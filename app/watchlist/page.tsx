import { Suspense } from "react"
import { MainNav } from "@/components/navigation/main-nav"
import { getWatchlist } from "@/app/actions/watchlist-actions"
import { ContentCard } from "@/components/content/content-card"
import { Bookmark } from "lucide-react"

async function WatchlistContent() {
  const { success, data } = await getWatchlist()

  if (!success || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bookmark className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Your watchlist is empty</h2>
        <p className="mt-2 text-muted-foreground">
          Add movies and TV shows to your watchlist to keep track of what you want to watch.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {data.map((content: any) => (
        <ContentCard
          key={content.id}
          id={content.id}
          title={content.title}
          posterUrl={content.poster_url}
          releaseYear={content.release_year}
          type={content.type}
          maturityRating={content.maturity_rating}
        />
      ))}
    </div>
  )
}

export default function WatchlistPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="container mx-auto py-8">
          <h1 className="mb-6 text-3xl font-bold">My Watchlist</h1>
          <Suspense fallback={<div className="py-16 text-center">Loading your watchlist...</div>}>
            <WatchlistContent />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
