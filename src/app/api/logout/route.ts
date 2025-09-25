import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Simple logout - just redirect to home
    return NextResponse.redirect(new URL("/", req.url))
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.redirect(new URL("/", req.url))
  }
}
