"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Season {
  id: string
  number: number
  title: string | null
}

interface Episode {
  id: string
  number: number
  title: string
  season_id: string
}

interface WatchControlsProps {
  contentId: string
  title: string
  type: string
  seasons: Season[]
  currentEpisodeId?: string
}

export default function WatchControls({ contentId, title, type, seasons, currentEpisodeId }: WatchControlsProps) {
  const router = useRouter()
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null)
  const [prevEpisode, setPrevEpisode] = useState<Episode | null>(null)

  // Set initial selected season
  useEffect(() => {
    if (type !== "SHOW" || seasons.length === 0) return

    if (!selectedSeason) {
      setSelectedSeason(seasons[0].id)
    }
  }, [seasons, selectedSeason, type])

  // Fetch episodes for selected season
  useEffect(() => {
    if (!selectedSeason) return

    const fetchEpisodes = async () => {
      try {
        const supabase = createClient()

        const { data } = await supabase.from("episodes").select("*").eq("season_id", selectedSeason).order("number")

        setEpisodes(data || [])
      } catch (error) {
        console.error("Error fetching episodes:", error)
      }
    }

    fetchEpisodes()
  }, [selectedSeason])

  // Find current, next, and previous episodes
  useEffect(() => {
    if (!currentEpisodeId || episodes.length === 0) return

    const currentIndex = episodes.findIndex((ep) => ep.id === currentEpisodeId)

    if (currentIndex !== -1) {
      setCurrentEpisode(episodes[currentIndex])

      if (currentIndex < episodes.length - 1) {
        setNextEpisode(episodes[currentIndex + 1])
      } else {
        setNextEpisode(null)
      }

      if (currentIndex > 0) {
        setPrevEpisode(episodes[currentIndex - 1])
      } else {
        setPrevEpisode(null)
      }
    }
  }, [currentEpisodeId, episodes])

  // If it's a movie, just show back to details button
  if (type !== "SHOW") {
    return (
      <div className="mt-6 flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/title/${contentId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Details
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {currentEpisode && (
            <p className="text-gray-400">
              Season {seasons.find((s) => s.id === currentEpisode.season_id)?.number} | Episode {currentEpisode.number}:{" "}
              {currentEpisode.title}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!prevEpisode}
            onClick={() => router.push(`/watch/${contentId}?episode=${prevEpisode?.id}`)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>

          <Button
            variant="outline"
            disabled={!nextEpisode}
            onClick={() => router.push(`/watch/${contentId}?episode=${nextEpisode?.id}`)}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Season:</span>
          <Select
            value={selectedSeason || ""}
            onValueChange={(value) => {
              setSelectedSeason(value)
              setCurrentEpisode(null)
              setNextEpisode(null)
              setPrevEpisode(null)
            }}
          >
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              {seasons.map((season) => (
                <SelectItem key={season.id} value={season.id}>
                  {season.title || `Season ${season.number}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">Episode:</span>
          <Select
            value={currentEpisodeId || ""}
            onValueChange={(value) => router.push(`/watch/${contentId}?episode=${value}`)}
          >
            <SelectTrigger className="w-[220px] bg-gray-900 border-gray-700">
              <SelectValue placeholder="Select episode" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              {episodes.map((episode) => (
                <SelectItem key={episode.id} value={episode.id}>
                  {episode.number}. {episode.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto">
          <Button variant="outline" asChild>
            <Link href={`/title/${contentId}`}>Back to Details</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
