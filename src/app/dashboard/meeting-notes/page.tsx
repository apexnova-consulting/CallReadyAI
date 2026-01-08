"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Speaker {
  id: string
  name: string
  role?: string
  quotes?: string[]
}

interface TranscriptSegment {
  speaker: string
  text: string
}

interface MeetingNotesResult {
  summary: string
  keyPoints: string[]
  actionItems: string[]
  speakers?: Speaker[]
  transcriptBySpeaker?: TranscriptSegment[]
  followUpEmail: {
    subject: string
    body: string
  }
  transcript: string
}

export default function MeetingNotesPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState<string>('')
  const [interimTranscript, setInterimTranscript] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<MeetingNotesResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [inputMode, setInputMode] = useState<'record' | 'upload'>('record')
  const [autoProcessEnabled, setAutoProcessEnabled] = useState(true) // Auto-process by default
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Initialize speech recognition once on mount
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        console.log('Speech recognition started')
        setError(null)
      }
      
      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interim = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interim += transcript
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript)
          setInterimTranscript('') // Clear interim when we get final
        }
        if (interim) {
          setInterimTranscript(interim)
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          // This is common, don't show error - just log it
          console.log('No speech detected (this is normal)')
          return
        }
        if (event.error === 'aborted') {
          // User stopped or page changed - don't show error
          return
        }
        if (event.error === 'network') {
          setError('Network error with speech recognition. Please check your internet connection.')
          return
        }
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access in your browser settings and refresh the page.')
          return
        }
        setError(`Speech recognition error: ${event.error}. Please try again.`)
      }
      
      recognition.onend = () => {
        console.log('Speech recognition ended')
        // Auto-restart if still recording - Web Speech API times out after ~60 seconds
        if (isRecording && recognitionRef.current) {
          try {
            console.log('Auto-restarting speech recognition (Web Speech API timeout)...')
            // Use a longer delay to ensure clean restart
            setTimeout(() => {
              if (isRecording && recognitionRef.current) {
                try {
                  recognitionRef.current.start()
                  console.log('Speech recognition restarted successfully')
                } catch (restartError: any) {
                  if (restartError.message && restartError.message.includes('already started')) {
                    console.log('Recognition already running, continuing...')
                  } else {
                    console.error('Failed to restart recognition:', restartError)
                    // Try again after a longer delay
                    setTimeout(() => {
                      if (isRecording && recognitionRef.current) {
                        try {
                          recognitionRef.current.start()
                        } catch (e) {
                          console.error('Second restart attempt failed:', e)
                        }
                      }
                    }, 1000)
                  }
                }
              }
            }, 200)
          } catch (e: any) {
            console.error('Failed to schedule recognition restart:', e)
          }
        }
      }
      
      recognitionRef.current = recognition
      console.log('Speech recognition initialized')
    } else {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari for best results.')
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, []) // Only run once on mount, not when isRecording changes

  const startRecording = async () => {
    try {
      setError(null)
      setTranscript('')
      setInterimTranscript('')
      setResult(null)
      setRecordingTime(0)
      
      console.log('Starting recording...')
      
      // Check if speech recognition is available
      if (!recognitionRef.current) {
        setError('Speech recognition not initialized. Please refresh the page and try again.')
        return
      }
      
      // Request microphone permission first
      console.log('Requesting microphone permission...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      console.log('Microphone permission granted')
      streamRef.current = stream
      
      // Initialize MediaRecorder for audio backup
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 
                        MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' :
                        'audio/webm' // Default fallback
        const mediaRecorder = new MediaRecorder(stream, { mimeType })
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorder.mimeType 
          })
          console.log('Audio recorded:', audioBlob.size, 'bytes')
        }
        
        // Start recording
        mediaRecorder.start(1000) // Collect data every second
        console.log('MediaRecorder started')
      } catch (recorderError: any) {
        console.warn('MediaRecorder initialization failed:', recorderError)
        // Continue without MediaRecorder - speech recognition will still work
      }
      
      // Start speech recognition
      try {
        if (recognitionRef.current) {
          console.log('Starting speech recognition...')
          recognitionRef.current.start()
          console.log('Speech recognition started successfully')
        }
      } catch (recognitionError: any) {
        console.error('Speech recognition start error:', recognitionError)
        if (recognitionError.message && recognitionError.message.includes('already started')) {
          // Already started, that's fine
          console.log('Speech recognition already running')
        } else {
          setError(`Failed to start speech recognition: ${recognitionError.message || recognitionError}`)
          // Stop media recorder if recognition fails
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop()
          }
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
          }
          return
        }
      }
      
      setIsRecording(true)
      console.log('Recording state set to true')
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error: any) {
      console.error('Error starting recording:', error)
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings and try again.')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.')
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setError('Microphone is being used by another application. Please close other apps using the microphone and try again.')
      } else {
        setError(`Failed to start recording: ${error.message || error.name || 'Unknown error'}. Please check microphone permissions and try again.`)
      }
    }
  }

  const stopRecording = () => {
    console.log('Stopping recording...')
    
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
          console.log('Speech recognition stopped')
        } catch (e: any) {
          console.warn('Error stopping recognition:', e)
          // Ignore errors when stopping
        }
      }
    } catch (e) {
      console.warn('Error accessing recognition:', e)
    }
    
    try {
      if (mediaRecorderRef.current && isRecording) {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop()
          console.log('MediaRecorder stopped')
        }
      }
    } catch (e) {
      console.warn('Error stopping MediaRecorder:', e)
    }
    
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop()
          console.log('Media track stopped')
        })
      }
    } catch (e) {
      console.warn('Error stopping stream:', e)
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    setIsRecording(false)
    setInterimTranscript('')
    console.log('Recording stopped successfully')
  }

  const openGeminiWithTranscript = async () => {
    // If transcript is available, use it. Otherwise, create a prompt for the uploaded file
    if (!transcript || !transcript.trim()) {
      if (uploadedFile) {
        // File is uploaded but transcript not ready yet
        const geminiPrompt = `I've uploaded a ${uploadedFile.type || 'file'} file (${uploadedFile.name}) for meeting notes analysis. 

The file is currently being processed. Please help me analyze this meeting once the transcript is ready.

File details:
- Name: ${uploadedFile.name}
- Size: ${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
- Type: ${uploadedFile.type || 'Unknown'}

I'll paste the transcript here once processing is complete.`

        try {
          await navigator.clipboard.writeText(geminiPrompt)
          const notification = document.createElement('div')
          notification.textContent = '✅ Opening Gemini... You can paste the transcript once processing completes.'
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f59e0b;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-weight: 600;
            max-width: 300px;
          `
          document.body.appendChild(notification)
          setTimeout(() => notification.remove(), 4000)
          window.open('https://gemini.google.com/app', '_blank')
          return
        } catch (error) {
          console.error('Error:', error)
        }
      } else {
        setError('No transcript or file available. Please record a meeting or upload a file first.')
        return
      }
    }

    // Create a comprehensive prompt for Gemini
    const geminiPrompt = `Please analyze this meeting transcript and provide:

1. A comprehensive meeting summary (2-3 paragraphs)
2. Key discussion points (5-7 bullet points)
3. Action items with clear ownership and deadlines (3-5 items)
4. Speaker identification - identify different speakers and organize the transcript by speaker
5. A professional follow-up email ready to send with subject line and body

MEETING TRANSCRIPT:
${transcript}

Please format your response clearly with sections for Summary, Key Points, Action Items, Speakers, and Follow-up Email.`

    try {
      // Copy the prompt to clipboard
      await navigator.clipboard.writeText(geminiPrompt)
      console.log('Prompt copied to clipboard')
      
      // Show a brief notification
      const notification = document.createElement('div')
      notification.textContent = '✅ Transcript and prompt copied! Opening Gemini...'
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-weight: 600;
      `
      document.body.appendChild(notification)
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.remove()
      }, 3000)
      
      // Open Google Gemini with prompt in URL (if supported) or use chat interface
      // Try using Gemini's chat URL with prompt parameter
      const encodedPrompt = encodeURIComponent(geminiPrompt.substring(0, 2000)) // Limit length for URL
      const geminiUrl = `https://gemini.google.com/app?prompt=${encodedPrompt}`
      
      // Open Gemini
      const geminiWindow = window.open(geminiUrl, '_blank')
      
      // Show instructions immediately
      const instructions = document.createElement('div')
      instructions.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 2rem; border-radius: 0.75rem; 
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); z-index: 10001; max-width: 500px;">
          <h3 style="margin: 0 0 1rem 0; color: #111827; font-size: 1.25rem; font-weight: 600;">
            ✅ Opening Gemini with Your Transcript
          </h3>
          <p style="margin: 0 0 1rem 0; color: #374151; line-height: 1.6;">
            Your transcript and prompt have been copied to your clipboard. 
            In the Gemini window, <strong>click in the text box and press Ctrl+V (or Cmd+V on Mac)</strong> to paste.
          </p>
          <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.875rem;">
            The full transcript is ready to paste - just click in Gemini's input box and paste!
          </p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  style="padding: 0.75rem 1.5rem; background: #667eea; color: white; 
                         border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; width: 100%;">
            Got it!
          </button>
        </div>
      `
      document.body.appendChild(instructions)
      
      // Auto-remove instructions after 8 seconds
      setTimeout(() => {
        if (instructions.parentElement) {
          instructions.remove()
        }
      }, 8000)
    } catch (error: any) {
      console.error('Error copying to clipboard:', error)
      // Fallback: show the prompt in an alert or textarea they can copy
      const textarea = document.createElement('textarea')
      textarea.value = geminiPrompt
      textarea.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; max-width: 600px; height: 400px; padding: 1rem; border: 2px solid #667eea; border-radius: 0.5rem; z-index: 10000;'
      textarea.readOnly = true
      
      const copyBtn = document.createElement('button')
      copyBtn.textContent = 'Copy & Open Gemini'
      copyBtn.style.cssText = 'position: fixed; top: calc(50% + 220px); left: 50%; transform: translateX(-50%); padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; z-index: 10001;'
      copyBtn.onclick = () => {
        textarea.select()
        document.execCommand('copy')
        window.open('https://gemini.google.com/app', '_blank')
        textarea.remove()
        copyBtn.remove()
      }
      
      document.body.appendChild(textarea)
      document.body.appendChild(copyBtn)
    }
  }

  const handleFileUpload = async (file: File) => {
    // Support all common audio/video formats including Zoom recordings
    const validAudioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.flac', '.aac', '.wma', '.opus', '.m4b']
    const validVideoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.wmv', '.m4v', '.3gp', '.ogv', '.ts', '.mts']
    const validPdfExtensions = ['.pdf']
    const validZipExtensions = ['.zip']
    
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
    
    const isValidType = 
      file.type.startsWith('audio/') ||
      file.type.startsWith('video/') ||
      file.type === 'application/pdf' ||
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed' ||
      validAudioExtensions.includes(fileExtension) ||
      validVideoExtensions.includes(fileExtension) ||
      validPdfExtensions.includes(fileExtension) ||
      validZipExtensions.includes(fileExtension)

    if (!isValidType) {
      setError(`Unsupported file type. Please upload an audio file, video file, PDF document, or ZIP archive containing multiple files.`)
      return
    }

    // Increased file size limit to 500MB for longer meetings
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      setError('File size must be less than 500MB. Please upload a smaller file or compress the recording.')
      return
    }

    setUploadedFile(file)
    setIsUploading(true)
    setIsProcessing(true) // Start processing state
    setUploadProgress(0)
    setError(null)
    setTranscript('')
    setResult(null)

    // Simulate progress (since we can't easily track actual upload progress)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev
        return prev + 10
      })
    }, 200)

    let uploadError: Error | null = null

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', file.type || 'application/octet-stream')
      formData.append('autoProcess', autoProcessEnabled ? 'true' : 'false') // Auto-process by default

      // Add timeout for large files (10 minutes max for transcription + AI processing)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000) // 10 minutes

      const response = await fetch('/api/meeting-notes/process', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      clearInterval(progressInterval)
      setUploadProgress(100)
      setIsUploading(false) // File upload complete, now processing

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          const errorText = await response.text()
          throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`)
        }
        
        const errorMessage = errorData.error || errorData.details || 'Failed to process file'
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''))
      }

      // Set transcript from uploaded file processing
      if (data.transcript) {
        console.log("Setting transcript from file upload, length:", data.transcript.length)
        setTranscript(data.transcript)
        setIsUploading(false) // File upload complete
        
        // If we got a full result (from auto-processing), set it immediately
        if (data.summary) {
          console.log("AI meeting notes generated automatically!")
          setResult(data)
          setIsProcessing(false)
        } else if (data.processing) {
          // Transcript ready, AI is processing in background
          console.log("Transcript ready, AI processing in background...")
          setIsProcessing(true)
          // Auto-trigger AI processing after a short delay
          setTimeout(() => {
            if (data.transcript && data.transcript.trim()) {
              processTranscript()
            }
          }, 1000)
        } else if (data.message && !data.error) {
          // Transcript ready, trigger AI processing automatically
          console.log("File processed, triggering AI processing...")
          setIsProcessing(true)
          // Auto-trigger AI processing
          setTimeout(() => {
            if (data.transcript && data.transcript.trim()) {
              processTranscript()
            }
          }, 500)
        } else if (data.error) {
          // AI processing failed but transcript is available
          console.warn("AI processing failed but transcript available:", data.error)
          setError(`Transcript extracted but AI processing failed: ${data.error}. You can still use the transcript.`)
          setIsProcessing(false)
        }
      } else if (data.error) {
        // No transcript and there's an error
        console.error("File processing error:", data.error)
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''))
      } else {
        console.warn("No transcript in response:", data)
        setError("File uploaded but no transcript was generated. Please try again or check if the file contains audio/video content.")
        setIsProcessing(false)
      }
    } catch (error: any) {
      uploadError = error
      clearInterval(progressInterval)
      console.error('Error uploading file:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      let errorMessage = 'Failed to process file. Please try again.'
      if (error.name === 'AbortError') {
        errorMessage = 'File processing timed out. The file may be too large. Please try a smaller file or contact support.'
      } else if (error.message) {
        // Show the actual error message from the server
        errorMessage = `Error: ${error.message}`
      }
      
      // Don't show generic quota errors - show the actual error
      if (errorMessage.includes('quota') && !errorMessage.includes('exceeded')) {
        // If it mentions quota but not explicitly "exceeded", it might be a false positive
        errorMessage = error.message || 'Failed to process file. Please check the file format and try again.'
      }
      
      setError(errorMessage)
      setUploadProgress(0)
      setIsProcessing(false)
    } finally {
      setIsUploading(false)
      // Keep progress at 100 if successful, reset if error
      if (!uploadError) {
        setUploadProgress(100)
      } else {
        setIsProcessing(false)
      }
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const processTranscript = async () => {
    if (!transcript.trim() && !uploadedFile) {
      setError('No transcript available. Please record a meeting or upload a file first.')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // If we have an uploaded file but no transcript yet, process the file first
      if (uploadedFile && !transcript.trim()) {
        await handleFileUpload(uploadedFile)
        // Wait a bit for the file to be processed
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (!transcript.trim()) {
          setError('Failed to extract transcript from file. Please try again.')
          setIsProcessing(false)
          return
        }
      }

      const response = await fetch('/api/meeting-notes/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript
        })
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          // If response isn't JSON, get text
          const errorText = await response.text()
          throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`)
        }
        
        const errorMessage = errorData.error || errorData.details || 'Failed to process meeting notes'
        
        // If quota error, offer to open Gemini directly
        if (errorMessage.includes('quota') || errorMessage.includes('Quota') || response.status === 429) {
          setError(`AI service quota exceeded. Opening Google Gemini with your transcript instead...`)
          // Wait a moment to show the message, then open Gemini
          setTimeout(() => {
            openGeminiWithTranscript()
            setError(null) // Clear error after opening
          }, 1500)
          setIsProcessing(false)
          return
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Check if we got an error in the response
      if (data.error) {
        const errorMessage = data.error + (data.details ? `: ${data.details}` : '')
        
        // If quota error, offer to open Gemini directly
        if (errorMessage.includes('quota') || errorMessage.includes('Quota')) {
          setError(`AI service quota exceeded. Opening Google Gemini with your transcript instead...`)
          setTimeout(() => {
            openGeminiWithTranscript()
            setError(null)
          }, 1500)
          setIsProcessing(false)
          return
        }
        
        throw new Error(errorMessage)
      }
      
      setResult(data)
    } catch (error: any) {
      console.error('Error processing transcript:', error)
      const errorMessage = error.message || 'Failed to process meeting notes. Please try again.'
      
      // If quota or API error, offer Gemini fallback
      if (errorMessage.includes('quota') || errorMessage.includes('Quota') || errorMessage.includes('API')) {
        setError(`${errorMessage} Opening Google Gemini as an alternative...`)
        setTimeout(() => {
          openGeminiWithTranscript()
          setError(null)
        }, 1500)
      } else {
        setError(errorMessage)
      }
      
      // Show more detailed error in console for debugging
      if (error.response) {
        console.error('Response error:', error.response)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const openInGemini = async () => {
    if (!result) return
    
    // Create a prompt for Gemini with the meeting context
    const geminiPrompt = `Meeting Notes Analysis:

TRANSCRIPT:
${result.transcript}

SUMMARY:
${result.summary}

KEY POINTS:
${result.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

ACTION ITEMS:
${result.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

FOLLOW-UP EMAIL:
Subject: ${result.followUpEmail.subject}

${result.followUpEmail.body}

Please help me analyze this meeting and answer any questions I have.`

    try {
      // Copy the prompt to clipboard
      await navigator.clipboard.writeText(geminiPrompt)
      
      // Show notification
      const notification = document.createElement('div')
      notification.textContent = '✅ Meeting notes copied! Opening Gemini... Press Ctrl+V (Cmd+V) to paste.'
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-weight: 600;
        max-width: 300px;
      `
      document.body.appendChild(notification)
      
      setTimeout(() => notification.remove(), 4000)
      
      // Open Google Gemini
      window.open('https://gemini.google.com/app', '_blank')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      // Fallback: open with URL parameter
      const encodedPrompt = encodeURIComponent(geminiPrompt)
      window.open(`https://gemini.google.com/app?prompt=${encodedPrompt}`, '_blank')
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          Meeting Notes
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          Record your meeting, upload a recording, or upload PDF notes and get AI-powered summaries, key points, and follow-up emails. 
          Works with Zoom, Microsoft Teams, Google Meet, and any video conferencing platform.
        </p>
      </div>

      {/* Input Mode Selector */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={() => {
              setInputMode('record')
              setUploadedFile(null)
              setTranscript('')
              setResult(null)
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: inputMode === 'record' ? '#667eea' : '#f3f4f6',
              color: inputMode === 'record' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🎤 Record Live
          </button>
          <button
            onClick={() => {
              setInputMode('upload')
              setTranscript('')
              setResult(null)
              stopRecording()
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: inputMode === 'upload' ? '#667eea' : '#f3f4f6',
              color: inputMode === 'upload' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📁 Upload File
          </button>
        </div>

        {inputMode === 'upload' && (
          <div style={{
            border: '2px dashed #d1d5db',
            borderRadius: '0.5rem',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            transition: 'all 0.2s'
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.currentTarget.style.borderColor = '#667eea'
            e.currentTarget.style.backgroundColor = '#f0f4ff'
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.currentTarget.style.borderColor = '#d1d5db'
            e.currentTarget.style.backgroundColor = '#f9fafb'
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.currentTarget.style.borderColor = '#d1d5db'
            e.currentTarget.style.backgroundColor = '#f9fafb'
            const file = e.dataTransfer.files[0]
            if (file) {
              handleFileUpload(file)
            }
          }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*,.pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {isUploading ? (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: '#667eea',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
                <p style={{ color: '#6b7280' }}>Processing file... This may take a moment.</p>
              </div>
            ) : uploadedFile ? (
              <div>
                <p style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.5rem' }}>
                  ✓ {uploadedFile.name}
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => {
                    setUploadedFile(null)
                    setTranscript('')
                    setResult(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginRight: '0.5rem'
                  }}
                >
                  Remove File
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Change File
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</p>
                <p style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Drop a file here or click to browse
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Supports audio (MP3, WAV, M4A), video (MP4, MOV), or PDF files up to 100MB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Choose File
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recording Controls */}
      {inputMode === 'record' && (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {!isRecording ? (
            <button
              onClick={startRecording}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              <span style={{ fontSize: '1.25rem' }}>🎤</span>
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              <span style={{ fontSize: '1.25rem' }}>⏹</span>
              Stop Recording
            </button>
          )}

          {isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ color: '#6b7280', fontWeight: '500' }}>
                Recording: {formatTime(recordingTime)}
              </span>
            </div>
          )}

          {transcript && !isRecording && (
            <>
              <button
                onClick={processTranscript}
                disabled={isProcessing}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isProcessing ? '#9ca3af' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {isProcessing ? 'Processing...' : '📝 Process with AI'}
              </button>
              <button
                onClick={openGeminiWithTranscript}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                🤖 Open in Gemini
              </button>
            </>
          )}
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            color: '#991b1b',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <div>
              <strong>Error:</strong> {error}
              {error.includes('permission') && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
                  <strong>How to fix:</strong> Click the lock icon in your browser's address bar, then allow microphone access.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Browser compatibility warning */}
        {typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window) && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '0.5rem',
            color: '#92400e',
            marginBottom: '1rem'
          }}>
            <strong>⚠️ Browser Compatibility:</strong> Speech recognition works best in Chrome, Edge, or Safari. 
            If you're using Firefox, please switch to Chrome for the best experience.
          </div>
        )}

        {/* Transcript Display */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          minHeight: '200px',
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid #e5e7eb'
        }}>
          {transcript ? (
            <div>
              <p style={{ 
                color: '#111827', 
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                margin: 0
              }}>
                {transcript}
                {interimTranscript && (
                  <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    {interimTranscript}
                  </span>
                )}
              </p>
            </div>
          ) : (
            <div>
              <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
                {isRecording 
                  ? '🎤 Listening... Start speaking to see the transcript appear here in real-time.' 
                  : 'Click "Start Recording" to begin capturing your meeting notes. Make sure to allow microphone access when prompted.'}
              </p>
              {isRecording && !transcript && !interimTranscript && (
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem', margin: 0 }}>
                  💡 Tip: Speak clearly and ensure your microphone is working. The transcript will appear as you speak.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Upload Mode - Show transcript and process button */}
      {inputMode === 'upload' && uploadedFile && !isUploading && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={processTranscript}
              disabled={isProcessing || !transcript || !transcript.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: (isProcessing || !transcript || !transcript.trim()) ? '#9ca3af' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (isProcessing || !transcript || !transcript.trim()) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isProcessing ? 'Processing...' : '🤖 Generate AI Meeting Notes'}
            </button>
            <button
              onClick={openGeminiWithTranscript}
              disabled={false}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                opacity: (!transcript || !transcript.trim()) ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
              title={(!transcript || !transcript.trim()) ? 'Opens Gemini. Transcript will be available once processing completes.' : 'Open transcript in Google Gemini'}
            >
              🤖 Open in Gemini {isUploading || isProcessing ? '(Processing...)' : ''}
            </button>
          </div>

          {/* Status Message */}
          {isProcessing && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ 
                width: '20px',
                height: '20px',
                border: '3px solid #bfdbfe',
                borderTopColor: '#667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ 
                color: '#1e40af', 
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: '500'
              }}>
                🤖 Generating AI meeting notes... This may take a minute for longer files.
              </p>
            </div>
          )}

          {/* Transcript Display */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            minHeight: '200px',
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb'
          }}>
            {transcript ? (
              <p style={{ 
                color: '#111827', 
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                margin: 0
              }}>
                {transcript}
              </p>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ 
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e5e7eb',
                  borderTopColor: '#667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '1rem'
                }} />
                <p style={{ 
                  color: '#6b7280', 
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  Processing file and generating AI meeting notes... This may take a moment for large files.
                </p>
                <p style={{ 
                  color: '#9ca3af', 
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.875rem'
                }}>
                  You can click "Open in Gemini" to prepare while waiting.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '1rem'
            }}>
              📋 Meeting Summary
            </h2>
            <p style={{ color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {result.summary}
            </p>
          </div>

          {/* Speakers Section */}
          {result.speakers && result.speakers.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '1rem'
              }}>
                👥 Meeting Participants
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {result.speakers.map((speaker, index) => (
                  <div key={speaker.id || index} style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#111827',
                      marginBottom: '0.5rem'
                    }}>
                      {speaker.name}
                    </h4>
                    {speaker.role && (
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        {speaker.role}
                      </p>
                    )}
                    {speaker.quotes && speaker.quotes.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Key quotes:</p>
                        {speaker.quotes.slice(0, 2).map((quote, qIndex) => (
                          <p key={qIndex} style={{ 
                            fontSize: '0.875rem', 
                            color: '#374151', 
                            fontStyle: 'italic',
                            marginBottom: '0.25rem'
                          }}>
                            "{quote}"
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript by Speaker */}
          {result.transcriptBySpeaker && result.transcriptBySpeaker.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '1rem'
              }}>
                📝 Transcript by Speaker
              </h2>
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {result.transcriptBySpeaker.map((segment, index) => (
                  <div key={index} style={{
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: index < result.transcriptBySpeaker!.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#667eea',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      {segment.speaker}:
                    </div>
                    <div style={{
                      color: '#374151',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {segment.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Points & Action Items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '1rem'
              }}>
                🎯 Key Points
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {result.keyPoints.map((point, index) => (
                  <li key={index} style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    color: '#374151'
                  }}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '1rem'
              }}>
                ✅ Action Items
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {result.actionItems.map((item, index) => (
                  <li key={index} style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '0.5rem',
                    color: '#374151'
                  }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Follow-up Email */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '1rem'
            }}>
              📧 Follow-up Email
            </h2>
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#374151' }}>Subject:</strong>
                <p style={{ color: '#111827', margin: '0.5rem 0 0 0' }}>
                  {result.followUpEmail.subject}
                </p>
              </div>
              <div>
                <strong style={{ color: '#374151' }}>Body:</strong>
                <p style={{ 
                  color: '#111827', 
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  margin: '0.5rem 0 0 0'
                }}>
                  {result.followUpEmail.body}
                </p>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  const emailBody = encodeURIComponent(result.followUpEmail.body)
                  const emailSubject = encodeURIComponent(result.followUpEmail.subject)
                  window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📤 Open in Email Client
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.followUpEmail.body)
                  alert('Email body copied to clipboard!')
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📋 Copy Email
              </button>
            </div>
          </div>

          {/* Open in Gemini Button */}
          <div style={{
            backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '0.75rem',
            padding: '2rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'white',
              marginBottom: '1rem'
            }}>
              🤖 Continue Analysis in Google Gemini
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1.5rem' }}>
              Ask additional questions, get deeper insights, or refine your meeting notes with Google Gemini's advanced AI.
            </p>
            <button
              onClick={openInGemini}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              Open in Google Gemini →
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

