import { NextResponse, type NextRequest } from "next/server"

import { resolveAuthRedirect } from "@/lib/auth/guard"
import { TOKEN_COOKIE_NAMES } from "@/lib/auth/tokens"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookies = request.cookies

  const redirectTo = resolveAuthRedirect({
    pathname,
    hasOwnerToken: cookies.has(TOKEN_COOKIE_NAMES.owner.access),
    hasTenantToken: cookies.has(TOKEN_COOKIE_NAMES.tenant.access),
  })

  if (redirectTo && redirectTo !== pathname) {
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/owner/dashboard/:path*",
    "/owner/rooms/:path*",
    "/owner/tenants/:path*",
    "/owner/bills/:path*",
    "/owner/payments/:path*",
    "/tenant/dashboard/:path*",
    "/login",
    "/owner/login",
    "/owner/register",
  ],
}
