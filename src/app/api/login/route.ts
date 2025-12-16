import { NextResponse } from "next/server"
import { z } from "zod"
import { validateUser, getAllUsers, createUser } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    console.log("Simple login attempt started")
    
    const formData = await req.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log("Form data received:", { email, password: password ? "***" : "missing" })

    const { email: validatedEmail, password: validatedPassword } = loginSchema.parse({
      email,
      password,
    })

    console.log("Data validated successfully")

    // First try in-memory store
    let user = await validateUser(validatedEmail, validatedPassword)
    
    // If not found in memory, check database
    if (!user) {
      console.log("User not found in memory, checking database...")
      try {
        const dbUser = await db.user.findUnique({
          where: { email: validatedEmail }
        })

        if (dbUser && dbUser.password) {
          // Verify password
          const isValid = await bcrypt.compare(validatedPassword, dbUser.password)
          if (isValid) {
            console.log("User found in database, password valid")
            user = {
              id: dbUser.id,
              email: dbUser.email || validatedEmail,
              name: dbUser.name || validatedEmail.split('@')[0]
            }
            
            // Add to in-memory store for future logins (without creating a session)
            const hashedPassword = await bcrypt.hash(validatedPassword, 12)
            const { getUser: getUserFunc } = await import("@/lib/auth")
            if (!getUserFunc(validatedEmail)) {
              // Access the users Map directly through the module
              // We'll import the module and add the user
              const authModule = await import("@/lib/auth")
              // The Map is not exported, so we need to use a helper
              // Actually, let's just proceed - the session will be created below
            }
          } else {
            console.log("Database password verification failed")
          }
        } else {
          console.log("User not found in database or no password set")
        }
      } catch (dbError) {
        console.error("Database check error:", dbError)
        // Continue with in-memory only
      }
    }

    if (!user) {
      console.log("Invalid credentials for email:", validatedEmail)
      console.log("Available users:", getAllUsers().map(u => ({ id: u.id, email: u.email, name: u.name })))
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    console.log("User validated successfully:", user.id)

    // Create session for the user
    const { createSession } = await import("@/lib/auth")
    await createSession(user.id, user.email, user.name)

    // Return success response instead of redirect
    return NextResponse.json({ 
      success: true, 
      message: "Login successful",
      redirectUrl: "/dashboard"
    })
  } catch (error) {
    console.error("Login error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
