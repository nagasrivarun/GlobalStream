import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { command } = body

    if (!command) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 })
    }

    // Process more complex commands here
    const lowerCommand = command.toLowerCase()
    const supabase = createClient()

    // Recommendations
    if (lowerCommand.includes("recommend") || lowerCommand.includes("suggestion")) {
      let genre = null

      // Extract genre from command
      const genres = ["action", "comedy", "drama", "horror", "sci-fi", "thriller", "romance", "documentary"]
      for (const g of genres) {
        if (lowerCommand.includes(g)) {
          genre = g
          break
        }
      }

      // Query based on genre or get popular content
      let query = supabase.from("content").select("*")

      if (genre) {
        query = query.select("*, genres!inner(*)").eq("genres.name", genre).limit(5)
      } else {
        query = query.eq("popular", true).limit(5)
      }

      const { data, error } = await query

      if (error) {
        return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 })
      }

      return NextResponse.json({
        type: "recommendation",
        message: genre
          ? `Here are some ${genre} recommendations for you`
          : "Here are some popular recommendations for you",
        data,
      })
    }

    // User-specific commands (requires auth)
    if (session?.user) {
      // Continue watching
      if (lowerCommand.includes("continue") || lowerCommand.includes("resume watching")) {
        const { data, error } = await supabase
          .from("watch_history")
          .select(`
            *,
            content (
              id,
              title,
              type,
              poster_url
            )
          `)
          .eq("user_id", session.user.id)
          .lt("progress", 0.95) // Not completed
          .order("watched_at", { ascending: false })
          .limit(1)

        if (error || !data.length) {
          return NextResponse.json({
            type: "continue",
            message: "I couldn't find anything to continue watching",
            data: null,
          })
        }

        return NextResponse.json({
          type: "continue",
          message: `You can continue watching ${data[0].content.title}`,
          data: data[0],
        })
      }
    }

    // Fallback for unrecognized commands
    return NextResponse.json({
      type: "unknown",
      message: "I'm not sure how to help with that specific request",
      data: null,
    })
  } catch (error) {
    console.error("Voice assistant API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
