import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Test basic connection
    await db.$connect()
    
    // Test a simple query
    const result = await db.$queryRaw`SELECT 1 as test`
    
    // Test if tables exist
    const tables = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      testQuery: result,
      tables: tables,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Database test error:", error)
    
    return NextResponse.json({
      status: "error",
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}
