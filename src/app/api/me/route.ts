import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

