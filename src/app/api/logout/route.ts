import { NextResponse } from "next/server"
import { destroySession } from "@/lib/simple-auth"

export async function POST(req: Request) {
  try {
    await destroySession()
    return NextResponse.redirect(new URL("/", req.url))
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.redirect(new URL("/", req.url))
  }
}
