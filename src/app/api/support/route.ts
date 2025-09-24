import { NextResponse } from "next/server"
import { z } from "zod"

const supportSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = supportSchema.parse(body)

    // In production, send email using Resend or similar service
    console.log("Support message received:", {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    // For now, just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 422 }
      )
    }

    console.error("Support error:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
