import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TENANT_LOGIN = "/tenant/login";

/**
 * Route guard (Next.js "proxy", formerly middleware). Owners need an owner
 * token for `/dashboard`; tenants need a tenant token for the `/tenant/*`
 * portal (except the login page). Already signed-in users are bounced away from
 * the auth pages. Token validity is enforced by the API; here we only check
 * presence (the client refreshes on 401). See matcher below for the paths this
 * runs on.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ownerToken = req.cookies.get("owner_access_token")?.value;
  const tenantToken = req.cookies.get("tenant_access_token")?.value;

  const isOwnerProtected =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isTenantPortal =
    pathname !== TENANT_LOGIN &&
    (pathname === "/tenant" || pathname.startsWith("/tenant/"));

  if (isOwnerProtected && !ownerToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isTenantPortal && !tenantToken) {
    return NextResponse.redirect(new URL(TENANT_LOGIN, req.url));
  }

  if ((pathname === "/login" || pathname === "/register") && ownerToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (pathname === TENANT_LOGIN && tenantToken) {
    return NextResponse.redirect(new URL("/tenant/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tenant/:path*", "/login", "/register"],
};
