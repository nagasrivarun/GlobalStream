import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { scheduleContentRelease } from "@/lib/services/content-scheduler"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { contentId, regions } = body

    if (!contentId || !regions || !Array.isArray(regions) || regions.length === 0) {
      return new NextResponse("Invalid request data", { status: 400 })
    }

    const result = await scheduleContentRelease(contentId, regions)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error scheduling release:", error)
    return new NextResponse(error.message || "Internal Error", { status: 500 })
  }
}
