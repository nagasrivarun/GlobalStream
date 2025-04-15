"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addToWatchlist, removeFromWatchlist } from "@/app/actions/watchlist-actions"
import { useAuth } from "@/components/auth/auth-provider"

interface WatchlistButtonProps {
  contentId: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function WatchlistButton({ contentId, variant = "outline", size = "icon" }: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const checkWatchlist = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { success, isInWatchlist } = await isInWatchlist(contentId)
        if (success) {
          setInWatchlist(isInWatchlist)
        }
      } catch (error) {
        console.error("Error checking watchlist status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkWatchlist()
  }, [contentId, user])

  const handleWatchlistToggle = async () => {
    if (!user) {
      router.push("/auth/signin?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }

    setIsProcessing(true)
    try {
      if (inWatchlist) {
        const { success, message } = await removeFromWatchlist(contentId)
        if (success) {
          setInWatchlist(false)
          toast({
            title: "Removed from watchlist",
            description: "This title has been removed from your watchlist",
          })
        } else {
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          })
        }
      } else {
        const { success, message } = await addToWatchlist(contentId)
        if (success) {
          setInWatchlist(true)
          toast({
            title: "Added to watchlist",
            description: "This title has been added to your watchlist",
          })
        } else {
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="sr-only">Loading</span>
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWatchlistToggle}
      disabled={isProcessing}
      aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : inWatchlist ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {size !== "icon" && <span className="ml-2">{inWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>}
    </Button>
  )
}
