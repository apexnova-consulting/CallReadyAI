import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function SettingsPage() {
  const session = await getSession()

  const user = await db.user.findUnique({
    where: { id: session?.user?.id },
  })

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Settings
        </h1>
        <p style={{ color: "#6b7280" }}>
          Manage your account settings and preferences
        </p>
      </div>

      <div style={{ 
        backgroundColor: "white", 
        padding: "2rem", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>
          Profile Information
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Name
            </label>
            <input
              type="text"
              defaultValue={user?.name || ""}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Email
            </label>
            <input
              type="email"
              defaultValue={user?.email || ""}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                backgroundColor: "#f9fafb",
                color: "#6b7280"
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
              Email cannot be changed
            </p>
          </div>

          <button
            style={{
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              alignSelf: "flex-start"
            }}
          >
            Update Profile
          </button>
        </div>
      </div>

      <div style={{ 
        backgroundColor: "white", 
        padding: "2rem", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>
          Change Password
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Current Password
            </label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              New Password
            </label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none"
              }}
            />
          </div>

          <button
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              alignSelf: "flex-start"
            }}
          >
            Change Password
          </button>
        </div>
      </div>

      <div style={{ 
        backgroundColor: "#fef2f2", 
        padding: "2rem", 
        borderRadius: "0.75rem", 
        border: "1px solid #fecaca"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#dc2626" }}>
          Danger Zone
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
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
          Delete Account
        </button>
      </div>
    </div>
  )
}
