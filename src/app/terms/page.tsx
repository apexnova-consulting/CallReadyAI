export default function TermsPage() {
  return (
    <div style={{ 
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      padding: "2rem 0"
    }}>
      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto", 
        padding: "2rem",
        lineHeight: "1.6",
        color: "#374151"
      }}>
      <h1 style={{ 
        fontSize: "2rem", 
        fontWeight: "bold", 
        marginBottom: "1rem",
        color: "#667eea"
      }}>
        Terms of Service
      </h1>
      
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          1. Acceptance of Terms
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          By accessing and using CallReady AI, you accept and agree to be bound by the terms 
          and provision of this agreement. If you do not agree to abide by the above, please 
          do not use this service.
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          2. Description of Service
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          CallReady AI provides AI-powered sales call brief generation services. Our service 
          includes:
        </p>
        <ul style={{ marginLeft: "2rem", marginBottom: "1rem" }}>
          <li>AI-generated sales call briefs</li>
          <li>Export options (PDF, email, copy)</li>
          <li>Subscription-based access</li>
          <li>Customer support</li>
        </ul>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          3. User Accounts
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          To use our service, you must create an account. You are responsible for:
        </p>
        <ul style={{ marginLeft: "2rem", marginBottom: "1rem" }}>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Providing accurate and up-to-date information</li>
          <li>Notifying us immediately of any unauthorized use</li>
        </ul>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          4. Subscription and Payment
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          Our service operates on a subscription basis:
        </p>
        <ul style={{ marginLeft: "2rem", marginBottom: "1rem" }}>
          <li>Free tier: 5 briefs per month</li>
          <li>Paid tiers: Starter ($19/month), Pro ($49/month)</li>
          <li>Payments are processed securely through Stripe</li>
          <li>Subscriptions auto-renew unless cancelled</li>
          <li>Refunds are handled on a case-by-case basis</li>
        </ul>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          5. Acceptable Use
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          You agree not to use our service for:
        </p>
        <ul style={{ marginLeft: "2rem", marginBottom: "1rem" }}>
          <li>Illegal or unauthorized purposes</li>
          <li>Violating any applicable laws or regulations</li>
          <li>Infringing on intellectual property rights</li>
          <li>Attempting to gain unauthorized access to our systems</li>
          <li>Interfering with the proper functioning of the service</li>
        </ul>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          6. Intellectual Property
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          The service and its original content, features, and functionality are owned by 
          CallReady AI and are protected by international copyright, trademark, patent, 
          trade secret, and other intellectual property laws.
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          7. Limitation of Liability
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          In no event shall CallReady AI be liable for any indirect, incidental, special, 
          consequential, or punitive damages, including without limitation, loss of profits, 
          data, use, goodwill, or other intangible losses, resulting from your use of the service.
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          8. Termination
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          We may terminate or suspend your account immediately, without prior notice or 
          liability, for any reason whatsoever, including without limitation if you breach 
          the Terms.
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          9. Changes to Terms
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          We reserve the right to modify or replace these Terms at any time. If a revision 
          is material, we will try to provide at least 30 days notice prior to any new 
          terms taking effect.
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          10. Contact Information
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p style={{ marginBottom: "1rem" }}>
          Email: legal@callreadyai.com<br />
          Address: CallReady AI, Inc.
        </p>
      </div>
      </div>
    </div>
  )
}
