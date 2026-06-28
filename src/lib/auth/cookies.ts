import Cookies from "js-cookie";

/** The two kinds of authenticated principals in the app. */
export type AuthRole = "owner" | "tenant";

/** A token pair as returned by the auth + refresh endpoints. */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

/** Cookie names. Kept in one place so middleware and client agree. */
export const COOKIE = {
  ownerAccess: "owner_access_token",
  ownerRefresh: "owner_refresh_token",
  tenantAccess: "tenant_access_token",
  tenantRefresh: "tenant_refresh_token",
  role: "role",
} as const;

const baseOptions: Cookies.CookieAttributes = {
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function accessTokenName(role: AuthRole): string {
  return role === "owner" ? COOKIE.ownerAccess : COOKIE.tenantAccess;
}

export function refreshTokenName(role: AuthRole): string {
  return role === "owner" ? COOKIE.ownerRefresh : COOKIE.tenantRefresh;
}

export function getAccessToken(role: AuthRole): string | undefined {
  return Cookies.get(accessTokenName(role));
}

export function getRefreshToken(role: AuthRole): string | undefined {
  return Cookies.get(refreshTokenName(role));
}

/** Persist a freshly-issued token pair for the given role. */
export function setAuthCookies(role: AuthRole, tokens: TokenPair): void {
  Cookies.set(accessTokenName(role), tokens.access_token, { ...baseOptions, expires: 7 });
  Cookies.set(refreshTokenName(role), tokens.refresh_token, { ...baseOptions, expires: 30 });
  Cookies.set(COOKIE.role, role, { ...baseOptions, expires: 30 });
}

/** Remove all auth cookies for the given role. */
export function clearAuthCookies(role: AuthRole): void {
  Cookies.remove(accessTokenName(role), { path: "/" });
  Cookies.remove(refreshTokenName(role), { path: "/" });
  // Only drop the shared role hint if it points at the role we're clearing, so
  // logging one role out doesn't blank the hint for the other still-valid one.
  if (getRole() === role) Cookies.remove(COOKIE.role, { path: "/" });
}

/** The role currently signed in within this browser, if any. UI hint only. */
export function getRole(): AuthRole | undefined {
  const r = Cookies.get(COOKIE.role);
  return r === "owner" || r === "tenant" ? r : undefined;
}
