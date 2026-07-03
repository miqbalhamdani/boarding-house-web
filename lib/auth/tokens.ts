import type { AuthKind, TokenPair } from "@/lib/api/types"

// Token storage.
//
// Tokens live in JS-readable cookies (not httpOnly): there is no BFF, so the
// browser fetch client must read the access token to attach the Bearer header,
// and Next.js middleware must read them to guard routes server-side. This trades
// off XSS exposure for a single storage that both the client and middleware can
// see; a future BFF could move these to httpOnly cookies.

const COOKIE = {
  owner: { access: "owner_access_token", refresh: "owner_refresh_token" },
  tenant: { access: "tenant_access_token", refresh: "tenant_refresh_token" },
} as const

// Access token lifetime is short but the cookie itself persists so a page
// reload keeps the session; refresh-on-401 renews the access token.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

export function setTokens(kind: AuthKind, tokens: TokenPair) {
  writeCookie(COOKIE[kind].access, tokens.access_token)
  writeCookie(COOKIE[kind].refresh, tokens.refresh_token)
}

export function setOwnerTokens(tokens: TokenPair) {
  setTokens("owner", tokens)
}

export function setTenantTokens(tokens: TokenPair) {
  setTokens("tenant", tokens)
}

export function getAccessToken(kind: AuthKind): string | null {
  return readCookie(COOKIE[kind].access)
}

export function getRefreshToken(kind: AuthKind): string | null {
  return readCookie(COOKIE[kind].refresh)
}

export function clearTokens(kind: AuthKind) {
  deleteCookie(COOKIE[kind].access)
  deleteCookie(COOKIE[kind].refresh)
}

export const TOKEN_COOKIE_NAMES = COOKIE
