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
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/briefs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const brief = await response.json()
        router.push(`/dashboard/briefs/${brief.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create brief")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Create New Brief
        </h1>
        <p style={{ color: "#6b7280" }}>
          Fill in the prospect details to generate an AI-powered sales call brief
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ 
        backgroundColor: "white", 
        padding: "2rem", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem"
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
              type="text"
              required
              value={formData.prospectName}
              onChange={(e) => setFormData({ ...formData, prospectName: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none"
              }}
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
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none"
              }}
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
            Title/Role *
          </label>
          <input
            id="role"
            type="text"
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              outline: "none"
            }}
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
            type="url"
            value={formData.meetingLink}
            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              outline: "none"
            }}
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
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              outline: "none",
              resize: "vertical"
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "0.75rem 1.5rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? "Generating Brief..." : "Generate Call Brief"}
        </button>
      </form>
    </div>
  )
}
