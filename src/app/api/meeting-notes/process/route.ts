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

    // Create comprehensive prompt for meeting notes analysis with speaker identification
    const systemPrompt = `You are CallReady AI, an expert meeting notes analyzer. Analyze the provided meeting transcript and generate:

1. A comprehensive meeting summary (2-3 paragraphs)
2. Key discussion points (5-7 bullet points)
3. Action items with clear ownership and deadlines (3-5 items)
4. A professional follow-up email ready to send
5. Speaker identification - identify different speakers and organize the transcript by speaker

IMPORTANT: Identify different speakers in the transcript. Use context clues like:
- Different speaking patterns, vocabulary, or topics
- Names mentioned or self-references
- Question/answer patterns
- Different perspectives or roles

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
  "speakers": [
    {
      "id": "speaker1",
      "name": "Speaker 1 or inferred name",
      "role": "Inferred role if possible",
      "quotes": ["Key quote 1", "Key quote 2"]
    }
  ],
  "transcriptBySpeaker": [
    {
      "speaker": "Speaker 1",
      "text": "What they said"
    }
  ],
  "followUpEmail": {
    "subject": "Email subject line",
    "body": "Email body text"
  }
}`

    const userPrompt = `Please analyze this meeting transcript and provide the requested information:

MEETING TRANSCRIPT:
${transcript}`

    try {
      // Try the new API endpoint first, fallback to old one
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
      const apiKey = process.env.GEMINI_API_KEY || ''
      
      console.log("Calling Gemini API...")
      console.log("API Key present:", !!apiKey)
      console.log("API Key length:", apiKey.length)
      
      const geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
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

      console.log("Gemini response status:", geminiResponse.status)

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text()
        console.error("Gemini API error response:", errorText)
        
        // Try to parse error JSON
        let errorMessage = `Gemini API error: ${geminiResponse.status}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorJson.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const geminiData = await geminiResponse.json()
      console.log("Gemini response data keys:", Object.keys(geminiData))
      
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
      console.log("Gemini response text length:", responseText.length)
      console.log("Gemini response preview:", responseText.substring(0, 200))

      if (!responseText || responseText.trim().length === 0) {
        throw new Error("Empty response from Gemini API")
      }

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
        speakers: Array.isArray(parsedResponse.speakers) 
          ? parsedResponse.speakers 
          : [],
        transcriptBySpeaker: Array.isArray(parsedResponse.transcriptBySpeaker) 
          ? parsedResponse.transcriptBySpeaker 
          : [],
        followUpEmail: {
          subject: parsedResponse.followUpEmail?.subject || "Follow-up: Meeting Notes",
          body: parsedResponse.followUpEmail?.body || "Thank you for the meeting. Here are the key points we discussed."
        },
        transcript: transcript // Include original transcript for Gemini integration
      }

      return NextResponse.json(result)
    } catch (geminiError: any) {
      console.error("Gemini API error:", geminiError)
      console.error("Error stack:", geminiError.stack)
      
      // Provide a helpful error message
      let errorMessage = "Failed to process meeting notes"
      let errorDetails = geminiError.message || "Unknown error"
      
      if (errorDetails.includes("API key") || errorDetails.includes("401") || errorDetails.includes("403")) {
        errorMessage = "AI service authentication failed. Please contact support."
      } else if (errorDetails.includes("quota") || errorDetails.includes("429")) {
        errorMessage = "AI service quota exceeded. Please try again later."
      } else if (errorDetails.includes("network") || errorDetails.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again."
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails
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

