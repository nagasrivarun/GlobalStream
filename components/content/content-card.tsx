import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { WatchlistButton } from "@/components/watchlist/watchlist-button"

interface ContentCardProps {
  id: string
  title: string
  posterUrl: string
  releaseYear: number
  type: string
  maturityRating?: string
}

export function ContentCard({ id, title, posterUrl, releaseYear, type, maturityRating }: ContentCardProps) {
  return (
    <Card className="group overflow-hidden rounded-lg transition-all hover:shadow-lg">
      <div className="relative aspect-[2/3] overflow-hidden">
        <Link href={`/content/${id}`}>
          <img
            src={posterUrl || `/placeholder.svg?height=450&width=300`}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="absolute top-2 right-2">
          <WatchlistButton contentId={id} />
        </div>
        {maturityRating && (
          <div className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {maturityRating}
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <Link href={`/content/${id}`} className="hover:underline">
          <h3 className="line-clamp-1 font-medium">{title}</h3>
        </Link>
        <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
          <span>{releaseYear}</span>
          <span className="capitalize">{type}</span>
        </div>
      </CardContent>
    </Card>
  )
}
