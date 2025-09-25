import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

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

  // Mock brief data for now - will be replaced with real database query
  const brief = {
    id: params.id,
    prospectName: "John Smith",
    companyName: "Acme Corporation",
    role: "VP of Sales",
    meetingLink: "https://calendly.com/example",
    notes: "Interested in our enterprise solution",
    createdAt: new Date().toISOString(),
    overview: "John Smith is the VP of Sales at Acme Corporation, a mid-sized technology company with 500+ employees. He has been in his current role for 3 years and is responsible for driving sales growth across multiple product lines.",
    context: "Acme Corporation is a B2B SaaS company that provides project management solutions to enterprise clients. They've been experiencing rapid growth but are struggling with inefficient sales processes and lack of visibility into their sales pipeline.",
    painPoints: [
      "Manual sales processes are slowing down deal closure",
      "Lack of real-time visibility into sales pipeline",
      "Difficulty tracking and managing multiple deals simultaneously",
      "Inconsistent follow-up processes leading to lost opportunities"
    ],
    talkingPoints: [
      "Our solution can reduce sales cycle time by 30%",
      "Real-time pipeline visibility helps identify bottlenecks early",
      "Automated follow-up sequences ensure no deals fall through cracks",
      "Integration with existing CRM systems minimizes disruption"
    ],
    questions: [
      "What's your current average sales cycle length?",
      "How do you currently track deal progress?",
      "What's your biggest challenge in closing deals?",
      "How important is CRM integration to your team?"
    ],
    competitiveInsights: "Acme is likely evaluating multiple sales automation tools. Key differentiators include our seamless CRM integration, advanced analytics, and proven ROI with similar-sized companies."
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      {/* Navigation */}
      <nav style={{ 
        backgroundColor: "white", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        borderBottom: "1px solid #e5e7eb"
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}>
          <div style={{ display: "flex", height: "4rem", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <a 
                href="/dashboard"
                style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "bold", 
                  color: "#667eea",
                  textDecoration: "none"
                }}
              >
                CallReady AI
              </a>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <a 
                  href="/dashboard"
                  style={{ 
                    color: "#6b7280", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  Dashboard
                </a>
                <a 
                  href="/dashboard/new"
                  style={{ 
                    color: "#6b7280", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  New Brief
                </a>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                {session.user.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1rem" }}>
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
              <p style={{ color: "#374151", lineHeight: "1.6" }}>{brief.overview}</p>
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
              <p style={{ color: "#374151", lineHeight: "1.6" }}>{brief.context}</p>
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
              <ul style={{ color: "#374151", lineHeight: "1.6", paddingLeft: "1.5rem" }}>
                {brief.painPoints.map((point, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>{point}</li>
                ))}
              </ul>
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
              <ul style={{ color: "#374151", lineHeight: "1.6", paddingLeft: "1.5rem" }}>
                {brief.talkingPoints.map((point, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>{point}</li>
                ))}
              </ul>
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
              <ul style={{ color: "#374151", lineHeight: "1.6", paddingLeft: "1.5rem" }}>
                {brief.questions.map((question, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>{question}</li>
                ))}
              </ul>
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
              <p style={{ color: "#374151", lineHeight: "1.6" }}>{brief.competitiveInsights}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}