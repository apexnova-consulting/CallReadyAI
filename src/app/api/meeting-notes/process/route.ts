import 'server-only'
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import AdmZip from 'adm-zip'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper function to extract text from PDF using improved text extraction
// This works for text-based PDFs including Google Docs PDFs
function extractTextFromPDF(buffer: Buffer): string {
  try {
    const pdfContent = buffer.toString('latin1') // Use latin1 to preserve binary data
    const textMatches: string[] = []
    
    // Method 1: Extract text from PDF text objects (most common)
    // Pattern: (text) or (text with\escaped characters)
    const textPattern = /\((.*?)\)/g
    let match
    
    while ((match = textPattern.exec(pdfContent)) !== null) {
      let text = match[1]
      // Decode PDF escape sequences
      text = text
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\([0-9]{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
      
      // Filter out very short strings, binary data, or non-text
      if (text.length > 2 && /[a-zA-Z0-9]/.test(text)) {
        // Allow more characters including Unicode and special chars
        if (text.length > 1 && !/^[\x00-\x08\x0B-\x0C\x0E-\x1F]*$/.test(text)) {
          textMatches.push(text)
        }
      }
    }
    
    // Method 2: Extract text from TJ operator (array of text)
    // Pattern: [(text1) (text2) ...] TJ
    const tjPattern = /\[(.*?)\]\s*TJ/g
    while ((match = tjPattern.exec(pdfContent)) !== null) {
      const tjContent = match[1]
      // Extract all text within parentheses in the TJ array
      const tjTextPattern = /\((.*?)\)/g
      let tjMatch
      while ((tjMatch = tjTextPattern.exec(tjContent)) !== null) {
        let text = tjMatch[1]
        text = text
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\([0-9]{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
        
        if (text.length > 1 && /[a-zA-Z0-9]/.test(text)) {
          textMatches.push(text)
        }
      }
    }
    
    // Method 3: Extract text from Tj operator (single text string)
    // Pattern: (text) Tj
    const tjSinglePattern = /\((.*?)\)\s*Tj/g
    while ((match = tjSinglePattern.exec(pdfContent)) !== null) {
      let text = match[1]
      text = text
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\([0-9]{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
      
      if (text.length > 1 && /[a-zA-Z0-9]/.test(text)) {
        textMatches.push(text)
      }
    }
    
    // Method 4: Extract from stream objects (for compressed PDFs)
    const streamRegex = /stream[\s\S]*?endstream/g
    while ((match = streamRegex.exec(pdfContent)) !== null) {
      const streamContent = match[0]
      // Look for text patterns within streams
      const streamTextPattern = /\((.*?)\)/g
      let streamMatch
      while ((streamMatch = streamTextPattern.exec(streamContent)) !== null) {
        let text = streamMatch[1]
        // Only add if it looks like readable text
        if (text.length > 5 && /[a-zA-Z]{3,}/.test(text)) {
          text = text
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
          textMatches.push(text)
        }
      }
    }
    
    // Combine all extracted text
    let allText = textMatches.join(' ')
    
    // Clean up the text
    allText = allText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
      .trim()
    
    console.log(`PDF text extraction: found ${textMatches.length} text segments, total length: ${allText.length} characters`)
    
    return allText
      
  } catch (error) {
    console.error("PDF text extraction error:", error)
    return ''
  }
}

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
    
    // Skip pdf-parse - it doesn't work in serverless environments (needs canvas/DOM APIs)
    // Use Gemini API directly, with OpenAI fallback if quota exceeded
    console.log("Skipping pdf-parse (not compatible with serverless), using AI API directly...")
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Validate PDF magic bytes
    const pdfHeader = buffer.slice(0, 4).toString()
    if (pdfHeader !== '%PDF') {
      throw new Error(`Invalid PDF file: File does not start with PDF magic bytes. Got: ${pdfHeader}`)
    }
    console.log(`PDF validated: ${buffer.length} bytes`)
    
    const base64Data = buffer.toString('base64')
    
    if (file.size > 20 * 1024 * 1024) { // 20MB limit for AI APIs
      throw new Error("PDF file is too large (max 20MB). Please use a smaller file.")
    }
    
    // Try Gemini API first
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (geminiApiKey) {
      try {
        console.log("Attempting Gemini API for PDF processing...")
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
        const startTime = Date.now()
        
        const response = await fetch(`${apiUrl}?key=${geminiApiKey}`, {
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
          let errorMessage = `Gemini API error: ${response.status}`
          let isQuotaError = false
          
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.error?.message || errorJson.message || errorMessage
            isQuotaError = response.status === 429 || 
                          errorJson.error?.status === 'RESOURCE_EXHAUSTED' ||
                          errorJson.error?.code === 429 ||
                          errorMessage.includes('quota') && errorMessage.includes('exceeded')
          } catch (e) {
            errorMessage = errorText || errorMessage
            isQuotaError = response.status === 429
          }
          
          // If quota exceeded, try OpenAI fallback
          if (isQuotaError) {
            console.warn("Gemini quota exceeded, trying OpenAI fallback...")
            throw new Error('GEMINI_QUOTA_EXCEEDED') // Special error to trigger OpenAI fallback
          }
          
          throw new Error(errorMessage)
        }
        
        const geminiData = await response.json()
        const extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
        
        if (!extractedText || !extractedText.trim()) {
          throw new Error("PDF appears to be empty or contains no extractable text.")
        }
        
        const trimmedText = extractedText.trim()
        console.log(`PDF processed successfully via Gemini API, extracted ${trimmedText.length} characters`)
        return trimmedText
        
      } catch (geminiError: any) {
        // If quota exceeded, try OpenAI fallback
        if (geminiError.message === 'GEMINI_QUOTA_EXCEEDED' || 
            geminiError.message?.includes('quota') || 
            geminiError.message?.includes('RESOURCE_EXHAUSTED') ||
            geminiError.message?.includes('429')) {
          console.log("Gemini quota exceeded, trying OpenAI fallback...")
          // Fall through to OpenAI fallback
        } else if (!geminiError.message?.includes('quota') && !geminiError.message?.includes('RESOURCE_EXHAUSTED')) {
          // If it's not a quota error, throw it
          throw geminiError
        }
      }
    }
    
    // Fallback: Try OpenAI if Gemini quota exceeded or not available
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (openaiApiKey) {
      try {
        console.log("Attempting OpenAI fallback for PDF processing...")
        
        // OpenAI doesn't support PDFs directly in chat completions
        // But we can use a workaround: extract text using a simple regex-based approach
        // This works for text-based PDFs (not scanned images)
        const pdfText = extractTextFromPDF(buffer)
        
        // Lower threshold to 50 characters to catch more PDFs
        // Google Docs PDFs should have plenty of text
        if (pdfText && pdfText.trim().length > 50) {
          console.log(`Extracted ${pdfText.length} characters from PDF using text extraction`)
          return pdfText.trim()
        } else {
          // Log what we found for debugging
          console.warn(`PDF text extraction found only ${pdfText?.length || 0} characters. This might be a scanned PDF or the extraction method needs improvement.`)
          
          // If text extraction failed, it's likely a scanned/image PDF
          throw new Error("PDF appears to be a scanned document or image-only PDF. OpenAI cannot process image-based PDFs directly. Please use the 'Open in Gemini' button to process this PDF manually, or convert the PDF to text first.")
        }
      } catch (openaiError: any) {
        // If it's our custom error, re-throw it
        if (openaiError.message?.includes('scanned') || openaiError.message?.includes('image-only')) {
          throw openaiError
        }
        // For other errors, provide helpful message
        console.error("OpenAI PDF processing error:", openaiError)
        throw new Error(`PDF processing failed: ${openaiError.message || 'Unknown error'}. OpenAI cannot process PDFs directly. Please use the 'Open in Gemini' button or convert the PDF to text first.`)
      }
    }
    
    // If no API keys configured
    if (!geminiApiKey && !openaiApiKey) {
      throw new Error("PDF processing failed. No AI service configured. Please configure GEMINI_API_KEY or OPENAI_API_KEY in environment variables.")
    }
    
    // Gemini quota exceeded and no OpenAI fallback
    throw new Error("AI service quota exceeded. Your Gemini API quota has been exceeded. Please use the 'Open in Gemini' button to process the PDF manually, or wait for your quota to reset. To add OpenAI as a fallback, configure OPENAI_API_KEY in your environment variables.")
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

// Helper function to process transcript with AI (with OpenAI fallback)
async function processTranscriptWithAI(transcript: string) {
  const geminiApiKey = process.env.GEMINI_API_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY
  
  // Try Gemini first if available
  if (geminiApiKey && geminiApiKey.trim() !== '') {
    try {
      return await processWithGemini(transcript)
    } catch (geminiError: any) {
      // If quota exceeded, try OpenAI fallback
      const isQuotaError = geminiError.message?.includes('quota') || 
                          geminiError.message?.includes('429') ||
                          geminiError.message?.includes('RESOURCE_EXHAUSTED') ||
                          geminiError.message?.includes('AI service quota exceeded')
      
      if (isQuotaError && openaiApiKey) {
        console.log("Gemini quota exceeded, trying OpenAI fallback...")
        return await processWithOpenAI(transcript)
      }
      
      // If not quota error or no OpenAI, throw the error
      throw geminiError
    }
  }
  
  // If no Gemini, try OpenAI
  if (openaiApiKey) {
    return await processWithOpenAI(transcript)
  }
  
  throw new Error("AI service not configured. Please configure GEMINI_API_KEY or OPENAI_API_KEY.")
}

// Helper function to process with Gemini
async function processWithGemini(transcript: string) {
  const geminiApiKey = process.env.GEMINI_API_KEY || ''
  console.log("GEMINI_API_KEY is present, length:", geminiApiKey.length)

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
    const fetchPromise = fetch(`${apiUrl}?key=${geminiApiKey}`, {
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
        console.error("Gemini API error status:", geminiResponse.status)
        
        let errorMessage = `Gemini API error: ${geminiResponse.status}`
        let errorCode = ''
        let errorReason = ''
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorJson.message || errorMessage
          errorCode = errorJson.error?.code?.toString() || errorJson.error?.status || ''
          errorReason = errorJson.error?.reason || ''
          
          console.error("Parsed error details:", {
            message: errorMessage,
            code: errorCode,
            reason: errorReason,
            fullError: errorJson
          })
        } catch (e) {
          errorMessage = errorText || errorMessage
          console.error("Could not parse error JSON:", e)
        }
        
        // Only throw quota error if it's actually a quota issue
        const isQuotaError = 
          geminiResponse.status === 429 ||
          errorCode === '429' ||
          errorReason === 'RESOURCE_EXHAUSTED' ||
          (errorMessage.toLowerCase().includes('quota') && errorMessage.toLowerCase().includes('exceeded')) ||
          errorMessage.includes('RESOURCE_EXHAUSTED')
        
        if (isQuotaError) {
          console.error("Confirmed quota error:", { status: geminiResponse.status, code: errorCode, reason: errorReason, message: errorMessage })
          throw new Error(`AI service quota exceeded. Please try again later or use the 'Open in Gemini' option.`)
        }
        
        // For other errors, throw with actual details
        throw new Error(`AI service error: ${errorMessage}`)
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
    
    // Re-throw with more context
    const errorMessage = fetchError.message || 'Unknown error during AI processing'
    throw new Error(`AI service error: ${errorMessage}`)
  }
}

// Helper function to process with OpenAI (fallback)
async function processWithOpenAI(transcript: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }
  
  console.log("Using OpenAI API for transcript analysis...")
  console.log(`Transcript length: ${transcript.length} characters`)
  
  const OpenAI = (await import('openai')).default
  const openai = new OpenAI({ apiKey })
  
  // Truncate if too long (OpenAI has token limits)
  const transcriptPreview = transcript.length > 12000 ? transcript.substring(0, 12000) + '\n[Truncated for processing...]' : transcript
  
  const systemPrompt = `You are CallReady AI, an expert meeting notes analyzer. Analyze the provided meeting transcript and generate a JSON response with:

1. A comprehensive meeting summary (2-3 paragraphs)
2. Key discussion points (5-7 bullet points)
3. Action items with clear ownership and deadlines (3-5 items)
4. Speaker identification - identify different speakers and organize the transcript by speaker
5. A professional follow-up email ready to send

Format your response as JSON only:
{
  "summary": "Meeting summary text",
  "keyPoints": ["point 1", "point 2", ...],
  "actionItems": ["action 1", "action 2", ...],
  "speakers": [{"id": "s1", "name": "Name", "role": "Role", "quotes": ["quote"]}],
  "transcriptBySpeaker": [{"speaker": "Name", "text": "text"}],
  "followUpEmail": {"subject": "Subject", "body": "Body under 200 words"}
}`

  const startTime = Date.now()
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please analyze this meeting transcript:\n\n${transcriptPreview}` }
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
    
    const fetchTime = Date.now() - startTime
    console.log(`OpenAI API request completed in ${fetchTime}ms`)
    
    const responseText = response.choices[0]?.message?.content || ""
    
    if (!responseText || responseText.trim().length === 0) {
      throw new Error("Empty response from OpenAI API")
    }
    
    console.log("OpenAI response received, parsing...")
    
    // Parse JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse JSON response, creating structured response from text")
      const lines = responseText.split('\n').filter(line => line.trim())
      parsedResponse = {
        summary: responseText.substring(0, 500) || "Meeting summary generated from transcript.",
        keyPoints: lines.slice(0, 5).filter(line => line.trim() && !line.startsWith('#')),
        actionItems: lines.slice(5, 8).filter(line => line.trim() && !line.startsWith('#')),
        speakers: [],
        transcriptBySpeaker: [],
        followUpEmail: {
          subject: "Follow-up: Meeting Notes",
          body: responseText.substring(0, 1000) || "Thank you for the meeting. Here are the key points we discussed."
        }
      }
    }
    
    // Ensure all required fields exist
    return {
      summary: parsedResponse.summary || "Meeting summary generated from transcript.",
      keyPoints: Array.isArray(parsedResponse.keyPoints) ? parsedResponse.keyPoints : [],
      actionItems: Array.isArray(parsedResponse.actionItems) ? parsedResponse.actionItems : [],
      speakers: Array.isArray(parsedResponse.speakers) ? parsedResponse.speakers : [],
      transcriptBySpeaker: Array.isArray(parsedResponse.transcriptBySpeaker) ? parsedResponse.transcriptBySpeaker : [],
      followUpEmail: parsedResponse.followUpEmail || {
        subject: "Follow-up: Meeting Notes",
        body: "Thank you for the meeting. Here are the key points we discussed."
      },
      transcript: transcript
    }
    
  } catch (openaiError: any) {
    console.error("OpenAI API error:", openaiError)
    throw new Error(`OpenAI API error: ${openaiError.message || 'Unknown error'}`)
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
        console.error("Error stack:", error.stack)
        console.error("Error name:", error.name)
        console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
        
        let errorMessage = "Failed to process file"
        let errorDetails = error.message || "Unknown error"
        
        // Provide more helpful error messages
        console.error("File processing error details:", errorDetails)
        
        // Check if it's an unexpected error type
        if (error.name === 'TypeError' || error.name === 'ReferenceError' || error.name === 'SyntaxError') {
          console.error("Code error detected - this might be a bug:", {
            name: error.name,
            message: error.message,
            stack: error.stack
          })
          errorMessage = `An unexpected error occurred: ${error.message || 'Unknown error'}. Please contact support with this error message.`
          errorDetails = `${error.name}: ${error.message}`
        }
        
        // Check for specific error types
        if (errorDetails.includes('timeout') || errorDetails.includes('timed out')) {
          errorMessage = "File processing timed out. The file may be too large. Please try a smaller file (under 50MB recommended) or split it into multiple files."
        } else if (errorDetails.includes('No transcript') || errorDetails.includes('empty') || errorDetails.includes('no extractable')) {
          errorMessage = "Could not extract content from the file. Please ensure the file contains audio, video, or text content. For PDFs, make sure the file has selectable text (not just images)."
        } else if (errorDetails.includes('Unsupported file type')) {
          errorMessage = "Unsupported file type. Please upload a PDF, audio file (MP3, WAV, M4A), video file (MP4, MOV), or ZIP archive containing these files."
        } else if (errorDetails.includes('Failed to parse PDF') || errorDetails.includes('PDF parsing')) {
          // Include the actual error details in the message
          errorMessage = `PDF parsing failed: ${errorDetails}. The PDF may be corrupted, password-protected, or contain only images. Please ensure the PDF has selectable text (not just scanned images) and try again.`
        } else if (errorDetails === 'AI service quota exceeded. Please try again later or use the \'Open in Gemini\' option.' || 
                   errorDetails === 'AI service quota exceeded. Please try again later.') {
          // Only show quota error if it was explicitly thrown as quota error
          errorMessage = "AI service quota exceeded. Please try again later or use the 'Open in Gemini' option."
        } else if (errorDetails.includes('AI service error:')) {
          // Show the actual AI service error
          errorMessage = errorDetails.replace('AI service error: ', '')
        } else if (errorDetails.includes('API key') || errorDetails.includes('401') || errorDetails.includes('403')) {
        errorMessage = "AI service authentication failed. Please contact support."
        } else if (errorDetails.includes('File is empty')) {
          errorMessage = "The uploaded file is empty. Please upload a valid file with content."
        } else if (errorDetails.includes('not configured') || errorDetails.includes('GEMINI_API_KEY')) {
          errorMessage = "AI service is not properly configured. Please contact support."
        } else {
          // Show the actual error message for better debugging
          errorMessage = errorDetails
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
            details: errorDetails,
            type: error.name || 'Error'
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
    console.error("Error stack:", error.stack)
    console.error("Error name:", error.name)
    
    const errorMessage = error.message || "Internal server error"
    const errorDetails = {
      message: errorMessage,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
    
    // Only show quota error if it was explicitly thrown as quota error
    let userFacingError = errorMessage
    if (errorMessage === 'AI service quota exceeded. Please try again later or use the \'Open in Gemini\' option.' ||
        errorMessage === 'AI service quota exceeded. Please try again later.') {
      userFacingError = "AI service quota exceeded. Please try again later or use the 'Open in Gemini' option."
    } else if (errorMessage.includes('not configured') || errorMessage.includes('GEMINI_API_KEY')) {
      userFacingError = "AI service is not properly configured. Please contact support."
    } else if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('403')) {
      userFacingError = "AI service authentication failed. Please contact support."
    }
    
    return NextResponse.json(
      { 
        error: userFacingError,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}

