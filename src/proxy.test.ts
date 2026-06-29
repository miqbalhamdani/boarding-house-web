import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

function request(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie } : {},
  });
}

function pathOf(res: Response) {
  const location = res.headers.get("location");
  return location ? new URL(location).pathname : null;
}

describe("proxy route guards", () => {
  it("redirects unauthenticated owners to /owner/login", () => {
    const res = proxy(request("/dashboard"));
    expect(res.status).toBe(307);
    expect(pathOf(res)).toBe("/owner/login");
  });

  it("allows owners with a token into /dashboard", () => {
    const res = proxy(request("/dashboard", "owner_access_token=abc"));
    expect(pathOf(res)).toBeNull();
  });

  it("redirects unauthenticated tenants to /login", () => {
    const res = proxy(request("/tenant/dashboard"));
    expect(res.status).toBe(307);
    expect(pathOf(res)).toBe("/login");
  });

  it("never blocks the public tenant login page (/login)", () => {
    const res = proxy(request("/login"));
    expect(pathOf(res)).toBeNull();
  });

  it("never blocks the public owner login page when signed out", () => {
    const res = proxy(request("/owner/login"));
    expect(pathOf(res)).toBeNull();
  });

  it("bounces signed-in owners off /owner/login", () => {
    const res = proxy(request("/owner/login", "owner_access_token=abc"));
    expect(res.status).toBe(307);
    expect(pathOf(res)).toBe("/dashboard");
  });

  it("bounces signed-in owners off /owner/register", () => {
    const res = proxy(request("/owner/register", "owner_access_token=abc"));
    expect(res.status).toBe(307);
    expect(pathOf(res)).toBe("/dashboard");
  });

  it("bounces signed-in tenants off /login", () => {
    const res = proxy(request("/login", "tenant_access_token=abc"));
    expect(res.status).toBe(307);
    expect(pathOf(res)).toBe("/tenant/dashboard");
  });

  it("does not let an owner token unlock the tenant portal", () => {
    const res = proxy(request("/tenant/dashboard", "owner_access_token=abc"));
    expect(res.status).toBe(307);
    expect(pathOf(res)).toBe("/login");
  });
});
