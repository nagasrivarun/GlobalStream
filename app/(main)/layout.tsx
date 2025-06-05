import type React from "react"
import VoiceAssistantWrapper from "@/components/voice-assistant-wrapper"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <VoiceAssistantWrapper />
      </body>
    </html>
  )
}
