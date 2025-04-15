import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function seedDatabase() {
  const supabase = createClient()

  // Seed subscription plans
  const plans = [
    {
      name: "Basic",
      description: "Watch on one device in SD quality",
      price: 7.99,
      features: ["Access to all content", "SD quality", "Watch on 1 device", "Cancel anytime"],
      is_popular: false,
    },
    {
      name: "Standard",
      description: "Watch on two devices in HD quality",
      price: 12.99,
      features: ["Access to all content", "HD quality", "Watch on 2 devices", "Downloads available", "Cancel anytime"],
      is_popular: true,
    },
    {
      name: "Premium",
      description: "Watch on four devices in Ultra HD",
      price: 17.99,
      features: [
        "Access to all content",
        "4K Ultra HD quality",
        "Watch on 4 devices",
        "Downloads available",
        "Offline viewing",
        "Cancel anytime",
      ],
      is_popular: false,
    },
  ]

  for (const plan of plans) {
    const { error } = await supabase.from("subscription_plans").upsert(plan, { onConflict: "name" })

    if (error) {
      console.error("Error seeding subscription plan:", error)
    }
  }

  // Seed genres
  const genres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Science Fiction",
    "Thriller",
    "War",
    "Western",
  ]

  for (const name of genres) {
    const { error } = await supabase.from("genres").upsert({ name }, { onConflict: "name" })

    if (error) {
      console.error("Error seeding genre:", error)
    }
  }

  // Seed languages
  const languages = [
    { name: "English", code: "en" },
    { name: "Spanish", code: "es" },
    { name: "French", code: "fr" },
    { name: "German", code: "de" },
    { name: "Italian", code: "it" },
    { name: "Japanese", code: "ja" },
    { name: "Korean", code: "ko" },
    { name: "Chinese", code: "zh" },
    { name: "Hindi", code: "hi" },
    { name: "Arabic", code: "ar" },
  ]

  for (const language of languages) {
    const { error } = await supabase.from("languages").upsert(language, { onConflict: "code" })

    if (error) {
      console.error("Error seeding language:", error)
    }
  }

  // Create admin user if it doesn't exist
  const { data: existingAdmin } = await supabase
    .from("users")
    .select("id")
    .eq("email", "admin@globalstream.com")
    .single()

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin123!", 12)
    const { error } = await supabase.from("users").insert({
      email: "admin@globalstream.com",
      name: "Admin User",
      hashed_password: hashedPassword,
      role: "ADMIN",
      subscription_status: "ACTIVE",
    })

    if (error) {
      console.error("Error creating admin user:", error)
    }
  }

  // Seed sample content
  const sampleMovies = [
    {
      title: "Interstellar",
      description:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      type: "MOVIE",
      release_year: 2014,
      duration: 169,
      maturity_rating: "PG-13",
      featured: true,
      trending: true,
      popular: true,
      poster_url: "/placeholder.svg?height=450&width=300",
      backdrop_url: "/placeholder.svg?height=1080&width=1920",
    },
    {
      title: "The Shawshank Redemption",
      description:
        "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      type: "MOVIE",
      release_year: 1994,
      duration: 142,
      maturity_rating: "R",
      featured: false,
      trending: false,
      popular: true,
      poster_url: "/placeholder.svg?height=450&width=300",
      backdrop_url: "/placeholder.svg?height=1080&width=1920",
    },
    {
      title: "Inception",
      description:
        "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      type: "MOVIE",
      release_year: 2010,
      duration: 148,
      maturity_rating: "PG-13",
      featured: false,
      trending: true,
      popular: true,
      poster_url: "/placeholder.svg?height=450&width=300",
      backdrop_url: "/placeholder.svg?height=1080&width=1920",
    },
  ]

  for (const movie of sampleMovies) {
    // Check if movie already exists
    const { data: existingMovie } = await supabase.from("content").select("id").eq("title", movie.title).single()

    if (!existingMovie) {
      const { data: newMovie, error } = await supabase.from("content").insert(movie).select().single()

      if (error) {
        console.error("Error creating sample movie:", error)
        continue
      }

      if (newMovie) {
        // Add genres
        const genresToAdd =
          movie.title === "Interstellar"
            ? ["Science Fiction", "Adventure", "Drama"]
            : movie.title === "The Shawshank Redemption"
              ? ["Drama", "Crime"]
              : ["Science Fiction", "Action", "Thriller"]

        // Get genre IDs
        const { data: genreData } = await supabase.from("genres").select("id, name").in("name", genresToAdd)

        if (genreData && genreData.length > 0) {
          const contentGenres = genreData.map((genre) => ({
            content_id: newMovie.id,
            genre_id: genre.id,
          }))

          const { error: genreError } = await supabase.from("content_genres").insert(contentGenres)

          if (genreError) {
            console.error("Error adding genres to movie:", genreError)
          }
        }

        // Add English language
        const { data: englishLang } = await supabase.from("languages").select("id").eq("code", "en").single()

        if (englishLang) {
          const { error: langError } = await supabase.from("content_languages").insert({
            content_id: newMovie.id,
            language_id: englishLang.id,
          })

          if (langError) {
            console.error("Error adding language to movie:", langError)
          }
        }
      }
    }
  }

  console.log("Database seeded successfully!")
  return { success: true }
}
