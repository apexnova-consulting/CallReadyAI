import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Testing Google Gemini connection...")
    console.log("API Key present:", !!process.env.GEMINI_API_KEY)
    console.log("API Key length:", process.env.GEMINI_API_KEY?.length || 0)
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: "Gemini API key not found",
        hasApiKey: false 
      }, { status: 500 })
    }

    // Test with a simple completion
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Say 'Hello, Google Gemini is working!'"
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        }
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No response"

    return NextResponse.json({ 
      success: true,
      message: "Google Gemini connection successful",
      response: response,
      hasApiKey: true
    })
  } catch (error) {
    console.error("Gemini test error:", error)
    return NextResponse.json({ 
      error: "Gemini connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
      hasApiKey: !!process.env.GEMINI_API_KEY
    }, { status: 500 })
  }
}
