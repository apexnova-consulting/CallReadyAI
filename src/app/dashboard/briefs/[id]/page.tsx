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

  // For now, show a message that brief viewing is not yet implemented
  // In a real app, this would fetch the brief from the database
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Brief Viewing
        </h1>
        <p style={{ color: "#6b7280" }}>
          Brief ID: {params.id}
        </p>
      </div>

      {/* Info Message */}
      <div style={{ 
        backgroundColor: "#f0f9ff", 
        border: "1px solid #0ea5e9",
        borderRadius: "0.5rem", 
        padding: "2rem", 
        marginBottom: "2rem",
        color: "#0c4a6e"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
          📋 Brief Generated Successfully!
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          Your AI-powered sales call brief has been generated successfully. The brief viewing feature is currently being enhanced.
        </p>
        <p style={{ marginBottom: "1.5rem" }}>
          <strong>Brief ID:</strong> {params.id}
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <a
            href="/dashboard/new"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#0ea5e9",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600"
            }}
          >
            Generate Another Brief
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

      {/* Sample Brief Preview */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        padding: "2rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
          Sample Brief Preview
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
          Here's what your generated brief would look like:
        </p>
        
        <div style={{ 
          backgroundColor: "#f9fafb", 
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem", 
          padding: "1.5rem",
          fontSize: "0.875rem",
          lineHeight: "1.6"
        }}>
          <div style={{ marginBottom: "1rem" }}>
            <strong style={{ color: "#667eea" }}>1. Prospect Overview</strong>
            <div style={{ color: "#374151", marginTop: "0.5rem" }}>
              • Professional contact with decision-making authority<br/>
              • Key stakeholder in the sales process<br/>
              • Experienced in their industry and role
            </div>
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
            <strong style={{ color: "#667eea" }}>2. Company Context</strong>
            <div style={{ color: "#374151", marginTop: "0.5rem" }}>
              • Growing company with expansion opportunities<br/>
              • Looking to improve business processes<br/>
              • Potential for significant growth
            </div>
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
            <strong style={{ color: "#667eea" }}>3. Potential Pain Points</strong>
            <div style={{ color: "#374151", marginTop: "0.5rem" }}>
              • Manual processes slowing operations<br/>
              • Lack of visibility into key metrics<br/>
              • Difficulty scaling current solutions
            </div>
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
            <strong style={{ color: "#667eea" }}>4. Key Talking Points</strong>
            <div style={{ color: "#374151", marginTop: "0.5rem" }}>
              • Our solution addresses their challenges<br/>
              • Proven ROI with similar companies<br/>
              • Easy implementation and adoption
            </div>
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
            <strong style={{ color: "#667eea" }}>5. Questions to Ask</strong>
            <div style={{ color: "#374151", marginTop: "0.5rem" }}>
              • What's your biggest challenge right now?<br/>
              • How do you currently handle this process?<br/>
              • What would success look like for you?
            </div>
          </div>
          
          <div>
            <strong style={{ color: "#667eea" }}>6. Competitive Insights</strong>
            <div style={{ color: "#374151", marginTop: "0.5rem" }}>
              • Focus on our unique value proposition<br/>
              • Emphasize customer success stories<br/>
              • Highlight superior support and training
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}