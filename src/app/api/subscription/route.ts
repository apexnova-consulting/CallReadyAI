import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to find user in database by email or ID
    const dbUser = await db.user.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { id: session.user.id }
        ]
      },
      include: { subscription: true }
    })

    if (!dbUser) {
      return NextResponse.json({
        plan: "free",
        status: "active",
        briefsLimit: 5,
        briefsUsed: 0
      })
    }

    if (dbUser.subscription) {
      return NextResponse.json({
        plan: dbUser.subscription.plan || "free",
        status: dbUser.subscription.status || "active",
        briefsLimit: dbUser.subscription.briefsLimit || 5,
        briefsUsed: dbUser.subscription.briefsUsed || 0,
        stripeCurrentPeriodEnd: dbUser.subscription.stripeCurrentPeriodEnd
      })
    }

    // No subscription found, return free tier
    return NextResponse.json({
      plan: "free",
      status: "active",
      briefsLimit: 5,
      briefsUsed: 0
    })
  } catch (error: any) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}



