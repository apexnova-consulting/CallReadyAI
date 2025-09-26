import { NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { storeBrief } from "@/lib/brief-storage"

const briefSchema = z.object({
  prospectName: z.string().min(1),
  companyName: z.string().min(1),
  role: z.string().min(1),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
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
  
  if (userLimit.count >= 10) { // 10 requests per minute
    return false
  }
  
  userLimit.count++
  return true
}

export async function POST(req: Request) {
  try {
    console.log("Brief generation request started")
    
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
        { error: "Rate limit exceeded. Please wait before generating another brief." },
        { status: 429 }
      )
    }

    const body = await req.json()
    console.log("Request body:", body)
    
    const { prospectName, companyName, role, meetingLink, notes } = briefSchema.parse(body)
    console.log("Parsed data:", { prospectName, companyName, role, meetingLink, notes })

    // For now, use mock data - will be replaced with real database queries
    const briefCount = 0 // Mock current brief count
    const briefLimit = 5 // Mock limit for free users
    if (briefCount >= briefLimit) {
      return NextResponse.json(
        { error: "Brief limit exceeded. Please upgrade your plan." },
        { status: 402 }
      )
    }

    // Generate AI brief with improved system prompt
    const systemPrompt = `You are CallReady AI, an expert sales strategist. Given prospect details, output a concise, actionable Call Brief in bullet points. Use exactly these sections:

1. Prospect Overview
2. Company Context  
3. Potential Pain Points
4. Key Talking Points
5. Questions to Ask
6. Competitive Insights

Keep it practical, short, and designed for a sales rep with 2 minutes to prep. Each section should have 3-5 bullet points maximum.`

    const userPrompt = `Prospect: ${prospectName}
Company: ${companyName}
Role: ${role}
${meetingLink ? `Meeting Link: ${meetingLink}` : ""}
${notes ? `Additional Notes: ${notes}` : ""}`

    console.log("Calling Google Gemini API...")
    
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
      const fallbackResponse = `1. Prospect Overview
• ${prospectName} is the ${role} at ${companyName}
• Key decision maker for sales opportunities
• Professional with industry experience

2. Company Context
• ${companyName} is a growing company in their industry
• Looking to improve their business processes
• Potential for significant growth and expansion

3. Potential Pain Points
• Manual processes slowing down operations
• Lack of visibility into key metrics
• Difficulty scaling current solutions
• Need for better efficiency and automation

4. Key Talking Points
• Our solution addresses their specific challenges
• Proven ROI with similar companies
• Easy implementation and user adoption
• Strong support and training programs

5. Questions to Ask
• What's your biggest challenge right now?
• How do you currently handle this process?
• What would success look like for you?
• What's your timeline for making a decision?

6. Competitive Insights
• Focus on our unique value proposition
• Emphasize customer success stories
• Highlight our superior support and training
• Address any competitive concerns directly`

      response = fallbackResponse
    }

    console.log("Gemini response received")
    console.log("Response length:", response.length)

    if (!response || response.trim().length === 0) {
      console.log("Empty response from Gemini, using fallback template")
      
      // Fallback template if OpenAI fails
      const fallbackResponse = `1. Prospect Overview
• ${prospectName} is the ${role} at ${companyName}
• Key decision maker for sales opportunities
• Professional with industry experience

2. Company Context
• ${companyName} is a growing company in their industry
• Looking to improve their business processes
• Potential for significant growth and expansion

3. Potential Pain Points
• Manual processes slowing down operations
• Lack of visibility into key metrics
• Difficulty scaling current solutions
• Need for better efficiency and automation

4. Key Talking Points
• Our solution addresses their specific challenges
• Proven ROI with similar companies
• Easy implementation and user adoption
• Strong support and training programs

5. Questions to Ask
• What's your biggest challenge right now?
• How do you currently handle this process?
• What would success look like for you?
• What's your timeline for making a decision?

6. Competitive Insights
• Focus on our unique value proposition
• Emphasize customer success stories
• Highlight our superior support and training
• Address any competitive concerns directly`
      
      const sections = {
        overview: "• " + prospectName + " is the " + role + " at " + companyName + "\n• Key decision maker for sales opportunities\n• Professional with industry experience",
        context: "• " + companyName + " is a growing company in their industry\n• Looking to improve their business processes\n• Potential for significant growth and expansion",
        painPoints: "• Manual processes slowing down operations\n• Lack of visibility into key metrics\n• Difficulty scaling current solutions\n• Need for better efficiency and automation",
        talkingPoints: "• Our solution addresses their specific challenges\n• Proven ROI with similar companies\n• Easy implementation and user adoption\n• Strong support and training programs",
        questions: "• What's your biggest challenge right now?\n• How do you currently handle this process?\n• What would success look like for you?\n• What's your timeline for making a decision?",
        competitive: "• Focus on our unique value proposition\n• Emphasize customer success stories\n• Highlight our superior support and training\n• Address any competitive concerns directly"
      }
      
      const brief = {
        id: `brief_${Date.now()}`,
        userId: session.user.id,
        prospectName,
        companyName,
        role,
        meetingLink,
        notes,
        overview: sections.overview,
        context: sections.context,
        painPoints: sections.painPoints,
        talkingPoints: sections.talkingPoints,
        questions: sections.questions,
        competitive: sections.competitive,
        createdAt: new Date().toISOString(),
      }

      // Store brief in memory
      storeBrief(brief)

      return NextResponse.json({ 
        success: true, 
        brief: brief,
        message: "Brief generated successfully (using fallback template)"
      })
    }

    // Improved section parsing
    const parseSection = (content: string, sectionName: string): string => {
      const regex = new RegExp(`${sectionName}[\\s\\S]*?(?=\\d+\\.|$)`, 'i')
      const match = content.match(regex)
      if (match) {
        return match[0].replace(sectionName, '').trim()
      }
      return `No ${sectionName.toLowerCase()} provided`
    }

    const sections = {
      overview: parseSection(response, "1. Prospect Overview"),
      context: parseSection(response, "2. Company Context"),
      painPoints: parseSection(response, "3. Potential Pain Points"),
      talkingPoints: parseSection(response, "4. Key Talking Points"),
      questions: parseSection(response, "5. Questions to Ask"),
      competitive: parseSection(response, "6. Competitive Insights"),
    }

    // Create brief object
    const brief = {
      id: `brief_${Date.now()}`,
      userId: session.user.id,
      prospectName,
      companyName,
      role,
      meetingLink,
      notes,
      overview: sections.overview,
      context: sections.context,
      painPoints: sections.painPoints,
      talkingPoints: sections.talkingPoints,
      questions: sections.questions,
      competitive: sections.competitive,
      createdAt: new Date().toISOString(),
    }

    // Store brief in memory
    storeBrief(brief)

    return NextResponse.json({ 
      success: true, 
      brief: brief,
      message: "Brief generated successfully"
    })
  } catch (error) {
    console.error("Brief generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate brief" },
      { status: 500 }
    )
  }
}
