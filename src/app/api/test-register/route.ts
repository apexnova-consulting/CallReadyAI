import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    console.log("Test registration started")
    
    // Test database connection
    await db.$connect()
    console.log("Database connected")
    
    // Test a simple query
    const result = await db.$queryRaw`SELECT 1 as test`
    console.log("Test query result:", result)
    
    // Test if User table exists and is accessible
    const userCount = await db.user.count()
    console.log("User count:", userCount)
    
    return NextResponse.json({
      status: "success",
      message: "Database operations working",
      userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Test registration error:", error)
    
    return NextResponse.json({
      status: "error",
      message: "Database operations failed",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}


