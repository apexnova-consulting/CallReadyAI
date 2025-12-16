import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { transcript } = body

    if (!transcript || !transcript.trim()) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      )
    }

    console.log("Processing meeting notes transcript...")

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 500 }
      )
    }

    // Create comprehensive prompt for meeting notes analysis
    const systemPrompt = `You are CallReady AI, an expert meeting notes analyzer. Analyze the provided meeting transcript and generate:

1. A comprehensive meeting summary (2-3 paragraphs)
2. Key discussion points (5-7 bullet points)
3. Action items with clear ownership and deadlines (3-5 items)
4. A professional follow-up email ready to send

The follow-up email should:
- Be professional but personable
- Reference specific discussion points from the meeting
- Include clear next steps
- Be concise (under 200 words)
- Have a compelling subject line

Format your response as JSON with the following structure:
{
  "summary": "Meeting summary text",
  "keyPoints": ["point 1", "point 2", ...],
  "actionItems": ["action 1", "action 2", ...],
  "followUpEmail": {
    "subject": "Email subject line",
    "body": "Email body text"
  }
}`

    const userPrompt = `Please analyze this meeting transcript and provide the requested information:

MEETING TRANSCRIPT:
${transcript}`

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': process.env.GEMINI_API_KEY || '',
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
        }
      )

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text()
        console.error("Gemini API error response:", errorText)
        throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
      }

      const geminiData = await geminiResponse.json()
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""

      console.log("Gemini response received, parsing...")

      // Try to parse JSON from the response
      let parsedResponse
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                         responseText.match(/\{[\s\S]*\}/)
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText
        parsedResponse = JSON.parse(jsonString)
      } catch (parseError) {
        console.error("Failed to parse JSON response, creating structured response from text")
        // Fallback: create structured response from text
        const lines = responseText.split('\n').filter(line => line.trim())
        parsedResponse = {
          summary: responseText.substring(0, 500) || "Meeting summary generated from transcript.",
          keyPoints: lines.slice(0, 5).filter(line => line.trim() && !line.startsWith('#')),
          actionItems: lines.slice(5, 8).filter(line => line.trim() && !line.startsWith('#')),
          followUpEmail: {
            subject: "Follow-up: Meeting Notes",
            body: responseText.substring(0, 1000) || "Thank you for the meeting. Here are the key points we discussed."
          }
        }
      }

      // Ensure all required fields exist
      const result = {
        summary: parsedResponse.summary || "Meeting summary generated from transcript.",
        keyPoints: Array.isArray(parsedResponse.keyPoints) 
          ? parsedResponse.keyPoints 
          : ["Key points extracted from meeting"],
        actionItems: Array.isArray(parsedResponse.actionItems) 
          ? parsedResponse.actionItems 
          : ["Action items to be determined"],
        followUpEmail: {
          subject: parsedResponse.followUpEmail?.subject || "Follow-up: Meeting Notes",
          body: parsedResponse.followUpEmail?.body || "Thank you for the meeting. Here are the key points we discussed."
        },
        transcript: transcript // Include original transcript for Gemini integration
      }

      return NextResponse.json(result)
    } catch (geminiError: any) {
      console.error("Gemini API error:", geminiError)
      return NextResponse.json(
        { 
          error: "Failed to process meeting notes",
          details: geminiError.message 
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Meeting notes processing error:", error)
    return NextResponse.json(
      { 
        error: "Failed to process meeting notes",
        details: error.message 
      },
      { status: 500 }
    )
  }
}

