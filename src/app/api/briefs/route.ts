import { NextResponse } from "next/server"
import { z } from "zod"
import OpenAI from "openai"
import { getSession } from "@/lib/auth"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    console.log("Calling OpenAI API...")
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1200,
    })

    console.log("OpenAI response received")
    const response = completion.choices[0].message?.content || ""
    console.log("Response length:", response.length)

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

    // Create mock brief object - will be replaced with real database save
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
