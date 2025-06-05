"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Volume2, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { processNaturalLanguage, generateResponse, resetContext } from "@/lib/services/nlp-service"

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{ type: "user" | "assistant"; text: string }>>(
    [],
  )
  const recognitionRef = useRef<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Initialize speech recognition
    if ((typeof window !== "undefined" && "SpeechRecognition" in window) || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
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
    if (!recognitionRef.current) {
      setResponse("Sorry, speech recognition is not supported in your browser.")
      return
    }

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

    try {
      // Add user command to conversation history
      setConversationHistory((prev) => [...prev, { type: "user", text: command }])

      // Process the command with NLP
      const nlpResult = processNaturalLanguage(command)
      console.log("NLP Result:", nlpResult)

      // Generate a natural language response
      const naturalResponse = generateResponse(nlpResult)
      setResponse(naturalResponse)

      // Add assistant response to conversation history
      setConversationHistory((prev) => [...prev, { type: "assistant", text: naturalResponse }])

      // Handle navigation and actions based on intent
      const { intent, entities } = nlpResult

      switch (intent.name) {
        case "navigation.home":
          setTimeout(() => router.push("/"), 1500)
          break

        case "navigation.movies":
          setTimeout(() => router.push("/browse/movies"), 1500)
          break

        case "navigation.shows":
          setTimeout(() => router.push("/browse/shows"), 1500)
          break

        case "navigation.mylist":
          setTimeout(() => router.push("/my-list"), 1500)
          break

        case "navigation.profile":
          setTimeout(() => router.push("/profile"), 1500)
          break

        case "search":
          if (intent.entities.query) {
            setTimeout(() => router.push(`/search?q=${encodeURIComponent(intent.entities.query)}`), 1500)
          }
          break

        case "playback.play":
          if (intent.entities.title) {
            // Search for content with this title
            const { data } = await supabase
              .from("content")
              .select("id, title")
              .ilike("title", `%${intent.entities.title}%`)
              .limit(1)

            if (data && data.length > 0) {
              setTimeout(() => router.push(`/watch/${data[0].id}`), 1500)
            }
          }
          break

        case "playback.resume":
          // Handle resume watching
          const { data } = await supabase
            .from("watch_history")
            .select(`
              *,
              content (
                id,
                title,
                type,
                poster_url
              )
            `)
            .order("watched_at", { ascending: false })
            .limit(1)

          if (data && data.length > 0) {
            setTimeout(() => router.push(`/watch/${data[0].content.id}`), 1500)
          }
          break

        case "recommendation":
          // Handle recommendations
          let query = supabase.from("content").select("*")

          if (entities.genre) {
            query = query.ilike("genres", `%${entities.genre}%`)
          }

          if (entities.rating === "top" || entities.rating === "best") {
            query = query.order("rating", { ascending: false })
          } else if (entities.rating === "popular" || entities.rating === "trending") {
            query = query.eq("popular", true)
          }

          query = query.limit(10)

          const { data: recommendations } = await query

          if (recommendations && recommendations.length > 0) {
            // Show recommendations (in a real app, you'd display these)
            setTimeout(() => router.push(`/browse?genre=${entities.genre || ""}`), 1500)
          }
          break
      }
    } catch (error) {
      console.error("Voice assistant error:", error)
      setResponse("Sorry, I encountered an error processing your request.")
      setConversationHistory((prev) => [
        ...prev,
        { type: "assistant", text: "Sorry, I encountered an error processing your request." },
      ])
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
    resetContext() // Reset conversation context when closing
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 shadow-lg z-50"
        size="icon"
      >
        <Mic className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 p-4 shadow-lg bg-gray-900 border-gray-800 text-white z-50 max-h-[70vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">GlobalStream Assistant</h3>
        <Button variant="ghost" size="icon" onClick={closeAssistant}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 overflow-y-auto flex-grow">
        {/* Conversation history */}
        {conversationHistory.length > 0 ? (
          <div className="space-y-3">
            {conversationHistory.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm ${message.type === "user" ? "bg-gray-800" : "bg-red-900/30"}`}
              >
                <p className="font-semibold text-xs text-gray-400">{message.type === "user" ? "You:" : "Assistant:"}</p>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-4">
            <p>How can I help you today?</p>
            <p className="mt-2 text-xs">Try saying "Show me action movies" or "What's popular?"</p>
          </div>
        )}

        {/* Current transcript */}
        {isListening && transcript && (
          <div className="bg-blue-900/30 p-3 rounded-lg text-sm animate-pulse">
            <p className="font-semibold text-xs text-gray-400">Listening...</p>
            <p>{transcript}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-800">
        {response && (
          <Button variant="ghost" size="sm" onClick={speakResponse} className="text-xs">
            <Volume2 className="h-3 w-3 mr-1" />
            Speak
          </Button>
        )}

        <div className="flex-grow"></div>

        <Button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`rounded-full w-12 h-12 ${
            isListening ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
          }`}
          size="icon"
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      </div>
    </Card>
  )
}
