import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
})

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // Get subscription plans
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: {
        price: "asc",
      },
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.log(error, "SUBSCRIPTION_PLANS_ERROR")
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return new NextResponse("Plan ID is required", { status: 400 })
    }

    // Get plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: {
        id: planId,
      },
    })

    if (!plan) {
      return new NextResponse("Plan not found", { status: 404 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
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
            unit_amount: plan.price * 100, // Stripe uses cents
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
      customer_email: user.email || undefined,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.log(error, "SUBSCRIPTION_CHECKOUT_ERROR")
    return new NextResponse("Internal Error", { status: 500 })
  }
}
