import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const genre = searchParams.get("genre")
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const offset = (page - 1) * limit

    const supabase = createClient()

    // Start building the query
    let dbQuery = supabase.from("content").select(
      `
        *,
        content_genres (
          genres (*)
        ),
        content_languages (
          languages (*)
        )
      `,
      { count: "exact" },
    )

    // Apply filters
    if (type) {
      dbQuery = dbQuery.eq("type", type)
    }

    if (genre) {
      dbQuery = dbQuery.eq("content_genres.genres.name", genre)
    }

    if (query) {
      dbQuery = dbQuery.ilike("title", `%${query}%`)
    }

    // Apply pagination
    const { data, error, count } = await dbQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Admin content fetch error:", error)
      return new NextResponse("Error fetching content", { status: 500 })
    }

    return NextResponse.json({
      content: data,
      pagination: {
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Admin content error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
