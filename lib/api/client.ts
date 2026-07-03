import {
  ApiClientError,
  type ApiErrorBody,
  type ApiSuccess,
  type AuthKind,
  type TokenPair,
} from "@/lib/api/types"
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth/tokens"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1"

const REFRESH_PATH: Record<AuthKind, string> = {
  owner: "/auth/owner/refresh",
  tenant: "/auth/tenant/refresh",
}

export type ApiRequest = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  // When set, attaches the matching Bearer token and enables one refresh+retry
  // on a 401. Omit for public endpoints (login/register).
  kind?: AuthKind
}

function buildHeaders(kind: AuthKind | undefined, hasBody: boolean): Headers {
  const headers = new Headers()
  if (hasBody) headers.set("Content-Type", "application/json")
  if (kind) {
    const token = getAccessToken(kind)
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }
  return headers
}

async function rawFetch(
  path: string,
  req: ApiRequest,
  accessKind: AuthKind | undefined
): Promise<Response> {
  const hasBody = req.body !== undefined
  return fetch(`${BASE_URL}${path}`, {
    method: req.method ?? (hasBody ? "POST" : "GET"),
    headers: buildHeaders(accessKind, hasBody),
    body: hasBody ? JSON.stringify(req.body) : undefined,
  })
}

// Attempts to exchange the refresh token for a fresh pair. Returns true on
// success (new tokens stored), false otherwise (tokens cleared).
async function tryRefresh(kind: AuthKind): Promise<boolean> {
  const refresh_token = getRefreshToken(kind)
  if (!refresh_token) return false

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${REFRESH_PATH[kind]}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    })
  } catch {
    return false
  }

  if (!res.ok) {
    clearTokens(kind)
    return false
  }

  // Refresh returns the pair flat on `data` (not under `data.tokens`).
  const json = (await res.json()) as ApiSuccess<TokenPair>
  setTokens(kind, json.data)
  return true
}

async function parse<T>(res: Response): Promise<T> {
  if (res.ok) {
    try {
      const json = (await res.json()) as ApiSuccess<T>
      return json.data
    } catch {
      // 204 / empty / non-JSON success body — nothing to unwrap.
      return undefined as T
    }
  }

  let code = "UNKNOWN"
  let message = res.statusText || "Request failed"
  let fields: Record<string, string> = {}
  try {
    const body = (await res.json()) as ApiErrorBody
    if (body?.error) {
      code = body.error.code ?? code
      message = body.error.message ?? message
      fields = body.error.fields ?? {}
    }
  } catch {
    // Non-JSON error body — keep status-derived defaults.
  }
  throw new ApiClientError(res.status, code, message, fields)
}

export async function apiFetch<T>(path: string, req: ApiRequest = {}): Promise<T> {
  let res: Response
  try {
    res = await rawFetch(path, req, req.kind)
  } catch {
    throw new ApiClientError(0, "NETWORK_ERROR", "Unable to reach the server")
  }

  // One refresh + retry for authed calls that come back unauthorized.
  if (res.status === 401 && req.kind) {
    const refreshed = await tryRefresh(req.kind)
    if (refreshed) {
      try {
        res = await rawFetch(path, req, req.kind)
      } catch {
        throw new ApiClientError(0, "NETWORK_ERROR", "Unable to reach the server")
      }
    }
    // Still unauthorized after refresh (or no refresh token): the session is
    // dead — drop the stale cookies so guards send the user back to login.
    if (res.status === 401) {
      clearTokens(req.kind)
    }
  }

  return parse<T>(res)
}
