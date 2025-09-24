"use client"

import { useState } from "react"

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Message sent successfully! We'll get back to you soon.")
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        alert("Failed to send message. Please try again.")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "24px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div style={{ 
        backgroundColor: "white", 
        padding: "3rem", 
        borderRadius: "1rem", 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        width: "100%"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ 
            fontSize: "1.875rem", 
            fontWeight: "bold", 
            marginBottom: "0.5rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Contact Support
          </h1>
          <p style={{ color: "#6b7280" }}>
            We're here to help! Send us a message and we'll get back to you.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="name" style={{ 
                display: "block", 
                fontSize: "0.875rem", 
                fontWeight: "500", 
                marginBottom: "0.5rem",
                color: "#374151"
              }}>
                Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <label htmlFor="email" style={{ 
                display: "block", 
                fontSize: "0.875rem", 
                fontWeight: "500", 
                marginBottom: "0.5rem",
                color: "#374151"
              }}>
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            <label htmlFor="subject" style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Subject *
            </label>
            <input
              id="subject"
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
            <label htmlFor="message" style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Message *
            </label>
            <textarea
              id="message"
              rows={5}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
            {isLoading ? "Sending..." : "Send Message"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Or email us directly at{" "}
            <a 
              href="mailto:support@callreadyai.com" 
              style={{ color: "#667eea", textDecoration: "none" }}
            >
              support@callreadyai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
