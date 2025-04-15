import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const supabase = createClient()

    // Get user with password
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("hashed_password")
      .eq("id", session.user.id)
      .single()

    if (userError || !user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.hashed_password || "")

    if (!isPasswordValid) {
      return new NextResponse("Current password is incorrect", { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    const { error: updateError } = await supabase
      .from("users")
      .update({ hashed_password: hashedPassword })
      .eq("id", session.user.id)

    if (updateError) {
      return new NextResponse("Failed to update password", { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password update error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
