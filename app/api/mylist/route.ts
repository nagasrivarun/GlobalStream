import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const supabase = createClient()

    const { data: userContent, error } = await supabase
      .from("user_content")
      .select(`
        *,
        content (
          *,
          content_genres (
            genres (*)
          )
        )
      `)
      .eq("user_id", session.user.id)
      .order("added_at", { ascending: false })

    if (error) {
      console.error("My list error:", error)
      return new NextResponse("Error fetching my list", { status: 500 })
    }

    return NextResponse.json(userContent)
  } catch (error) {
    console.error("My list error:", error)
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
    const { contentId } = body

    if (!contentId) {
      return new NextResponse("Content ID is required", { status: 400 })
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

    // Check if already in list
    const { data: existingItem } = await supabase
      .from("user_content")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("content_id", contentId)
      .single()

    if (existingItem) {
      // Remove from list
      const { error: deleteError } = await supabase.from("user_content").delete().eq("id", existingItem.id)

      if (deleteError) {
        console.error("Error removing from list:", deleteError)
        return new NextResponse("Error removing from list", { status: 500 })
      }

      return NextResponse.json({ added: false })
    } else {
      // Add to list
      const { error: insertError } = await supabase.from("user_content").insert({
        user_id: session.user.id,
        content_id: contentId,
      })

      if (insertError) {
        console.error("Error adding to list:", insertError)
        return new NextResponse("Error adding to list", { status: 500 })
      }

      return NextResponse.json({ added: true })
    }
  } catch (error) {
    console.error("My list update error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
