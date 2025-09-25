import Link from "next/link"

export default function SimpleDashboardPage() {
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
                href="/dashboard-simple"
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
                  href="/dashboard-simple"
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
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                Test User (test@example.com)
              </span>
              <Link 
                href="/"
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
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 1rem" }}>
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
                  Welcome back, Test User!
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
                  0
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
                  5
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
                  Free
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

            {/* Success Message */}
            <div style={{
              backgroundColor: "#d1fae5",
              border: "1px solid #10b981",
              borderRadius: "0.5rem",
              padding: "1rem",
              marginTop: "2rem",
              textAlign: "center"
            }}>
              <h3 style={{ color: "#065f46", fontWeight: "600", marginBottom: "0.5rem" }}>
                ✅ Authentication Working!
              </h3>
              <p style={{ color: "#047857", fontSize: "0.875rem" }}>
                You successfully registered and can now access the dashboard. 
                The authentication system is working properly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
