import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { createClient } from "@/lib/supabase/server"
import { processScheduledReleases } from "@/lib/services/regional-service"

// GET: Fetch upcoming regional releases
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "7")

    // Calculate the date range
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(today.getDate() + days)

    const startDateStr = today.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    const supabase = createClient()

    const { data, error } = await supabase
      .from("content_regional_availability")
      .select(`
        id,
        content_id,
        region,
        release_date,
        content (
          title,
          type,
          poster_url
        )
      `)
      .gte("release_date", startDateStr)
      .lte("release_date", endDateStr)
      .order("release_date", { ascending: true })

    if (error) {
      console.error("Error fetching regional releases:", error)
      return new NextResponse("Error fetching regional releases", { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Regional releases error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// POST: Process scheduled releases for today
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const result = await processScheduledReleases()

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} scheduled releases`,
      processed: result.processed,
    })
  } catch (error: any) {
    console.error("Error processing scheduled releases:", error)
    return new NextResponse(error.message || "Internal Error", { status: 500 })
  }
}
