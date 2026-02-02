import { NextResponse } from "next/server"

const SITE_PASSWORD = "0210"
const AUTH_COOKIE_NAME = "site-auth"

export function middleware(request) {
  // Check if already authenticated via cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  if (authCookie?.value === "authenticated") {
    return NextResponse.next()
  }

  // Allow the login API route to pass through
  if (request.nextUrl.pathname === "/api/login") {
    return NextResponse.next()
  }

  // Allow the login page to pass through
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next()
  }

  // Redirect to login page
  return NextResponse.redirect(new URL("/login", request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

export { SITE_PASSWORD }
