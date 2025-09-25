import { NextResponse } from "next/server"

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    OPENAI_API_KEY_SET: !!process.env.OPENAI_API_KEY,
    OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length || 0,
    OPENAI_API_KEY_PREFIX: process.env.OPENAI_API_KEY?.substring(0, 10) || "not set",
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  }

  return NextResponse.json({
    status: "ok",
    message: "Environment variables debug info",
    envVars,
    timestamp: new Date().toISOString(),
  })
}
