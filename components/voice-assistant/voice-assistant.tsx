"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import SpeechRecognition from "speech-recognition"

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("")

        setTranscript(transcript)
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start()
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
      recognitionRef.current?.stop()
      if (transcript) {
        processCommand(transcript)
      }
    } else {
      setTranscript("")
      setResponse("")
      setIsListening(true)
      recognitionRef.current?.start()
    }
  }

  const processCommand = async (command: string) => {
    setIsProcessing(true)
    const lowerCommand = command.toLowerCase()

    try {
      // Basic commands
      if (lowerCommand.includes("home") || lowerCommand.includes("go home")) {
        setResponse("Taking you to the home page")
        setTimeout(() => router.push("/"), 1500)
      } else if (lowerCommand.includes("movies") || lowerCommand.includes("show movies")) {
        setResponse("Taking you to movies")
        setTimeout(() => router.push("/browse/movies"), 1500)
      } else if (lowerCommand.includes("tv") || lowerCommand.includes("shows") || lowerCommand.includes("tv shows")) {
        setResponse("Taking you to TV shows")
        setTimeout(() => router.push("/browse/shows"), 1500)
      } else if (lowerCommand.includes("my list") || lowerCommand.includes("watchlist")) {
        setResponse("Opening your watchlist")
        setTimeout(() => router.push("/my-list"), 1500)
      } else if (lowerCommand.includes("profile") || lowerCommand.includes("my profile")) {
        setResponse("Opening your profile")
        setTimeout(() => router.push("/profile"), 1500)
      }
      // Search commands
      else if (lowerCommand.includes("search for") || lowerCommand.includes("find")) {
        const searchTerm = lowerCommand.replace("search for", "").replace("find", "").trim()
        if (searchTerm) {
          setResponse(`Searching for "${searchTerm}"`)
          setTimeout(() => router.push(`/search?q=${encodeURIComponent(searchTerm)}`), 1500)
        } else {
          setResponse("What would you like to search for?")
        }
      }
      // Play content
      else if (lowerCommand.includes("play") || lowerCommand.includes("watch")) {
        const title = lowerCommand.replace("play", "").replace("watch", "").trim()
        if (title) {
          setResponse(`Looking for "${title}" to play`)

          // Search for content with this title
          const { data } = await supabase.from("content").select("id, title").ilike("title", `%${title}%`).limit(1)

          if (data && data.length > 0) {
            setResponse(`Playing "${data[0].title}"`)
            setTimeout(() => router.push(`/watch/${data[0].id}`), 1500)
          } else {
            setResponse(`Sorry, I couldn't find "${title}"`)
          }
        } else {
          setResponse("What would you like to watch?")
        }
      }
      // Help command
      else if (lowerCommand.includes("help") || lowerCommand.includes("what can you do")) {
        setResponse(
          "I can help you navigate GlobalStream. Try saying: 'go home', 'show movies', 'search for action', 'play Stranger Things', or 'open my list'",
        )
      }
      // Fallback
      else {
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
      const utterance = new SpeechSynthesisUtterance(response)
      window.speechSynthesis.speak(utterance)
    }
  }

  const closeAssistant = () => {
    setIsOpen(false)
    setIsListening(false)
    recognitionRef.current?.stop()
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 shadow-lg"
        size="icon"
      >
        <Mic className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 p-4 shadow-lg bg-gray-900 border-gray-800 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">GlobalStream Assistant</h3>
        <Button variant="ghost" size="icon" onClick={closeAssistant}>
          <X className="h-4 w-4" />
        </Button>
      </div>

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
    </Card>
  )
}
