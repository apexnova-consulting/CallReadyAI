import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function DashboardPage() {
  const session = await auth()

  const briefs = await db.brief.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const subscription = await db.subscription.findUnique({
    where: { userId: session?.user?.id },
  })

  const briefsUsed = briefs.length
  const briefsLimit = subscription?.briefsLimit || 5

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
            Welcome back, {session?.user?.name || session?.user?.email}
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
            {subscription?.plan || "Free"}
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
        
        {briefs.length === 0 ? (
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
        ) : (
          <div>
            {briefs.map((brief) => (
              <div 
                key={brief.id}
                style={{ 
                  padding: "1.5rem", 
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                    {brief.prospectName} - {brief.companyName}
                  </h3>
                  <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                    {brief.role}
                  </p>
                  <p style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                    Created {new Date(brief.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Link 
                  href={`/dashboard/briefs/${brief.id}`}
                  style={{ 
                    padding: "0.5rem 1rem", 
                    backgroundColor: "#f3f4f6", 
                    color: "#374151", 
                    textDecoration: "none", 
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  View Brief
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}