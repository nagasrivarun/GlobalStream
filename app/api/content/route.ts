import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const genre = searchParams.get("genre")
    const language = searchParams.get("language")
    const year = searchParams.get("year")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const offset = (page - 1) * limit

    const supabase = createClient()

    // Start building the query
    let query = supabase.from("content").select(
      `
        *,
        content_genres!inner (
          genres (*)
        ),
        content_languages!inner (
          languages (*)
        )
      `,
      { count: "exact" },
    )

    // Apply filters
    if (type) {
      query = query.eq("type", type)
    }

    if (genre) {
      query = query.eq("content_genres.genres.name", genre)
    }

    if (language) {
      query = query.eq("content_languages.languages.code", language)
    }

    if (year) {
      query = query.eq("release_year", Number.parseInt(year))
    }

    // Apply pagination
    const {
      data: content,
      error,
      count,
    } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    if (error) {
      console.error("Content fetch error:", error)
      return new NextResponse("Error fetching content", { status: 500 })
    }

    return NextResponse.json({
      content,
      pagination: {
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Content fetch error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
