import { NextResponse } from "next/server"
import { seedSampleContent } from "@/lib/seed-content"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    // Only allow in development or for admin users
    if (process.env.NODE_ENV !== "development") {
      const session = await getServerSession(authOptions)

      if (!session?.user || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
      }
    }

    const result = await seedSampleContent()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Seed content error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
