// AI Sales Call Companion Mode
// Real-time transcription and AI assistance during live calls

import { useState, useEffect, useRef } from 'react'

interface CompanionModeProps {
  briefId: string
  onClose: () => void
}

interface TranscriptionData {
  text: string
  timestamp: number
  confidence: number
}

interface AIResponse {
  talkingPoints: string[]
  objectionHandling: string[]
  keyNotes: string[]
  followUpEmail: string
}

export default function CompanionMode({ briefId, onClose }: CompanionModeProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState<string>('')
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        setTranscript(prev => prev + finalTranscript)
        
        // Send transcript to AI for real-time analysis
        if (finalTranscript.trim()) {
          analyzeTranscript(finalTranscript)
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(`Speech recognition error: ${event.error}`)
      }
      
      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Initialize MediaRecorder for audio backup
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        // Could send audio to Whisper API for transcription backup
        console.log('Audio recorded:', audioBlob.size, 'bytes')
      }
      
      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
      
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    setIsRecording(false)
    
    // Generate final follow-up email
    generateFollowUpEmail()
  }

  const analyzeTranscript = async (newTranscript: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/companion/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          briefId,
          transcript: newTranscript,
          fullTranscript: transcript + newTranscript
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAIResponse(data)
      }
    } catch (error) {
      console.error('Error analyzing transcript:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateFollowUpEmail = async () => {
    try {
      const response = await fetch('/api/companion/follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          briefId,
          transcript,
          aiResponse
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAIResponse(prev => prev ? { ...prev, followUpEmail: data.followUpEmail } : null)
      }
    } catch (error) {
      console.error('Error generating follow-up email:', error)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '2rem',
        maxWidth: '800px',
        maxHeight: '80vh',
        width: '90%',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: 0
          }}>
            🤖 AI Sales Companion
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Recording Controls */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          justifyContent: 'center'
        }}>
          {!isRecording ? (
            <button
              onClick={startRecording}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🎤 Start Call
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ⏹️ End Call
            </button>
          )}
        </div>

        {/* Status */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          {isRecording ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '1rem',
              fontSize: '0.875rem'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: 'white',
                borderRadius: '50%',
                animation: 'pulse 1.5s infinite'
              }} />
              Recording in progress...
            </div>
          ) : (
            <div style={{
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              Ready to start your sales call
            </div>
          )}
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Transcript */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          minHeight: '150px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Live Transcript
          </h3>
          <div style={{
            fontSize: '0.875rem',
            lineHeight: '1.5',
            color: '#374151',
            whiteSpace: 'pre-wrap'
          }}>
            {transcript || 'Transcript will appear here as you speak...'}
          </div>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {/* Talking Points */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: '0.5rem'
              }}>
                💡 Talking Points
              </h4>
              <ul style={{
                fontSize: '0.75rem',
                color: '#0c4a6e',
                margin: 0,
                paddingLeft: '1rem'
              }}>
                {aiResponse.talkingPoints.map((point, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Objection Handling */}
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '0.5rem'
              }}>
                🛡️ Objection Handling
              </h4>
              <ul style={{
                fontSize: '0.75rem',
                color: '#92400e',
                margin: 0,
                paddingLeft: '1rem'
              }}>
                {aiResponse.objectionHandling.map((objection, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    {objection}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Notes */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #22c55e',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#166534',
                marginBottom: '0.5rem'
              }}>
                📝 Key Notes
              </h4>
              <ul style={{
                fontSize: '0.75rem',
                color: '#166534',
                margin: 0,
                paddingLeft: '1rem'
              }}>
                {aiResponse.keyNotes.map((note, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Follow-up Email */}
        {aiResponse?.followUpEmail && (
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              📧 Follow-up Email Draft
            </h4>
            <div style={{
              fontSize: '0.75rem',
              lineHeight: '1.5',
              color: '#374151',
              whiteSpace: 'pre-wrap',
              backgroundColor: 'white',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db'
            }}>
              {aiResponse.followUpEmail}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(aiResponse.followUpEmail)}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Copy Email
            </button>
          </div>
        )}

        {isLoading && (
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            AI is analyzing the conversation...
          </div>
        )}
      </div>
    </div>
  )
}



