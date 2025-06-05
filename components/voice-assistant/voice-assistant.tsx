"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Volume2, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// Polyfill for older browsers
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [browserInfo, setBrowserInfo] = useState("")
  const recognitionRef = useRef<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check browser support
    const checkSupport = () => {
      if (typeof window === "undefined") return false

      const userAgent = navigator.userAgent

      // Detect Internet Explorer
      if (userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1) {
        setBrowserInfo("Internet Explorer is not supported. Please use Chrome, Edge, Firefox, or Safari.")
        return false
      }

      // Check for speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        setBrowserInfo("Your browser doesn't support voice recognition. Try Chrome for the best experience.")
        return false
      }

      // Initialize speech recognition
      try {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join("")

          setTranscript(transcript)
        }

        recognitionRef.current.onend = () => {
          if (isListening) {
            try {
              recognitionRef.current?.start()
            } catch (error) {
              console.error("Speech recognition restart failed:", error)
              setIsListening(false)
            }
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          if (event.error === "not-allowed") {
            setResponse("Microphone access denied. Please allow microphone access and try again.")
          }
        }

        return true
      } catch (error) {
        console.error("Failed to initialize speech recognition:", error)
        setBrowserInfo("Failed to initialize voice recognition. Your browser may not support this feature.")
        return false
      }
    }

    setIsSupported(checkSupport())

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.error("Error stopping speech recognition:", error)
        }
      }
    }
  }, [isListening])

  const toggleListening = () => {
    if (!isSupported) {
      setResponse("Voice assistant is not supported in your browser.")
      return
    }

    if (isListening) {
      setIsListening(false)
      try {
        recognitionRef.current?.stop()
      } catch (error) {
        console.error("Error stopping recognition:", error)
      }
      if (transcript) {
        processCommand(transcript)
      }
    } else {
      setTranscript("")
      setResponse("")
      setIsListening(true)
      try {
        recognitionRef.current?.start()
      } catch (error) {
        console.error("Error starting recognition:", error)
        setResponse("Failed to start voice recognition. Please check your microphone permissions.")
        setIsListening(false)
      }
    }
  }

  const processCommand = async (command: string) => {
    setIsProcessing(true)
    const lowerCommand = command.toLowerCase()

    try {
      // Navigation commands
      if (lowerCommand.includes("home") || lowerCommand.includes("go home")) {
        setResponse("Taking you to the home page")
        setTimeout(() => router.push("/"), 1500)
      } else if (lowerCommand.includes("movies") || lowerCommand.includes("show movies")) {
        setResponse("Taking you to movies")
        setTimeout(() => router.push("/browse/movies"), 1500)
      } else if (lowerCommand.includes("tv") || lowerCommand.includes("shows")) {
        setResponse("Taking you to TV shows")
        setTimeout(() => router.push("/browse/shows"), 1500)
      } else if (lowerCommand.includes("my list") || lowerCommand.includes("watchlist")) {
        setResponse("Opening your watchlist")
        setTimeout(() => router.push("/my-list"), 1500)
      } else if (lowerCommand.includes("search for") || lowerCommand.includes("find")) {
        const searchTerm = lowerCommand.replace("search for", "").replace("find", "").trim()
        if (searchTerm) {
          setResponse(`Searching for "${searchTerm}"`)
          setTimeout(() => router.push(`/search?q=${encodeURIComponent(searchTerm)}`), 1500)
        }
      } else if (lowerCommand.includes("help")) {
        setResponse(
          "I can help you navigate GlobalStream. Try saying: 'go home', 'show movies', 'search for action', or 'open my list'",
        )
      } else {
        setResponse("I'm not sure how to help with that. Try asking for movies, TV shows, or search for a title.")
      }
    } catch (error) {
      console.error("Voice assistant error:", error)
      setResponse("Sorry, I encountered an error processing your request.")
    }

    setIsProcessing(false)
  }

  const speakResponse = () => {
    if ("speechSynthesis" in window && response) {
      try {
        const utterance = new SpeechSynthesisUtterance(response)
        utterance.rate = 0.9
        utterance.pitch = 1
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("Text-to-speech error:", error)
      }
    }
  }

  // Don't show the assistant if not supported
  if (!isSupported && !isOpen) {
    return null
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 shadow-lg"
        size="icon"
        disabled={!isSupported}
      >
        {isSupported ? <Mic className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 p-4 shadow-lg bg-gray-900 border-gray-800 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">GlobalStream Assistant</h3>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!isSupported ? (
        <div className="bg-yellow-900/30 p-3 rounded-lg text-sm">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <p className="font-semibold text-yellow-400">Not Supported</p>
          </div>
          <p className="text-yellow-200">{browserInfo}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transcript && (
            <div className="bg-gray-800 p-3 rounded-lg text-sm">
              <p className="font-semibold text-xs text-gray-400">You said:</p>
              <p>{transcript}</p>
            </div>
          )}

          {response && (
            <div className="bg-red-900/30 p-3 rounded-lg text-sm">
              <div className="flex justify-between">
                <p className="font-semibold text-xs text-gray-400">Assistant:</p>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={speakResponse}>
                  <Volume2 className="h-3 w-3" />
                </Button>
              </div>
              <p>{response}</p>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={toggleListening}
              disabled={isProcessing}
              className={`rounded-full w-12 h-12 ${
                isListening ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
              }`}
              size="icon"
            >
              {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
