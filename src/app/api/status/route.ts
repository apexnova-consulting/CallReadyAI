import { NextResponse } from "next/server"

export async function GET() {
  try {
    const status = {
      status: "operational",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV,
      services: {
        api: "healthy",
        database: "in-memory", // Currently using in-memory storage
        ai_service: process.env.GEMINI_API_KEY ? "configured" : "not_configured",
        email_service: process.env.RESEND_API_KEY ? "configured" : "not_configured"
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

