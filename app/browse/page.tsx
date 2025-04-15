import { createClient } from "@/lib/supabase/server"
import ContentRow from "@/components/content-row"
import Hero from "@/components/hero"

export default async function BrowsePage() {
  const supabase = createClient()

  // Fetch featured content
  const { data: featuredContent } = await supabase
    .from("content")
    .select(`
      *,
      content_genres (
        genres (*)
      )
    `)
    .eq("featured", true)
    .limit(1)
    .single()

  // Fetch trending content
  const { data: trendingContent } = await supabase
    .from("content")
    .select(`
      *,
      content_genres (
        genres (*)
      )
    `)
    .eq("trending", true)
    .limit(10)

  // Fetch popular movies
  const { data: popularMovies } = await supabase
    .from("content")
    .select(`
      *,
      content_genres (
        genres (*)
      )
    `)
    .eq("popular", true)
    .eq("type", "MOVIE")
    .limit(10)

  // Fetch popular shows
  const { data: popularShows } = await supabase
    .from("content")
    .select(`
      *,
      content_genres (
        genres (*)
      )
    `)
    .eq("popular", true)
    .eq("type", "SHOW")
    .limit(10)

  return (
    <main className="min-h-screen bg-black text-white">
      {featuredContent && (
        <Hero
          id={featuredContent.id}
          title={featuredContent.title}
          description={featuredContent.description || ""}
          backdropUrl={featuredContent.backdrop_url || ""}
          genres={featuredContent.content_genres?.map((cg) => cg.genres?.name).filter(Boolean) || []}
        />
      )}

      <div className="container mx-auto px-4 py-8 space-y-8">
        {trendingContent && trendingContent.length > 0 && (
          <ContentRow
            title="Trending Now"
            contents={trendingContent.map((content) => ({
              id: content.id,
              title: content.title,
              posterUrl: content.poster_url || "",
              releaseYear: content.release_year,
              type: content.type,
            }))}
          />
        )}

        {popularMovies && popularMovies.length > 0 && (
          <ContentRow
            title="Popular Movies"
            contents={popularMovies.map((content) => ({
              id: content.id,
              title: content.title,
              posterUrl: content.poster_url || "",
              releaseYear: content.release_year,
              type: content.type,
            }))}
          />
        )}

        {popularShows && popularShows.length > 0 && (
          <ContentRow
            title="Popular TV Shows"
            contents={popularShows.map((content) => ({
              id: content.id,
              title: content.title,
              posterUrl: content.poster_url || "",
              releaseYear: content.release_year,
              type: content.type,
            }))}
          />
        )}
      </div>
    </main>
  )
}
