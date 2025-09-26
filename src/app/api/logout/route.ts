import { NextResponse } from "next/server"
import { destroySession } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    // Destroy the session
    await destroySession()
    
    // Return success response instead of redirect
    return NextResponse.json({ 
      success: true, 
      message: "Logged out successfully",
      redirectUrl: "/"
    })
  } catch (error) {
    console.error("Logout error:", error)
    // Even if there's an error, try to destroy session
    await destroySession()
    return NextResponse.json({ 
      success: true, 
      message: "Logged out successfully",
      redirectUrl: "/"
    })
  }
}
