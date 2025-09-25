import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function BillingPage() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // Mock subscription data for now
  const subscription = {
    plan: "Free",
    status: "active",
    briefsUsed: 0,
    briefsLimit: 5,
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
                  href="/dashboard/billing"
                  style={{ 
                    color: "#667eea", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  Billing
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
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
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
      </main>
    </div>
  )
}