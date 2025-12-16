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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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
        // Auto-restart if still recording
        if (isRecording && recognitionRef.current) {
          try {
            console.log('Auto-restarting speech recognition...')
            setTimeout(() => {
              if (isRecording && recognitionRef.current) {
                recognitionRef.current.start()
              }
            }, 100)
          } catch (e: any) {
            console.error('Failed to restart recognition:', e)
            if (e.message && e.message.includes('already started')) {
              // Recognition already running, that's fine
              return
            }
            setError(`Failed to restart recognition: ${e.message}`)
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

  const processTranscript = async () => {
    if (!transcript.trim()) {
      setError('No transcript available. Please record a meeting first.')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
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
        throw new Error(errorData.error || errorData.details || 'Failed to process meeting notes')
      }

      const data = await response.json()
      
      // Check if we got an error in the response
      if (data.error) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''))
      }
      
      setResult(data)
    } catch (error: any) {
      console.error('Error processing transcript:', error)
      const errorMessage = error.message || 'Failed to process meeting notes. Please try again.'
      setError(errorMessage)
      
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

  const openInGemini = () => {
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

    // Encode the prompt for URL
    const encodedPrompt = encodeURIComponent(geminiPrompt)
    
    // Open Google Gemini with the prompt
    window.open(`https://gemini.google.com/app?prompt=${encodedPrompt}`, '_blank')
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
          Record your meeting and get AI-powered notes, summaries, and follow-up emails. 
          Works with Zoom, Microsoft Teams, Google Meet, and any video conferencing platform.
        </p>
      </div>

      {/* Recording Controls */}
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
      `}</style>
    </div>
  )
}

