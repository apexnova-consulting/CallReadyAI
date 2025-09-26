import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Gemini API key is available
    const hasGeminiKey = !!process.env.GEMINI_API_KEY
    const geminiKeyLength = process.env.GEMINI_API_KEY?.length || 0
    
    // Basic health check
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        api: "operational",
        gemini: hasGeminiKey ? "configured" : "not_configured",
        gemini_key_length: geminiKeyLength
      }
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}