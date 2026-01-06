import { NextResponse } from "next/server"
import { addUserToMemory, getUser } from "@/lib/auth"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

// Simple endpoint to ensure user exists in in-memory store
// This works even if database is unavailable
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const userName = name || email.split('@')[0]
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Use a consistent user ID (based on email hash for stability)
    const userId = `user_${Buffer.from(email).toString('base64').substring(0, 16)}`
    
    // Add/update user in in-memory store
    addUserToMemory(email, userId, hashedPassword, userName)
    
    // Verify it worked
    const verifyUser = getUser(email)
    const testValid = await bcrypt.compare(password, verifyUser?.password || '')

    return NextResponse.json({
      success: true,
      message: "User ensured in memory store",
      user: {
        id: userId,
        email: email,
        name: userName,
        inMemory: !!verifyUser,
        passwordValid: testValid
      }
    })
  } catch (error: any) {
    console.error("Error ensuring user:", error)
    return NextResponse.json(
      {
        error: "Failed to ensure user",
        details: error.message
      },
      { status: 500 }
    )
  }
}



