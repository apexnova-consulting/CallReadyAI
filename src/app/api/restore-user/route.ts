import { NextResponse } from "next/server"
import { z } from "zod"
import { createUser, getUser } from "@/lib/auth"

const restoreSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    console.log("User restore attempt started")
    
    const body = await req.json()
    const { email, name, password } = restoreSchema.parse(body)

    console.log("Restore data received:", { email, name, password: password ? "***" : "missing" })

    // Check if user already exists
    const existingUser = getUser(email)
    if (existingUser) {
      console.log("User already exists, no restore needed")
      return NextResponse.json({ 
        success: true, 
        message: "User already exists",
        exists: true
      })
    }

    console.log("User doesn't exist, restoring from backup")

    // Create user in memory store
    const user = await createUser(email, password, name)
    console.log("User restored:", user.id)

    return NextResponse.json({ 
      success: true, 
      message: "User restored successfully",
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch (error) {
    console.error("User restore error:", error)
    
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

