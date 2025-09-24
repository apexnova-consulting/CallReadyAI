import { NextResponse } from "next/server"
import Stripe from "stripe"
import { auth } from "@/lib/auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plan } = await req.json()

    let priceId: string
    let briefsLimit: number

    switch (plan) {
      case "starter":
        priceId = process.env.STRIPE_STARTER_PRICE_ID!
        briefsLimit = 20
        break
      case "pro":
        priceId = process.env.STRIPE_PRO_PRICE_ID!
        briefsLimit = 100
        break
      default:
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email!,
      metadata: {
        userId: session.user.id,
        plan,
        briefsLimit: briefsLimit.toString(),
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=false`,
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan,
          briefsLimit: briefsLimit.toString(),
        },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Billing session error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
