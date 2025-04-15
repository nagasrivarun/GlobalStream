import { createClient } from "@/lib/supabase/server"

interface RegionalRelease {
  content_id: string
  region: string
  release_date: string
}

export async function updateContentAvailability() {
  const supabase = createClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    // Get all content with regional release dates for today
    const { data: releasingContent, error } = await supabase
      .from("content_regional_availability")
      .select("content_id, region")
      .eq("release_date", today)

    if (error) {
      throw error
    }

    if (!releasingContent || releasingContent.length === 0) {
      console.log("No content scheduled for release today")
      return
    }

    console.log(`Found ${releasingContent.length} content items to release today`)

    // Update content visibility for each region
    for (const item of releasingContent) {
      const { error: visibilityError } = await supabase.from("content_regional_visibility").upsert({
        content_id: item.content_id,
        region: item.region,
        is_visible: true,
        updated_at: new Date().toISOString(),
      })

      if (visibilityError) {
        console.error(`Error updating visibility for content ${item.content_id} in ${item.region}:`, visibilityError)
        continue
      }

      console.log(`Released content ${item.content_id} in region ${item.region}`)
    }

    return releasingContent
  } catch (error) {
    console.error("Error updating content availability:", error)
    throw error
  }
}

export async function scheduleContentRelease(contentId: string, regions: { region: string; releaseDate: string }[]) {
  const supabase = createClient()

  try {
    // First, check if content exists
    const { data: content, error: contentError } = await supabase
      .from("content")
      .select("id")
      .eq("id", contentId)
      .single()

    if (contentError || !content) {
      throw new Error(`Content with ID ${contentId} not found`)
    }

    // Insert or update regional availability
    for (const { region, releaseDate } of regions) {
      if (!region || !releaseDate) continue

      const { error } = await supabase.from("content_regional_availability").upsert({
        content_id: contentId,
        region,
        release_date: releaseDate,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error(`Error scheduling content ${contentId} in ${region}:`, error)
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error scheduling content release:", error)
    throw error
  }
}

export async function getUpcomingReleases(days = 7) {
  const supabase = createClient()

  // Calculate date range
  const today = new Date()
  const endDate = new Date()
  endDate.setDate(today.getDate() + days)

  const startDateStr = today.toISOString().split("T")[0]
  const endDateStr = endDate.toISOString().split("T")[0]

  try {
    const { data, error } = await supabase
      .from("content_regional_availability")
      .select(`
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
      .order("release_date")

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error fetching upcoming releases:", error)
    throw error
  }
}
