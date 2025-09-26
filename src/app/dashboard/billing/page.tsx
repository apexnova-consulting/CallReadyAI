import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllBriefsForUser } from "@/lib/brief-storage"

export default async function BillingPage() {
  try {
    const session = await getSession()
    
    if (!session) {
      redirect("/login")
    }

    // Get real brief usage data with error handling
    let userBriefs = []
    let briefsUsed = 0
    let briefsLimit = 5 // Free tier limit
    
    try {
      userBriefs = getAllBriefsForUser(session.user.id)
      briefsUsed = userBriefs.length
    } catch (error) {
      console.error("Error getting user briefs:", error)
      // Fallback to safe defaults
      userBriefs = []
      briefsUsed = 0
    }
    
    const subscription = {
      plan: briefsUsed >= briefsLimit ? "Pro" : "Free",
      status: "active",
      briefsUsed: briefsUsed,
      briefsLimit: briefsLimit,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeCurrentPeriodEnd: null
    }

  const plans = [
    {
      name: "Starter",
      price: 19,
      period: "month",
      briefsLimit: 50,
      features: [
        "50 AI-generated briefs per month",
        "PDF export",
        "Email sharing",
        "Basic analytics",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: 49,
      period: "month",
      briefsLimit: 200,
      features: [
        "200 AI-generated briefs per month",
        "PDF export",
        "Email sharing",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "API access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "month",
      briefsLimit: "Unlimited",
      features: [
        "Unlimited AI-generated briefs",
        "All Pro features",
        "Dedicated account manager",
        "Custom integrations",
        "SSO",
        "Advanced security",
        "Custom training"
      ],
      popular: false
    }
  ]

  return (
    <div>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
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
                  {subscription.briefsUsed}
                </h3>
                <p style={{ color: "#6b7280" }}>Briefs Generated</p>
              </div>
              <div>
                <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
                  {subscription.briefsLimit}
                </h3>
                <p style={{ color: "#6b7280" }}>Monthly Limit</p>
              </div>
              <div>
                <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
                  {subscription.briefsLimit - subscription.briefsUsed}
                </h3>
                <p style={{ color: "#6b7280" }}>Remaining</p>
              </div>
              <div>
                <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
                  {subscription.plan}
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
              {plans.map((plan, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "0.75rem",
                    boxShadow: plan.popular ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
                    padding: "2rem",
                    border: plan.popular ? "2px solid #667eea" : "1px solid #e5e7eb",
                    position: "relative"
                  }}
                >
                  {plan.popular && (
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
                  )}
                  
                  <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                      {plan.name}
                    </h3>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "3rem", fontWeight: "bold", color: "#667eea" }}>
                        ${plan.price}
                      </span>
                      <span style={{ color: "#6b7280" }}>/{plan.period}</span>
                    </div>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      {plan.briefsLimit} briefs per month
                    </p>
                  </div>

                  <ul style={{ marginBottom: "2rem", paddingLeft: "0", listStyle: "none" }}>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        marginBottom: "0.75rem",
                        fontSize: "0.875rem",
                        color: "#374151"
                      }}>
                        <span style={{ color: "#22c55e", marginRight: "0.5rem" }}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      backgroundColor: plan.popular ? "#667eea" : "#f3f4f6",
                      color: plan.popular ? "white" : "#374151",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      if (!plan.popular) {
                        e.currentTarget.style.backgroundColor = "#e5e7eb"
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!plan.popular) {
                        e.currentTarget.style.backgroundColor = "#f3f4f6"
                      }
                    }}
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : 
                     subscription.plan === plan.name ? "Current Plan" : 
                     `Upgrade to ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Information */}
          {subscription.stripeCustomerId && (
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
                  <div style={{ color: "#6b7280" }}>{subscription.status}</div>
                </div>
                <div>
                  <strong style={{ color: "#374151" }}>Next Billing Date:</strong>
                  <div style={{ color: "#6b7280" }}>
                    {subscription.stripeCurrentPeriodEnd ? 
                      new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString() : 
                      "N/A"}
                  </div>
                </div>
                <div>
                  <strong style={{ color: "#374151" }}>Customer ID:</strong>
                  <div style={{ color: "#6b7280", fontFamily: "monospace" }}>
                    {subscription.stripeCustomerId}
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
          )}
    </div>
  )
  } catch (error) {
    console.error("Billing page error:", error)
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '50vh',
        padding: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#dc2626'
        }}>
          Billing Page Error
        </h1>
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          We're experiencing a technical issue with the billing page. Please try again later.
        </p>
        <a
          href="/dashboard"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#667eea',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          Back to Dashboard
        </a>
      </div>
    )
  }
}