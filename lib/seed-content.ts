import { createClient } from "@/lib/supabase/server"

export async function seedSampleContent() {
  const supabase = createClient()

  // Sample movies data
  const movies = [
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
      poster_url:
        "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      backdrop_url: "https://wallpapercave.com/wp/wp1817955.jpg",
      trailer_url: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      genres: ["Science Fiction", "Adventure", "Drama"],
      languages: ["en", "fr", "es"],
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
      poster_url:
        "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
      backdrop_url: "https://wallpapercave.com/wp/wp2162772.jpg",
      trailer_url: "https://www.youtube.com/watch?v=6hB3S9bIaco",
      genres: ["Drama", "Crime"],
      languages: ["en"],
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
      poster_url: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
      backdrop_url: "https://wallpapercave.com/wp/wp1917154.jpg",
      trailer_url: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      genres: ["Science Fiction", "Action", "Thriller"],
      languages: ["en", "ja"],
    },
  ]

  // Sample TV shows data
  const tvShows = [
    {
      title: "Breaking Bad",
      description:
        "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
      type: "SHOW",
      release_year: 2008,
      maturity_rating: "TV-MA",
      featured: true,
      trending: true,
      popular: true,
      poster_url:
        "https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjMtNjA5ZDdiYjdiODU5XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_.jpg",
      backdrop_url: "https://wallpapercave.com/wp/wp1812512.jpg",
      trailer_url: "https://www.youtube.com/watch?v=HhesaQXLuRY",
      genres: ["Drama", "Crime", "Thriller"],
      languages: ["en", "es"],
      seasons: [
        {
          number: 1,
          title: "Season 1",
          overview: "The first season of Breaking Bad.",
          release_year: 2008,
          episodes: [
            {
              number: 1,
              title: "Pilot",
              duration: 58,
              description:
                "Walter White, a struggling high school chemistry teacher, is diagnosed with advanced lung cancer.",
            },
            {
              number: 2,
              title: "Cat's in the Bag...",
              duration: 48,
              description: "Walt and Jesse attempt to dispose of the bodies of Emilio and Krazy-8.",
            },
          ],
        },
        {
          number: 2,
          title: "Season 2",
          overview: "The second season of Breaking Bad.",
          release_year: 2009,
          episodes: [
            {
              number: 1,
              title: "Seven Thirty-Seven",
              duration: 47,
              description: "Walt and Jesse realize how dire their situation is.",
            },
            { number: 2, title: "Grilled", duration: 48, description: "Walt and Jesse become prisoners of Tuco." },
          ],
        },
      ],
    },
    {
      title: "Stranger Things",
      description:
        "When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.",
      type: "SHOW",
      release_year: 2016,
      maturity_rating: "TV-14",
      featured: true,
      trending: true,
      popular: true,
      poster_url:
        "https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3MjYtZGMzZWI1ZjhlOWJmXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg",
      backdrop_url: "https://wallpapercave.com/wp/wp1917111.jpg",
      trailer_url: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
      genres: ["Drama", "Fantasy", "Horror"],
      languages: ["en"],
      seasons: [
        {
          number: 1,
          title: "Season 1",
          overview: "The first season of Stranger Things.",
          release_year: 2016,
          episodes: [
            {
              number: 1,
              title: "Chapter One: The Vanishing of Will Byers",
              duration: 49,
              description:
                "A young boy mysteriously disappears, and his panicked mother demands that the police find him.",
            },
            {
              number: 2,
              title: "Chapter Two: The Weirdo on Maple Street",
              duration: 56,
              description: "Lucas, Mike and Dustin try to talk to the girl they found in the woods.",
            },
          ],
        },
      ],
    },
  ]

  // Sample people data (actors, directors)
  const people = [
    {
      name: "Christopher Nolan",
      biography: "Christopher Edward Nolan is a British-American film director, producer, and screenwriter.",
      birth_date: "1970-07-30",
      image_url: "https://m.media-amazon.com/images/M/MV5BNjE3NDQyOTYyMV5BMl5BanBnXkFtZTcwODcyODU2Mw@@._V1_.jpg",
    },
    {
      name: "Matthew McConaughey",
      biography: "Matthew David McConaughey is an American actor and producer.",
      birth_date: "1969-11-04",
      image_url: "https://m.media-amazon.com/images/M/MV5BMTg0MDc3ODUwOV5BMl5BanBnXkFtZTcwMTk2NjY4Nw@@._V1_.jpg",
    },
    {
      name: "Anne Hathaway",
      biography: "Anne Jacqueline Hathaway is an American actress.",
      birth_date: "1982-11-12",
      image_url: "https://m.media-amazon.com/images/M/MV5BNjQ5MTAxMDc5OF5BMl5BanBnXkFtZTcwOTI0OTE4OA@@._V1_.jpg",
    },
    {
      name: "Leonardo DiCaprio",
      biography: "Leonardo Wilhelm DiCaprio is an American actor, film producer, and environmentalist.",
      birth_date: "1974-11-11",
      image_url: "https://m.media-amazon.com/images/M/MV5BMjI0MTg3MzI0M15BMl5BanBnXkFtZTcwMzQyODU2Mw@@._V1_.jpg",
    },
  ]

  // Insert people
  for (const person of people) {
    // Check if person already exists
    const { data: existingPerson } = await supabase.from("people").select("id").eq("name", person.name).single()

    if (!existingPerson) {
      await supabase.from("people").insert(person)
    }
  }

  // Get all genres
  const { data: allGenres } = await supabase.from("genres").select("id, name")

  // Get all languages
  const { data: allLanguages } = await supabase.from("languages").select("id, code")

  // Get all people
  const { data: allPeople } = await supabase.from("people").select("id, name")

  // Helper function to get genre ID by name
  const getGenreId = (name: string) => {
    const genre = allGenres?.find((g) => g.name === name)
    return genre?.id
  }

  // Helper function to get language ID by code
  const getLanguageId = (code: string) => {
    const language = allLanguages?.find((l) => l.code === code)
    return language?.id
  }

  // Helper function to get person ID by name
  const getPersonId = (name: string) => {
    const person = allPeople?.find((p) => p.name === name)
    return person?.id
  }

  // Insert movies
  for (const movie of movies) {
    // Check if movie already exists
    const { data: existingMovie } = await supabase.from("content").select("id").eq("title", movie.title).single()

    if (!existingMovie) {
      // Insert movie
      const { data: newMovie } = await supabase
        .from("content")
        .insert({
          title: movie.title,
          description: movie.description,
          type: movie.type,
          release_year: movie.release_year,
          duration: movie.duration,
          maturity_rating: movie.maturity_rating,
          featured: movie.featured,
          trending: movie.trending,
          popular: movie.popular,
          poster_url: movie.poster_url,
          backdrop_url: movie.backdrop_url,
          trailer_url: movie.trailer_url,
        })
        .select()
        .single()

      if (newMovie) {
        // Link genres
        for (const genreName of movie.genres) {
          const genreId = getGenreId(genreName)
          if (genreId) {
            await supabase.from("content_genres").insert({
              content_id: newMovie.id,
              genre_id: genreId,
            })
          }
        }

        // Link languages
        for (const langCode of movie.languages) {
          const langId = getLanguageId(langCode)
          if (langId) {
            await supabase.from("content_languages").insert({
              content_id: newMovie.id,
              language_id: langId,
            })
          }
        }

        // Add cast and crew for specific movies
        if (movie.title === "Interstellar") {
          // Add director
          const nolanId = getPersonId("Christopher Nolan")
          if (nolanId) {
            await supabase.from("crew").insert({
              content_id: newMovie.id,
              person_id: nolanId,
              role: "Director",
            })
          }

          // Add cast
          const mcconaugheyId = getPersonId("Matthew McConaughey")
          if (mcconaugheyId) {
            await supabase.from("cast_members").insert({
              content_id: newMovie.id,
              person_id: mcconaugheyId,
              character: "Cooper",
            })
          }

          const hathawayId = getPersonId("Anne Hathaway")
          if (hathawayId) {
            await supabase.from("cast_members").insert({
              content_id: newMovie.id,
              person_id: hathawayId,
              character: "Dr. Amelia Brand",
            })
          }
        } else if (movie.title === "Inception") {
          // Add director
          const nolanId = getPersonId("Christopher Nolan")
          if (nolanId) {
            await supabase.from("crew").insert({
              content_id: newMovie.id,
              person_id: nolanId,
              role: "Director",
            })
          }

          // Add cast
          const dicaprioId = getPersonId("Leonardo DiCaprio")
          if (dicaprioId) {
            await supabase.from("cast_members").insert({
              content_id: newMovie.id,
              person_id: dicaprioId,
              character: "Cobb",
            })
          }
        }
      }
    }
  }

  // Insert TV shows
  for (const show of tvShows) {
    // Check if show already exists
    const { data: existingShow } = await supabase.from("content").select("id").eq("title", show.title).single()

    let showId = existingShow?.id

    if (!existingShow) {
      // Insert show
      const { data: newShow } = await supabase
        .from("content")
        .insert({
          title: show.title,
          description: show.description,
          type: show.type,
          release_year: show.release_year,
          maturity_rating: show.maturity_rating,
          featured: show.featured,
          trending: show.trending,
          popular: show.popular,
          poster_url: show.poster_url,
          backdrop_url: show.backdrop_url,
          trailer_url: show.trailer_url,
        })
        .select()
        .single()

      showId = newShow?.id

      if (newShow) {
        // Link genres
        for (const genreName of show.genres) {
          const genreId = getGenreId(genreName)
          if (genreId) {
            await supabase.from("content_genres").insert({
              content_id: newShow.id,
              genre_id: genreId,
            })
          }
        }

        // Link languages
        for (const langCode of show.languages) {
          const langId = getLanguageId(langCode)
          if (langId) {
            await supabase.from("content_languages").insert({
              content_id: newShow.id,
              language_id: langId,
            })
          }
        }
      }
    }

    // Add seasons and episodes if show exists
    if (showId && show.seasons) {
      for (const season of show.seasons) {
        // Check if season already exists
        const { data: existingSeason } = await supabase
          .from("seasons")
          .select("id")
          .eq("content_id", showId)
          .eq("number", season.number)
          .single()

        let seasonId = existingSeason?.id

        if (!existingSeason) {
          // Insert season
          const { data: newSeason } = await supabase
            .from("seasons")
            .insert({
              content_id: showId,
              number: season.number,
              title: season.title,
              overview: season.overview,
              release_year: season.release_year,
            })
            .select()
            .single()

          seasonId = newSeason?.id
        }

        // Add episodes if season exists
        if (seasonId && season.episodes) {
          for (const episode of season.episodes) {
            // Check if episode already exists
            const { data: existingEpisode } = await supabase
              .from("episodes")
              .select("id")
              .eq("season_id", seasonId)
              .eq("number", episode.number)
              .single()

            if (!existingEpisode) {
              // Insert episode
              await supabase.from("episodes").insert({
                season_id: seasonId,
                number: episode.number,
                title: episode.title,
                description: episode.description,
                duration: episode.duration,
              })
            }
          }
        }
      }
    }
  }

  return { success: true, message: "Sample content seeded successfully" }
}
