"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SearchIcon, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import Navbar from "@/components/navbar"
import ContentCard from "@/components/content-card"

interface Content {
  id: string
  title: string
  poster_url: string | null
  release_year: number | null
  type: string
}

interface Person {
  id: string
  name: string
  image_url: string | null
}

interface SearchResults {
  content: Content[]
  people: Person[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setSearchQuery(query)

    if (query) {
      performSearch(query)
    } else {
      setResults(null)
    }
  }, [query])

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setResults(null)
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-10 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for movies, TV shows, actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 bg-gray-800 border-gray-700 text-white"
              />
            </form>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
          ) : results ? (
            <div className="space-y-8">
              {results.content.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-white">Content</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {results.content.map((item) => (
                      <ContentCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        posterUrl={item.poster_url || ""}
                        releaseYear={item.release_year || undefined}
                        type={item.type}
                      />
                    ))}
                  </div>
                </div>
              )}

              {results.people.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-white">People</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {results.people.map((person) => (
                      <div key={person.id} className="text-center">
                        <div className="aspect-square rounded-full overflow-hidden bg-gray-800 mb-2">
                          <img
                            src={person.image_url || "/placeholder.svg?height=200&width=200"}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-white font-medium truncate">{person.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.content.length === 0 && results.people.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-400">No results found for "{query}"</p>
                </div>
              )}
            </div>
          ) : query ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400">Enter a search term to find content</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
