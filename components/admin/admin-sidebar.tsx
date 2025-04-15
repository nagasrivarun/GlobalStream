"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, Users, Settings, BarChart, PlusCircle, LogOut, Globe, Calendar } from "lucide-react"
import { signOut } from "next-auth/react"

export default function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart },
    { href: "/admin/content", label: "Content Library", icon: Film },
    { href: "/admin/content/add", label: "Add Content", icon: PlusCircle },
    { href: "/admin/regional-releases", label: "Regional Releases", icon: Calendar },
    { href: "/admin/regional-visibility", label: "Regional Visibility", icon: Globe },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="fixed w-64 h-screen bg-gray-900 border-r border-gray-800">
      <div className="p-6">
        <Link href="/admin" className="text-xl font-bold text-red-600">
          GlobalStream Admin
        </Link>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    pathname === item.href
                      ? "bg-red-600/20 text-red-500"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="absolute bottom-8 w-full px-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )
}
