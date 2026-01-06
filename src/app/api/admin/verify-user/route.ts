import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

// Admin route to verify user credentials
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user in database
    const dbUser = await db.user.findUnique({
      where: { email },
      include: { subscription: true }
    })

    if (!dbUser) {
      return NextResponse.json({
        exists: false,
        message: "User not found in database"
      })
    }

    if (!dbUser.password) {
      return NextResponse.json({
        exists: true,
        hasPassword: false,
        message: "User exists but has no password set"
      })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, dbUser.password)

    return NextResponse.json({
      exists: true,
      hasPassword: true,
      passwordValid: isValid,
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      subscription: dbUser.subscription ? {
        plan: dbUser.subscription.plan,
        status: dbUser.subscription.status,
        briefsLimit: dbUser.subscription.briefsLimit
      } : null
    })
  } catch (error: any) {
    console.error("Error verifying user:", error)
    return NextResponse.json(
      {
        error: "Failed to verify user",
        details: error.message
      },
      { status: 500 }
    )
  }
}



