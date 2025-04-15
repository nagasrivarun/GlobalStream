import { createClient } from "@/lib/supabase/server"
import ContentRow from "@/components/content-row"

export default async function MoviesPage() {
  const supabase = createClient()

  // Fetch genres
  const { data: genres } = await supabase.from("genres").select("name").order("name")

  // Fetch movies for each genre
  const genreMovies = await Promise.all(
    (genres || []).map(async (genre) => {
      const { data: movies } = await supabase
        .from("content")
        .select(`
          *,
          content_genres!inner (
            genres!inner (*)
          )
        `)
        .eq("type", "MOVIE")
        .eq("content_genres.genres.name", genre.name)
        .limit(10)

      return {
        genre: genre.name,
        movies: movies || [],
      }
    }),
  )

  // Filter out genres with no movies
  const filteredGenreMovies = genreMovies.filter((genreMovie) => genreMovie.movies.length > 0)

  return (
    <main className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold mb-8">Movies</h1>

        {filteredGenreMovies.map((genreMovie) => (
          <ContentRow
            key={genreMovie.genre}
            title={genreMovie.genre}
            contents={genreMovie.movies.map((movie) => ({
              id: movie.id,
              title: movie.title,
              posterUrl: movie.poster_url || "",
              releaseYear: movie.release_year,
              type: movie.type,
            }))}
          />
        ))}
      </div>
    </main>
  )
}
