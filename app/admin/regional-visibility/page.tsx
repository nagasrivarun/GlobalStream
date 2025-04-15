"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Eye, EyeOff, Search } from "lucide-react"

interface RegionalVisibility {
  id: string
  content_id: string
  region: string
  is_visible: boolean
  content: {
    title: string
    type: string
  }
}

interface ContentItem {
  id: string
  title: string
}

export default function RegionalVisibilityPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [visibilityData, setVisibilityData] = useState<RegionalVisibility[]>([])
  const [contentList, setContentList] = useState<ContentItem[]>([])
  const [selectedContent, setSelectedContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Fetch visibility data
  useEffect(() => {
    const fetchVisibilityData = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        // Get visibility data
        const { data, error } = await supabase
          .from("content_regional_visibility")
          .select(`
            id,
            content_id,
            region,
            is_visible,
            content (
              title,
              type
            )
          `)
          .order("region")

        if (error) throw error
        setVisibilityData(data || [])

        // Get content list for dropdown
        const { data: contentData, error: contentError } = await supabase
          .from("content")
          .select("id, title")
          .order("title")

        if (contentError) throw contentError
        setContentList(contentData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load visibility data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVisibilityData()
  }, [])

  // Toggle visibility for a region
  const toggleVisibility = async (id: string, currentValue: boolean) => {
    try {
      setIsUpdating(true)
      const supabase = createClient()

      const { error } = await supabase
        .from("content_regional_visibility")
        .update({
          is_visible: !currentValue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Update local state
      setVisibilityData((prev) => prev.map((item) => (item.id === id ? { ...item, is_visible: !currentValue } : item)))

      setSuccess(`Visibility ${!currentValue ? "enabled" : "disabled"} successfully`)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (error: any) {
      console.error("Error updating visibility:", error)
      setError(error.message || "Failed to update visibility")

      // Clear error message after 3 seconds
      setTimeout(() => {
        setError("")
      }, 3000)
    } finally {
      setIsUpdating(false)
    }
  }

  // Filter visibility data based on search query and selected content
  const filteredData = visibilityData.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesContent = selectedContent === "" || item.content_id === selectedContent

    return matchesSearch && matchesContent
  })

  // Group by content
  const groupedByContent = filteredData.reduce(
    (acc, item) => {
      if (!acc[item.content_id]) {
        acc[item.content_id] = {
          title: item.content.title,
          type: item.content.type,
          regions: [],
        }
      }

      acc[item.content_id].regions.push({
        id: item.id,
        region: item.region,
        is_visible: item.is_visible,
      })

      return acc
    },
    {} as Record<
      string,
      { title: string; type: string; regions: { id: string; region: string; is_visible: boolean }[] }
    >,
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Regional Visibility</h1>
        <Button onClick={() => router.push("/admin")} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Manage Content Visibility by Region</CardTitle>
          <CardDescription className="text-gray-400">Control which regions can see specific content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <div className="bg-red-900/50 border border-red-900 text-white p-4 rounded-md">{error}</div>}

          {success && (
            <div className="bg-green-900/50 border border-green-900 text-white p-4 rounded-md">{success}</div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by region or content title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700"
                />
              </div>
            </div>

            <div className="w-full md:w-64">
              <Select value={selectedContent} onValueChange={setSelectedContent}>
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Filter by content" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 max-h-[300px]">
                  <SelectItem value="all">All Content</SelectItem>
                  {contentList.map((content) => (
                    <SelectItem key={content.id} value={content.id}>
                      {content.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No visibility data found. Schedule regional releases first.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByContent).map(([contentId, content]) => (
                <Card key={contentId} className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{content.title}</CardTitle>
                      <span className="text-xs bg-blue-900 text-blue-100 px-2 py-1 rounded">{content.type}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {content.regions.map((region) => (
                        <div
                          key={region.id}
                          className="flex justify-between items-center p-2 hover:bg-gray-800 rounded-md"
                        >
                          <div className="flex items-center">
                            {region.is_visible ? (
                              <Eye className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span>{region.region}</span>
                          </div>
                          <Switch
                            checked={region.is_visible}
                            onCheckedChange={() => toggleVisibility(region.id, region.is_visible)}
                            disabled={isUpdating}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
