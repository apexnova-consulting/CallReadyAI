"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TemplatesPage() {
  const [selectedMethodology, setSelectedMethodology] = useState("")
  const [selectedCallType, setSelectedCallType] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("")
  const [selectedTemplateType, setSelectedTemplateType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedTemplate, setGeneratedTemplate] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  // Mock user data - will be replaced with real data
  const userPlan = "Free" // or "Starter", "Pro", "Enterprise"
  const templatesUsed = 0
  const templatesLimit = userPlan === "Free" ? 1 : userPlan === "Starter" ? 5 : userPlan === "Pro" ? 20 : 999

  const methodologies = [
    { id: "value-selling", name: "Value Selling", description: "Focus on customer value and ROI" },
    { id: "medpicc", name: "MEDPICC", description: "MEDPICC qualification framework" },
    { id: "challenger", name: "Challenger Sale", description: "Teach, tailor, take control approach" },
    { id: "spin", name: "SPIN Selling", description: "Situation, Problem, Implication, Need-payoff" },
    { id: "sandler", name: "Sandler Selling", description: "Relationship-based selling methodology" },
    { id: "solution-selling", name: "Solution Selling", description: "Problem-focused solution approach" }
  ]

  const callTypes = [
    { id: "new-sale", name: "New Sale", description: "First-time prospect outreach" },
    { id: "renewal", name: "Renewal", description: "Contract renewal conversation" },
    { id: "upsell", name: "Upsell", description: "Expanding existing customer relationship" },
    { id: "follow-up", name: "Follow-up", description: "Post-meeting follow-up call" },
    { id: "discovery", name: "Discovery", description: "Qualifying and understanding needs" },
    { id: "demo", name: "Demo", description: "Product demonstration call" }
  ]

  const industries = [
    { id: "saas", name: "SaaS Sales", description: "Software as a Service" },
    { id: "real-estate", name: "Real Estate Sales", description: "Property and real estate" },
    { id: "healthcare", name: "Healthcare Sales", description: "Medical and healthcare solutions" },
    { id: "finance", name: "Financial Services", description: "Banking and financial products" },
    { id: "manufacturing", name: "Manufacturing", description: "Industrial and manufacturing" },
    { id: "retail", name: "Retail Sales", description: "Consumer goods and retail" },
    { id: "consulting", name: "Consulting", description: "Professional services" },
    { id: "education", name: "Education", description: "Educational services and products" }
  ]

  const templateTypes = [
    { id: "call-script", name: "Call Script", description: "Structured conversation outline" },
    { id: "email-template", name: "Email Template", description: "Professional email template" },
    { id: "voicemail", name: "Voicemail Script", description: "Compelling voicemail message" },
    { id: "follow-up-sequence", name: "Follow-up Sequence", description: "Multi-touch follow-up plan" }
  ]

  const handleGenerateTemplate = async () => {
    if (!selectedMethodology || !selectedCallType || !selectedIndustry || !selectedTemplateType) {
      setError("Please select all required options")
      return
    }

    if (userPlan === "Free" && templatesUsed >= templatesLimit) {
      setError("Free plan limited to 1 template per industry. Upgrade to generate more templates.")
      return
    }

    setIsLoading(true)
    setError("")
    setGeneratedTemplate("")

    try {
      const response = await fetch("/api/templates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          methodology: selectedMethodology,
          callType: selectedCallType,
          industry: selectedIndustry,
          templateType: selectedTemplateType,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setGeneratedTemplate(data.template)
      } else {
        setError(data.error || "Failed to generate template")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(generatedTemplate)
    // Could add a toast notification here
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob([generatedTemplate], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedMethodology}-${selectedCallType}-${selectedIndustry}-template.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>
          Sales Templates
        </h1>
        <p style={{ color: "#6b7280" }}>
          Generate AI-powered sales templates based on methodology, call type, and industry
        </p>
      </div>

      {/* Usage Stats */}
      <div style={{ 
        backgroundColor: "white", 
        padding: "1rem", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        marginBottom: "2rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Templates Used: {templatesUsed} / {templatesLimit}
            </span>
          </div>
          <div>
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Plan: {userPlan}
            </span>
          </div>
        </div>
      </div>

      {/* Template Generator */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        padding: "2rem",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>
          Generate Custom Template
        </h2>

        {error && (
          <div style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            marginBottom: "1.5rem",
            fontSize: "0.875rem"
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          {/* Sales Methodology */}
          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Sales Methodology *
            </label>
            <select
              value={selectedMethodology}
              onChange={(e) => setSelectedMethodology(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                backgroundColor: "white"
              }}
            >
              <option value="">Select Methodology</option>
              {methodologies.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name} - {method.description}
                </option>
              ))}
            </select>
          </div>

          {/* Call Type */}
          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Call Type *
            </label>
            <select
              value={selectedCallType}
              onChange={(e) => setSelectedCallType(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                backgroundColor: "white"
              }}
            >
              <option value="">Select Call Type</option>
              {callTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Industry */}
          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Industry *
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                backgroundColor: "white"
              }}
            >
              <option value="">Select Industry</option>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name} - {industry.description}
                </option>
              ))}
            </select>
          </div>

          {/* Template Type */}
          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Template Type *
            </label>
            <select
              value={selectedTemplateType}
              onChange={(e) => setSelectedTemplateType(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                backgroundColor: "white"
              }}
            >
              <option value="">Select Template Type</option>
              {templateTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateTemplate}
          disabled={isLoading}
          style={{
            padding: "0.75rem 1.5rem",
            background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "transform 0.2s"
          }}
        >
          {isLoading ? "Generating Template..." : "Generate Template"}
        </button>
      </div>

      {/* Generated Template */}
      {generatedTemplate && (
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          padding: "2rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
              Generated Template
            </h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleCopyTemplate}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                Copy
              </button>
              <button
                onClick={handleDownloadTemplate}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                Download
              </button>
            </div>
          </div>
          
          <div style={{
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            fontSize: "0.875rem",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace"
          }}>
            {generatedTemplate}
          </div>
        </div>
      )}

      {/* Plan Limitations Info */}
      {userPlan === "Free" && (
        <div style={{ 
          backgroundColor: "#fef3c7", 
          border: "1px solid #f59e0b",
          borderRadius: "0.5rem", 
          padding: "1rem", 
          marginTop: "2rem",
          color: "#92400e"
        }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem" }}>
            Free Plan Limitations
          </h3>
          <p style={{ fontSize: "0.875rem", margin: 0 }}>
            Free users can generate 1 template per industry. Upgrade to Starter ($19/month) for 5 templates, 
            or Pro ($49/month) for unlimited templates across all industries and methodologies.
          </p>
        </div>
      )}
    </div>
  )
}
