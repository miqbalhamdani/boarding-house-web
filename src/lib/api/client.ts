import { ApiError, type ApiErrorEnvelope } from "./errors";
import {
  type AuthRole,
  type TokenPair,
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
} from "@/lib/auth/cookies";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

/** Common success envelope: `{ "data": {...}, "message": "Success" }`. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Which token to attach. `"public"` sends no Authorization header. */
  role?: AuthRole | "public";
  headers?: Record<string, string>;
  /** Internal: set once a 401 has already triggered a refresh+retry. */
  _retried?: boolean;
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function loginPathFor(role: AuthRole): string {
  return role === "owner" ? "/login" : "/tenant/login";
}

/** In-flight refresh per role, so concurrent 401s share one refresh call. */
const inFlightRefresh: Partial<Record<AuthRole, Promise<TokenPair | null>>> = {};

/**
 * Exchange the stored refresh token for a new pair. The refresh response is
 * flat: `{ data: { access_token, refresh_token } }`.
 *
 * Returns the new tokens (and persists them) on success. Returns `null` when
 * the session is genuinely invalid (no refresh token, or the server rejects it
 * with 401/403) — the caller should then log out. Throws an {@link ApiError}
 * for transient failures (network error, 5xx) so a passing hiccup never logs a
 * valid session out.
 */
async function doRefresh(role: AuthRole): Promise<TokenPair | null> {
  const refresh_token = getRefreshToken(role);
  if (!refresh_token) return null;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/auth/${role}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });
  } catch {
    throw new ApiError(0, null, "Network error. Please try again.");
  }

  if (res.status === 401 || res.status === 403) return null; // invalid session
  if (!res.ok) {
    throw new ApiError(
      res.status,
      null,
      "Could not refresh your session. Please try again.",
    );
  }

  const body = (await parseJson(res)) as ApiResponse<Partial<TokenPair>> | null;
  const data = body?.data;
  if (!data?.access_token || !data?.refresh_token) return null;

  const tokens: TokenPair = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  };
  setAuthCookies(role, tokens);
  return tokens;
}

/** Single-flight wrapper around {@link doRefresh}. */
function refreshTokens(role: AuthRole): Promise<TokenPair | null> {
  if (!inFlightRefresh[role]) {
    inFlightRefresh[role] = doRefresh(role).finally(() => {
      delete inFlightRefresh[role];
    });
  }
  return inFlightRefresh[role]!;
}

/** Clear the session and send the user to the role's login page, then throw. */
function forceLogout(role: AuthRole): never {
  clearAuthCookies(role);
  if (typeof window !== "undefined") {
    window.location.assign(loginPathFor(role));
  }
  throw new ApiError(
    401,
    null,
    "Your session has expired. Please log in again.",
  );
}

/**
 * Thin fetch wrapper for the boarding-house API.
 *
 * - Prefixes {@link BASE_URL} and serialises the JSON body.
 * - Attaches the correct bearer token for `role` (never owner token on tenant
 *   calls or vice-versa) — `owner_id`/`tenant_id` are derived server-side from
 *   the token and must never be sent from the frontend.
 * - On a 401 for an authenticated call, refreshes the token once (single-flight)
 *   and retries. If the session is invalid it clears cookies and redirects to
 *   the role's login page; a transient refresh failure is surfaced as an error
 *   without logging the user out.
 * - Throws {@link ApiError} on any non-2xx response.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = "GET", body, role = "public", headers = {}, _retried = false } =
    options;

  const requestHeaders: Record<string, string> = { ...headers };
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";

  if (role !== "public") {
    const token = getAccessToken(role);
    if (token) requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && role !== "public") {
    // Already refreshed once and still unauthorised → session is dead.
    if (_retried) forceLogout(role);

    const tokens = await refreshTokens(role); // throws on transient failure
    if (tokens) {
      return apiFetch<T>(path, { ...options, _retried: true });
    }
    forceLogout(role);
  }

  const parsed = await parseJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      parsed as ApiErrorEnvelope | null,
      `Request failed (${res.status}).`,
    );
  }

  return parsed as T;
}
