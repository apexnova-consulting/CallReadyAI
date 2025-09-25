import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getBrief } from "@/lib/brief-storage"

interface BriefPageProps {
  params: {
    id: string
  }
}

export default async function BriefPage({ params }: BriefPageProps) {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // Get the brief data
  const brief = getBrief(params.id)

  if (!brief) {
    return (
      <div>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
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
            Brief ID: {params.id}
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
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Call Brief
          </h1>
          <p style={{ color: "#6b7280" }}>
            {brief.prospectName} at {brief.companyName}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => navigator.clipboard.writeText(document.documentElement.innerText)}
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
            href={`/api/briefs/${brief.id}/pdf`}
            target="_blank"
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