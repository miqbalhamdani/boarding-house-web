import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

function request(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie } : {},
  });
}

function locationOf(res: Response) {
  return res.headers.get("location");
}

describe("proxy route guards", () => {
  it("redirects unauthenticated owners away from /dashboard", () => {
    const res = proxy(request("/dashboard"));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toContain("/login");
  });

  it("allows owners with a token into /dashboard", () => {
    const res = proxy(request("/dashboard", "owner_access_token=abc"));
    expect(locationOf(res)).toBeNull();
  });

  it("redirects unauthenticated tenants away from the portal", () => {
    const res = proxy(request("/tenant/dashboard"));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toContain("/tenant/login");
  });

  it("never blocks the public tenant login page", () => {
    const res = proxy(request("/tenant/login"));
    expect(locationOf(res)).toBeNull();
  });

  it("bounces signed-in owners off the login page", () => {
    const res = proxy(request("/login", "owner_access_token=abc"));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toContain("/dashboard");
  });

  it("does not let an owner token unlock the tenant portal", () => {
    const res = proxy(request("/tenant/dashboard", "owner_access_token=abc"));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toContain("/tenant/login");
  });
});
