"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SeedContentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)
  const router = useRouter()

  const handleSeedContent = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/seed-content", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Refresh the browse page after successful seeding
        setTimeout(() => {
          router.push("/browse")
          router.refresh()
        }, 2000)
      }
    } catch (error) {
      console.error("Error seeding content:", error)
      setResult({ success: false, message: "An error occurred while seeding content" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-white">Seed Sample Content</h1>

        <p className="text-gray-300 mb-6">
          This page will seed your database with sample content including movies, TV shows, seasons, episodes, and
          people. This is useful for testing and development purposes.
        </p>

        <Button onClick={handleSeedContent} disabled={isLoading} className="w-full mb-4">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding Content...
            </>
          ) : (
            "Seed Sample Content"
          )}
        </Button>

        {result && (
          <div className={`p-4 rounded-md ${result.success ? "bg-green-900/50" : "bg-red-900/50"}`}>
            <p className="text-sm">
              {result.message || (result.success ? "Content seeded successfully!" : "Failed to seed content.")}
            </p>
            {result.success && <p className="text-sm mt-2">Redirecting to browse page...</p>}
          </div>
        )}
      </div>
    </div>
  )
}
