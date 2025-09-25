import { NextResponse } from "next/server"
import { z } from "zod"
import { createUser, getUser } from "@/lib/auth"

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  try {
    console.log("Simple registration attempt started")
    
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

    // Check if user already exists
    const existingUser = getUser(validatedEmail)
    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    console.log("User doesn't exist, proceeding with creation")

    // Create user in memory store
    const user = await createUser(validatedEmail, validatedPassword, validatedName)
    console.log("User created:", user.id)

    // Return success response instead of redirect
    return NextResponse.json({ 
      success: true, 
      message: "Registration successful",
      redirectUrl: "/test-minimal"
    })
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
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}