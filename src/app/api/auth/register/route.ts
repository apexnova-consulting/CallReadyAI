import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { name: validatedName, email: validatedEmail, password: validatedPassword } = registerSchema.parse({
      name,
      email,
      password,
    })

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Create user
    const user = await db.user.create({
      data: {
        name: validatedName,
        email: validatedEmail,
        password: validatedPassword, // In production, hash this password
      },
    })

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

    return NextResponse.redirect(new URL("/login", req.url))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 422 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}