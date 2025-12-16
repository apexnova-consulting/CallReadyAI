import Link from "next/link"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllBriefsForUser } from "@/lib/brief-storage"
import { db } from "@/lib/db"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // Get real brief data for the user
  const userBriefs = getAllBriefsForUser(session.user.id)
  const briefsUsed = userBriefs.length

  // Get subscription from database
  let briefsLimit = 5 // Default to Free tier
  let currentPlan = "Free"
  
  // HARDCODED: Pro account for shuchi831@gmail.com
  if (session.user.email === "shuchi831@gmail.com" || session.user.id === "user_shuchi_pro") {
    briefsLimit = 200
    currentPlan = "Pro"
  } else {
    try {
      // Try to find user in database by email
      const dbUser = await db.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true }
      })

      if (dbUser?.subscription) {
        // Use subscription from database
        briefsLimit = dbUser.subscription.briefsLimit || 5
        currentPlan = dbUser.subscription.plan === "pro" ? "Pro" : 
                     dbUser.subscription.plan === "starter" ? "Starter" : "Free"
      } else {
        // Check if user exists in database by ID (in case email doesn't match)
        const dbUserById = await db.user.findUnique({
          where: { id: session.user.id },
          include: { subscription: true }
        })

        if (dbUserById?.subscription) {
          briefsLimit = dbUserById.subscription.briefsLimit || 5
          currentPlan = dbUserById.subscription.plan === "pro" ? "Pro" : 
                       dbUserById.subscription.plan === "starter" ? "Starter" : "Free"
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
      // Fall back to defaults if database query fails
    }
  }

  const recentBriefs = userBriefs.slice(0, 5) // Show last 5 briefs

  return <DashboardClient 
    session={session}
    briefsUsed={briefsUsed}
    briefsLimit={briefsLimit}
    currentPlan={currentPlan}
    recentBriefs={recentBriefs}
    userBriefs={userBriefs}
  />
}