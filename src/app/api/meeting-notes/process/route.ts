import 'server-only'
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper function to extract transcript from file
async function extractTranscriptFromFile(file: File): Promise<string> {
  const fileType = file.type || ''
  const fileName = file.name.toLowerCase()

  // Check if it's a PDF
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    console.log("Processing PDF file...")
    // Use dynamic import to avoid webpack bundling issues
    const pdfParse = (await import('pdf-parse')).default
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const data = await pdfParse(buffer)
    return data.text
  }

  // Check if it's audio or video
  const isAudio = fileType.startsWith('audio/') || 
                  ['.mp3', '.wav', '.m4a', '.ogg', '.webm'].some(ext => fileName.endsWith(ext))
  const isVideo = fileType.startsWith('video/') || 
                  ['.mp4', '.mov', '.avi', '.webm'].some(ext => fileName.endsWith(ext))

  if (isAudio || isVideo) {
    console.log("Processing audio/video file for transcription...")
    return await transcribeAudioVideo(file)
  }

  throw new Error("Unsupported file type. Please upload a PDF, audio, or video file.")
}

// Helper function to transcribe audio/video using Gemini
async function transcribeAudioVideo(file: File): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("AI service not configured. Please contact support.")
  }

  // Convert file to base64
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64Data = buffer.toString('base64')

  // Determine MIME type
  const mimeType = file.type || 
    (file.name.toLowerCase().endsWith('.mp3') ? 'audio/mpeg' :
     file.name.toLowerCase().endsWith('.wav') ? 'audio/wav' :
     file.name.toLowerCase().endsWith('.m4a') ? 'audio/mp4' :
     file.name.toLowerCase().endsWith('.mp4') ? 'video/mp4' :
     file.name.toLowerCase().endsWith('.mov') ? 'video/quicktime' :
     'audio/mpeg') // default

  try {
    // Use Gemini 1.5 Pro which supports audio/video transcription
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent`
    
    console.log(`Transcribing ${mimeType} file, size: ${buffer.length} bytes`)
    
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Please transcribe this audio/video file completely. Provide a word-for-word transcript of all spoken content. Include speaker changes if detectable."
          }, {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini transcription error:", errorText)
      let errorMessage = `Transcription failed: ${response.status}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage
      } catch (e) {
        // Use errorText as is
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log("Gemini transcription response received")
    const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    if (!transcript.trim()) {
      console.error("Empty transcript from Gemini:", JSON.stringify(data, null, 2))
      throw new Error("No transcript generated from audio/video file. The file may be too long, corrupted, or contain no speech.")
    }

    console.log(`Transcript generated, length: ${transcript.length} characters`)
    return transcript
  } catch (error: any) {
    console.error("Error transcribing audio/video:", error)
    // Fallback: try with gemini-1.5-flash
    try {
      console.log("Trying fallback model: gemini-1.5-flash")
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Transcribe this audio/video file completely. Provide all spoken words."
            }, {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Fallback transcription error:", errorText)
        throw new Error(`Transcription failed: ${response.status}`)
      }

      const data = await response.json()
      const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      
      if (!transcript.trim()) {
        throw new Error("No transcript generated from audio/video file")
      }

      console.log(`Fallback transcript generated, length: ${transcript.length} characters`)
      return transcript
    } catch (fallbackError: any) {
      console.error("Fallback transcription also failed:", fallbackError)
      throw new Error(`Failed to transcribe file: ${fallbackError.message || 'Unknown error'}`)
    }
  }
}

// Helper function to process transcript with AI
async function processTranscriptWithAI(transcript: string) {
  // Check if Gemini API key is available
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI service not configured. Please contact support.")
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

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
  const apiKey = process.env.GEMINI_API_KEY || ''
  
  console.log("Calling Gemini API for analysis...")
  
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
  const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""

  if (!responseText || responseText.trim().length === 0) {
    throw new Error("Empty response from Gemini API")
  }

  console.log("Gemini response received, parsing...")

  // Try to parse JSON from the response
  let parsedResponse
  try {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                     responseText.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText
    parsedResponse = JSON.parse(jsonString)
  } catch (parseError) {
    console.error("Failed to parse JSON response, creating structured response from text")
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
  return {
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
    transcript: transcript
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let transcript: string = ''
    let shouldProcessWithAI = true

    // Check if request is FormData (file upload) or JSON (text transcript)
    const contentType = req.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      console.log("Processing file upload...")
      const formData = await req.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        )
      }

      try {
        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)
        
        // Add timeout wrapper for file processing (4.5 minutes to be safe)
        const processingPromise = extractTranscriptFromFile(file)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('File processing timed out. The file may be too large or complex.')), 4.5 * 60 * 1000)
        )
        
        transcript = await Promise.race([processingPromise, timeoutPromise]) as string
        
        if (!transcript || !transcript.trim()) {
          throw new Error("No transcript was extracted from the file. The file may be empty, corrupted, or in an unsupported format.")
        }
        
        console.log("Transcript extracted from file, length:", transcript.length)
        
        // Return transcript first, user can then click "Generate AI" to process
        return NextResponse.json({
          transcript: transcript,
          message: "File processed successfully. Click 'Generate AI Meeting Notes' to analyze."
        })
      } catch (error: any) {
        console.error("Error processing file:", error)
        
        let errorMessage = "Failed to process file"
        let errorDetails = error.message || "Unknown error"
        
        // Provide more helpful error messages
        if (errorDetails.includes('timeout') || errorDetails.includes('timed out')) {
          errorMessage = "File processing timed out. The file may be too large. Please try a smaller file (under 50MB recommended)."
        } else if (errorDetails.includes('No transcript') || errorDetails.includes('empty')) {
          errorMessage = "Could not extract content from the file. Please ensure the file contains audio, video, or text content."
        } else if (errorDetails.includes('Unsupported file type')) {
          errorMessage = "Unsupported file type. Please upload a PDF, audio file (MP3, WAV, M4A), or video file (MP4, MOV)."
        } else if (errorDetails.includes('quota') || errorDetails.includes('429')) {
          errorMessage = "AI service quota exceeded. Please try again later or use the 'Open in Gemini' option."
        } else if (errorDetails.includes('API key') || errorDetails.includes('401') || errorDetails.includes('403')) {
          errorMessage = "AI service authentication failed. Please contact support."
        }
        
        return NextResponse.json(
          { 
            error: errorMessage,
            details: errorDetails 
          },
          { status: 500 }
        )
      }
    } else {
      // Handle text transcript (existing flow)
      const body = await req.json()
      transcript = body.transcript

      if (!transcript || !transcript.trim()) {
        return NextResponse.json(
          { error: "Transcript is required" },
          { status: 400 }
        )
      }

      console.log("Processing meeting notes transcript...")
      
      // Process with AI
      const result = await processTranscriptWithAI(transcript)
      return NextResponse.json(result)
    }

  } catch (error: any) {
    console.error("Meeting notes processing error:", error)
    
    let errorMessage = "Failed to process meeting notes"
    let errorDetails = error.message || "Unknown error"
    
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
}

