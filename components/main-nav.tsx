"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Search, Bell, ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMobile } from "@/hooks/use-mobile"

export default function MainNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isMobile = useMobile()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/movies", label: "Movies" },
    { href: "/shows", label: "TV Shows" },
    { href: "/sports", label: "Sports" },
  ]

  const languageItems = [
    { href: "/language/english", label: "English" },
    { href: "/language/spanish", label: "Spanish" },
    { href: "/language/hindi", label: "Hindi" },
    { href: "/language/french", label: "French" },
    { href: "/language/japanese", label: "Japanese" },
    { href: "/language/korean", label: "Korean" },
    { href: "/languages", label: "View All Languages" },
  ]

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-gradient-to-b from-black to-transparent"}`}
    >
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            GlobalStream
          </Link>

          {!isMobile && (
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium hover:text-primary ${
                    pathname === item.href ? "text-primary" : "text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium hover:text-primary">
                  Languages <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 hidden group-hover:block bg-background border rounded-md p-2 w-48 shadow-lg">
                  {languageItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-sm hover:bg-muted rounded-sm"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isMobile && (
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search titles, genres..."
                className="w-[200px] pl-9 bg-background/80 border-muted focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          )}

          {session ? (
            <>
              <Button variant="ghost" size="icon" className="text-white">
                <Search className="h-5 w-5 md:hidden" />
                <Bell className="h-5 w-5 hidden md:block" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                      <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && <p className="font-medium">{session.user.name}</p>}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile?tab=mylist">My List</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/subscription">Subscription</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(event) => {
                      event.preventDefault()
                      signOut({ callbackUrl: "/" })
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="text-white md:hidden">
                <Search className="h-5 w-5" />
              </Button>

              <Button variant="ghost" className="hidden md:flex" asChild>
                <Link href="/login">Sign In</Link>
              </Button>

              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}

          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4 border-b">
                    <Link href="/" className="text-xl font-bold text-primary">
                      GlobalStream
                    </Link>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                  </div>

                  <form onSubmit={handleSearch} className="relative py-4 border-b">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search titles, genres..."
                      className="w-full pl-9 bg-background/80 border-muted focus-visible:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>

                  <nav className="flex flex-col py-4 space-y-4 border-b">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`text-base font-medium hover:text-primary ${
                          pathname === item.href ? "text-primary" : "text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}

                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-between text-base font-medium hover:text-primary">
                        Languages <ChevronDown className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {languageItems.map((item) => (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href}>{item.label}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </nav>

                  <div className="mt-auto py-4 border-t">
                    {session ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                            <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{session.user?.name}</p>
                            <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" asChild>
                            <Link href="/profile">Profile</Link>
                          </Button>
                          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" asChild>
                          <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild>
                          <Link href="/register">Sign Up</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}
