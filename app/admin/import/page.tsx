"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Film, Upload, Database } from "lucide-react"

export default function ImportPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [importCount, setImportCount] = useState(0)

  const handleImportMovies = async () => {
    try {
      setIsLoading(true)
      setError("")
      setSuccess("")

      const response = await fetch("/api/admin/import-movies", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to import movies")
      }

      const data = await response.json()
      setSuccess(data.message || "Movies imported successfully")
      setImportCount(data.count || 0)
    } catch (error: any) {
      setError(error.message || "An error occurred while importing movies")
      console.error("Import movies error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Import Content</h1>

      <Tabs defaultValue="tmdb" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="tmdb">TMDB Import</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="tmdb" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Film className="h-5 w-5 mr-2" />
                Import Movies from TMDB
              </CardTitle>
              <CardDescription className="text-gray-400">
                Fetch upcoming and new release movies from The Movie Database API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <div className="bg-red-900/50 border border-red-900 text-white p-4 rounded-md">{error}</div>}

              {success && (
                <div className="bg-green-900/50 border border-green-900 text-white p-4 rounded-md">
                  {success}
                  {importCount > 0 && <p className="mt-2">Imported {importCount} movies</p>}
                </div>
              )}

              <p className="text-gray-300">
                This will fetch upcoming movies from TMDB and import them into your database. Movies that already exist
                will be skipped.
              </p>

              <div className="flex justify-end">
                <Button onClick={handleImportMovies} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Import Upcoming Movies
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Bulk Import Content
              </CardTitle>
              <CardDescription className="text-gray-400">Import content from CSV or JSON files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-700 rounded-md p-8 text-center">
                <Upload className="h-10 w-10 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 mb-2">Drag and drop a CSV or JSON file here</p>
                <p className="text-gray-500 text-sm mb-4">or</p>
                <Button variant="outline">Select File</Button>
                <p className="text-gray-500 text-xs mt-4">Supported formats: CSV, JSON</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
