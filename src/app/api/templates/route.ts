import { NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"

const templateSchema = z.object({
  methodology: z.string().min(1),
  callType: z.string().min(1),
  industry: z.string().min(1),
  templateType: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    console.log("Template generation request started")
    
    const session = await getSession()
    if (!session?.user?.id) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Session found:", session.user.id)

    const body = await req.json()
    const { methodology, callType, industry, templateType } = templateSchema.parse(body)

    console.log("Template data validated:", { methodology, callType, industry, templateType })

    // Generate AI template with improved system prompt
    const systemPrompt = `You are CallReady AI, an expert sales strategist. Generate a professional ${templateType} template based on the following criteria:

Sales Methodology: ${methodology}
Call Type: ${callType}
Industry: ${industry}
Template Type: ${templateType}

IMPORTANT: Create a unique, professional template tailored to the specific methodology, call type, and industry. Include relevant industry-specific language, pain points, and value propositions. Make it actionable and ready to use.`

    const userPrompt = `Create a ${templateType} template for ${callType} calls using ${methodology} methodology in the ${industry} industry.`

    console.log("Calling Google Gemini API for template...")
    
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.log("Gemini API key not found")
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 500 }
      )
    }

    let response
    try {
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
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
            maxOutputTokens: 1200,
          }
        })
      })

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.status}`)
      }

      const geminiData = await geminiResponse.json()
      response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
      
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError)
      
      // Use fallback template when AI fails
      console.log("Using fallback template due to AI error")
      const fallbackResponse = `# ${templateType} Template - ${methodology} Methodology

## Industry: ${industry}
## Call Type: ${callType}

### Template Structure:

**Opening:**
- Introduction and rapport building
- Purpose of the call
- Agenda overview

**Discovery Questions:**
- Industry-specific pain points
- Current challenges
- Goals and objectives
- Decision-making process

**Value Proposition:**
- Key benefits relevant to ${industry}
- ROI and business impact
- Competitive advantages
- Success stories

**Next Steps:**
- Clear action items
- Timeline and follow-up
- Resource requirements
- Decision criteria

### ${industry} Specific Considerations:
- Industry terminology and challenges
- Regulatory requirements (if applicable)
- Budget cycles and timing
- Key stakeholders and influencers

### ${methodology} Framework:
- Follow the ${methodology} methodology principles
- Adapt to ${callType} call objectives
- Maintain professional tone
- Focus on value creation`

      response = fallbackResponse
    }

    console.log("Template response received")
    console.log("Response length:", response.length)

    if (!response || response.trim().length === 0) {
      console.log("Empty response, using basic fallback")
      response = `# ${templateType} Template\n\n## ${methodology} Methodology for ${callType} Calls\n\n### Industry: ${industry}\n\n**Template content will be generated here.**`
    }

    // Parse the response into sections
    const sections = {
      overview: `Template for ${callType} calls using ${methodology} methodology in the ${industry} industry`,
      content: response,
      methodology: methodology,
      callType: callType,
      industry: industry,
      templateType: templateType
    }

    console.log("Template generated successfully")

    return NextResponse.json({
      success: true,
      template: {
        id: `template_${Date.now()}`,
        userId: session.user.id,
        methodology,
        callType,
        industry,
        templateType,
        content: response,
        sections,
        createdAt: new Date().toISOString()
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
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
