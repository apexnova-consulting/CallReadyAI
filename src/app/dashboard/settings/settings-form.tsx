"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface SettingsFormProps {
  userData: {
    name: string
    email: string
  }
}

export default function SettingsForm({ userData }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess("Profile updated successfully!")
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          newPassword: newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess("Password updated successfully!")
        // Clear form
        e.currentTarget.reset()
      } else {
        setError(data.error || "Failed to update password")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push("/")
      } else {
        setError(data.error || "Failed to delete account")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>
          Account Settings
        </h1>
        <p style={{ color: "#6b7280" }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div style={{
          backgroundColor: "#d1fae5",
          border: "1px solid #10b981",
          color: "#065f46",
          padding: "0.75rem",
          borderRadius: "0.5rem",
          marginBottom: "1.5rem",
          fontSize: "0.875rem"
        }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#dc2626",
          padding: "0.75rem",
          borderRadius: "0.5rem",
          marginBottom: "1.5rem",
          fontSize: "0.875rem"
        }}>
          {error}
        </div>
      )}

      {/* Profile Information */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        padding: "2rem",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>
          Profile Information
        </h2>
        
        <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label htmlFor="name" style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={userData.name}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.2s"
              }}
            />
          </div>

          <div>
            <label htmlFor="email" style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={userData.email}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.2s"
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
              Changing your email will require verification
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "0.75rem 1.5rem",
              background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              alignSelf: "flex-start"
            }}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        padding: "2rem",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>
          Change Password
        </h2>
        
        <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label htmlFor="currentPassword" style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.2s"
              }}
            />
          </div>

          <div>
            <label htmlFor="newPassword" style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.2s"
              }}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{ 
              display: "block", 
              fontSize: "0.875rem", 
              fontWeight: "500", 
              marginBottom: "0.5rem",
              color: "#374151"
            }}>
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.2s"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: isLoading ? "#9ca3af" : "#f3f4f6",
              color: isLoading ? "white" : "#374151",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              alignSelf: "flex-start"
            }}
          >
            {isLoading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div style={{ 
        backgroundColor: "#fef2f2", 
        border: "1px solid #fecaca",
        borderRadius: "0.75rem", 
        padding: "2rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#dc2626" }}>
          Danger Zone
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={isLoading}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: isLoading ? "#9ca3af" : "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  )
}
