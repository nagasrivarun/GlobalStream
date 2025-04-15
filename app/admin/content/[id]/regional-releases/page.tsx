"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2, Calendar, Globe } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface RegionalRelease {
  region: string
  releaseDate: string
}

export default function RegionalReleasesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const contentId = params.id

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [contentTitle, setContentTitle] = useState("")

  const [regions, setRegions] = useState<RegionalRelease[]>([{ region: "", releaseDate: "" }])

  const [existingReleases, setExistingReleases] = useState<any[]>([])

  // Fetch content details and existing regional releases
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        // Fetch content details
        const { data: content, error: contentError } = await supabase
          .from("content")
          .select("title")
          .eq("id", contentId)
          .single()

        if (contentError) throw contentError
        setContentTitle(content.title)

        // Fetch existing regional releases
        const { data: releases, error: releasesError } = await supabase
          .from("content_regional_availability")
          .select("*")
          .eq("content_id", contentId)

        if (releasesError) throw releasesError

        if (releases && releases.length > 0) {
          setExistingReleases(releases)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load content data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [contentId])

  const addRegion = () => {
    setRegions([...regions, { region: "", releaseDate: "" }])
  }

  const removeRegion = (index: number) => {
    const newRegions = [...regions]
    newRegions.splice(index, 1)
    setRegions(newRegions)
  }

  const updateRegion = (index: number, field: "region" | "releaseDate", value: string) => {
    const newRegions = [...regions]
    newRegions[index][field] = value
    setRegions(newRegions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate input
    const validRegions = regions.filter((r) => r.region && r.releaseDate)
    if (validRegions.length === 0) {
      setError("Please add at least one valid region and release date")
      return
    }

    try {
      setIsSaving(true)
      setError("")
      setSuccess("")

      const response = await fetch("/api/admin/schedule-release", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          regions: validRegions,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to schedule releases")
      }

      setSuccess("Regional releases scheduled successfully")

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error: any) {
      setError(error.message || "An error occurred while scheduling releases")
      console.error("Schedule release error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Regional Releases</h1>
        <Button onClick={() => router.push(`/admin/content/${contentId}`)}>Back to Content</Button>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Manage Regional Releases for "{contentTitle}"</CardTitle>
          <CardDescription className="text-gray-400">
            Specify when this content will be available in different regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-900/50 border border-red-900 text-white p-4 rounded-md mb-6">{error}</div>}

          {success && (
            <div className="bg-green-900/50 border border-green-900 text-white p-4 rounded-md mb-6">{success}</div>
          )}

          {existingReleases.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Existing Scheduled Releases</h3>
              <div className="bg-gray-900 rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3 text-gray-400 font-medium">Region</th>
                      <th className="text-left p-3 text-gray-400 font-medium">Release Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingReleases.map((release, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="p-3">{release.region}</td>
                        <td className="p-3">{new Date(release.release_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">Add New Regional Releases</h3>

            {regions.map((region, index) => (
              <div key={index} className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`region-${index}`}>
                    <Globe className="h-4 w-4 inline mr-2" />
                    Region/Country
                  </Label>
                  <Input
                    id={`region-${index}`}
                    value={region.region}
                    onChange={(e) => updateRegion(index, "region", e.target.value)}
                    className="bg-gray-900 border-gray-700"
                    placeholder="e.g., US, India, Global"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor={`releaseDate-${index}`}>
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Release Date
                  </Label>
                  <Input
                    id={`releaseDate-${index}`}
                    type="date"
                    value={region.releaseDate}
                    onChange={(e) => updateRegion(index, "releaseDate", e.target.value)}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRegion(index)}
                  disabled={regions.length === 1}
                  className="text-gray-400 hover:text-white"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addRegion} className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add Region
            </Button>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={isSaving} className="bg-red-600 hover:bg-red-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Schedule Releases"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
