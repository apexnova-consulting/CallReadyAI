import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Simple route protection without database calls
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Check for auth token in cookies
    const token = request.cookies.get("next-auth.session-token") || 
                  request.cookies.get("__Secure-next-auth.session-token")
    
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"]
}