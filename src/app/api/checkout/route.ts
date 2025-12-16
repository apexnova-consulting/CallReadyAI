import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { plan } = body

    if (!plan || !['starter', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // For now, return a mock checkout URL
    // In production, you would integrate with Stripe Checkout
    const checkoutUrl = `https://checkout.stripe.com/mock-checkout-${plan}-${session.user.id}`
    
    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutUrl,
      message: "Redirecting to checkout..."
    })

  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



