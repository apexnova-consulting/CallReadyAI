import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { priceId } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    // Create or retrieve Stripe customer
    let customer
    try {
      const customers = await stripe.customers.list({
        email: session.user.email,
        limit: 1,
      })
      
      if (customers.data.length > 0) {
        customer = customers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: session.user.email,
          name: session.user.name,
          metadata: {
            userId: session.user.id,
          },
        })
      }
    } catch (error) {
      console.error("Error creating/retrieving customer:", error)
      return NextResponse.json(
        { error: "Failed to create customer" },
        { status: 500 }
      )
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ 
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })
  } catch (error) {
    console.error("Billing session error:", error)
    return NextResponse.json(
      { error: "Failed to create billing session" },
      { status: 500 }
    )
  }
}