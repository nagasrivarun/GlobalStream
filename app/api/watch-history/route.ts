import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const supabase = createClient()

    const { data, error } = await supabase
      .from("watch_history")
      .select(`
        *,
        content (
          id,
          title,
          type,
          poster_url,
          release_year
        )
      `)
      .eq("user_id", session.user.id)
      .order("watched_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Watch history fetch error:", error)
      return new NextResponse("Error fetching watch history", { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Watch history error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { contentId, episodeId, progress } = body

    if (!contentId || progress === undefined) {
      return new NextResponse("Content ID and progress are required", { status: 400 })
    }

    const supabase = createClient()

    // Check if content exists
    const { data: content, error: contentError } = await supabase
      .from("content")
      .select("id")
      .eq("id", contentId)
      .single()

    if (contentError || !content) {
      return new NextResponse("Content not found", { status: 404 })
    }

    // Check if watch history entry exists
    let query = supabase.from("watch_history").select("id").eq("user_id", session.user.id).eq("content_id", contentId)

    if (episodeId) {
      query = query.eq("episode_id", episodeId)
    } else {
      query = query.is("episode_id", null)
    }

    const { data: existingEntry } = await query.single()

    const now = new Date().toISOString()

    if (existingEntry) {
      // Update existing entry
      const { error: updateError } = await supabase
        .from("watch_history")
        .update({
          progress,
          updated_at: now,
          watched_at: now, // Update watched_at to move to top of history
        })
        .eq("id", existingEntry.id)

      if (updateError) {
        console.error("Error updating watch history:", updateError)
        return new NextResponse("Error updating watch history", { status: 500 })
      }
    } else {
      // Create new entry
      const newEntry = {
        user_id: session.user.id,
        content_id: contentId,
        progress,
        watched_at: now,
        updated_at: now,
      }

      if (episodeId) {
        Object.assign(newEntry, { episode_id: episodeId })
      }

      const { error: insertError } = await supabase.from("watch_history").insert(newEntry)

      if (insertError) {
        console.error("Error creating watch history:", insertError)
        return new NextResponse("Error creating watch history", { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Watch history update error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
