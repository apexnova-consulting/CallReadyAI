import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { db } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook error:", error)
    return new NextResponse("Webhook error", { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session | Stripe.Subscription

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = session as Stripe.Checkout.Session

        if (checkoutSession.subscription && checkoutSession.metadata?.userId) {
          await db.subscription.upsert({
            where: { userId: checkoutSession.metadata.userId },
            update: {
              stripeSubscriptionId: checkoutSession.subscription.toString(),
              stripeCustomerId: checkoutSession.customer?.toString()!,
              stripePriceId: checkoutSession.metadata.priceId,
              stripeCurrentPeriodEnd: new Date(
                (checkoutSession.expires_at || Date.now()) * 1000
              ),
              plan: checkoutSession.metadata.plan,
              status: "active",
              briefsLimit: parseInt(checkoutSession.metadata.briefsLimit),
            },
            create: {
              userId: checkoutSession.metadata.userId,
              stripeSubscriptionId: checkoutSession.subscription.toString(),
              stripeCustomerId: checkoutSession.customer?.toString()!,
              stripePriceId: checkoutSession.metadata.priceId,
              stripeCurrentPeriodEnd: new Date(
                (checkoutSession.expires_at || Date.now()) * 1000
              ),
              plan: checkoutSession.metadata.plan,
              status: "active",
              briefsLimit: parseInt(checkoutSession.metadata.briefsLimit),
            },
          })
        }
        break
      }
      case "invoice.payment_succeeded": {
        const subscription = await stripe.subscriptions.retrieve(
          (session as any).subscription
        )

        await db.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
        break
      }
      case "customer.subscription.deleted": {
        const subscription = session as Stripe.Subscription

        await db.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: "canceled",
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
