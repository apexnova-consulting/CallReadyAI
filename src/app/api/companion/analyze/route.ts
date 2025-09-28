import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getBrief } from "@/lib/brief-storage"

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { briefId, transcript, fullTranscript } = body

    // Get the original brief for context
    const brief = getBrief(briefId)
    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 })
    }

    // AI analysis prompt for real-time assistance
    const systemPrompt = `You are CallReady AI, a live sales assistant. Based on the ongoing conversation transcript, provide:

1. Suggested talking points (2-3 relevant points to bring up)
2. Objection-handling prompts (common objections and responses)
3. Key follow-up notes (important points to remember)

Keep output concise, context-aware, and actionable for immediate use during the call.`

    const userPrompt = `
ORIGINAL BRIEF CONTEXT:
Prospect: ${brief.prospectName}
Company: ${brief.companyName}
Role: ${brief.role}
Pain Points: ${brief.painPoints}
Talking Points: ${brief.talkingPoints}
Buyer Intent Signals: ${brief.buyerIntentSignals}

CURRENT CONVERSATION:
${fullTranscript}

NEW CONVERSATION SEGMENT:
${transcript}

Provide real-time assistance based on the conversation flow.`

    console.log("Analyzing transcript for companion mode...")

    // Call Gemini API for real-time analysis
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      )
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // Parse the AI response
    const analysis = parseCompanionResponse(response)

    return NextResponse.json(analysis)

  } catch (error) {
    console.error("Companion analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze conversation" },
      { status: 500 }
    )
  }
}

function parseCompanionResponse(response: string) {
  // Parse AI response into structured format
  const lines = response.split('\n').filter(line => line.trim())
  
  const talkingPoints: string[] = []
  const objectionHandling: string[] = []
  const keyNotes: string[] = []
  
  let currentSection = ''
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.toLowerCase().includes('talking point') || trimmedLine.includes('💡')) {
      currentSection = 'talking'
    } else if (trimmedLine.toLowerCase().includes('objection') || trimmedLine.includes('🛡️')) {
      currentSection = 'objection'
    } else if (trimmedLine.toLowerCase().includes('note') || trimmedLine.includes('📝')) {
      currentSection = 'notes'
    } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
      const content = trimmedLine.substring(1).trim()
      
      switch (currentSection) {
        case 'talking':
          talkingPoints.push(content)
          break
        case 'objection':
          objectionHandling.push(content)
          break
        case 'notes':
          keyNotes.push(content)
          break
      }
    }
  }
  
  return {
    talkingPoints: talkingPoints.length > 0 ? talkingPoints : [
      "Ask about their current challenges",
      "Discuss ROI and business impact",
      "Address any concerns directly"
    ],
    objectionHandling: objectionHandling.length > 0 ? objectionHandling : [
      "Listen actively and acknowledge concerns",
      "Provide relevant case studies",
      "Focus on value and outcomes"
    ],
    keyNotes: keyNotes.length > 0 ? keyNotes : [
      "Document key pain points mentioned",
      "Note decision-making timeline",
      "Record next steps agreed upon"
    ]
  }
}

