import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Play, Clock, Calendar, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddToListButton from "@/components/add-to-list-button"
import EpisodeList from "@/components/episode-list"
import Navbar from "@/components/navbar"

export default async function TitlePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch content details
  const { data: content, error } = await supabase
    .from("content")
    .select(`
      *,
      content_genres (
        genres (*)
      ),
      content_languages (
        languages (*)
      ),
      cast_members (
        *,
        people (*)
      ),
      crew (
        *,
        people (*)
      ),
      seasons (
        *
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !content) {
    notFound()
  }

  // Fetch related content
  const { data: relatedContent } = await supabase
    .from("content")
    .select(`
      *,
      content_genres (
        genres (*)
      )
    `)
    .eq("type", content.type)
    .neq("id", content.id)
    .limit(10)

  // Extract genres
  const genres = content.content_genres?.map((cg) => cg.genres) || []

  // Extract languages
  const languages = content.content_languages?.map((cl) => cl.languages) || []

  // Extract cast and crew
  const cast =
    content.cast_members?.map((cm) => ({
      id: cm.people?.id,
      name: cm.people?.name,
      character: cm.character,
      imageUrl: cm.people?.image_url,
    })) || []

  const directors = content.crew?.filter((c) => c.role === "Director").map((c) => c.people?.name) || []
  const writers = content.crew?.filter((c) => c.role === "Writer").map((c) => c.people?.name) || []

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section with Backdrop */}
        <div className="relative pt-16">
          <div className="absolute inset-0 z-0">
            <Image
              src={content.backdrop_url || "/placeholder.svg?height=1080&width=1920"}
              alt={content.title}
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/50" />
          </div>

          <div className="container relative z-10 pt-12 pb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Poster */}
              <div className="flex-shrink-0 w-full md:w-[300px]">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-xl">
                  <Image
                    src={content.poster_url || "/placeholder.svg?height=450&width=300"}
                    alt={content.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1 gap-2 bg-red-600 hover:bg-red-700" asChild>
                    <Link href={`/watch/${content.id}`}>
                      <Play className="h-4 w-4" /> Play
                    </Link>
                  </Button>
                  <AddToListButton contentId={content.id} />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{content.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-300">
                    {content.maturity_rating && (
                      <>
                        <Badge variant="outline" className="rounded-sm">
                          {content.maturity_rating}
                        </Badge>
                        <span className="w-1 h-1 rounded-full bg-gray-400" />
                      </>
                    )}
                    {content.release_year && (
                      <>
                        <span>{content.release_year}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-400" />
                      </>
                    )}
                    {content.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDuration(content.duration)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge key={genre?.id} variant="secondary" className="bg-gray-800 hover:bg-gray-700">
                      {genre?.name}
                    </Badge>
                  ))}
                </div>

                <p className="text-gray-300">{content.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {directors.length > 0 && (
                    <div>
                      <span className="text-gray-400">Director:</span>
                      <span className="ml-2">{directors.join(", ")}</span>
                    </div>
                  )}

                  {writers.length > 0 && (
                    <div>
                      <span className="text-gray-400">Writers:</span>
                      <span className="ml-2">{writers.join(", ")}</span>
                    </div>
                  )}

                  {content.release_year && (
                    <div>
                      <span className="text-gray-400">Release:</span>
                      <span className="ml-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {content.release_year}
                      </span>
                    </div>
                  )}

                  {languages.length > 0 && (
                    <div>
                      <span className="text-gray-400">Languages:</span>
                      <span className="ml-2 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {languages.map((l) => l?.name).join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {cast.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Cast</h3>
                    <div className="flex overflow-x-auto gap-4 pb-4">
                      {cast.slice(0, 6).map((actor) => (
                        <div key={actor.id} className="flex-shrink-0 w-[120px]">
                          <div className="relative aspect-square overflow-hidden rounded-full mb-2">
                            <Image
                              src={actor.imageUrl || "/placeholder.svg?height=200&width=200"}
                              alt={actor.name || ""}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-sm">{actor.name}</p>
                            <p className="text-xs text-gray-400">{actor.character}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="container py-8">
          <Tabs defaultValue={content.type === "SHOW" ? "episodes" : "more"} className="space-y-6">
            <TabsList className="bg-gray-900 border-b border-gray-800 w-full justify-start rounded-none h-auto p-0">
              {content.type === "SHOW" && (
                <TabsTrigger
                  value="episodes"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:bg-transparent px-6 py-3"
                >
                  Episodes
                </TabsTrigger>
              )}
              <TabsTrigger
                value="more"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                More Like This
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:bg-transparent px-6 py-3"
              >
                Details
              </TabsTrigger>
            </TabsList>

            {content.type === "SHOW" && (
              <TabsContent value="episodes" className="space-y-8">
                <EpisodeList contentId={content.id} seasons={content.seasons || []} />
              </TabsContent>
            )}

            <TabsContent value="more" className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {relatedContent?.map((item) => (
                  <Link key={item.id} href={`/title/${item.id}`} className="group">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-gray-800">
                      <Image
                        src={item.poster_url || "/placeholder.svg?height=450&width=300"}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <span>{item.release_year}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-400" />
                            <span>{item.type === "MOVIE" ? "Movie" : "TV Show"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Synopsis</h3>
                  <p className="text-gray-300">{content.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Details</h3>
                  <div className="space-y-3">
                    {directors.length > 0 && (
                      <div className="flex">
                        <span className="text-gray-400 w-32">Director</span>
                        <span>{directors.join(", ")}</span>
                      </div>
                    )}

                    {writers.length > 0 && (
                      <div className="flex">
                        <span className="text-gray-400 w-32">Writers</span>
                        <span>{writers.join(", ")}</span>
                      </div>
                    )}

                    {cast.length > 0 && (
                      <div className="flex">
                        <span className="text-gray-400 w-32">Stars</span>
                        <span>
                          {cast
                            .slice(0, 3)
                            .map((a) => a.name)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    {genres.length > 0 && (
                      <div className="flex">
                        <span className="text-gray-400 w-32">Genres</span>
                        <span>{genres.map((g) => g?.name).join(", ")}</span>
                      </div>
                    )}

                    {content.maturity_rating && (
                      <div className="flex">
                        <span className="text-gray-400 w-32">Maturity Rating</span>
                        <span>{content.maturity_rating}</span>
                      </div>
                    )}

                    {content.release_year && (
                      <div className="flex">
                        <span className="text-gray-400 w-32">Release Year</span>
                        <span>{content.release_year}</span>
                      </div>
                    )}

                    {content.duration && (
                      <div className="flex">
                        <span className="text-gray-400 w-32">Duration</span>
                        <span>{formatDuration(content.duration)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
