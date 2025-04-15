"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface VideoPlayerProps {
  src: string
  title?: string
  poster?: string
  contentId: string
  episodeId?: string
  startTime?: number
  duration: number
}

export default function VideoPlayer({
  src,
  title,
  poster,
  contentId,
  episodeId,
  startTime = 0,
  duration,
}: VideoPlayerProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)
  const [progress, setProgress] = useState(0)

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set initial volume
    video.volume = volume

    // Set initial time if provided
    if (startTime > 0) {
      video.currentTime = startTime
      setCurrentTime(startTime)
    }

    // Event listeners
    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      const newProgress = video.currentTime / video.duration
      setProgress(newProgress)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handlePlaying = () => {
      setIsBuffering(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      saveWatchProgress(1) // 100% complete
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("playing", handlePlaying)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("playing", handlePlaying)
      video.removeEventListener("ended", handleEnded)
    }
  }, [startTime])

  // Save progress periodically
  useEffect(() => {
    if (!session?.user) return

    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        saveWatchProgress(progress)
      }, 10000) // Save every 10 seconds
    } else if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isPlaying, progress, session])

  // Handle play/pause
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.play().catch(() => {
        setIsPlaying(false)
      })
    } else {
      video.pause()
    }
  }, [isPlaying])

  // Handle volume changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  // Handle playback rate changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = playbackRate
  }, [playbackRate])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Save watch progress to the server
  const saveWatchProgress = async (currentProgress: number) => {
    if (!session?.user?.id || currentProgress <= 0) return

    try {
      await fetch("/api/watch-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          episodeId,
          progress: currentProgress,
        }),
      })
    } catch (error) {
      console.error("Error saving watch progress:", error)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate)
  }

  const skipForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 10, videoDuration)
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const skipBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 10, 0)
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const handleBackToDetails = () => {
    // Save progress before navigating away
    saveWatchProgress(progress)
    router.push(`/title/${contentId}`)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video ref={videoRef} className="w-full h-full" poster={poster} onClick={handlePlayPause} playsInline>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Back button */}
      <div
        className={`absolute top-4 left-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToDetails}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Title */}
      {title && (
        <div
          className={`absolute inset-x-0 top-0 p-4 text-lg text-white bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="line-clamp-1 ml-10">{title}</div>
        </div>
      )}

      {/* Play/Pause button overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isPlaying && !showControls ? "opacity-0" : "opacity-100"
        } pointer-events-none`}
      >
        <Button
          size="icon"
          variant="ghost"
          className="h-20 w-20 rounded-full bg-black/30 text-white hover:bg-black/50 pointer-events-auto"
          onClick={handlePlayPause}
        >
          {isBuffering ? (
            <div className="h-10 w-10 border-4 border-t-transparent border-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-10 w-10" />
          ) : (
            <Play className="h-10 w-10" />
          )}
        </Button>
      </div>

      {/* Controls */}
      <div
        className={`absolute inset-x-0 bottom-0 grid gap-2 bg-gradient-to-b from-transparent to-black/80 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="px-4 pt-8">
          <Slider
            value={[currentTime]}
            min={0}
            max={videoDuration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-red-600 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&>span:first-child_span]:bg-red-600 [&_[role=slider]:focus-visible]:ring-2 [&_[role=slider]:focus-visible]:ring-offset-2 [&_[role=slider]:focus-visible]:ring-red-600"
          />
        </div>
        <div className="flex items-center gap-3 p-4 pt-0 text-white [&_svg]:text-white">
          <Button size="icon" variant="ghost" className="w-9 h-9 hover:bg-white/10" onClick={handlePlayPause}>
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>

          <Button size="icon" variant="ghost" className="w-9 h-9 hover:bg-white/10" onClick={skipBackward}>
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button size="icon" variant="ghost" className="w-9 h-9 hover:bg-white/10" onClick={skipForward}>
            <SkipForward className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="w-9 h-9 hover:bg-white/10" onClick={handleMuteToggle}>
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <div className="w-24 hidden sm:block">
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&>span:first-child_span]:bg-white [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0"
              />
            </div>
          </div>

          <div className="text-sm ml-auto mr-2">
            {formatTime(currentTime)} / {formatTime(videoDuration)}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="w-9 h-9 hover:bg-white/10">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white">
              <DropdownMenuItem
                onClick={() => handlePlaybackRateChange(0.5)}
                className={playbackRate === 0.5 ? "bg-gray-800" : ""}
              >
                0.5x
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePlaybackRateChange(1)}
                className={playbackRate === 1 ? "bg-gray-800" : ""}
              >
                1x (Normal)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePlaybackRateChange(1.5)}
                className={playbackRate === 1.5 ? "bg-gray-800" : ""}
              >
                1.5x
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePlaybackRateChange(2)}
                className={playbackRate === 2 ? "bg-gray-800" : ""}
              >
                2x
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="icon" variant="ghost" className="w-9 h-9 hover:bg-white/10" onClick={handleFullscreenToggle}>
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
