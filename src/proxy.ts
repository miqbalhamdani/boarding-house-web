import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const OWNER_LOGIN = "/owner/login";
const OWNER_REGISTER = "/owner/register";
const TENANT_LOGIN = "/login";

/**
 * Route guard (Next.js "proxy", formerly middleware). Owners need an owner
 * token for `/dashboard`; tenants need a tenant token for the `/tenant/*`
 * portal. Owner auth lives under `/owner/*`; tenant login is the public
 * `/login`. Already signed-in users are bounced away from their auth pages.
 * Token validity is enforced by the API; here we only check presence (the
 * client refreshes on 401). See matcher below for the paths this runs on.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ownerToken = req.cookies.get("owner_access_token")?.value;
  const tenantToken = req.cookies.get("tenant_access_token")?.value;

  const isOwnerProtected =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isTenantPortal =
    pathname === "/tenant" || pathname.startsWith("/tenant/");

  if (isOwnerProtected && !ownerToken) {
    return NextResponse.redirect(new URL(OWNER_LOGIN, req.url));
  }
  if (isTenantPortal && !tenantToken) {
    return NextResponse.redirect(new URL(TENANT_LOGIN, req.url));
  }

  if ((pathname === OWNER_LOGIN || pathname === OWNER_REGISTER) && ownerToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (pathname === TENANT_LOGIN && tenantToken) {
    return NextResponse.redirect(new URL("/tenant/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tenant/:path*",
    "/owner/login",
    "/owner/register",
    "/login",
  ],
};
