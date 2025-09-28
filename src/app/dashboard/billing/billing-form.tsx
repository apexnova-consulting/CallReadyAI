"use client"

import { useState } from "react"

interface BillingFormProps {
  subscriptionPlan: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripeCurrentPeriodEnd: Date | null
  briefsUsed: number
  briefsLimit: number
}

export default function BillingForm({
  subscriptionPlan,
  briefsUsed,
  briefsLimit
}: BillingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(subscriptionPlan)

  const handleSubscribe = async (plan: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/billing/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        alert("Failed to create checkout session")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$19",
      period: "month",
      briefs: 20,
      description: "Perfect for individual sales reps",
      features: ["20 AI briefs per month", "PDF export", "Email briefs", "Basic support"]
    },
    {
      id: "pro",
      name: "Pro",
      price: "$49",
      period: "month",
      briefs: 100,
      description: "Ideal for sales teams",
      features: ["100 AI briefs per month", "PDF export", "Email briefs", "Priority support", "Team collaboration"]
    }
  ]

  return (
    <div style={{ 
      backgroundColor: "white", 
      borderRadius: "0.75rem", 
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      overflow: "hidden"
    }}>
      <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
          Choose Your Plan
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          Upgrade to get more briefs and advanced features
        </p>
      </div>

      <div style={{ padding: "1.5rem" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "1.5rem" 
        }}>
          {plans.map((plan) => (
            <div 
              key={plan.id}
              style={{ 
                border: selectedPlan === plan.id ? "2px solid #667eea" : "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                padding: "1.5rem",
                position: "relative"
              }}
            >
              {selectedPlan === plan.id && (
                <div style={{
                  position: "absolute",
                  top: "-1px",
                  right: "-1px",
                  backgroundColor: "#667eea",
                  color: "white",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "0 0.75rem 0 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: "600"
                }}>
                  Current Plan
                </div>
              )}
              
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  {plan.name}
                </h3>
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#667eea" }}>
                    {plan.price}
                  </span>
                  <span style={{ color: "#6b7280" }}>/{plan.period}</span>
                </div>
                <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                  {plan.description}
                </p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.75rem" }}>
                  What's included:
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{ 
                      padding: "0.25rem 0", 
                      fontSize: "0.875rem",
                      color: "#4b5563",
                      display: "flex",
                      alignItems: "center"
                    }}>
                      <span style={{ 
                        color: "#10b981", 
                        marginRight: "0.5rem",
                        fontWeight: "bold"
                      }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isLoading || selectedPlan === plan.id}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: selectedPlan === plan.id ? "#f3f4f6" : "#667eea",
                  color: selectedPlan === plan.id ? "#6b7280" : "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? "Processing..." : selectedPlan === plan.id ? "Current Plan" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Free Plan */}
        <div style={{ 
          marginTop: "2rem",
          padding: "1.5rem",
          backgroundColor: "#f9fafb",
          borderRadius: "0.75rem",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                Free Plan
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                5 AI briefs per month • Perfect for trying out CallReady AI
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>
                $0
              </div>
              <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                per month
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

