import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import VideoPlayer from "@/components/video-player"
import WatchControls from "@/components/watch-controls"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface WatchPageProps {
  params: { id: string }
  searchParams: { episode?: string }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const supabase = createClient()
  const session = await getServerSession(authOptions)

  // Fetch content details
  const { data: content, error } = await supabase
    .from("content")
    .select(`
      *,
      seasons (
        id,
        number,
        title
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !content) {
    notFound()
  }

  let videoUrl = content.trailer_url
  let episodeTitle = ""
  let episodeNumber = 0
  let seasonNumber = 0
  let episodeId = ""

  // If it's a TV show and an episode is specified
  if (content.type === "SHOW" && searchParams.episode) {
    const { data: episode } = await supabase
      .from("episodes")
      .select(`
        *,
        seasons (
          number
        )
      `)
      .eq("id", searchParams.episode)
      .single()

    if (episode) {
      videoUrl = episode.video_url || content.trailer_url
      episodeTitle = episode.title
      episodeNumber = episode.number
      seasonNumber = episode.seasons?.number || 0
      episodeId = episode.id
    }
  }

  // Get watch progress if user is logged in
  let progress = 0

  if (session?.user?.id) {
    if (content.type === "MOVIE") {
      const { data: watchHistory } = await supabase
        .from("watch_history")
        .select("progress")
        .eq("user_id", session.user.id)
        .eq("content_id", content.id)
        .single()

      if (watchHistory) {
        progress = watchHistory.progress
      }
    } else if (episodeId) {
      const { data: watchHistory } = await supabase
        .from("watch_history")
        .select("progress")
        .eq("user_id", session.user.id)
        .eq("content_id", content.id)
        .eq("episode_id", episodeId)
        .single()

      if (watchHistory) {
        progress = watchHistory.progress
      }
    }
  }

  // Calculate start time in seconds
  const startTime = progress > 0 ? Math.floor(progress * (content.duration || 0) * 60) : 0

  // Prepare title for display
  let displayTitle = content.title

  if (content.type === "SHOW" && episodeTitle) {
    displayTitle = `${content.title}: S${seasonNumber} E${episodeNumber} - ${episodeTitle}`
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4">
          <VideoPlayer
            src={videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
            title={displayTitle}
            poster={content.backdrop_url || undefined}
            contentId={content.id}
            episodeId={episodeId}
            startTime={startTime}
            duration={content.duration || 0}
          />

          <WatchControls
            contentId={params.id}
            title={content.title}
            type={content.type}
            seasons={content.seasons || []}
            currentEpisodeId={episodeId}
          />
        </div>
      </div>
    </div>
  )
}
