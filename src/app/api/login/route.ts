import { NextResponse } from "next/server"
import { z } from "zod"
import { validateUser, createSession } from "@/lib/simple-auth"

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

    // Validate user credentials
    const user = await validateUser(validatedEmail, validatedPassword)
    if (!user) {
      console.log("Invalid credentials")
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    console.log("User validated successfully:", user.id)

    // Create session and redirect to dashboard
    await createSession(user.id, user.email, user.name)
    
    return NextResponse.redirect(new URL("/dashboard", req.url))
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
