import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Testing connection pooling...")
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL)
    
    // Test with different connection configurations
    const configs = [
      {
        name: "Direct connection",
        url: process.env.DATABASE_URL
      },
      {
        name: "Pooling connection",
        url: process.env.DATABASE_URL?.replace(':5432', ':6543') + '?pgbouncer=true&connection_limit=1'
      }
    ]
    
    const results = []
    
    for (const config of configs) {
      try {
        console.log(`Testing ${config.name}...`)
        
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient({
          datasources: {
            db: {
              url: config.url
            }
          }
        })
        
        await prisma.$connect()
        const result = await prisma.$queryRaw`SELECT 1 as test`
        await prisma.$disconnect()
        
        results.push({
          config: config.name,
          status: "success",
          result
        })
        
        console.log(`${config.name} successful`)
      } catch (error) {
        console.log(`${config.name} failed:`, error instanceof Error ? error.message : error)
        results.push({
          config: config.name,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }
    
    return NextResponse.json({
      status: "completed",
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Pooling test error:", error)
    
    return NextResponse.json({
      status: "error",
      message: "Pooling test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
