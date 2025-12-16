import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Test route working",
    timestamp: new Date().toISOString(),
    routes: {
      register: "/api/register",
      auth: "/api/auth/[...nextauth]",
      login: "/api/auth/signin/credentials"
    }
  })
}

export async function POST() {
  return NextResponse.json({
    message: "POST method working",
    timestamp: new Date().toISOString()
  })
}



