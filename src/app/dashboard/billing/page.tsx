"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BillingPage() {
  const [briefsUsed, setBriefsUsed] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load brief count from localStorage
    try {
      const stored = localStorage.getItem('callready_briefs')
      if (stored) {
        const briefs = JSON.parse(stored)
        // Get the most recent user ID from the briefs (since we don't have session in client component)
        const userBriefs = briefs.filter((brief: any) => brief.userId)
        if (userBriefs.length > 0) {
          // Use the user ID from the first brief
          const userId = userBriefs[0].userId
          const userSpecificBriefs = briefs.filter((brief: any) => brief.userId === userId)
          setBriefsUsed(userSpecificBriefs.length)
        }
      }
    } catch (error) {
      console.error('Failed to load brief count:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

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
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
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
              onClick={() => {
                // Redirect to Starter plan
                window.open('https://buy.stripe.com/eVq14f9dXdqraTnf4IaVa01', '_blank')
              }}
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
              {currentPlan === "Free" ? "Current Plan" : "Upgrade to Starter"}
            </button>
          </div>

          {/* Starter Plan */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "0.75rem",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            padding: "2rem",
            border: "1px solid #e5e7eb",
            position: "relative"
          }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Starter
              </h3>
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: "bold", color: "#667eea" }}>
                  $19.99
                </span>
                <span style={{ color: "#6b7280" }}>/month</span>
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                25 briefs per month
              </p>
            </div>

            <ul style={{ marginBottom: "2rem", paddingLeft: "0", listStyle: "none" }}>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                25 AI-generated briefs per month
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
                Basic analytics
              </li>
              <li style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.875rem", color: "#374151" }}>
                <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                Email support
              </li>
            </ul>

            <button
              onClick={() => {
                window.open('https://buy.stripe.com/eVq14f9dXdqraTnf4IaVa01', '_blank')
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: currentPlan === "Starter" ? "#22c55e" : "#667eea",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {currentPlan === "Starter" ? "Current Plan" : "Upgrade to Starter"}
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
              onClick={() => {
                window.open('https://buy.stripe.com/14AcMXbm5euv6D7aOsaVa00', '_blank')
              }}
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
            onClick={() => {
              // For now, redirect to Stripe's customer portal
              // In production, this would create a customer portal session
              alert('Payment management will be available after upgrading to a paid plan. Please upgrade first.')
            }}
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
            onClick={() => {
              alert('Subscription management will be available after upgrading to a paid plan.')
            }}
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