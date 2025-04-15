import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return new NextResponse("Search query is required", { status: 400 })
    }

    const supabase = createClient()

    // Search content
    const { data: content, error: contentError } = await supabase
      .from("content")
      .select(`
        *,
        content_genres (
          genres (*)
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20)

    if (contentError) {
      console.error("Content search error:", contentError)
      return new NextResponse("Error searching content", { status: 500 })
    }

    // Search people
    const { data: people, error: peopleError } = await supabase
      .from("people")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(10)

    if (peopleError) {
      console.error("People search error:", peopleError)
      return new NextResponse("Error searching people", { status: 500 })
    }

    return NextResponse.json({
      content: content || [],
      people: people || [],
    })
  } catch (error) {
    console.error("Search error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
