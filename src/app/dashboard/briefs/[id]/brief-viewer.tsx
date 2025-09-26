"use client"

import { useState, useEffect } from "react"

interface BriefData {
  id: string
  userId: string
  prospectName: string
  companyName: string
  role: string
  meetingLink?: string
  notes?: string
  overview: string
  context: string
  painPoints: string
  talkingPoints: string
  questions: string
  competitive: string
  createdAt: string
}

interface BriefViewerProps {
  briefId: string
  serverBrief?: BriefData | null
}

export default function BriefViewer({ briefId, serverBrief }: BriefViewerProps) {
  const [brief, setBrief] = useState<BriefData | null>(serverBrief || null)
  const [loading, setLoading] = useState(!serverBrief)

  useEffect(() => {
    // If we don't have server brief, try to get from localStorage
    if (!serverBrief) {
      try {
        const storedBrief = localStorage.getItem(`brief_${briefId}`)
        if (storedBrief) {
          const parsedBrief = JSON.parse(storedBrief)
          setBrief(parsedBrief)
          console.log("Brief loaded from localStorage:", briefId)
        }
      } catch (error) {
        console.error("Error loading brief from localStorage:", error)
      }
      setLoading(false)
    }
  }, [briefId, serverBrief])

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px" 
      }}>
        <div style={{ 
          fontSize: "1.125rem", 
          color: "#6b7280" 
        }}>
          Loading brief...
        </div>
      </div>
    )
  }

  if (!brief) {
    return (
      <div>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>
            Brief Not Found
          </h1>
          <p style={{ color: "#6b7280" }}>
            The requested brief could not be found.
          </p>
        </div>
        <div style={{ 
          backgroundColor: "#fef2f2", 
          border: "1px solid #fecaca",
          borderRadius: "0.5rem", 
          padding: "2rem", 
          marginBottom: "2rem",
          color: "#dc2626"
        }}>
          <p style={{ marginBottom: "1.5rem" }}>
            Brief ID: {briefId}
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a
              href="/dashboard/new"
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#dc2626",
                color: "white",
                textDecoration: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600"
              }}
            >
              Generate New Brief
            </a>
            <a
              href="/dashboard"
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                textDecoration: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600"
              }}
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  const handleCopy = () => {
    const briefText = `
Call Brief: ${brief.prospectName} at ${brief.companyName}

Prospect Information:
- Name: ${brief.prospectName}
- Company: ${brief.companyName}
- Role: ${brief.role}
${brief.meetingLink ? `- Meeting Link: ${brief.meetingLink}` : ""}
${brief.notes ? `- Notes: ${brief.notes}` : ""}

Prospect Overview:
${brief.overview}

Company Context:
${brief.context}

Potential Pain Points:
${brief.painPoints}

Key Talking Points:
${brief.talkingPoints}

Questions to Ask:
${brief.questions}

Competitive Insights:
${brief.competitive}
    `.trim()
    
    navigator.clipboard.writeText(briefText)
    alert("Brief copied to clipboard!")
  }

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>
            Call Brief
          </h1>
          <p style={{ color: "#6b7280" }}>
            {brief.prospectName} at {brief.companyName}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={handleCopy}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Copy Brief
          </button>
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault()
                  try {
                    const response = await fetch(`/api/briefs/${brief.id}/pdf`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ brief })
                    })
                    
                    if (response.ok) {
                      const contentType = response.headers.get('content-type')
                      
                      if (contentType?.includes('application/pdf')) {
                        // Handle PDF response
                        const blob = await response.blob()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${brief.prospectName}-${brief.companyName}-Brief.pdf`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        window.URL.revokeObjectURL(url)
                      } else {
                        // Handle text response (fallback)
                        const text = await response.text()
                        const blob = new Blob([text], { type: 'text/plain' })
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${brief.prospectName}-${brief.companyName}-Brief.txt`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        window.URL.revokeObjectURL(url)
                      }
                    } else {
                      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                      alert(`Failed to generate PDF: ${errorData.error || 'Please try again.'}`)
                    }
                  } catch (error) {
                    alert('Error generating PDF. Please try again.')
                  }
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#dc2626",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}
              >
                Download PDF
              </a>
          <a
            href={`/api/briefs/${brief.id}/email`}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#059669",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600"
            }}
          >
            Email Brief
          </a>
        </div>
      </div>

      {/* Prospect Info */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        padding: "2rem",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
          Prospect Information
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <div>
            <strong style={{ color: "#374151" }}>Name:</strong>
            <div style={{ color: "#6b7280" }}>{brief.prospectName}</div>
          </div>
          <div>
            <strong style={{ color: "#374151" }}>Company:</strong>
            <div style={{ color: "#6b7280" }}>{brief.companyName}</div>
          </div>
          <div>
            <strong style={{ color: "#374151" }}>Role:</strong>
            <div style={{ color: "#6b7280" }}>{brief.role}</div>
          </div>
          {brief.meetingLink && (
            <div>
              <strong style={{ color: "#374151" }}>Meeting Link:</strong>
              <div style={{ color: "#6b7280" }}>
                <a href={brief.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: "#667eea" }}>
                  Join Meeting
                </a>
              </div>
            </div>
          )}
        </div>
        {brief.notes && (
          <div style={{ marginTop: "1rem" }}>
            <strong style={{ color: "#374151" }}>Notes:</strong>
            <div style={{ color: "#6b7280", marginTop: "0.5rem" }}>{brief.notes}</div>
          </div>
        )}
      </div>

      {/* Brief Sections */}
      <div style={{ display: "grid", gap: "2rem" }}>
        {/* Prospect Overview */}
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          padding: "2rem"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#667eea" }}>
            Prospect Overview
          </h2>
          <div style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-line" }}>
            {brief.overview}
          </div>
        </div>

        {/* Company Context */}
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          padding: "2rem"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#667eea" }}>
            Company Context
          </h2>
          <div style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-line" }}>
            {brief.context}
          </div>
        </div>

        {/* Potential Pain Points */}
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          padding: "2rem"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#667eea" }}>
            Potential Pain Points
          </h2>
          <div style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-line" }}>
            {brief.painPoints}
          </div>
        </div>

        {/* Key Talking Points */}
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          padding: "2rem"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#667eea" }}>
            Key Talking Points
          </h2>
          <div style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-line" }}>
            {brief.talkingPoints}
          </div>
        </div>

        {/* Questions to Ask */}
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          padding: "2rem"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#667eea" }}>
            Questions to Ask
          </h2>
          <div style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-line" }}>
            {brief.questions}
          </div>
        </div>

        {/* Competitive Insights */}
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          padding: "2rem"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#667eea" }}>
            Competitive Insights
          </h2>
          <div style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-line" }}>
            {brief.competitive}
          </div>
        </div>
      </div>
    </div>
  )
}
