import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const id = params.id

    if (!id) {
      return new NextResponse("Content ID is required", { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase
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
      console.error("Admin content detail error:", error)
      return new NextResponse("Error fetching content details", { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Admin content detail error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const id = params.id

    if (!id) {
      return new NextResponse("Content ID is required", { status: 400 })
    }

    const supabase = createClient()

    // Delete content (cascade delete should handle related records)
    const { error } = await supabase.from("content").delete().eq("id", id)

    if (error) {
      console.error("Admin content delete error:", error)
      return new NextResponse("Error deleting content", { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin content delete error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const id = params.id

    if (!id) {
      return new NextResponse("Content ID is required", { status: 400 })
    }

    const body = await request.json()

    const supabase = createClient()

    // Update content
    const { data, error } = await supabase.from("content").update(body).eq("id", id).select().single()

    if (error) {
      console.error("Admin content update error:", error)
      return new NextResponse("Error updating content", { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Admin content update error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
