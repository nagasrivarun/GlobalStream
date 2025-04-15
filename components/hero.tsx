"use client"

import { useState } from "react"
import { Play, Info, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface HeroProps {
  id: string
  title: string
  description: string
  backdropUrl: string
  genres: string[]
}

export default function Hero({ id, title, description, backdropUrl, genres }: HeroProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [inMyList, setInMyList] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleMyListToggle = async () => {
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
    <div className="relative h-[80vh] w-full">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backdropUrl})` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>

        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map((genre) => (
            <span key={genre} className="text-sm bg-white/20 px-2 py-1 rounded">
              {genre}
            </span>
          ))}
        </div>

        <p className="text-lg mb-8 line-clamp-3">{description}</p>

        <div className="flex flex-wrap gap-4">
          <Button size="lg" className="gap-2" onClick={() => router.push(`/watch/${id}`)}>
            <Play className="h-5 w-5" /> Play
          </Button>

          <Button variant="outline" size="lg" className="gap-2" onClick={() => router.push(`/title/${id}`)}>
            <Info className="h-5 w-5" /> More Info
          </Button>

          <Button variant="outline" size="icon" className="h-11 w-11" onClick={handleMyListToggle} disabled={isLoading}>
            {inMyList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
