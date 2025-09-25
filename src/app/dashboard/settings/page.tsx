export default function SettingsPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem", color: "#22c55e" }}>
        ✅ Settings Page
      </h1>
      <p style={{ fontSize: "1.25rem", color: "#4b5563", marginBottom: "2rem" }}>
        Settings functionality will be implemented once authentication is fully working.
      </p>
      <div style={{ 
        backgroundColor: "#f0f9ff", 
        padding: "2rem", 
        borderRadius: "0.75rem", 
        border: "1px solid #0ea5e9",
        color: "#0c4a6e"
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          Coming Soon
        </h2>
        <p>
          User profile management, API key settings, and account preferences will be added after core authentication is stable.
        </p>
      </div>
    </div>
  )
}