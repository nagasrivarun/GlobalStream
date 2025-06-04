import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
})

export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // Get subscription plans
    const { data: plans, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("price", { ascending: true })

    if (error) {
      console.error("Error fetching subscription plans:", error)
      return new NextResponse("Error fetching subscription plans", { status: 500 })
    }

    return NextResponse.json(plans || [])
  } catch (error) {
    console.error("SUBSCRIPTION_PLANS_ERROR:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return new NextResponse("Plan ID is required", { status: 400 })
    }

    const supabase = createClient()

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single()

    if (planError || !plan) {
      console.error("Plan not found:", planError)
      return new NextResponse("Plan not found", { status: 404 })
    }

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100), // Stripe uses cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id || "",
        planId: plan.id,
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error("SUBSCRIPTION_CHECKOUT_ERROR:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
