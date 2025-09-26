import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Testing Gemini API connection...")
    
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: "Gemini API key not configured",
          status: "missing_key"
        },
        { status: 500 }
      )
    }

    // Test API call
    const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Say hello in one word"
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 10,
        }
      })
    })

    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      return NextResponse.json(
        { 
          error: `Gemini API error: ${testResponse.status}`,
          details: errorText,
          status: "api_error"
        },
        { status: 500 }
      )
    }

    const data = await testResponse.json()
    const response = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return NextResponse.json({
      success: true,
      response: response,
      status: "working"
    })

  } catch (error) {
    console.error("AI test error:", error)
    return NextResponse.json(
      { 
        error: "AI service test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        status: "test_failed"
      },
      { status: 500 }
    )
  }
}
