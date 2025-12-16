import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { addUserToMemory, getUser } from "@/lib/auth"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

// Direct fix route to ensure user can login
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
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      )
    }

    // Get or create password hash
    let passwordHash = dbUser.password
    if (!passwordHash) {
      // If no password in DB, create one
      passwordHash = await bcrypt.hash(password, 12)
      await db.user.update({
        where: { id: dbUser.id },
        data: { password: passwordHash }
      })
    }

    // Verify the password works
    const isValid = await bcrypt.compare(password, passwordHash)
    if (!isValid) {
      // Password doesn't match, update it
      passwordHash = await bcrypt.hash(password, 12)
      await db.user.update({
        where: { id: dbUser.id },
        data: { password: passwordHash }
      })
    }

    // Ensure user is in in-memory store with correct password
    const inMemoryUser = getUser(email)
    if (inMemoryUser) {
      // Update existing in-memory user
      addUserToMemory(
        email,
        dbUser.id,
        passwordHash,
        dbUser.name || email.split('@')[0]
      )
    } else {
      // Add new user to in-memory store
      addUserToMemory(
        email,
        dbUser.id,
        passwordHash,
        dbUser.name || email.split('@')[0]
      )
    }

    // Ensure Pro subscription exists
    if (!dbUser.subscription) {
      await db.subscription.create({
        data: {
          userId: dbUser.id,
          plan: "pro",
          status: "active",
          briefsLimit: 200,
          briefsUsed: 0,
          stripeCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      })
    } else {
      // Update to Pro if not already
      await db.subscription.update({
        where: { userId: dbUser.id },
        data: {
          plan: "pro",
          status: "active",
          briefsLimit: 200
        }
      })
    }

    // Verify login will work
    const testUser = getUser(email)
    const testValid = await bcrypt.compare(password, testUser?.password || '')

    return NextResponse.json({
      success: true,
      message: "User login fixed",
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        inMemory: !!testUser,
        passwordValid: testValid,
        subscription: {
          plan: "pro",
          status: "active",
          briefsLimit: 200
        }
      }
    })
  } catch (error: any) {
    console.error("Error fixing user login:", error)
    return NextResponse.json(
      {
        error: "Failed to fix user login",
        details: error.message
      },
      { status: 500 }
    )
  }
}

