import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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
        await supabase
          .from("users")
          .update({
            subscription_status: "ACTIVE",
            subscription_plan_id: session.metadata.planId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.metadata.userId)

        // Create subscription record
        await supabase.from("subscriptions").insert({
          user_id: session.metadata.userId,
          plan_id: session.metadata.planId,
          stripe_subscription_id: session.subscription as string,
          status: "ACTIVE",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
      }
      break
    case "customer.subscription.updated":
      const subscription = event.data.object as Stripe.Subscription
      if (subscription.metadata?.userId) {
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status === "active" ? "ACTIVE" : "INACTIVE",
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        await supabase
          .from("users")
          .update({
            subscription_status: subscription.status === "active" ? "ACTIVE" : "INACTIVE",
            updated_at: new Date().toISOString(),
          })
          .eq("id", subscription.metadata.userId)
      }
      break
    case "customer.subscription.deleted":
      const canceledSubscription = event.data.object as Stripe.Subscription
      if (canceledSubscription.metadata?.userId) {
        await supabase
          .from("subscriptions")
          .update({
            status: "CANCELED",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", canceledSubscription.id)

        await supabase
          .from("users")
          .update({
            subscription_status: "CANCELED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", canceledSubscription.metadata.userId)
      }
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
