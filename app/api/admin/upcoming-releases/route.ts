import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { getUpcomingReleases } from "@/lib/services/content-scheduler"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "7")

    const releases = await getUpcomingReleases(days)

    return NextResponse.json(releases)
  } catch (error: any) {
    console.error("Error fetching upcoming releases:", error)
    return new NextResponse(error.message || "Internal Error", { status: 500 })
  }
}
