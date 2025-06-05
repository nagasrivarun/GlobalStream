"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
        <p className="text-gray-400 mb-6">We encountered an error while loading GlobalStream. Please try again.</p>
        <Button onClick={reset} className="bg-red-600 hover:bg-red-700">
          Try again
        </Button>
      </div>
    </div>
  )
}
