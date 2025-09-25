import { NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"

const templateSchema = z.object({
  methodology: z.string().min(1),
  callType: z.string().min(1),
  industry: z.string().min(1),
  templateType: z.string().min(1),
})

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return true
  }
  
  if (userLimit.count >= 5) { // 5 template requests per minute
    return false
  }
  
  userLimit.count++
  return true
}

export async function POST(req: Request) {
  try {
    console.log("Template generation request started")
    
    const session = await getSession()
    if (!session?.user?.id) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Session found:", session.user.id)

    // Rate limiting
    if (!checkRateLimit(session.user.id)) {
      console.log("Rate limit exceeded")
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before generating another template." },
        { status: 429 }
      )
    }

    const body = await req.json()
    console.log("Request body:", body)
    
    const { methodology, callType, industry, templateType } = templateSchema.parse(body)
    console.log("Parsed data:", { methodology, callType, industry, templateType })

    // Create comprehensive system prompt for template generation
    const systemPrompt = `You are CallReady AI, an expert sales strategist and template creator. Generate a professional, actionable ${templateType} for ${callType} using the ${methodology} methodology in the ${industry} industry.

Requirements:
- Use the specific sales methodology principles
- Tailor content to the industry context
- Make it practical and immediately usable
- Include specific talking points and structure
- Keep it concise but comprehensive
- Use professional, confident tone

Format the output as a clean, structured template that a sales professional can follow step-by-step.`

    const userPrompt = `Generate a ${templateType} for:
- Sales Methodology: ${methodology}
- Call Type: ${callType}
- Industry: ${industry}
- Template Type: ${templateType}

Please create a detailed, actionable template that follows the ${methodology} methodology and is specifically tailored for ${industry} sales professionals conducting ${callType} calls.`

    console.log("Calling Google Gemini API...")
    
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.log("Gemini API key not found")
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 500 }
      )
    }

    let template
    try {
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${userPrompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        })
      })

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`)
      }

      const geminiData = await geminiResponse.json()
      template = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
      
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError)
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again in a few moments." },
        { status: 503 }
      )
    }

    console.log("Gemini response received")

    if (!template) {
      console.log("No template content received from Gemini")
      return NextResponse.json(
        { error: "Failed to generate template" },
        { status: 500 }
      )
    }

    console.log("Template generated successfully")

    // TODO: Save template to database with usage tracking
    // For now, we'll just return the generated template

    return NextResponse.json({ 
      success: true, 
      template: template,
      metadata: {
        methodology,
        callType,
        industry,
        templateType,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Template generation error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    )
  }
}
