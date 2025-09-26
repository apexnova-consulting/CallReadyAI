import { NextResponse } from "next/server"
import { destroySession } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    // Destroy the session
    await destroySession()
    
    // Redirect to home page
    return NextResponse.redirect(new URL("/", req.url))
  } catch (error) {
    console.error("Logout error:", error)
    // Even if there's an error, try to destroy session and redirect
    await destroySession()
    return NextResponse.redirect(new URL("/", req.url))
  }
}
