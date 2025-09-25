import Link from "next/link"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // Mock data for now - will be replaced with real database queries
  const userStats = {
    briefsUsed: 0,
    briefsLimit: 5,
    currentPlan: "Free",
    recentBriefs: []
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
              <Link 
                href="/dashboard"
                style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "bold", 
                  color: "#667eea",
                  textDecoration: "none"
                }}
              >
                CallReady AI
              </Link>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <Link 
                  href="/dashboard"
                  style={{ 
                    color: "#6b7280", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/new"
                  style={{ 
                    color: "#6b7280", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  New Brief
                </Link>
                <Link 
                  href="/dashboard/billing"
                  style={{ 
                    color: "#6b7280", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  Billing
                </Link>
                <Link 
                  href="/dashboard/settings"
                  style={{ 
                    color: "#6b7280", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  Settings
                </Link>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                {session.user.name} ({session.user.email})
              </span>
              <form action="/api/logout" method="POST">
                <button
                  type="submit"
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
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 1rem" }}>
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
                Welcome back, {session.user.name}!
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
                {userStats.briefsUsed}
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
                {userStats.briefsLimit - userStats.briefsUsed}
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
                {userStats.currentPlan}
              </h3>
              <p style={{ color: "#6b7280" }}>Current Plan</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "0.75rem", 
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            padding: "2rem",
            marginBottom: "2rem"
          }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>
              Quick Actions
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
              <Link 
                href="/dashboard/new"
                style={{ 
                  padding: "1rem", 
                  backgroundColor: "#f0f9ff", 
                  border: "1px solid #0ea5e9",
                  borderRadius: "0.5rem", 
                  textDecoration: "none",
                  color: "#0c4a6e",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}
              >
                <div style={{ fontSize: "1.5rem" }}>📝</div>
                <div>
                  <div style={{ fontWeight: "600" }}>Create New Brief</div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>Generate AI-powered sales call brief</div>
                </div>
              </Link>
              <Link 
                href="/dashboard/billing"
                style={{ 
                  padding: "1rem", 
                  backgroundColor: "#f0fdf4", 
                  border: "1px solid #22c55e",
                  borderRadius: "0.5rem", 
                  textDecoration: "none",
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}
              >
                <div style={{ fontSize: "1.5rem" }}>💳</div>
                <div>
                  <div style={{ fontWeight: "600" }}>Manage Billing</div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>View subscription and usage</div>
                </div>
              </Link>
              <Link 
                href="/dashboard/settings"
                style={{ 
                  padding: "1rem", 
                  backgroundColor: "#fefce8", 
                  border: "1px solid #eab308",
                  borderRadius: "0.5rem", 
                  textDecoration: "none",
                  color: "#a16207",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}
              >
                <div style={{ fontSize: "1.5rem" }}>⚙️</div>
                <div>
                  <div style={{ fontWeight: "600" }}>Account Settings</div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>Update profile and preferences</div>
                </div>
              </Link>
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
      </main>
    </div>
  )
}