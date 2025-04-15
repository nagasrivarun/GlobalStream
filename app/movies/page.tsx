import Link from "next/link"
import Image from "next/image"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MoviesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with navigation is in layout */}
      <div className="pt-24 pb-8 container">
        <h1 className="text-3xl font-bold mb-6">Movies</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div className="flex flex-wrap gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] bg-background/80">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="action">Action</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="drama">Drama</SelectItem>
                <SelectItem value="horror">Horror</SelectItem>
                <SelectItem value="scifi">Sci-Fi</SelectItem>
                <SelectItem value="thriller">Thriller</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] bg-background/80">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
                <SelectItem value="korean">Korean</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] bg-background/80">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="older">2019 & Older</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative w-full md:w-auto">
            <Input type="search" placeholder="Search movies..." className="w-full md:w-[250px] bg-background/80" />
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-background/10 border-b border-muted w-full justify-start rounded-none h-auto p-0 overflow-x-auto">
            <TabsTrigger
              value="all"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              All Movies
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Trending
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              New Releases
            </TabsTrigger>
            <TabsTrigger
              value="top"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Top Rated
            </TabsTrigger>
            <TabsTrigger
              value="awards"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Award Winners
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <MovieCard key={i} />
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Button variant="outline">Load More</Button>
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <MovieCard key={i} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <MovieCard key={i} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top" className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <MovieCard key={i} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="awards" className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <MovieCard key={i} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function MovieCard() {
  return (
    <Link href="/title/123" className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-muted">
        <Image
          src="/placeholder.svg?height=450&width=300"
          alt="Movie thumbnail"
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm line-clamp-1">Movie Title</h4>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span>2023</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span>HD</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
