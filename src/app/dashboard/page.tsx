import Link from "next/link"
import { requireAuth } from "@/lib/simple-auth"

export default async function DashboardPage() {
  const session = await requireAuth()

  // Simple in-memory data for demo
  const briefsUsed = 0 // Will be updated when briefs are created
  const briefsLimit = 5
  const currentPlan = "Free"

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Dashboard
          </h1>
          <p style={{ color: "#6b7280" }}>
            Welcome back, {session?.user?.name || session?.user?.email}!
          </p>
        </div>
        <Link 
          href="/dashboard/new"
          style={{ 
            padding: "0.75rem 1.5rem", 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "0.5rem",
            fontWeight: "600"
          }}
        >
          New Brief
        </Link>
      </div>

      {/* Usage Stats */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        <div style={{ 
          backgroundColor: "white", 
          padding: "1.5rem", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
            {briefsUsed}
          </h3>
          <p style={{ color: "#6b7280" }}>Briefs Generated</p>
        </div>
        <div style={{ 
          backgroundColor: "white", 
          padding: "1.5rem", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
            {briefsLimit - briefsUsed}
          </h3>
          <p style={{ color: "#6b7280" }}>Remaining</p>
        </div>
            <div style={{ 
              backgroundColor: "white", 
              padding: "1.5rem", 
              borderRadius: "0.75rem", 
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              textAlign: "center"
            }}>
              <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
                {currentPlan}
              </h3>
              <p style={{ color: "#6b7280" }}>Current Plan</p>
            </div>
      </div>

      {/* Brief History */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        overflow: "hidden"
      }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Recent Briefs</h2>
        </div>
        
            <div style={{ 
              padding: "3rem", 
              textAlign: "center",
              color: "#6b7280"
            }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                No briefs yet
              </h3>
              <p style={{ marginBottom: "1.5rem" }}>
                Create your first AI-powered sales call brief
              </p>
              <Link 
                href="/dashboard/new"
                style={{ 
                  padding: "0.75rem 1.5rem", 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                  color: "white", 
                  textDecoration: "none", 
                  borderRadius: "0.5rem",
                  fontWeight: "600"
                }}
              >
                Create Your First Brief
              </Link>
            </div>
      </div>
    </div>
  )
}