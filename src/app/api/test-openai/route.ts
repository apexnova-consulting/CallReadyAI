import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
  try {
    console.log("Testing OpenAI connection...")
    console.log("API Key present:", !!process.env.OPENAI_API_KEY)
    console.log("API Key length:", process.env.OPENAI_API_KEY?.length || 0)
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "OpenAI API key not found",
        hasApiKey: false 
      }, { status: 500 })
    }

    // Test with a simple completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "Say 'Hello, OpenAI is working!'" }
      ],
      max_tokens: 50,
    })

    const response = completion.choices[0]?.message?.content || "No response"

    return NextResponse.json({ 
      success: true,
      message: "OpenAI connection successful",
      response: response,
      hasApiKey: true
    })
  } catch (error) {
    console.error("OpenAI test error:", error)
    return NextResponse.json({ 
      error: "OpenAI connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
      hasApiKey: !!process.env.OPENAI_API_KEY
    }, { status: 500 })
  }
}
