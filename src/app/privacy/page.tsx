export default function PrivacyPage() {
  return (
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
        Privacy Policy
      </h1>
      
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          1. Information We Collect
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          We collect information you provide directly to us, such as when you create an account, 
          generate briefs, or contact us for support.
        </p>
        <ul style={{ marginLeft: "2rem", marginBottom: "1rem" }}>
          <li>Account information (name, email address)</li>
          <li>Brief data (prospect information, company details, notes)</li>
          <li>Payment information (processed securely through Stripe)</li>
          <li>Usage data and analytics</li>
        </ul>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          2. How We Use Your Information
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          We use the information we collect to:
        </p>
        <ul style={{ marginLeft: "2rem", marginBottom: "1rem" }}>
          <li>Provide and improve our AI brief generation service</li>
          <li>Process payments and manage subscriptions</li>
          <li>Send you important updates about your account</li>
          <li>Provide customer support</li>
          <li>Analyze usage patterns to improve our service</li>
        </ul>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          3. Information Sharing
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          We do not sell, trade, or otherwise transfer your personal information to third parties 
          except in the following circumstances:
        </p>
        <ul style={{ marginLeft: "2rem", marginBottom: "1rem" }}>
          <li>With your explicit consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and prevent fraud</li>
          <li>With service providers who assist in our operations (under strict confidentiality)</li>
        </ul>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          4. Data Security
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          We implement appropriate security measures to protect your personal information against 
          unauthorized access, alteration, disclosure, or destruction. This includes:
        </p>
        <ul style={{ marginLeft: "2rem", marginBottom: "1rem" }}>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security audits and updates</li>
          <li>Access controls and authentication</li>
          <li>Secure payment processing through Stripe</li>
        </ul>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          5. Your Rights
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          You have the right to:
        </p>
        <ul style={{ marginLeft: "2rem", marginBottom: "1rem" }}>
          <li>Access and update your personal information</li>
          <li>Delete your account and associated data</li>
          <li>Export your data</li>
          <li>Opt out of marketing communications</li>
          <li>Request information about how we use your data</li>
        </ul>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          6. Contact Us
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p style={{ marginBottom: "1rem" }}>
          Email: privacy@callreadyai.com<br />
          Address: CallReady AI, Inc.
        </p>
      </div>
    </div>
  )
}
