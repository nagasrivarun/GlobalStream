import { createClient } from "@/lib/supabase/server"

// Types for TMDB API responses
interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  genre_ids: number[]
  original_language: string
  adult: boolean
  vote_average: number
}

interface TMDBResponse {
  results: TMDBMovie[]
  page: number
  total_pages: number
  total_results: number
}

// Map TMDB genre IDs to our genre names
const genreMap: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
}

export async function fetchUpcomingMovies() {
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey) {
    throw new Error("TMDB API key is not configured")
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US`)

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }

    const data: TMDBResponse = await response.json()
    return data.results
  } catch (error) {
    console.error("Error fetching upcoming movies:", error)
    throw error
  }
}

export async function importMoviesToDatabase(movies: TMDBMovie[]) {
  const supabase = createClient()

  for (const movie of movies) {
    try {
      // Check if movie already exists
      const { data: existingMovie } = await supabase
        .from("content")
        .select("id")
        .eq("external_id", movie.id.toString())
        .single()

      if (existingMovie) {
        console.log(`Movie already exists: ${movie.title}`)
        continue
      }

      // Insert the movie
      const { data: newContent, error } = await supabase
        .from("content")
        .insert({
          title: movie.title,
          description: movie.overview,
          type: "MOVIE",
          release_year: new Date(movie.release_date).getFullYear(),
          poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          backdrop_url: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
          external_id: movie.id.toString(),
          maturity_rating: movie.adult ? "R" : "PG-13", // Default rating
          featured: false,
          trending: false,
          popular: false,
        })
        .select()
        .single()

      if (error) {
        console.error(`Error inserting movie ${movie.title}:`, error)
        continue
      }

      // Add genres
      if (movie.genre_ids.length > 0) {
        // Get genre IDs from our database
        const { data: genreData } = await supabase
          .from("genres")
          .select("id, name")
          .in("name", movie.genre_ids.map((id) => genreMap[id] || "").filter(Boolean))

        if (genreData && genreData.length > 0) {
          // Link genres to content
          const genreLinks = genreData.map((genre) => ({
            content_id: newContent.id,
            genre_id: genre.id,
          }))

          await supabase.from("content_genres").insert(genreLinks)
        }
      }

      // Add language
      const { data: languageData } = await supabase
        .from("languages")
        .select("id")
        .eq("code", movie.original_language)
        .single()

      if (languageData) {
        await supabase.from("content_languages").insert({
          content_id: newContent.id,
          language_id: languageData.id,
        })
      }

      console.log(`Imported movie: ${movie.title}`)
    } catch (error) {
      console.error(`Error processing movie ${movie.title}:`, error)
    }
  }
}
