import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
})

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string)
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      if (session.metadata?.userId && session.metadata?.planId) {
        // Update user subscription
        await prisma.user.update({
          where: {
            id: session.metadata.userId,
          },
          data: {
            subscriptionStatus: "ACTIVE",
            subscriptionPlanId: session.metadata.planId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        })

        // Create subscription record
        await prisma.subscription.create({
          data: {
            userId: session.metadata.userId,
            planId: session.metadata.planId,
            stripeSubscriptionId: session.subscription as string,
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        })
      }
      break
    case "customer.subscription.updated":
      const subscription = event.data.object as Stripe.Subscription
      if (subscription.metadata?.userId) {
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: subscription.status === "active" ? "ACTIVE" : "INACTIVE",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })

        await prisma.user.update({
          where: {
            id: subscription.metadata.userId,
          },
          data: {
            subscriptionStatus: subscription.status === "active" ? "ACTIVE" : "INACTIVE",
          },
        })
      }
      break
    case "customer.subscription.deleted":
      const canceledSubscription = event.data.object as Stripe.Subscription
      if (canceledSubscription.metadata?.userId) {
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: canceledSubscription.id,
          },
          data: {
            status: "CANCELED",
          },
        })

        await prisma.user.update({
          where: {
            id: canceledSubscription.metadata.userId,
          },
          data: {
            subscriptionStatus: "CANCELED",
          },
        })
      }
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
