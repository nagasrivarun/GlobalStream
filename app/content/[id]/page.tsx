import { notFound } from "next/navigation"
import { MainNav } from "@/components/navigation/main-nav"
import { Button } from "@/components/ui/button"
import { WatchlistButton } from "@/components/watchlist/watchlist-button"
import { Play, Calendar, Clock } from "lucide-react"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

async function getContentDetails(id: string) {
  try {
    const content = await sql`
      SELECT * FROM content WHERE id = ${id}
    `

    if (!content || content.length === 0) {
      return null
    }

    return content[0]
  } catch (error) {
    console.error("Error fetching content details:", error)
    return null
  }
}

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const content = await getContentDetails(params.id)

  if (!content) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="relative">
          {/* Backdrop Image */}
          <div className="relative h-[50vh] w-full">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
            <img
              src={content.backdrop_url || `/placeholder.svg?height=720&width=1280`}
              alt={content.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Content Details */}
          <div className="container relative mx-auto -mt-40 px-4 pb-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
              {/* Poster */}
              <div className="hidden md:block">
                <div className="overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={content.poster_url || `/placeholder.svg?height=450&width=300`}
                    alt={content.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-2 lg:col-span-3">
                <h1 className="text-4xl font-bold">{content.title}</h1>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  {content.maturity_rating && (
                    <span className="rounded border border-muted px-2 py-1">{content.maturity_rating}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {content.release_year}
                  </span>
                  {content.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.floor(content.duration / 60)}h {content.duration % 60}m
                    </span>
                  )}
                  <span className="capitalize">{content.type}</span>
                </div>

                <p className="mt-6 text-lg">{content.description}</p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Play
                  </Button>
                  <WatchlistButton contentId={content.id} size="lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
