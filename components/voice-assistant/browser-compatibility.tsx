"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertTriangle, Chrome } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BrowserSupport {
  isSupported: boolean
  browserName: string
  reason?: string
  suggestion?: string
}

export function BrowserCompatibilityChecker({ children }: { children: React.ReactNode }) {
  const [browserSupport, setBrowserSupport] = useState<BrowserSupport | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const checkBrowserSupport = (): BrowserSupport => {
      if (typeof window === "undefined") {
        return { isSupported: false, browserName: "Server" }
      }

      const userAgent = navigator.userAgent

      // Check for Internet Explorer
      if (userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1) {
        return {
          isSupported: false,
          browserName: "Internet Explorer",
          reason: "Internet Explorer doesn't support modern web speech APIs",
          suggestion: "Please use Chrome, Edge, Firefox, or Safari for the best experience",
        }
      }

      // Check for Edge Legacy
      if (userAgent.indexOf("Edge/") !== -1) {
        return {
          isSupported: false,
          browserName: "Edge Legacy",
          reason: "Legacy Edge doesn't support speech recognition",
          suggestion: "Please update to the new Microsoft Edge (Chromium-based)",
        }
      }

      // Check for speech recognition support
      const hasSpeechRecognition = "SpeechRecognition" in window || "webkitSpeechRecognition" in window

      if (!hasSpeechRecognition) {
        let browserName = "Unknown"
        if (userAgent.indexOf("Firefox") !== -1) browserName = "Firefox"
        else if (userAgent.indexOf("Safari") !== -1) browserName = "Safari"
        else if (userAgent.indexOf("Chrome") !== -1) browserName = "Chrome"

        return {
          isSupported: false,
          browserName,
          reason: "Your browser doesn't support speech recognition",
          suggestion: "Try using Chrome for the best voice assistant experience",
        }
      }

      // Browser is supported
      let browserName = "Modern Browser"
      if (userAgent.indexOf("Chrome") !== -1) browserName = "Chrome"
      else if (userAgent.indexOf("Firefox") !== -1) browserName = "Firefox"
      else if (userAgent.indexOf("Safari") !== -1) browserName = "Safari"
      else if (userAgent.indexOf("Edg/") !== -1) browserName = "Microsoft Edge"

      return { isSupported: true, browserName }
    }

    const support = checkBrowserSupport()
    setBrowserSupport(support)

    if (!support.isSupported) {
      setShowWarning(true)
    }
  }, [])

  if (!browserSupport) {
    return <>{children}</>
  }

  if (!browserSupport.isSupported && showWarning) {
    return (
      <>
        {children}
        <UnsupportedBrowserWarning browserSupport={browserSupport} onDismiss={() => setShowWarning(false)} />
      </>
    )
  }

  return <>{children}</>
}

function UnsupportedBrowserWarning({
  browserSupport,
  onDismiss,
}: {
  browserSupport: BrowserSupport
  onDismiss: () => void
}) {
  return (
    <Card className="fixed top-4 right-4 w-80 p-4 bg-yellow-900/90 border-yellow-600 text-yellow-100 z-50">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Voice Assistant Not Available</h4>
          <p className="text-xs mt-1 text-yellow-200">{browserSupport.reason}</p>
          {browserSupport.suggestion && <p className="text-xs mt-2 text-yellow-300">💡 {browserSupport.suggestion}</p>}

          <div className="flex space-x-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 border-yellow-600 text-yellow-100 hover:bg-yellow-800"
              onClick={() => window.open("https://www.google.com/chrome/", "_blank")}
            >
              <Chrome className="h-3 w-3 mr-1" />
              Get Chrome
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 text-yellow-200 hover:bg-yellow-800"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default BrowserCompatibilityChecker
