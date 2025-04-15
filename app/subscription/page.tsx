"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  isPopular: boolean
}

export default function SubscriptionPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get("/api/subscription")
        setPlans(response.data)
      } catch (error) {
        toast.error("Failed to load subscription plans")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/subscription")
    }
  }, [status, router])

  const handleSubscribe = async (planId: string) => {
    try {
      setSelectedPlan(planId)

      if (!session?.user) {
        toast.error("Please sign in to subscribe")
        router.push("/login?redirect=/subscription")
        return
      }

      const response = await axios.post("/api/subscription", { planId })

      if (response.data.url) {
        window.location.href = response.data.url
      }
    } catch (error) {
      toast.error("Failed to process subscription")
      setSelectedPlan(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading subscription plans...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-400">
            Unlock premium content with our flexible subscription plans. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-background/80 backdrop-blur-sm border-gray-800 ${
                plan.isPopular ? "border-primary" : ""
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleSubscribe(plan.id)} disabled={selectedPlan === plan.id}>
                  {selectedPlan === plan.id ? "Processing..." : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
