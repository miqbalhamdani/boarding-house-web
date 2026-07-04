// Pure route-guard logic, decoupled from the Next.js middleware runtime so it
// can be unit-tested directly. Given the current path and which token cookies
// are present, it returns a redirect target or null (allow).

export type GuardInput = {
  pathname: string
  hasOwnerToken: boolean
  hasTenantToken: boolean
}

export const OWNER_LOGIN = "/owner/login"
export const OWNER_REGISTER = "/owner/register"
export const TENANT_LOGIN = "/login"
export const OWNER_HOME = "/owner/dashboard"
export const TENANT_HOME = "/tenant/dashboard"

// Owner-only areas (dashboard + the future owner resource sections). Listed as
// explicit sub-paths rather than a bare "/owner" so the owner auth pages
// (/owner/login, /owner/register) are not treated as protected.
const OWNER_PREFIXES = [
  "/owner/dashboard",
  "/owner/rooms",
  "/owner/tenants",
  "/owner/bills",
  "/owner/payments",
]

// Public auth pages.
const OWNER_AUTH_PAGES = [OWNER_LOGIN, OWNER_REGISTER]

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function resolveAuthRedirect(input: GuardInput): string | null {
  const { pathname, hasOwnerToken, hasTenantToken } = input

  // Already-authenticated users shouldn't sit on a login/register page.
  if (OWNER_AUTH_PAGES.includes(pathname) && hasOwnerToken) {
    return OWNER_HOME
  }
  if (pathname === TENANT_LOGIN && hasTenantToken) {
    return TENANT_HOME
  }

  // Tenant portal: requires a tenant token (an owner token does not grant it).
  if (matchesPrefix(pathname, [TENANT_HOME])) {
    return hasTenantToken ? null : TENANT_LOGIN
  }

  // Owner areas: require an owner token (a tenant token does not grant it).
  if (matchesPrefix(pathname, OWNER_PREFIXES)) {
    return hasOwnerToken ? null : OWNER_LOGIN
  }

  return null
}
