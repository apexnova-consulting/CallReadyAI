import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  try {
    console.log("Registration attempt started")
    
    const formData = await req.formData()
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log("Form data received:", { name, email, password: password ? "***" : "missing" })

    const { name: validatedName, email: validatedEmail, password: validatedPassword } = registerSchema.parse({
      name,
      email,
      password,
    })

    console.log("Data validated successfully")

    // Test database connection first
    await db.$connect()
    console.log("Database connected")

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedEmail },
    })

    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    console.log("User doesn't exist, proceeding with creation")

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedPassword, 12)
    console.log("Password hashed")

    // Create user
    const user = await db.user.create({
      data: {
        name: validatedName,
        email: validatedEmail,
        password: hashedPassword,
      },
    })
    console.log("User created:", user.id)

    // Create default subscription
    await db.subscription.create({
      data: {
        userId: user.id,
        plan: "free",
        status: "active",
        briefsLimit: 5,
        briefsUsed: 0,
      },
    })
    console.log("Subscription created")

    return NextResponse.redirect(new URL("/login", req.url))
  } catch (error) {
    console.error("Registration error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    await db.$disconnect()
  }
}