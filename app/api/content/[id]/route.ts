import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return new NextResponse("Content ID is required", { status: 400 })
    }

    const supabase = createClient()

    // Get content details with related data
    const { data: content, error } = await supabase
      .from("content")
      .select(`
        *,
        content_genres (
          genres (*)
        ),
        content_languages (
          languages (*)
        ),
        cast_members (
          *,
          people (*)
        ),
        crew (
          *,
          people (*)
        ),
        seasons (
          *,
          episodes (*)
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Content detail error:", error)
      return new NextResponse("Error fetching content details", { status: 500 })
    }

    if (!content) {
      return new NextResponse("Content not found", { status: 404 })
    }

    // Get related content
    const { data: relatedContentIds } = await supabase
      .from("related_content")
      .select("related_content_id")
      .eq("content_id", id)

    let relatedContent = []
    if (relatedContentIds && relatedContentIds.length > 0) {
      const ids = relatedContentIds.map((item) => item.related_content_id)
      const { data: related } = await supabase
        .from("content")
        .select(`
          *,
          content_genres (
            genres (*)
          )
        `)
        .in("id", ids)

      relatedContent = related || []
    }

    // Check if content is in user's list
    const session = await getServerSession(authOptions)
    let isInMyList = false

    if (session?.user?.id) {
      const { data: userContent } = await supabase
        .from("user_content")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("content_id", id)
        .single()

      isInMyList = !!userContent
    }

    return NextResponse.json({
      ...content,
      relatedContent,
      isInMyList,
    })
  } catch (error) {
    console.error("Content detail error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
