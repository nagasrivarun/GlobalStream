"use client"

import type React from "react"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
      return
    }

    if (adminOnly && session.user.role !== "ADMIN") {
      router.push("/browse")
    }
  }, [session, status, router, adminOnly])

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  if (adminOnly && session.user.role !== "ADMIN") {
    return null
  }

  return <>{children}</>
}
