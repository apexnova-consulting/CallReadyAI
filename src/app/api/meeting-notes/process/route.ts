import 'server-only'
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import AdmZip from 'adm-zip'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper function to extract transcript from ZIP file
async function extractTranscriptFromZip(file: File): Promise<string> {
  console.log("Processing ZIP file...")
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const zip = new AdmZip(buffer)
  const zipEntries = zip.getEntries()
  
  const transcripts: string[] = []
  const supportedExtensions = ['.pdf', '.mp3', '.wav', '.m4a', '.mp4', '.mov', '.avi', '.webm', '.txt', '.docx']
  
  for (const entry of zipEntries) {
    if (entry.isDirectory) continue
    
    const entryName = entry.entryName.toLowerCase()
    const extension = entryName.substring(entryName.lastIndexOf('.'))
    
    if (!supportedExtensions.includes(extension)) {
      console.log(`Skipping unsupported file in ZIP: ${entry.entryName}`)
      continue
    }
    
    try {
      const fileData = entry.getData()
      const tempFile = new File([fileData], entry.entryName, { type: entry.entryName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream' })
      
      console.log(`Processing file from ZIP: ${entry.entryName}`)
      const transcript = await extractTranscriptFromFile(tempFile)
      if (transcript && transcript.trim()) {
        transcripts.push(`\n\n--- File: ${entry.entryName} ---\n\n${transcript}`)
      }
    } catch (error: any) {
      console.error(`Error processing ${entry.entryName} from ZIP:`, error.message)
      // Continue with other files
    }
  }
  
  if (transcripts.length === 0) {
    throw new Error("No supported files found in ZIP archive. Please include PDF, audio, video, or text files.")
  }
  
  return transcripts.join('\n\n')
}

// Helper function to extract transcript from file
async function extractTranscriptFromFile(file: File): Promise<string> {
  const fileType = file.type || ''
  const fileName = file.name.toLowerCase()

  // Check if it's a ZIP file
  if (fileType === 'application/zip' || fileType === 'application/x-zip-compressed' || fileName.endsWith('.zip')) {
    return await extractTranscriptFromZip(file)
  }

  // Check if it's a PDF - Use pdf-parse first, then Gemini API fallback
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    console.log("Processing PDF file...")
    
    // Validate file size first
    if (file.size === 0) {
      throw new Error("PDF file is empty")
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error("PDF file is too large (max 50MB). Please use a smaller file.")
    }
    
    // Try pdf-parse first (fast and reliable for text PDFs)
    let pdfParseError: any = null
    try {
      const pdfParse = (await import('pdf-parse')).default
      const arrayBuffer = await file.arrayBuffer()
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error("PDF file data is empty")
      }
      
      const buffer = Buffer.from(arrayBuffer)
      console.log(`PDF size: ${buffer.length} bytes, attempting pdf-parse...`)
      
      // Validate PDF magic bytes
      const pdfHeader = buffer.slice(0, 4).toString()
      if (pdfHeader !== '%PDF') {
        throw new Error(`Invalid PDF file: File does not start with PDF magic bytes. Got: ${pdfHeader}`)
      }
      console.log("PDF header validated:", pdfHeader)
      
      // Add timeout for PDF parsing (10 seconds - should be instant for small files)
      const parsePromise = pdfParse(buffer)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF parsing timed out after 10 seconds')), 10000)
      )
      
      const startTime = Date.now()
      const data = await Promise.race([parsePromise, timeoutPromise]) as any
      const parseTime = Date.now() - startTime
      console.log(`PDF parsing completed in ${parseTime}ms`)
      
      if (!data) {
        throw new Error("PDF parsing returned no data")
      }
      
      // Extract text from the parsed data
      const text = data.text || ''
      console.log(`PDF parse result - text length: ${text.length}, type: ${typeof text}, has content: ${!!text.trim()}`)
      
      if (text && typeof text === 'string' && text.trim()) {
        const trimmedText = text.trim()
        console.log(`PDF parsed successfully with pdf-parse, extracted ${trimmedText.length} characters`)
        console.log(`First 200 chars of extracted text: ${trimmedText.substring(0, 200)}`)
        return trimmedText
      }
      
      // If no text, log details and try Gemini fallback
      console.warn("PDF-parse returned no text. Data structure:", {
        hasText: !!data.text,
        textLength: data.text?.length || 0,
        textType: typeof data.text,
        dataKeys: Object.keys(data),
        numPages: data.numpages,
        info: data.info
      })
      console.log("PDF-parse returned no text, trying Gemini API fallback...")
      pdfParseError = new Error("PDF-parse returned no extractable text")
      
    } catch (error: any) {
      console.error("PDF-parse error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      })
      console.warn("PDF-parse failed, will try Gemini API fallback:", error.message)
      pdfParseError = error
    }
    
    // Fallback: Use Gemini API with gemini-2.0-flash (works in other parts of codebase)
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      const errorMsg = pdfParseError?.message || 'Unknown error'
      if (errorMsg.includes('timeout')) {
        throw new Error(`PDF parsing timed out. The file may be too large or complex. Please try a smaller file.`)
      } else if (errorMsg.includes('password') || errorMsg.includes('encrypted')) {
        throw new Error(`PDF is password-protected. Please remove the password and try again.`)
      } else if (errorMsg.includes('no text') || errorMsg.includes('empty') || errorMsg.includes('no extractable')) {
        throw new Error(`PDF contains no extractable text. The PDF may contain only images. Please ensure the PDF has selectable text (not just scanned images).`)
      } else {
        throw new Error(`PDF parsing failed: ${errorMsg}. Please ensure the PDF contains selectable text and is not corrupted.`)
      }
    }
    
    if (file.size > 20 * 1024 * 1024) { // 20MB limit for Gemini
      throw new Error("PDF file is too large for AI processing (max 20MB). Please use a smaller file.")
    }
    
    try {
      console.log("Attempting Gemini API fallback for PDF processing...")
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64Data = buffer.toString('base64')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      // Use gemini-2.0-flash (works in other parts of codebase)
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
      const startTime = Date.now()
      
      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Extract all text content from this PDF document. Return only the raw text content, no formatting, no analysis, no explanations. Just the text."
            }, {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Data
              }
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          }
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const fetchTime = Date.now() - startTime
      console.log(`Gemini API PDF processing completed in ${fetchTime}ms`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Gemini API error response:", errorText)
        
        let errorMessage = `Gemini API error: ${response.status}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorJson.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        
        // If Gemini also fails, throw the original pdf-parse error
        throw new Error(errorMessage)
      }
      
      const geminiData = await response.json()
      const extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
      
      if (!extractedText || !extractedText.trim()) {
        throw new Error("PDF appears to be empty or contains no extractable text. The PDF may contain only images or be password-protected.")
      }
      
      const trimmedText = extractedText.trim()
      console.log(`PDF processed successfully via Gemini API, extracted ${trimmedText.length} characters`)
      return trimmedText
      
    } catch (geminiError: any) {
      console.error("Gemini API fallback also failed:", geminiError.message)
      console.error("Gemini error details:", JSON.stringify(geminiError, null, 2))
      console.error("Original pdf-parse error:", pdfParseError?.message)
      
      // Return the most helpful error message with actual details
      const pdfErrorMsg = pdfParseError?.message || ''
      const geminiErrorMsg = geminiError.message || ''
      const combinedError = `${pdfErrorMsg}${pdfErrorMsg && geminiErrorMsg ? ' | ' : ''}${geminiErrorMsg}` || 'Unknown error'
      
      console.error("Combined error message:", combinedError)
      
      if (combinedError.includes('timeout')) {
        throw new Error(`PDF processing timed out. The file may be too large or complex. Please try a smaller file.`)
      } else if (combinedError.includes('password') || combinedError.includes('encrypted')) {
        throw new Error(`PDF is password-protected. Please remove the password and try again.`)
      } else if ((combinedError.includes('quota') && combinedError.includes('exceeded')) || combinedError.includes('429') || combinedError.includes('RESOURCE_EXHAUSTED')) {
        throw new Error(`AI service quota exceeded. Please try again later.`)
      } else if (combinedError.includes('not found') || combinedError.includes('not supported') || combinedError.includes('models/')) {
        // If Gemini model doesn't support PDFs, provide helpful guidance
        if (pdfErrorMsg.includes('no text') || pdfErrorMsg.includes('empty') || pdfErrorMsg.includes('no extractable')) {
          throw new Error(`PDF contains no extractable text. The PDF may contain only images. Please ensure the PDF has selectable text (not just scanned images). If this is a scanned PDF, please use OCR software to convert it to text first.`)
        } else {
          throw new Error(`PDF parsing failed: ${pdfErrorMsg || 'Unable to extract text from PDF'}. Please ensure the PDF contains selectable text and is not corrupted. If the PDF is valid, please try again or contact support.`)
        }
      } else if (combinedError.includes('no text') || combinedError.includes('empty') || combinedError.includes('no extractable')) {
        throw new Error(`PDF contains no extractable text. The PDF may contain only images. Please ensure the PDF has selectable text (not just scanned images). If this is a scanned PDF, please use OCR software to convert it to text first.`)
      } else {
        // Include actual error details for debugging
        const detailedError = pdfErrorMsg || geminiErrorMsg || 'Unknown error'
        throw new Error(`PDF parsing failed: ${detailedError}. Please ensure the PDF contains selectable text and is not corrupted. If the PDF is valid, please try again or contact support with this error message.`)
      }
    }
  }

  // Check if it's audio or video - support all common formats including Zoom
  const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.flac', '.aac', '.wma', '.opus', '.m4b']
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.wmv', '.m4v', '.3gp', '.ogv', '.ts', '.mts']
  
  const isAudio = fileType.startsWith('audio/') || audioExtensions.some(ext => fileName.endsWith(ext))
  const isVideo = fileType.startsWith('video/') || videoExtensions.some(ext => fileName.endsWith(ext))

  if (isAudio || isVideo) {
    console.log("Processing audio/video file for transcription...")
    return await transcribeAudioVideo(file)
  }

  throw new Error("Unsupported file type. Please upload a PDF, audio, video file, or ZIP archive containing these files.")
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

  // Determine MIME type with better detection
  const fileName = file.name.toLowerCase()
  let mimeType = file.type
  
  if (!mimeType || mimeType === 'application/octet-stream') {
    // Detect from extension
    if (fileName.endsWith('.mp3')) mimeType = 'audio/mpeg'
    else if (fileName.endsWith('.wav')) mimeType = 'audio/wav'
    else if (fileName.endsWith('.m4a') || fileName.endsWith('.m4b')) mimeType = 'audio/mp4'
    else if (fileName.endsWith('.mp4')) mimeType = 'video/mp4'
    else if (fileName.endsWith('.mov')) mimeType = 'video/quicktime'
    else if (fileName.endsWith('.avi')) mimeType = 'video/x-msvideo'
    else if (fileName.endsWith('.webm')) mimeType = fileType.startsWith('audio/') ? 'audio/webm' : 'video/webm'
    else if (fileName.endsWith('.mkv')) mimeType = 'video/x-matroska'
    else if (fileName.endsWith('.flv')) mimeType = 'video/x-flv'
    else if (fileName.endsWith('.wmv')) mimeType = 'video/x-ms-wmv'
    else if (fileName.endsWith('.m4v')) mimeType = 'video/mp4'
    else if (fileName.endsWith('.3gp')) mimeType = 'video/3gpp'
    else if (fileName.endsWith('.ogg') || fileName.endsWith('.ogv')) mimeType = fileType.startsWith('audio/') ? 'audio/ogg' : 'video/ogg'
    else mimeType = 'video/mp4' // Default for video files
  }

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
          maxOutputTokens: 32768, // Increased for longer transcripts
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
            maxOutputTokens: 32768, // Increased for longer transcripts
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

  // Use faster model for quicker responses
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
  const apiKey = process.env.GEMINI_API_KEY || ''
  
  console.log("Calling Gemini API for analysis...")
  console.log(`Transcript length: ${transcript.length} characters`)
  
  // Ultra-optimized prompt for fastest processing - reduce to 15k for maximum speed
  const transcriptPreview = transcript.length > 15000 ? transcript.substring(0, 15000) + '\n[Truncated for speed...]' : transcript
  
  const optimizedPrompt = `Meeting transcript analysis. Return JSON only:

{
  "summary": "2-3 paragraph summary",
  "keyPoints": ["point1", "point2", "point3", "point4", "point5"],
  "actionItems": ["action1", "action2", "action3"],
  "speakers": [{"id": "s1", "name": "Name", "role": "Role", "quotes": ["quote"]}],
  "transcriptBySpeaker": [{"speaker": "Name", "text": "text"}],
  "followUpEmail": {"subject": "Subject", "body": "Body under 200 words"}
}

TRANSCRIPT:
${transcriptPreview}`
  
  console.log(`Calling Gemini API with ${transcriptPreview.length} char transcript...`)
  const startTime = Date.now()
  
  // Add aggressive timeout - 15 seconds max for AI generation (very fast)
  const controller = new AbortController()
  let timeoutId: NodeJS.Timeout | null = setTimeout(() => controller.abort(), 15000) // 15 second timeout
  
  try {
    const fetchPromise = fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: optimizedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.2, // Very low for fastest, most deterministic responses
          maxOutputTokens: 1536, // Further reduced for maximum speed
          topP: 0.7,
          topK: 10,
        }
      }),
      signal: controller.signal
    })
    
    const geminiResponse = await fetchPromise
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  
    const fetchTime = Date.now() - startTime
    console.log(`Gemini API request completed in ${fetchTime}ms`)

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
  } catch (fetchError: any) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    const fetchTime = Date.now() - startTime
    console.error(`Gemini API fetch failed after ${fetchTime}ms:`, fetchError)
    
    if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
      throw new Error('AI generation timed out after 15 seconds. Please try again or use a shorter transcript.')
    }
    throw fetchError
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
        
        // Validate file before processing
        if (!file || file.size === 0) {
          throw new Error("File is empty or invalid")
        }
        
        // Add timeout wrapper for file processing (9 minutes to allow for large files)
        // Use a more aggressive timeout for PDFs (2 minutes) vs audio/video (9 minutes)
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        const isZip = file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.toLowerCase().endsWith('.zip')
        const timeoutDuration = isPdf ? 2 * 60 * 1000 : isZip ? 5 * 60 * 1000 : 9 * 60 * 1000
        
        console.log(`Starting file extraction with ${timeoutDuration / 1000}s timeout...`)
        
        const processingPromise = extractTranscriptFromFile(file)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('File processing timed out. The file may be too large or complex.')), timeoutDuration)
        )
        
        transcript = await Promise.race([processingPromise, timeoutPromise]) as string
        
        if (!transcript || !transcript.trim()) {
          throw new Error("No transcript was extracted from the file. The file may be empty, corrupted, or in an unsupported format.")
        }
        
        console.log("Transcript extracted from file, length:", transcript.length)
        
        // Truncate very long transcripts to avoid API limits (keep first 30k characters for fastest processing)
        if (transcript.length > 30000) {
          console.warn(`Transcript is very long (${transcript.length} chars), truncating to 30k for fastest AI processing`)
          transcript = transcript.substring(0, 30000) + "\n\n[Transcript truncated for faster processing...]"
        }
        
        console.log(`Transcript ready for AI processing: ${transcript.length} characters`)
        
        // ALWAYS return transcript immediately - don't wait for AI processing
        // This ensures fast response times. User can click "Generate AI" separately.
        console.log("Returning transcript immediately for fast response...")
        
        // Check if user wants auto-processing (but don't block on it)
        const autoProcess = formData.get('autoProcess') === 'true'
        
        if (autoProcess && transcript.trim()) {
          // Process AI in background - don't wait for it
          // Return transcript immediately, AI will be processed separately
          console.log("AI processing will happen in background (non-blocking)...")
          
          // Start AI processing but don't await it
          processTranscriptWithAI(transcript).then((result) => {
            console.log("Background AI processing completed successfully")
          }).catch((error) => {
            console.error("Background AI processing failed:", error)
          })
          
          // Return transcript immediately
          return NextResponse.json({
            transcript: transcript,
            message: "File processed successfully. AI meeting notes are being generated in the background. Click 'Generate AI Meeting Notes' if they don't appear automatically.",
            processing: true
          })
        }
        
        // Return transcript for manual processing
        return NextResponse.json({
          transcript: transcript,
          message: "File processed successfully. Click 'Generate AI Meeting Notes' to analyze."
        })
      } catch (error: any) {
        console.error("Error processing file:", error)
        
        let errorMessage = "Failed to process file"
        let errorDetails = error.message || "Unknown error"
        
        // Provide more helpful error messages
        console.error("File processing error details:", errorDetails)
        
        if (errorDetails.includes('timeout') || errorDetails.includes('timed out')) {
          errorMessage = "File processing timed out. The file may be too large. Please try a smaller file (under 50MB recommended) or split it into multiple files."
        } else if (errorDetails.includes('No transcript') || errorDetails.includes('empty') || errorDetails.includes('no extractable')) {
          errorMessage = "Could not extract content from the file. Please ensure the file contains audio, video, or text content. For PDFs, make sure the file has selectable text (not just images)."
        } else if (errorDetails.includes('Unsupported file type')) {
          errorMessage = "Unsupported file type. Please upload a PDF, audio file (MP3, WAV, M4A), video file (MP4, MOV), or ZIP archive containing these files."
        } else if (errorDetails.includes('Failed to parse PDF') || errorDetails.includes('PDF parsing')) {
          // Include the actual error details in the message
          errorMessage = `PDF parsing failed: ${errorDetails}. The PDF may be corrupted, password-protected, or contain only images. Please ensure the PDF has selectable text (not just scanned images) and try again.`
        } else if ((errorDetails.includes('quota') && errorDetails.includes('exceeded')) || errorDetails.includes('429') || errorDetails.includes('RESOURCE_EXHAUSTED')) {
          errorMessage = "AI service quota exceeded. Please try again later or use the 'Open in Gemini' option."
        } else if (errorDetails.includes('API key') || errorDetails.includes('401') || errorDetails.includes('403')) {
          errorMessage = "AI service authentication failed. Please contact support."
        } else if (errorDetails.includes('File is empty')) {
          errorMessage = "The uploaded file is empty. Please upload a valid file with content."
        } else {
          // Generic error with more context
          errorMessage = `Failed to process file: ${errorDetails}. Please check the file format and try again.`
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
    } else if ((errorDetails.includes("quota") && errorDetails.includes("exceeded")) || errorDetails.includes("429") || errorDetails.includes("RESOURCE_EXHAUSTED")) {
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

