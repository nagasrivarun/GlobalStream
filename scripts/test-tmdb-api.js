// Test TMDB API Key
const TMDB_API_KEY = "3532931b20a2cd8c67e7c32eb7c3e546"

async function testTMDBAPI() {
  try {
    console.log("🎬 Testing TMDB API Key...")

    const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    console.log("✅ TMDB API Key is working!")
    console.log(`📊 Found ${data.results.length} popular movies`)
    console.log("🎭 Sample movies:")

    data.results.slice(0, 3).forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} (${movie.release_date?.split("-")[0]})`)
    })

    return true
  } catch (error) {
    console.error("❌ TMDB API Error:", error.message)
    return false
  }
}

// Run the test
testTMDBAPI()
