import { describe, expect, it } from "vitest"

import {
  OWNER_HOME,
  OWNER_LOGIN,
  resolveAuthRedirect,
  TENANT_HOME,
  TENANT_LOGIN,
} from "@/lib/auth/guard"

const NONE = { hasOwnerToken: false, hasTenantToken: false }
const OWNER = { hasOwnerToken: true, hasTenantToken: false }
const TENANT = { hasOwnerToken: false, hasTenantToken: true }

describe("resolveAuthRedirect", () => {
  it("allows public pages for anonymous users", () => {
    for (const pathname of ["/", "/login", "/owner/login", "/owner/register"]) {
      expect(resolveAuthRedirect({ pathname, ...NONE })).toBeNull()
    }
  })

  it("redirects anonymous users away from owner areas to owner login", () => {
    expect(resolveAuthRedirect({ pathname: "/owner/dashboard", ...NONE })).toBe(
      OWNER_LOGIN
    )
    expect(resolveAuthRedirect({ pathname: "/owner/rooms/123", ...NONE })).toBe(
      OWNER_LOGIN
    )
  })

  it("redirects anonymous users away from the tenant portal to tenant login", () => {
    expect(
      resolveAuthRedirect({ pathname: "/tenant/dashboard", ...NONE })
    ).toBe(TENANT_LOGIN)
  })

  it("lets an owner into owner areas", () => {
    expect(
      resolveAuthRedirect({ pathname: "/owner/dashboard", ...OWNER })
    ).toBeNull()
  })

  it("lets a tenant into the tenant portal", () => {
    expect(
      resolveAuthRedirect({ pathname: "/tenant/dashboard", ...TENANT })
    ).toBeNull()
  })

  // Cross-token isolation (acceptance criteria):
  it("rejects a tenant token on an owner route", () => {
    expect(
      resolveAuthRedirect({ pathname: "/owner/dashboard", ...TENANT })
    ).toBe(OWNER_LOGIN)
  })

  it("rejects an owner token on a tenant route", () => {
    expect(
      resolveAuthRedirect({ pathname: "/tenant/dashboard", ...OWNER })
    ).toBe(TENANT_LOGIN)
  })

  it("bounces an authenticated owner off the login pages", () => {
    expect(resolveAuthRedirect({ pathname: "/owner/login", ...OWNER })).toBe(
      OWNER_HOME
    )
    expect(resolveAuthRedirect({ pathname: "/owner/register", ...OWNER })).toBe(
      OWNER_HOME
    )
  })

  it("bounces an authenticated tenant off the tenant login page", () => {
    expect(resolveAuthRedirect({ pathname: "/login", ...TENANT })).toBe(
      TENANT_HOME
    )
  })
})
