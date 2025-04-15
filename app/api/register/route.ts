import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, password } = body

    if (!email || !name || !password) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        name,
        hashed_password: hashedPassword,
        image: "",
        role: "USER",
        subscription_status: "FREE",
      })
      .select()
      .single()

    if (error) {
      console.error("Registration error:", error)
      return new NextResponse("Error creating user", { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Registration error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
