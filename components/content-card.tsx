"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Play, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface ContentCardProps {
  id: string
  title: string
  posterUrl?: string
  releaseYear?: number
  type?: string
  isInMyList?: boolean
}

export default function ContentCard({ id, title, posterUrl, releaseYear, type, isInMyList = false }: ContentCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isHovered, setIsHovered] = useState(false)
  const [inMyList, setInMyList] = useState(isInMyList)
  const [isLoading, setIsLoading] = useState(false)

  const handleMyListToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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
      setIsLoading(true)
      const response = await fetch("/api/mylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentId: id }),
      })

      if (!response.ok) {
        throw new Error("Failed to update list")
      }

      const data = await response.json()
      setInMyList(data.added)

      toast({
        title: data.added ? "Added to My List" : "Removed from My List",
        description: data.added ? `${title} has been added to your list` : `${title} has been removed from your list`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your list",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Link
      href={`/title/${id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-muted">
        <Image
          src={posterUrl || "/placeholder.svg?height=450&width=300"}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 flex flex-col justify-end p-3 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 gap-1"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push(`/watch/${id}`)
                }}
              >
                <Play className="h-4 w-4" /> Play
              </Button>
              <Button size="icon" variant="outline" onClick={handleMyListToggle} disabled={isLoading}>
                {inMyList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
            <div>
              <h4 className="font-medium text-sm line-clamp-1">{title}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                {releaseYear && <span>{releaseYear}</span>}
                {releaseYear && type && <span className="w-1 h-1 rounded-full bg-gray-400" />}
                {type && <span>{type}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
