"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type VoiceContextType = {
  isVoiceEnabled: boolean
  toggleVoiceEnabled: () => void
  lastCommand: string | null
  setLastCommand: (command: string | null) => void
  isListening: boolean
  setIsListening: (isListening: boolean) => void
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined)

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)

  // Check browser compatibility on mount
  useEffect(() => {
    const isSpeechRecognitionSupported =
      typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)

    setIsVoiceEnabled(isSpeechRecognitionSupported)
  }, [])

  const toggleVoiceEnabled = () => {
    setIsVoiceEnabled((prev) => !prev)
  }

  return (
    <VoiceContext.Provider
      value={{
        isVoiceEnabled,
        toggleVoiceEnabled,
        lastCommand,
        setLastCommand,
        isListening,
        setIsListening,
      }}
    >
      {children}
    </VoiceContext.Provider>
  )
}

export function useVoice() {
  const context = useContext(VoiceContext)
  if (context === undefined) {
    throw new Error("useVoice must be used within a VoiceProvider")
  }
  return context
}
