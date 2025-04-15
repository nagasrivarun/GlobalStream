"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Globe, Loader2, ArrowUpRight } from "lucide-react"

interface RegionalRelease {
  id: string
  content_id: string
  region: string
  release_date: string
  content: {
    title: string
    type: string
    poster_url: string | null
  }
}

interface ContentItem {
  id: string
  title: string
}

export default function RegionalReleasesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [upcomingReleases, setUpcomingReleases] = useState<RegionalRelease[]>([])
  const [contentList, setContentList] = useState<ContentItem[]>([])
  const [selectedContent, setSelectedContent] = useState("")
  const [region, setRegion] = useState("")
  const [releaseDate, setReleaseDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [timeframe, setTimeframe] = useState("7")

  // Fetch upcoming releases
  useEffect(() => {
    const fetchUpcomingReleases = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        // Get upcoming releases for the next X days
        const { data, error } = await supabase
          .from("content_regional_availability")
          .select(`
            id,
            content_id,
            region,
            release_date,
            content (
              title,
              type,
              poster_url
            )
          `)
          .gte("release_date", new Date().toISOString().split("T")[0])
          .order("release_date", { ascending: true })

        if (error) throw error
        setUpcomingReleases(data || [])

        // Get content list for dropdown
        const { data: contentData, error: contentError } = await supabase
          .from("content")
          .select("id, title")
          .order("title")

        if (contentError) throw contentError
        setContentList(contentData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load upcoming releases")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUpcomingReleases()
  }, [timeframe])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedContent || !region || !releaseDate) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      setSuccess("")

      const supabase = createClient()

      // Check if this region already has a release date for this content
      const { data: existing } = await supabase
        .from("content_regional_availability")
        .select("id")
        .eq("content_id", selectedContent)
        .eq("region", region)
        .single()

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("content_regional_availability")
          .update({
            release_date: releaseDate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)

        if (error) throw error
        setSuccess("Release date updated successfully")
      } else {
        // Insert new record
        const { error } = await supabase.from("content_regional_availability").insert({
          content_id: selectedContent,
          region,
          release_date: releaseDate,
        })

        if (error) throw error
        setSuccess("Release date scheduled successfully")
      }

      // Reset form
      setSelectedContent("")
      setRegion("")
      setReleaseDate("")

      // Refresh the list
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error: any) {
      console.error("Error scheduling release:", error)
      setError(error.message || "Failed to schedule release")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Group releases by date
  const releasesByDate = upcomingReleases.reduce(
    (acc, release) => {
      const date = release.release_date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(release)
      return acc
    },
    {} as Record<string, RegionalRelease[]>,
  )

  // Sort dates
  const sortedDates = Object.keys(releasesByDate).sort()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Regional Releases</h1>
        <Button onClick={() => router.push("/admin")} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="upcoming">Upcoming Releases</TabsTrigger>
          <TabsTrigger value="schedule">Schedule New Release</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upcoming Regional Releases</h2>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="7">Next 7 days</SelectItem>
                <SelectItem value="14">Next 14 days</SelectItem>
                <SelectItem value="30">Next 30 days</SelectItem>
                <SelectItem value="90">Next 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : upcomingReleases.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <p className="text-center text-gray-400">No upcoming releases scheduled</p>
              </CardContent>
            </Card>
          ) : (
            sortedDates.map((date) => (
              <Card key={date} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {releasesByDate[date].length} content items releasing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {releasesByDate[date].map((release) => (
                      <div key={release.id} className="bg-gray-900 rounded-lg p-4 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{release.content.title}</h3>
                          <span className="text-xs bg-blue-900 text-blue-100 px-2 py-1 rounded">
                            {release.content.type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mb-4">
                          <Globe className="h-4 w-4 inline mr-1" /> {release.region}
                        </div>
                        <div className="mt-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => router.push(`/admin/content/${release.content_id}`)}
                          >
                            View Content <ArrowUpRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Schedule New Regional Release</CardTitle>
              <CardDescription className="text-gray-400">
                Set when content will be available in specific regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-900/50 border border-red-900 text-white p-4 rounded-md mb-6">{error}</div>
              )}

              {success && (
                <div className="bg-green-900/50 border border-green-900 text-white p-4 rounded-md mb-6">{success}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Select value={selectedContent} onValueChange={setSelectedContent}>
                    <SelectTrigger id="content" className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select content" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 max-h-[300px]">
                      {contentList.map((content) => (
                        <SelectItem key={content.id} value={content.id}>
                          {content.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                    placeholder="e.g., US, Europe, Global"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Input
                    id="releaseDate"
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Release"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
