import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@/lib/supabase/server"

// Advanced NLP patterns for complex queries
const complexPatterns = [
  {
    pattern: /show me (.*) with (.*) from (\d{4}s?|\d{4})/i,
    handler: async (matches: string[], supabase: any) => {
      const contentType = matches[1].includes("movie") ? "movie" : "show"
      const actor = matches[2]
      const year = matches[3]

      const { data } = await supabase
        .from("content")
        .select("*")
        .eq("type", contentType)
        .ilike("cast", `%${actor}%`)
        .ilike("release_date", `%${year.substring(0, 4)}%`)
        .limit(5)

      return {
        type: "complex_search",
        message: `Here are ${contentType}s with ${actor} from ${year}`,
        data,
      }
    },
  },
  {
    pattern: /what should i watch if i (like|love|enjoy) (.*)/i,
    handler: async (matches: string[], supabase: any) => {
      const likedContent = matches[2]

      // First find the genre of the liked content
      const { data: likedData } = await supabase
        .from("content")
        .select("*, genres")
        .ilike("title", `%${likedContent}%`)
        .limit(1)

      if (!likedData || likedData.length === 0) {
        return {
          type: "recommendation",
          message: `I couldn't find anything similar to ${likedContent}`,
          data: null,
        }
      }

      // Then find similar content
      const { data: recommendations } = await supabase
        .from("content")
        .select("*")
        .neq("id", likedData[0].id)
        .ilike("genres", likedData[0].genres[0])
        .order("rating", { ascending: false })
        .limit(5)

      return {
        type: "recommendation",
        message: `If you like ${likedContent}, you might enjoy these:`,
        data: recommendations,
      }
    },
  },
  {
    pattern: /what's (new|trending|popular) (this week|this month|today|now)/i,
    handler: async (matches: string[], supabase: any) => {
      const type = matches[1] // new, trending, popular
      const timeframe = matches[2] // this week, this month, today, now

      let query = supabase.from("content").select("*")

      if (type === "new") {
        // Get content from the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        query = query.gte("added_date", thirtyDaysAgo.toISOString())
      } else if (type === "trending" || type === "popular") {
        query = query.eq("popular", true)
      }

      const { data } = await query.limit(10)

      return {
        type: "trending",
        message: `Here's what's ${type} ${timeframe}:`,
        data,
      }
    },
  },
]

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { command } = body

    if (!command) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Try to match complex patterns first
    for (const pattern of complexPatterns) {
      const matches = command.match(pattern.pattern)
      if (matches) {
        const result = await pattern.handler(matches, supabase)
        return NextResponse.json(result)
      }
    }

    // If no complex pattern matched, return a default response
    return NextResponse.json({
      type: "unknown_complex",
      message: "I understand you're asking something specific, but I need more information.",
      data: null,
    })
  } catch (error) {
    console.error("Advanced voice assistant API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
