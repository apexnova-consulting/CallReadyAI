import { NextResponse } from "next/server"
import { z } from "zod"
import OpenAI from "openai"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

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

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { prospectName, companyName, role, meetingLink, notes } = briefSchema.parse(body)

    // Check subscription limits
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    })

    const briefCount = await db.brief.count({
      where: { userId: session.user.id },
    })

    const briefLimit = subscription?.briefsLimit || 5
    if (briefCount >= briefLimit) {
      return NextResponse.json(
        { error: "Brief limit exceeded. Please upgrade your plan." },
        { status: 402 }
      )
    }

    // Generate AI brief
    const prompt = `You are CallReady AI, an expert sales strategist. Given prospect details, output a concise, actionable Call Brief in bullet points. Use these exact sections: 1. Prospect Overview 2. Company Context 3. Potential Pain Points 4. Key Talking Points 5. Questions to Ask 6. Competitive Insights. Keep it practical, short, and designed for a sales rep with 2 minutes to prep.

Prospect: ${prospectName}
Company: ${companyName}
Role: ${role}
${meetingLink ? `Meeting Link: ${meetingLink}` : ""}
${notes ? `Additional Notes: ${notes}` : ""}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0].message?.content || ""

    // Parse sections
    const sections = {
      overview: "",
      context: "",
      painPoints: "",
      talkingPoints: "",
      questions: "",
      competitive: "",
    }

    const sectionMatches = response.match(
      /(?:1\.\s*Prospect Overview([\s\S]*?)(?=2\.|$))?\s*(?:2\.\s*Company Context([\s\S]*?)(?=3\.|$))?\s*(?:3\.\s*Potential Pain Points([\s\S]*?)(?=4\.|$))?\s*(?:4\.\s*Key Talking Points([\s\S]*?)(?=5\.|$))?\s*(?:5\.\s*Questions to Ask([\s\S]*?)(?=6\.|$))?\s*(?:6\.\s*Competitive Insights([\s\S]*?)(?=$))?/
    )

    if (sectionMatches) {
      sections.overview = sectionMatches[1]?.trim() || "No overview provided"
      sections.context = sectionMatches[2]?.trim() || "No context provided"
      sections.painPoints = sectionMatches[3]?.trim() || "No pain points provided"
      sections.talkingPoints = sectionMatches[4]?.trim() || "No talking points provided"
      sections.questions = sectionMatches[5]?.trim() || "No questions provided"
      sections.competitive = sectionMatches[6]?.trim() || "No competitive insights provided"
    }

    // Save brief to database
    const brief = await db.brief.create({
      data: {
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
      },
    })

    // Update subscription usage
    if (subscription) {
      await db.subscription.update({
        where: { userId: session.user.id },
        data: { briefsUsed: { increment: 1 } },
      })
    }

    return NextResponse.json(brief)
  } catch (error) {
    console.error("Brief generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate brief" },
      { status: 500 }
    )
  }
}
