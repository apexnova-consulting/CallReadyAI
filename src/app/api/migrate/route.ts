import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
  try {
    // Check if User table exists
    const userTableExists = await db.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      )
    `
    
    // Check if Subscription table exists
    const subscriptionTableExists = await db.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Subscription'
      )
    `
    
    // Check if Brief table exists
    const briefTableExists = await db.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Brief'
      )
    `
    
    return NextResponse.json({
      status: "success",
      message: "Schema check completed",
      tables: {
        User: userTableExists,
        Subscription: subscriptionTableExists,
        Brief: briefTableExists
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Migration check error:", error)
    
    return NextResponse.json({
      status: "error",
      message: "Schema check failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



