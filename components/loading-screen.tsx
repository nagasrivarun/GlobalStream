"use client"

import { Loader2 } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">GlobalStream</h2>
        <p className="text-gray-400">Loading your entertainment...</p>
      </div>
    </div>
  )
}
