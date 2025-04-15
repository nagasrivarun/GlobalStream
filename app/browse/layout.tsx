import type React from "react"
import Navbar from "@/components/navbar"

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
