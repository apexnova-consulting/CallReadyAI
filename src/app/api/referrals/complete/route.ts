import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { referralCode } = body

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code required" }, { status: 400 })
    }

    // Get referral from storage (in production, query database)
    const referrals = JSON.parse(localStorage.getItem('callready_referrals') || '[]')
    const referral = referrals.find((ref: any) => ref.referralCode === referralCode)

    if (!referral) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
    }

    if (referral.status !== 'pending') {
      return NextResponse.json({ error: "Referral code already used" }, { status: 400 })
    }

    // Mark referral as completed
    referral.status = 'completed'
    referral.completedAt = new Date().toISOString()

    // Update referral in storage
    localStorage.setItem('callready_referrals', JSON.stringify(referrals))

    // Award bonus briefs to referrer (in production, update user's brief quota)
    const referrerBriefs = JSON.parse(localStorage.getItem('callready_briefs') || '[]')
    const bonusBriefs = 5 // 5 free briefs per referral

    // Add bonus briefs to referrer's account
    for (let i = 0; i < bonusBriefs; i++) {
      const bonusBrief = {
        id: `bonus_brief_${Date.now()}_${i}`,
        userId: referral.referrerId,
        prospectName: 'Bonus Brief',
        companyName: 'Referral Reward',
        role: 'Bonus',
        overview: 'This is a bonus brief earned through referral',
        context: 'Referral reward brief',
        painPoints: 'N/A',
        talkingPoints: 'N/A',
        questions: 'N/A',
        competitive: 'N/A',
        buyerIntentSignals: 'N/A',
        createdAt: new Date().toISOString(),
        isBonus: true
      }
      referrerBriefs.push(bonusBrief)
    }

    localStorage.setItem('callready_briefs', JSON.stringify(referrerBriefs))

    // Send notification to referrer (in production, send email)
    await sendReferralCompletionNotification(referral)

    return NextResponse.json({
      success: true,
      message: "Referral completed successfully",
      referrerEmail: referral.referrerEmail
    })

  } catch (error) {
    console.error("Referral completion error:", error)
    return NextResponse.json(
      { error: "Failed to complete referral" },
      { status: 500 }
    )
  }
}

async function sendReferralCompletionNotification(referral: any) {
  // In production, send email notification to referrer
  console.log(`Referral completed! ${referral.refereeEmail} signed up using ${referral.referralCode}`)
  
  const notificationContent = `
Great news! Your referral has been completed!

${referral.refereeEmail} has signed up for CallReady AI using your referral code: ${referral.referralCode}

🎉 You've earned 5 bonus briefs!

Your referral stats:
• Total referrals: ${getUserReferralStats(referral.referrerId).totalReferrals}
• Completed referrals: ${getUserReferralStats(referral.referrerId).completedReferrals}
• Bonus briefs earned: ${getUserReferralStats(referral.referrerId).bonusBriefsEarned}

Keep sharing CallReady AI to earn more bonus briefs!

Best regards,
The CallReady AI Team
  `.trim()

  console.log("Referral completion notification:", notificationContent)
}

function getUserReferralStats(userId: string) {
  const referrals = JSON.parse(localStorage.getItem('callready_referrals') || '[]')
  const userReferrals = referrals.filter((ref: any) => ref.referrerId === userId)
  const completed = userReferrals.filter((ref: any) => ref.status === 'completed').length
  const totalBonusBriefs = completed * 5

  return {
    totalReferrals: userReferrals.length,
    completedReferrals: completed,
    bonusBriefsEarned: totalBonusBriefs
  }
}



