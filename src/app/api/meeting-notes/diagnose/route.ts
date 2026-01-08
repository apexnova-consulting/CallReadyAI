import 'server-only'
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
        geminiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) || 'N/A'
      },
      tests: {}
    }

    // Test 1: Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      diagnostics.tests.apiKey = {
        status: 'FAIL',
        message: 'GEMINI_API_KEY is not set in environment variables'
      }
      return NextResponse.json(diagnostics, { status: 200 })
    }

    diagnostics.tests.apiKey = {
      status: 'PASS',
      message: 'GEMINI_API_KEY is configured'
    }

    // Test 2: Try a simple API call
    try {
      const testResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Say 'Hello'"
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 10,
            }
          })
        }
      )

      diagnostics.tests.apiCall = {
        status: testResponse.ok ? 'PASS' : 'FAIL',
        httpStatus: testResponse.status,
        statusText: testResponse.statusText
      }

      if (!testResponse.ok) {
        const errorText = await testResponse.text()
        diagnostics.tests.apiCall.error = errorText
        
        try {
          const errorJson = JSON.parse(errorText)
          diagnostics.tests.apiCall.errorDetails = {
            message: errorJson.error?.message,
            code: errorJson.error?.code,
            status: errorJson.error?.status,
            reason: errorJson.error?.reason
          }
        } catch (e) {
          // Not JSON, that's okay
        }
      } else {
        const data = await testResponse.json()
        diagnostics.tests.apiCall.response = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
      }
    } catch (apiError: any) {
      diagnostics.tests.apiCall = {
        status: 'FAIL',
        error: apiError.message,
        name: apiError.name
      }
    }

    return NextResponse.json(diagnostics, { status: 200 })
  } catch (error: any) {
    console.error("Diagnostic error:", error)
    return NextResponse.json({
      error: "Diagnostic failed",
      details: error.message
    }, { status: 500 })
  }
}

