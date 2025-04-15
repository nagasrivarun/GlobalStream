import { createClient } from "@/lib/supabase/server"
import ContentRow from "@/components/content-row"

export default async function ShowsPage() {
  const supabase = createClient()

  // Fetch genres
  const { data: genres } = await supabase.from("genres").select("name").order("name")

  // Fetch shows for each genre
  const genreShows = await Promise.all(
    (genres || []).map(async (genre) => {
      const { data: shows } = await supabase
        .from("content")
        .select(`
          *,
          content_genres!inner (
            genres!inner (*)
          )
        `)
        .eq("type", "SHOW")
        .eq("content_genres.genres.name", genre.name)
        .limit(10)

      return {
        genre: genre.name,
        shows: shows || [],
      }
    }),
  )

  // Filter out genres with no shows
  const filteredGenreShows = genreShows.filter((genreShow) => genreShow.shows.length > 0)

  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold mb-8">TV Shows</h1>

        {filteredGenreShows.map((genreShow) => (
          <ContentRow
            key={genreShow.genre}
            title={genreShow.genre}
            contents={genreShow.shows.map((show) => ({
              id: show.id,
              title: show.title,
              posterUrl: show.poster_url || "",
              releaseYear: show.release_year,
              type: show.type,
            }))}
          />
        ))}
      </div>
    </main>
  )
}
