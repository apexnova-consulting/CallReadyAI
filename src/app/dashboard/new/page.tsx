"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewBriefPage() {
  const [formData, setFormData] = useState({
    prospectName: "",
    companyName: "",
    role: "",
    meetingLink: "",
    notes: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/briefs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push(`/dashboard/briefs/${data.brief.id}`)
      } else {
        setError(data.error || "Failed to create brief")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              Create New Brief
            </h1>
            <p style={{ color: "#6b7280" }}>
              Fill in the prospect details to generate an AI-powered sales call brief
            </p>
          </div>

          {/* Form */}
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "0.75rem", 
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            padding: "2rem"
          }}>
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

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <label htmlFor="prospectName" style={{ 
                    display: "block", 
                    fontSize: "0.875rem", 
                    fontWeight: "500", 
                    marginBottom: "0.5rem",
                    color: "#374151"
                  }}>
                    Prospect Name *
                  </label>
                  <input
                    id="prospectName"
                    name="prospectName"
                    type="text"
                    required
                    value={formData.prospectName}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label htmlFor="companyName" style={{ 
                    display: "block", 
                    fontSize: "0.875rem", 
                    fontWeight: "500", 
                    marginBottom: "0.5rem",
                    color: "#374151"
                  }}>
                    Company Name *
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: "500", 
                  marginBottom: "0.5rem",
                  color: "#374151"
                }}>
                  Role/Title *
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  placeholder="VP of Sales"
                />
              </div>

              <div>
                <label htmlFor="meetingLink" style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: "500", 
                  marginBottom: "0.5rem",
                  color: "#374151"
                }}>
                  Meeting Link (Optional)
                </label>
                <input
                  id="meetingLink"
                  name="meetingLink"
                  type="url"
                  value={formData.meetingLink}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  placeholder="https://calendly.com/..."
                />
              </div>

              <div>
                <label htmlFor="notes" style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: "500", 
                  marginBottom: "0.5rem",
                  color: "#374151"
                }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                    resize: "vertical"
                  }}
                  placeholder="Any additional context about the prospect, company, or meeting..."
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <a
                  href="/dashboard"
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    textDecoration: "none",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </a>
                <button
                  type="submit"
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
                  {isLoading ? "Generating Brief..." : "Generate Call Brief"}
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div style={{ 
            backgroundColor: "#f0f9ff", 
            border: "1px solid #0ea5e9",
            borderRadius: "0.5rem", 
            padding: "1rem", 
            marginTop: "1.5rem",
            color: "#0c4a6e"
          }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              💡 What you'll get:
            </h3>
            <ul style={{ fontSize: "0.875rem", margin: 0, paddingLeft: "1rem" }}>
              <li>Prospect overview and background</li>
              <li>Company context and industry insights</li>
              <li>Potential pain points and challenges</li>
              <li>Key talking points and value propositions</li>
              <li>Strategic questions to ask</li>
              <li>Competitive insights and positioning</li>
            </ul>
          </div>
    </div>
  )
}