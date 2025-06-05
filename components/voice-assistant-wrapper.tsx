"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import the voice assistant to avoid SSR issues with browser APIs
const VoiceAssistant = dynamic(() => import("./voice-assistant/voice-assistant"), {
  ssr: false,
})

export default function VoiceAssistantWrapper() {
  const [isBrowserSupported, setIsBrowserSupported] = useState(false)

  useEffect(() => {
    // Check if the browser supports speech recognition
    const isSupported =
      typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)

    setIsBrowserSupported(isSupported)
  }, [])

  if (!isBrowserSupported) {
    return null
  }

  return <VoiceAssistant />
}
