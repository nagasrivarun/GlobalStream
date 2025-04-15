import { NextResponse } from "next/server"
import { getVisibleContentForRegion } from "@/lib/services/regional-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get("region")

    if (!region) {
      return new NextResponse("Region parameter is required", { status: 400 })
    }

    const content = await getVisibleContentForRegion(region)

    return NextResponse.json({
      region,
      content,
      count: content.length,
    })
  } catch (error) {
    console.error("Error fetching regional content:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
