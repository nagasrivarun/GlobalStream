import { createClient } from "@/lib/supabase/server"

/**
 * Updates content visibility based on scheduled release dates
 * This function would typically be run by a cron job daily
 */
export async function processScheduledReleases() {
  const supabase = createClient()
  const today = new Date().toISOString().split("T")[0]

  try {
    // Get all content scheduled to be released today
    const { data: scheduledReleases, error } = await supabase
      .from("content_regional_availability")
      .select("content_id, region")
      .eq("release_date", today)

    if (error) throw error

    if (!scheduledReleases || scheduledReleases.length === 0) {
      console.log("No content scheduled for release today")
      return { processed: 0 }
    }

    console.log(`Processing ${scheduledReleases.length} scheduled releases for today`)

    // Update visibility for each scheduled release
    for (const release of scheduledReleases) {
      // Check if visibility record exists
      const { data: existingVisibility } = await supabase
        .from("content_regional_visibility")
        .select("id")
        .eq("content_id", release.content_id)
        .eq("region", release.region)
        .single()

      if (existingVisibility) {
        // Update existing visibility record
        await supabase
          .from("content_regional_visibility")
          .update({
            is_visible: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingVisibility.id)
      } else {
        // Create new visibility record
        await supabase.from("content_regional_visibility").insert({
          content_id: release.content_id,
          region: release.region,
          is_visible: true,
        })
      }

      console.log(`Made content ${release.content_id} visible in region ${release.region}`)
    }

    return { processed: scheduledReleases.length }
  } catch (error) {
    console.error("Error processing scheduled releases:", error)
    throw error
  }
}

/**
 * Gets content that is visible in a specific region
 */
export async function getVisibleContentForRegion(region: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("content_regional_visibility")
      .select(`
        content_id,
        content (
          id,
          title,
          description,
          type,
          poster_url,
          backdrop_url,
          release_year,
          content_genres (
            genres (
              name
            )
          )
        )
      `)
      .eq("region", region)
      .eq("is_visible", true)

    if (error) throw error

    return data?.map((item) => item.content) || []
  } catch (error) {
    console.error(`Error getting visible content for region ${region}:`, error)
    throw error
  }
}

/**
 * Checks if specific content is visible in a region
 */
export async function isContentVisibleInRegion(contentId: string, region: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("content_regional_visibility")
      .select("is_visible")
      .eq("content_id", contentId)
      .eq("region", region)
      .single()

    if (error) {
      // If no record exists, content is not visible in this region
      if (error.code === "PGRST116") {
        return false
      }
      throw error
    }

    return data?.is_visible || false
  } catch (error) {
    console.error(`Error checking content visibility for ${contentId} in region ${region}:`, error)
    throw error
  }
}
