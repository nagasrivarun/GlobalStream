"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Plus, Trash2 } from "lucide-react"

export default function AddContentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Basic content info
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("MOVIE")
  const [releaseYear, setReleaseYear] = useState<number | undefined>()
  const [duration, setDuration] = useState<number | undefined>()
  const [maturityRating, setMaturityRating] = useState("")

  // Media
  const [posterUrl, setPosterUrl] = useState("")
  const [backdropUrl, setBackdropUrl] = useState("")
  const [trailerUrl, setTrailerUrl] = useState("")

  // Flags
  const [featured, setFeatured] = useState(false)
  const [trending, setTrending] = useState(false)
  const [popular, setPopular] = useState(false)

  // Genres and languages
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [availableGenres, setAvailableGenres] = useState<{ id: string; name: string }[]>([])
  const [availableLanguages, setAvailableLanguages] = useState<{ id: string; code: string; name: string }[]>([])

  // Regional availability
  const [regions, setRegions] = useState<{ region: string; releaseDate: string }[]>([{ region: "", releaseDate: "" }])

  // Fetch genres and languages on component mount
  useState(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Fetch genres
      const { data: genres } = await supabase.from("genres").select("id, name").order("name")

      if (genres) {
        setAvailableGenres(genres)
      }

      // Fetch languages
      const { data: languages } = await supabase.from("languages").select("id, code, name").order("name")

      if (languages) {
        setAvailableLanguages(languages)
      }
    }

    fetchData()
  }, [])

  const handleGenreToggle = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter((id) => id !== genreId))
    } else {
      setSelectedGenres([...selectedGenres, genreId])
    }
  }

  const handleLanguageToggle = (languageId: string) => {
    if (selectedLanguages.includes(languageId)) {
      setSelectedLanguages(selectedLanguages.filter((id) => id !== languageId))
    } else {
      setSelectedLanguages([...selectedLanguages, languageId])
    }
  }

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

    if (!title || !description || !type) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsLoading(true)
      setError("")
      setSuccess("")

      const supabase = createClient()

      // Insert content
      const { data: newContent, error: contentError } = await supabase
        .from("content")
        .insert({
          title,
          description,
          type,
          release_year: releaseYear,
          duration,
          maturity_rating: maturityRating,
          poster_url: posterUrl,
          backdrop_url: backdropUrl,
          trailer_url: trailerUrl,
          featured,
          trending,
          popular,
        })
        .select()
        .single()

      if (contentError) {
        throw new Error(contentError.message)
      }

      // Link genres
      if (selectedGenres.length > 0) {
        const genreLinks = selectedGenres.map((genreId) => ({
          content_id: newContent.id,
          genre_id: genreId,
        }))

        const { error: genreError } = await supabase.from("content_genres").insert(genreLinks)

        if (genreError) {
          console.error("Error linking genres:", genreError)
        }
      }

      // Link languages
      if (selectedLanguages.length > 0) {
        const languageLinks = selectedLanguages.map((languageId) => ({
          content_id: newContent.id,
          language_id: languageId,
        }))

        const { error: languageError } = await supabase.from("content_languages").insert(languageLinks)

        if (languageError) {
          console.error("Error linking languages:", languageError)
        }
      }

      // Add regional availability (this would be a separate table in a real implementation)
      // This is just a placeholder for demonstration
      console.log("Regional availability:", regions)

      setSuccess("Content added successfully!")

      // Redirect to content list after a short delay
      setTimeout(() => {
        router.push("/admin/content")
        router.refresh()
      }, 2000)
    } catch (error: any) {
      setError(error.message || "An error occurred while adding content")
      console.error("Add content error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Add New Content</h1>
        <Button onClick={() => router.push("/admin/content")}>Back to Content</Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="categorization">Categorization</TabsTrigger>
          <TabsTrigger value="regional">Regional Availability</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-900/50 border border-red-900 text-white p-4 rounded-md mb-6">{error}</div>}

          {success && (
            <div className="bg-green-900/50 border border-green-900 text-white p-4 rounded-md mb-6">{success}</div>
          )}

          <TabsContent value="basic" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription className="text-gray-400">Enter the basic details about the content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-gray-900 border-gray-700 min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Content Type *</Label>
                    <Select value={type} onValueChange={(value) => setType(value)}>
                      <SelectTrigger className="bg-gray-900 border-gray-700">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="MOVIE">Movie</SelectItem>
                        <SelectItem value="SHOW">TV Show</SelectItem>
                        <SelectItem value="SPORT">Sport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="releaseYear">Release Year</Label>
                    <Input
                      id="releaseYear"
                      type="number"
                      value={releaseYear || ""}
                      onChange={(e) => setReleaseYear(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={duration || ""}
                      onChange={(e) => setDuration(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maturityRating">Maturity Rating</Label>
                    <Select value={maturityRating} onValueChange={(value) => setMaturityRating(value)}>
                      <SelectTrigger className="bg-gray-900 border-gray-700">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="PG">PG</SelectItem>
                        <SelectItem value="PG-13">PG-13</SelectItem>
                        <SelectItem value="R">R</SelectItem>
                        <SelectItem value="NC-17">NC-17</SelectItem>
                        <SelectItem value="TV-Y">TV-Y</SelectItem>
                        <SelectItem value="TV-Y7">TV-Y7</SelectItem>
                        <SelectItem value="TV-G">TV-G</SelectItem>
                        <SelectItem value="TV-PG">TV-PG</SelectItem>
                        <SelectItem value="TV-14">TV-14</SelectItem>
                        <SelectItem value="TV-MA">TV-MA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription className="text-gray-400">Add poster, backdrop, and trailer URLs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="posterUrl">Poster URL</Label>
                  <Input
                    id="posterUrl"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backdropUrl">Backdrop URL</Label>
                  <Input
                    id="backdropUrl"
                    value={backdropUrl}
                    onChange={(e) => setBackdropUrl(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                    placeholder="https://example.com/backdrop.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trailerUrl">Trailer URL</Label>
                  <Input
                    id="trailerUrl"
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                    placeholder="https://example.com/trailer.mp4"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorization" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Categorization</CardTitle>
                <CardDescription className="text-gray-400">
                  Select genres, languages, and visibility options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Genres</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {availableGenres.map((genre) => (
                      <div key={genre.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre.id}`}
                          checked={selectedGenres.includes(genre.id)}
                          onCheckedChange={() => handleGenreToggle(genre.id)}
                        />
                        <label
                          htmlFor={`genre-${genre.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {genre.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Languages</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {availableLanguages.map((language) => (
                      <div key={language.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`language-${language.id}`}
                          checked={selectedLanguages.includes(language.id)}
                          onCheckedChange={() => handleLanguageToggle(language.id)}
                        />
                        <label
                          htmlFor={`language-${language.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {language.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Visibility Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={featured}
                        onCheckedChange={(checked) => setFeatured(checked === true)}
                      />
                      <label
                        htmlFor="featured"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Featured (shown in hero section)
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trending"
                        checked={trending}
                        onCheckedChange={(checked) => setTrending(checked === true)}
                      />
                      <label
                        htmlFor="trending"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Trending Now
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="popular"
                        checked={popular}
                        onCheckedChange={(checked) => setPopular(checked === true)}
                      />
                      <label
                        htmlFor="popular"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Popular
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Regional Availability</CardTitle>
                <CardDescription className="text-gray-400">
                  Specify when the content will be available in different regions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {regions.map((region, index) => (
                  <div key={index} className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`region-${index}`}>Region/Country</Label>
                      <Input
                        id={`region-${index}`}
                        value={region.region}
                        onChange={(e) => updateRegion(index, "region", e.target.value)}
                        className="bg-gray-900 border-gray-700"
                        placeholder="e.g., US, India, Global"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`releaseDate-${index}`}>Release Date</Label>
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
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Content...
                </>
              ) : (
                "Add Content"
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
