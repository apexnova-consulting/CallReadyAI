// Referral System for CallReady AI
// Users get 5 free briefs per successful referral

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { z } from "zod"

const referralSchema = z.object({
  email: z.string().email(),
  name: z.string().optional()
})

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { email, name } = referralSchema.parse(body)

    // Generate referral code
    const referralCode = generateReferralCode(session.user.id)
    
    // Store referral in memory (in production, this would be in database)
    const referral = {
      id: `ref_${Date.now()}`,
      referrerId: session.user.id,
      referrerEmail: session.user.email,
      refereeEmail: email,
      refereeName: name,
      referralCode,
      status: 'pending', // pending, completed, expired
      createdAt: new Date().toISOString(),
      completedAt: null
    }

    // Store referral (in production, save to database)
    storeReferral(referral)

    // Send referral email (in production, use Resend API)
    await sendReferralEmail(referral)

    return NextResponse.json({
      success: true,
      referralCode,
      message: "Referral sent successfully"
    })

  } catch (error) {
    console.error("Referral creation error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create referral" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's referrals (in production, query database)
    const userReferrals = getUserReferrals(session.user.id)
    const referralStats = getUserReferralStats(session.user.id)

    return NextResponse.json({
      referrals: userReferrals,
      stats: referralStats
    })

  } catch (error) {
    console.error("Referral fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    )
  }
}

function generateReferralCode(userId: string): string {
  // Generate a unique referral code
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `CR-${timestamp}-${random}`.toUpperCase()
}

function storeReferral(referral: any) {
  // In-memory storage (in production, save to database)
  const referrals = JSON.parse(localStorage.getItem('callready_referrals') || '[]')
  referrals.push(referral)
  localStorage.setItem('callready_referrals', JSON.stringify(referrals))
}

function getUserReferrals(userId: string) {
  // Get referrals from in-memory storage
  const referrals = JSON.parse(localStorage.getItem('callready_referrals') || '[]')
  return referrals.filter((ref: any) => ref.referrerId === userId)
}

function getUserReferralStats(userId: string) {
  const referrals = getUserReferrals(userId)
  const completed = referrals.filter((ref: any) => ref.status === 'completed').length
  const pending = referrals.filter((ref: any) => ref.status === 'pending').length
  const totalBonusBriefs = completed * 5 // 5 briefs per completed referral

  return {
    totalReferrals: referrals.length,
    completedReferrals: completed,
    pendingReferrals: pending,
    bonusBriefsEarned: totalBonusBriefs,
    bonusBriefsRemaining: totalBonusBriefs // In production, track usage
  }
}

async function sendReferralEmail(referral: any) {
  // In production, use Resend API to send referral email
  console.log(`Sending referral email to ${referral.refereeEmail}`)
  
  const emailContent = `
Hi ${referral.refereeName || 'there'}!

${referral.referrerEmail} has invited you to try CallReady AI - the AI-powered sales call brief generator that helps sales professionals close more deals.

🚀 What you'll get:
• 5 free AI-generated sales call briefs
• Buyer intent signals and competitive insights
• Live AI companion during calls
• Professional PDF exports

Use this referral link to get started:
${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${referral.referralCode}

Ready to close more deals with AI-powered insights?

Best regards,
The CallReady AI Team
  `.trim()

  // In production, implement actual email sending
  console.log("Referral email content:", emailContent)
}

// In-memory referral storage (in production, use database)
const referrals = new Map<string, any>()

export { referrals }

