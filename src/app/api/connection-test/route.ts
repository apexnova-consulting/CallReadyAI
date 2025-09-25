import { NextResponse } from "next/server"

export async function GET() {
  // Temporarily disable database test during build
  return NextResponse.json({ 
    status: "ok", 
    message: "Database test skipped during build",
    note: "This endpoint is disabled during build to prevent connection errors",
    databaseUrl: process.env.DATABASE_URL ? "Set" : "Missing",
    timestamp: new Date().toISOString()
  })
}
