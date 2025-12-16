import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createUser, getUser } from "@/lib/auth"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

// Admin route to create a Pro account
// This should be secured in production with admin authentication
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const userName = name || email.split('@')[0]

    // Check if user exists in in-memory store (primary auth method)
    const inMemoryUser = getUser(email)

    // Check if user exists in database
    let existingDbUser = null
    try {
      existingDbUser = await db.user.findUnique({
        where: { email },
        include: { subscription: true }
      })
    } catch (dbError) {
      console.log("Database not available, using in-memory store only")
    }

    if (inMemoryUser || existingDbUser) {
      // User exists - update password and ensure Pro subscription
      const hashedPassword = await bcrypt.hash(password, 12)
      const userId = existingDbUser?.id || inMemoryUser?.id || `user_${Date.now()}`

      // Update database if available
      if (existingDbUser) {
        await db.user.update({
          where: { id: existingDbUser.id },
          data: {
            password: hashedPassword,
            name: userName
          }
        })

        // Create or update subscription to Pro
        await db.subscription.upsert({
          where: { userId: existingDbUser.id },
          update: {
            plan: "pro",
            status: "active",
            briefsLimit: 200,
            briefsUsed: 0,
            stripeCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          },
          create: {
            userId: existingDbUser.id,
            plan: "pro",
            status: "active",
            briefsLimit: 200,
            briefsUsed: 0,
            stripeCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          }
        })
      }

      // Update in-memory store (critical for login)
      // Add user to in-memory store with database user ID and password hash
      if (existingDbUser) {
        const { addUserToMemory } = await import("@/lib/auth")
        addUserToMemory(
          email,
          existingDbUser.id,
          hashedPassword, // Use the newly hashed password
          userName
        )
        console.log("User synced to in-memory store with database ID")
      }

      return NextResponse.json({
        success: true,
        message: "User updated to Pro plan",
        user: {
          id: userId,
          email: email,
          name: userName,
          plan: "pro",
          status: "active",
          briefsLimit: 200
        }
      })
    }

    // Create new user in database first (so we get the correct ID)
    let user
    try {
      const hashedPassword = await bcrypt.hash(password, 12)
      const referralCode = `REF${Math.random().toString(36).substring(2, 9).toUpperCase()}`

      const dbUser = await db.user.create({
        data: {
          email,
          name: userName,
          password: hashedPassword,
          referralCode,
        }
      })

      // Create Pro subscription
      await db.subscription.create({
        data: {
          userId: dbUser.id,
          plan: "pro",
          status: "active",
          briefsLimit: 200,
          briefsUsed: 0,
          stripeCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      })

      // Add to in-memory store with database user ID
      const { addUserToMemory } = await import("@/lib/auth")
      addUserToMemory(
        email,
        dbUser.id,
        hashedPassword,
        userName
      )

      user = {
        id: dbUser.id,
        email: dbUser.email || email,
        name: dbUser.name || userName
      }
    } catch (dbError) {
      console.log("Database not available, creating in-memory user only")
      // Fallback to in-memory only
      user = await createUser(email, password, userName)
    }

    // Get the actual database user ID if available
    let finalUserId = user.id
    try {
      const dbUserCheck = await db.user.findUnique({
        where: { email },
        include: { subscription: true }
      })
      if (dbUserCheck) {
        finalUserId = dbUserCheck.id
      }
    } catch (e) {
      // Ignore if database check fails
    }

    return NextResponse.json({
      success: true,
      message: "Pro account created successfully",
      user: {
        id: finalUserId,
        email: user.email,
        name: user.name,
        plan: "pro",
        status: "active",
        briefsLimit: 200
      }
    })
  } catch (error: any) {
    console.error("Error creating Pro account:", error)
    return NextResponse.json(
      {
        error: "Failed to create Pro account",
        details: error.message
      },
      { status: 500 }
    )
  }
}

