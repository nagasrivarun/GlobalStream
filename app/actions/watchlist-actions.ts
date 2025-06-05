"use server"

import { getSupabaseServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

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
    const supabase = getSupabaseServerClient()

    // Check if already in watchlist
    const { data: existingItem } = await supabase
      .from("user_watchlist")
      .select("id")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .single()

    if (!existingItem) {
      await supabase.from("user_watchlist").insert({
        user_id: userId,
        content_id: contentId,
      })
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
    const supabase = getSupabaseServerClient()

    await supabase.from("user_watchlist").delete().eq("user_id", userId).eq("content_id", contentId)

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
    const supabase = getSupabaseServerClient()

    const { data } = await supabase
      .from("user_watchlist")
      .select("id")
      .eq("user_id", userId)
      .eq("content_id", contentId)

    return { success: true, isInWatchlist: data && data.length > 0 }
  } catch (error: any) {
    console.error("Error checking watchlist:", error)
    return { success: false, isInWatchlist: false }
  }
}

// Get user's watchlist
export async function getWatchlist() {
  try {
    const userId = await getCurrentUserId()
    const supabase = getSupabaseServerClient()

    const { data: watchlist } = await supabase
      .from("content")
      .select("*")
      .in("id", supabase.from("user_watchlist").select("content_id").eq("user_id", userId))
      .order("created_at", { ascending: false })

    return { success: true, data: watchlist || [] }
  } catch (error: any) {
    console.error("Error fetching watchlist:", error)
    return { success: false, data: [] }
  }
}
