"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in by looking for session data
    const checkSession = async () => {
      try {
        const response = await fetch('/api/me')
        if (response.ok) {
          const userData = await response.json()
          setSession({ user: userData })
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Session check failed:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

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
              <Link 
                href="/dashboard"
                style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: "bold", 
                  color: "#667eea",
                  textDecoration: "none"
                }}
              >
                CallReady AI
              </Link>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <Link 
                  href="/dashboard"
                  style={{ 
                    color: "#6b7280", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/new"
                  style={{ 
                    color: "#6b7280", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  New Brief
                </Link>
                <Link 
                  href="/dashboard/templates"
                  style={{ 
                    color: "#6b7280", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  Templates
                </Link>
                <Link 
                  href="/dashboard/billing"
                  style={{ 
                    color: "#6b7280", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  Billing
                </Link>
                <Link 
                  href="/dashboard/settings"
                  style={{ 
                    color: "#6b7280", 
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: "500"
                  }}
                >
                  Settings
                </Link>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/logout', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    })
                    
                    const data = await response.json()
                    
                    if (response.ok && data.success) {
                      // Clear localStorage
                      localStorage.removeItem('callready_briefs')
                      localStorage.removeItem('callready_templates')
                      
                      // Redirect to home page
                      window.location.href = data.redirectUrl || '/'
                    } else {
                      console.error('Logout failed:', data.error)
                      // Force redirect even if logout fails
                      window.location.href = '/'
                    }
                  } catch (error) {
                    console.error('Logout error:', error)
                    // Force redirect even if logout fails
                    window.location.href = '/'
                  }
                }}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 1rem" }}>
          {children}
        </div>
      </main>
    </div>
  )
}