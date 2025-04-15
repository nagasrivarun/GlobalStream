"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Play, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface Season {
  id: string
  number: number
  title: string | null
  overview: string | null
  poster_url: string | null
}

interface Episode {
  id: string
  number: number
  title: string
  description: string | null
  duration: number | null
  thumbnail_url: string | null
  season_id: string
}

interface EpisodeListProps {
  contentId: string
  seasons: Season[]
}

export default function EpisodeList({ contentId, seasons }: EpisodeListProps) {
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null)

  useEffect(() => {
    if (seasons.length > 0 && !selectedSeason) {
      // Default to first season
      setSelectedSeason(seasons[0].id)
    }
  }, [seasons, selectedSeason])

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!selectedSeason) return

      try {
        setIsLoading(true)

        const supabase = createClient()

        const { data } = await supabase.from("episodes").select("*").eq("season_id", selectedSeason).order("number")

        setEpisodes(data || [])
      } catch (error) {
        console.error("Error fetching episodes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEpisodes()
  }, [selectedSeason])

  const toggleEpisode = (episodeId: string) => {
    if (expandedEpisode === episodeId) {
      setExpandedEpisode(null)
    } else {
      setExpandedEpisode(episodeId)
    }
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return ""

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }

    return `${mins}m`
  }

  if (seasons.length === 0) {
    return <div className="text-gray-400">No episodes available</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Episodes</h2>

        <Select value={selectedSeason || ""} onValueChange={(value) => setSelectedSeason(value)}>
          <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {seasons.map((season) => (
              <SelectItem key={season.id} value={season.id}>
                {season.title || `Season ${season.number}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading episodes...</p>
        </div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No episodes available for this season</p>
        </div>
      ) : (
        <div className="space-y-4">
          {episodes.map((episode) => (
            <div key={episode.id} className="bg-gray-900 rounded-md overflow-hidden border border-gray-800">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-[240px] relative">
                  <div className="aspect-video relative">
                    <Image
                      src={episode.thumbnail_url || "/placeholder.svg?height=180&width=320"}
                      alt={episode.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button size="icon" className="rounded-full bg-black/50 hover:bg-black/70" asChild>
                        <Link href={`/watch/${contentId}?episode=${episode.id}`}>
                          <Play className="h-8 w-8" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">{episode.number}.</span>
                        <h3 className="text-lg font-medium">{episode.title}</h3>
                      </div>
                      {episode.duration && <p className="text-sm text-gray-400">{formatDuration(episode.duration)}</p>}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleEpisode(episode.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      {expandedEpisode === episode.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  {expandedEpisode === episode.id && episode.description && (
                    <div className="mt-2 text-gray-300 text-sm">{episode.description}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
