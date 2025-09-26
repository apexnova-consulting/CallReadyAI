import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllBriefsForUser } from "@/lib/brief-storage"

export default async function BillingPage() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // Get brief usage data with error handling
  let briefsUsed = 0
  try {
    const userBriefs = getAllBriefsForUser(session.user.id)
    briefsUsed = userBriefs.length
  } catch (error) {
    console.error("Error getting user briefs:", error)
    briefsUsed = 0
  }

  const briefsLimit = 5 // Free tier limit
  const currentPlan = briefsUsed >= briefsLimit ? "Pro" : "Free"

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>
          Billing & Subscription
        </h1>
        <p style={{ color: "#6b7280" }}>
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Usage */}
      <div style={{ 
        backgroundColor: "white", 
        padding: "1.5rem", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
          Current Usage
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
              {briefsUsed}
            </h3>
            <p style={{ color: "#6b7280" }}>Briefs Generated</p>
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
              {briefsLimit}
            </h3>
            <p style={{ color: "#6b7280" }}>Monthly Limit</p>
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
              {Math.max(0, briefsLimit - briefsUsed)}
            </h3>
            <p style={{ color: "#6b7280" }}>Remaining</p>
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
              {currentPlan}
            </h3>
            <p style={{ color: "#6b7280" }}>Current Plan</p>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center" }}>
          Choose Your Plan
        </h2>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "1.5rem" 
        }}>
          {/* Free Plan */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.75rem",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            padding: "2rem",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Free
              </h3>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: "bold", color: "#667eea" }}>
                  $0
                </span>
                <span style={{ color: "#6b7280" }}>/month</span>
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                5 briefs per month
              </p>
            </div>

            <ul style={{ marginBottom: "2rem", paddingLeft: "0", listStyle: "none" }}>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                5 AI-generated briefs per month
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                PDF export
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                Email sharing
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                Basic support
              </li>
            </ul>

            <button
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: currentPlan === "Free" ? "#22c55e" : "#f3f4f6",
                color: currentPlan === "Free" ? "white" : "#374151",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {currentPlan === "Free" ? "Current Plan" : "Downgrade to Free"}
            </button>
          </div>

          {/* Pro Plan */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.75rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "2rem",
            border: "2px solid #667eea",
            position: "relative"
          }}>
            <div style={{
              position: "absolute",
              top: "-0.75rem",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#667eea",
              color: "white",
              padding: "0.25rem 1rem",
              borderRadius: "1rem",
              fontSize: "0.75rem",
              fontWeight: "600"
            }}>
              Most Popular
            </div>
            
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Pro
              </h3>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: "bold", color: "#667eea" }}>
                  $49
                </span>
                <span style={{ color: "#6b7280" }}>/month</span>
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                200 briefs per month
              </p>
            </div>

            <ul style={{ marginBottom: "2rem", paddingLeft: "0", listStyle: "none" }}>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                200 AI-generated briefs per month
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                PDF export
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                Email sharing
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                Advanced analytics
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                Priority support
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                Custom branding
              </li>
            </ul>

            <button
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: currentPlan === "Pro" ? "#22c55e" : "#667eea",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {currentPlan === "Pro" ? "Current Plan" : "Upgrade to Pro"}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.75rem",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            padding: "2rem",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Enterprise
              </h3>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: "bold", color: "#667eea" }}>
                  Custom
                </span>
                <span style={{ color: "#6b7280" }}>/month</span>
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                Unlimited briefs
              </p>
            </div>

            <ul style={{ marginBottom: "2rem", paddingLeft: "0", listStyle: "none" }}>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                Unlimited AI-generated briefs
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                All Pro features
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                Dedicated account manager
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                Custom integrations
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                SSO
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                Advanced security
              </li>
            </ul>

            <button
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        padding: "2rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
          Billing Information
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <div>
            <strong style={{ color: "#374151" }}>Status:</strong>
            <div style={{ color: "#6b7280" }}>Active</div>
          </div>
          <div>
            <strong style={{ color: "#374151" }}>Plan:</strong>
            <div style={{ color: "#6b7280" }}>{currentPlan}</div>
          </div>
          <div>
            <strong style={{ color: "#374151" }}>Next Billing Date:</strong>
            <div style={{ color: "#6b7280" }}>
              {currentPlan === "Free" ? "N/A" : "Monthly"}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
          <button
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
            Update Payment Method
          </button>
          <button
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  )
}