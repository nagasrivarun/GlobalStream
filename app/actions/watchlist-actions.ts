"use server"

import { neon } from "@neondatabase/serverless"
import { getSupabaseServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

// Get the current user ID from the session
async function getCurrentUserId() {
  const supabase = getSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user?.id) {
    throw new Error("User not authenticated")
  }

  return session.user.id
}

// Add content to watchlist
export async function addToWatchlist(contentId: string) {
  try {
    const userId = await getCurrentUserId()

    // Check if already in watchlist
    const existingItem = await sql`
      SELECT id FROM user_watchlist 
      WHERE user_id = ${userId} AND content_id = ${contentId}
    `

    if (existingItem.length === 0) {
      await sql`
        INSERT INTO user_watchlist (user_id, content_id)
        VALUES (${userId}, ${contentId})
      `
    }

    revalidatePath("/watchlist")
    revalidatePath(`/content/${contentId}`)

    return { success: true, message: "Added to watchlist" }
  } catch (error: any) {
    console.error("Error adding to watchlist:", error)
    return { success: false, message: error.message }
  }
}

// Remove content from watchlist
export async function removeFromWatchlist(contentId: string) {
  try {
    const userId = await getCurrentUserId()

    await sql`
      DELETE FROM user_watchlist
      WHERE user_id = ${userId} AND content_id = ${contentId}
    `

    revalidatePath("/watchlist")
    revalidatePath(`/content/${contentId}`)

    return { success: true, message: "Removed from watchlist" }
  } catch (error: any) {
    console.error("Error removing from watchlist:", error)
    return { success: false, message: error.message }
  }
}

// Check if content is in watchlist
export async function isInWatchlist(contentId: string) {
  try {
    const userId = await getCurrentUserId()

    const result = await sql`
      SELECT id FROM user_watchlist 
      WHERE user_id = ${userId} AND content_id = ${contentId}
    `

    return { success: true, isInWatchlist: result.length > 0 }
  } catch (error: any) {
    console.error("Error checking watchlist:", error)
    return { success: false, isInWatchlist: false }
  }
}

// Get user's watchlist
export async function getWatchlist() {
  try {
    const userId = await getCurrentUserId()

    const watchlist = await sql`
      SELECT c.* 
      FROM content c
      JOIN user_watchlist w ON c.id = w.content_id
      WHERE w.user_id = ${userId}
      ORDER BY w.added_at DESC
    `

    return { success: true, data: watchlist }
  } catch (error: any) {
    console.error("Error fetching watchlist:", error)
    return { success: false, data: [] }
  }
}
