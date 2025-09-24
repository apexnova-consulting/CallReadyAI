import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Temporarily disable middleware to fix redirect loop
  return NextResponse.next()
}

export const config = {
  matcher: []
}