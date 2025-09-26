import { NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"

const templateSchema = z.object({
  methodology: z.string().min(1),
  callType: z.string().min(1),
  industry: z.string().min(1),
  templateType: z.string().min(1),
})

// Fallback template generator
function generateFallbackTemplate(methodology: string, callType: string, industry: string, templateType: string): string {
  if (templateType === "Call Script") {
    return `${methodology} Call Script for ${callType} - ${industry}

OPENING (30 seconds)
"Hi [Prospect Name], this is [Your Name] from [Your Company]. I'm calling because we've helped other ${industry} companies like yours [specific benefit]. Do you have a few minutes to discuss how we might help [Company Name] achieve similar results?"

DISCOVERY QUESTIONS (5-7 minutes)
• What's your biggest challenge in [relevant area] right now?
• How are you currently handling [specific process]?
• What would success look like for you in the next 6 months?
• Who else is involved in decisions like this?
• What's your timeline for finding a solution?

VALUE PROPOSITION (2-3 minutes)
"Based on what you've shared, it sounds like [Company Name] could benefit from our ${methodology} approach. We've helped similar ${industry} companies:
• [Specific benefit 1]
• [Specific benefit 2]
• [Specific benefit 3]

Would you be interested in exploring how this could work for your situation?"

OBJECTION HANDLING
If price concern: "I understand budget is always a consideration. Let me ask - what would it cost your company if this challenge continues for another 6 months?"

If timing concern: "That makes sense. When would be the ideal time to address this?"

If authority concern: "Who would be the best person to include in this conversation?"

CLOSING
"Based on our conversation, I think a [next step] would be valuable. I'd like to [specific next step]. Does that sound like it would work for your schedule?"

FOLLOW-UP
"Great! I'll send you a calendar invite for [day/time]. I'll also email you some additional information about how we've helped similar ${industry} companies. Is there anything specific you'd like me to include?"

Remember: Listen more than you talk. Ask follow-up questions. Focus on their pain points, not your features.`
  }

  if (templateType === "Email Template") {
    return `Subject: Quick question about ${industry} [Company Name] challenges

Hi [Prospect Name],

I hope this email finds you well. I'm [Your Name] from [Your Company].

I'm reaching out because we've been helping other ${industry} companies like [Company Name] solve [specific challenge]. I noticed that companies in your space often struggle with [relevant pain point].

I was wondering - is [specific challenge] something you're currently dealing with at [Company Name]?

If so, I'd love to share a quick case study about how we helped [Similar Company] achieve [specific result] using our ${methodology} approach.

Would you be open to a brief 15-minute call this week to discuss whether this might be relevant for your situation?

Best regards,
[Your Name]
[Your Title]
[Your Company]
[Phone Number]
[Email]

P.S. If this isn't relevant right now, no worries at all. Just let me know and I'll remove you from my follow-up list.`
  }

  if (templateType === "Voicemail Script") {
    return `${methodology} Voicemail Script for ${callType} - ${industry}

"Hi [Prospect Name], this is [Your Name] from [Your Company]. I'm calling because we've helped other ${industry} companies like [Company Name] [specific benefit]. 

I'd love to share a quick example of how we helped [Similar Company] achieve [specific result]. 

I'll try calling you again [specific day/time], but if you'd like to connect sooner, you can reach me at [phone number] or just reply to this voicemail.

Thanks for your time, and I look forward to speaking with you soon."

[Pause for 2 seconds before hanging up]`
  }

  if (templateType === "Follow-up Sequence") {
    return `Follow-up Sequence for ${callType} - ${industry} using ${methodology}

EMAIL 1 (Day 1 - Immediately after initial contact)
Subject: Quick follow-up on [Company Name]'s ${industry} challenges

Hi [Prospect Name],

Following up on my voicemail about helping ${industry} companies like [Company Name] solve [specific challenge].

I've attached a brief case study showing how we helped [Similar Company] achieve [specific result]. 

Would you be interested in a 15-minute call to discuss whether this approach might work for [Company Name]?

Best,
[Your Name]

EMAIL 2 (Day 4)
Subject: [Company Name] - quick question

Hi [Prospect Name],

I know you're busy, so I'll keep this brief.

I'm curious - is [specific challenge] currently impacting [Company Name]'s ability to [specific business outcome]?

If yes, I'd love to share a 2-minute story about how we helped [Similar Company] overcome this exact challenge.

Quick 15-minute call this week?

[Your Name]

CALL SCRIPT (Day 7)
"Hi [Prospect Name], this is [Your Name] following up on my emails about [specific challenge]. I know you're busy, so I'll be brief. 

Is [specific challenge] something that's currently affecting [Company Name]'s [business outcome]? 

If so, I have a quick story about how we helped [Similar Company] solve this exact problem. Do you have 2 minutes to hear it?"

EMAIL 3 (Day 10 - Final follow-up)
Subject: Last follow-up - [Company Name]

Hi [Prospect Name],

I've reached out a few times about helping ${industry} companies like [Company Name] solve [specific challenge].

I don't want to be a nuisance, so this will be my last follow-up.

If [specific challenge] is something you'd like to address, I'm here. If not, no worries at all.

Best regards,
[Your Name]

[Remove from follow-up list after this email]`
  }

  // Default fallback
  return `Template for ${methodology} - ${callType} - ${industry}

This is a ${templateType} template for ${callType} calls using the ${methodology} methodology in the ${industry} industry.

Key Elements:
• Opening that establishes credibility and relevance
• Discovery questions to understand their challenges
• Value proposition tailored to ${industry}
• Objection handling specific to ${callType}
• Clear next steps and follow-up

Remember to:
1. Research the prospect and company beforehand
2. Personalize the template with specific details
3. Focus on their pain points, not your features
4. Always ask for a clear next step

Customize this template based on your specific conversation and the prospect's responses.`
}

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
      console.log("Making Gemini API request...")
      console.log("API Key length:", process.env.GEMINI_API_KEY?.length || 0)
      
      const requestBody = {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      }
      
      console.log("Request body prepared, making API call...")
      
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log("Gemini response status:", geminiResponse.status)
      console.log("Gemini response headers:", Object.fromEntries(geminiResponse.headers.entries()))

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text()
        console.error("Gemini API error response:", errorText)
        throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
      }

      const geminiData = await geminiResponse.json()
      console.log("Gemini response data:", JSON.stringify(geminiData, null, 2))
      
      template = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
      console.log("Extracted template:", template.substring(0, 100) + "...")
      
    } catch (geminiError) {
      console.error("Gemini API error details:", geminiError)
      console.error("Error message:", geminiError instanceof Error ? geminiError.message : "Unknown error")
      console.error("Error stack:", geminiError instanceof Error ? geminiError.stack : "No stack")
      
      // Return a more helpful error message
      const errorMessage = geminiError instanceof Error ? geminiError.message : "Unknown error"
      return NextResponse.json(
        { 
          error: "AI service temporarily unavailable. Please try again in a few moments.",
          details: errorMessage
        },
        { status: 503 }
      )
    }

    console.log("Gemini response received")

    if (!template || template.trim().length === 0) {
      console.log("No template content received from Gemini, using fallback template")
      
      // Fallback template based on the selected options
      const fallbackTemplate = generateFallbackTemplate(methodology, callType, industry, templateType)
      
      return NextResponse.json({ 
        success: true, 
        template: fallbackTemplate,
        message: "Template generated successfully (using fallback template)"
      })
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
