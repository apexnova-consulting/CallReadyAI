import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import BillingForm from "./billing-form"

export default async function BillingPage() {
  const session = await getSession()

  const subscription = await db.subscription.findUnique({
    where: { userId: session?.user?.id },
  })

  const briefs = await db.brief.count({
    where: { userId: session?.user?.id },
  })

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
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
              {briefs}
            </h3>
            <p style={{ color: "#6b7280" }}>Briefs Generated</p>
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
              {subscription?.briefsLimit || 5}
            </h3>
            <p style={{ color: "#6b7280" }}>Monthly Limit</p>
          </div>
          <div>
            <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
              {(subscription?.briefsLimit || 5) - briefs}
            </h3>
            <p style={{ color: "#6b7280" }}>Remaining</p>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <BillingForm 
        subscriptionPlan={subscription?.plan || null}
        stripeCustomerId={subscription?.stripeCustomerId || null}
        stripeSubscriptionId={subscription?.stripeSubscriptionId || null}
        stripeCurrentPeriodEnd={subscription?.stripeCurrentPeriodEnd || null}
        briefsUsed={briefs}
        briefsLimit={subscription?.briefsLimit || 5}
      />
    </div>
  )
}
