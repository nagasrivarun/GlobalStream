import type React from "react"
import MainNav from "@/components/main-nav"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <MainNav />
      {children}
    </div>
  )
}
