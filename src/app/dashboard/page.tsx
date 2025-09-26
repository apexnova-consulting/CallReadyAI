import Link from "next/link"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllBriefsForUser } from "@/lib/brief-storage"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // Get real brief data for the user
  const userBriefs = getAllBriefsForUser(session.user.id)
  const briefsUsed = userBriefs.length
  const briefsLimit = 5 // Free tier limit
  const currentPlan = briefsUsed >= briefsLimit ? "Pro" : "Free"
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