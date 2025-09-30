"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { BriefData } from "@/lib/brief-storage"

interface DashboardClientProps {
  session: any
  briefsUsed: number
  briefsLimit: number
  currentPlan: string
  recentBriefs: BriefData[]
  userBriefs: BriefData[]
}

export default function DashboardClient({ 
  session, 
  briefsUsed, 
  briefsLimit, 
  currentPlan, 
  recentBriefs, 
  userBriefs 
}: DashboardClientProps) {
  const [localBriefs, setLocalBriefs] = useState<BriefData[]>([])
  const [displayBriefs, setDisplayBriefs] = useState<BriefData[]>(recentBriefs)

  useEffect(() => {
    // Load briefs from localStorage on client side
    try {
      const stored = localStorage.getItem('callready_briefs')
      if (stored) {
        const briefs = JSON.parse(stored).filter((brief: BriefData) => brief.userId === session.user.id)
        setLocalBriefs(briefs)
        
        // Use localStorage briefs if they're more recent or if server briefs are empty
        if (briefs.length > recentBriefs.length) {
          setDisplayBriefs(briefs.slice(0, 5))
        }
      }
    } catch (error) {
      console.error('Failed to load briefs from localStorage:', error)
    }
  }, [session.user.id, recentBriefs])

  const finalBriefsUsed = Math.max(briefsUsed, localBriefs.length)
  const finalRecentBriefs = displayBriefs.length > recentBriefs.length ? displayBriefs : recentBriefs

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>
            Dashboard
          </h1>
          <p style={{ color: "#6b7280" }}>
            Welcome back, {session.user.name}!
          </p>
        </div>
        <Link 
          href="/dashboard/new"
          style={{ 
            padding: "0.75rem 1.5rem", 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "0.5rem",
            fontWeight: "600"
          }}
        >
          New Brief
        </Link>
      </div>

      {/* Usage Stats */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        <div style={{ 
          backgroundColor: "white", 
          padding: "1.5rem", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
            {finalBriefsUsed}
          </h3>
          <p style={{ color: "#6b7280" }}>Briefs Generated</p>
        </div>
        <div style={{ 
          backgroundColor: "white", 
          padding: "1.5rem", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
            {Math.max(0, briefsLimit - finalBriefsUsed)}
          </h3>
          <p style={{ color: "#6b7280" }}>Remaining</p>
        </div>
        <div style={{ 
          backgroundColor: "white", 
          padding: "1.5rem", 
          borderRadius: "0.75rem", 
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          textAlign: "center"
        }}>
          <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
            {currentPlan}
          </h3>
          <p style={{ color: "#6b7280" }}>Current Plan</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        padding: "2rem",
        marginBottom: "2rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>
          Quick Actions
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <Link 
            href="/dashboard/new"
            style={{ 
              padding: "1rem", 
              backgroundColor: "#f0f9ff", 
              border: "1px solid #0ea5e9",
              borderRadius: "0.5rem", 
              textDecoration: "none",
              color: "#0c4a6e",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>📝</div>
            <div>
              <div style={{ fontWeight: "600" }}>Create New Brief</div>
              <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>Generate AI-powered sales call brief</div>
            </div>
          </Link>
          <Link 
            href="/dashboard/templates"
            style={{ 
              padding: "1rem", 
              backgroundColor: "#f0f9ff", 
              border: "1px solid #0ea5e9",
              borderRadius: "0.5rem", 
              textDecoration: "none",
              color: "#0c4a6e",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>📋</div>
            <div>
              <div style={{ fontWeight: "600" }}>Sales Templates</div>
              <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>Generate AI-powered templates</div>
            </div>
          </Link>
          <Link 
            href="/dashboard/billing"
            style={{ 
              padding: "1rem", 
              backgroundColor: "#f0fdf4", 
              border: "1px solid #22c55e",
              borderRadius: "0.5rem", 
              textDecoration: "none",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>💳</div>
            <div>
              <div style={{ fontWeight: "600" }}>Manage Billing</div>
              <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>View subscription and usage</div>
            </div>
          </Link>
          <Link 
            href="/dashboard/settings"
            style={{ 
              padding: "1rem", 
              backgroundColor: "#fefce8", 
              border: "1px solid #eab308",
              borderRadius: "0.5rem", 
              textDecoration: "none",
              color: "#a16207",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>⚙️</div>
            <div>
              <div style={{ fontWeight: "600" }}>Account Settings</div>
              <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>Update profile and preferences</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Brief History */}
      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "0.75rem", 
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        overflow: "hidden"
      }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Recent Briefs</h2>
        </div>
        
        {finalRecentBriefs.length === 0 ? (
          <div style={{ 
            padding: "3rem", 
            textAlign: "center",
            color: "#6b7280"
          }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "500", marginBottom: "0.5rem" }}>
              No briefs yet
            </h3>
            <p style={{ marginBottom: "1.5rem" }}>
              Create your first AI-powered sales call brief
            </p>
            <Link 
              href="/dashboard/new"
              style={{ 
                padding: "0.75rem 1.5rem", 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                color: "white", 
                textDecoration: "none", 
                borderRadius: "0.5rem",
                fontWeight: "600"
              }}
            >
              Create Your First Brief
            </Link>
          </div>
        ) : (
          <div>
            {finalRecentBriefs.map((brief, index) => (
              <div 
                key={brief.id}
                style={{ 
                  padding: "1.5rem", 
                  borderBottom: index < finalRecentBriefs.length - 1 ? "1px solid #e5e7eb" : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                    {brief.prospectName} at {brief.companyName}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                    {brief.role}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                    Generated {new Date(brief.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link 
                    href={`/dashboard/briefs/${brief.id}`}
                    style={{ 
                      padding: "0.5rem 1rem", 
                      backgroundColor: "#f3f4f6", 
                      color: "#374151",
                      textDecoration: "none", 
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      fontWeight: "500"
                    }}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
            {(localBriefs.length > 5 || userBriefs.length > 5) && (
              <div style={{ 
                padding: "1rem", 
                textAlign: "center",
                backgroundColor: "#f9fafb"
              }}>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  Showing 5 of {Math.max(localBriefs.length, userBriefs.length)} briefs
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


