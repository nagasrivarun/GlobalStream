"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface AddToListButtonProps {
  contentId: string
}

export default function AddToListButton({ contentId }: AddToListButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isInList, setIsInList] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const checkIfInList = async () => {
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClient()

        const { data } = await supabase
          .from("user_content")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("content_id", contentId)
          .single()

        setIsInList(!!data)
      } catch (error) {
        console.error("Error checking if content is in list:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkIfInList()
  }, [session, contentId])

  const toggleInList = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add content to your list",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      setIsUpdating(true)

      const response = await fetch("/api/mylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentId }),
      })

      if (!response.ok) {
        throw new Error("Failed to update list")
      }

      const data = await response.json()
      setIsInList(data.added)

      toast({
        title: data.added ? "Added to My List" : "Removed from My List",
        description: data.added
          ? "This title has been added to your list"
          : "This title has been removed from your list",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your list",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleInList}
      disabled={isUpdating}
      title={isInList ? "Remove from My List" : "Add to My List"}
    >
      {isUpdating ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isInList ? (
        <Check className="h-5 w-5" />
      ) : (
        <Plus className="h-5 w-5" />
      )}
    </Button>
  )
}
