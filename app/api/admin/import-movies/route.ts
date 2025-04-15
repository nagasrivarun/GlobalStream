import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { fetchUpcomingMovies, importMoviesToDatabase } from "@/lib/services/tmdb-service"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Fetch upcoming movies from TMDB
    const movies = await fetchUpcomingMovies()

    // Import movies to database
    await importMoviesToDatabase(movies)

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${movies.length} movies`,
      count: movies.length,
    })
  } catch (error: any) {
    console.error("Error importing movies:", error)
    return new NextResponse(error.message || "Internal Error", { status: 500 })
  }
}
