import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { db } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break
      
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const customerId = session.customer as string

  if (!userId) {
    console.error("No userId in checkout session metadata")
    return
  }

  try {
    // Update user with Stripe customer ID
    await db.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    })

    console.log(`Checkout completed for user ${userId}`)
  } catch (error) {
    console.error("Error handling checkout session completed:", error)
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  try {
    // Find user by Stripe customer ID
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!user) {
      console.error(`User not found for customer ${customerId}`)
      return
    }

    // Determine plan based on price ID
    let plan = "free"
    let briefsLimit = 5

    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id
      
      if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
        plan = "starter"
        briefsLimit = 50
      } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
        plan = "pro"
        briefsLimit = 200
      }
    }

    // Update or create subscription
    await db.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan,
        status: subscription.status,
        briefsLimit,
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      create: {
        userId: user.id,
        plan,
        status: subscription.status,
        briefsLimit,
        briefsUsed: 0,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    })

    console.log(`Subscription updated for user ${user.id}: ${plan}`)
  } catch (error) {
    console.error("Error handling subscription change:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  try {
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!user) {
      console.error(`User not found for customer ${customerId}`)
      return
    }

    // Update subscription to free plan
    await db.subscription.update({
      where: { userId: user.id },
      data: {
        plan: "free",
        status: "canceled",
        briefsLimit: 5,
        stripeSubscriptionId: null,
        stripeCurrentPeriodEnd: null,
      },
    })

    console.log(`Subscription canceled for user ${user.id}`)
  } catch (error) {
    console.error("Error handling subscription deletion:", error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  try {
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!user) {
      console.error(`User not found for customer ${customerId}`)
      return
    }

    // Reset briefs used for new billing period
    await db.subscription.update({
      where: { userId: user.id },
      data: { briefsUsed: 0 },
    })

    console.log(`Payment succeeded for user ${user.id}`)
  } catch (error) {
    console.error("Error handling payment success:", error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  try {
    const user = await db.user.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (!user) {
      console.error(`User not found for customer ${customerId}`)
      return
    }

    // Update subscription status
    await db.subscription.update({
      where: { userId: user.id },
      data: { status: "past_due" },
    })

    console.log(`Payment failed for user ${user.id}`)
  } catch (error) {
    console.error("Error handling payment failure:", error)
  }
}