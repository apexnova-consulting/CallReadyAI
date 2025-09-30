import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Simple API test working",
    timestamp: new Date().toISOString()
  })
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    return NextResponse.json({
      message: "POST test successful",
      received: {
        name: name || "missing",
        email: email || "missing", 
        password: password ? "***" : "missing"
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: "POST test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}


