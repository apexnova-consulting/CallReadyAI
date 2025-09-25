import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test if we can import Prisma
    const { PrismaClient } = await import('@prisma/client')
    
    // Test connection with minimal config
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
    
    // Test connection
    await prisma.$connect()
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      result,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Missing",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Connection test error:", error)
    
    return NextResponse.json({
      status: "error",
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Missing",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
