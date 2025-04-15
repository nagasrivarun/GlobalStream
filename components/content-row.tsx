"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ContentCard from "@/components/content-card"

interface Content {
  id: string
  title: string
  posterUrl: string
  releaseYear?: number
  type?: string
}

interface ContentRowProps {
  title: string
  contents: Content[]
}

export default function ContentRow({ title, contents }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2

      rowRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      })
    }
  }

  if (contents.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>

      <div className="relative group">
        <button
          className="absolute left-0 top-0 bottom-0 z-10 bg-black/30 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div ref={rowRef} className="flex space-x-4 overflow-x-scroll scrollbar-hide py-4">
          {contents.map((content) => (
            <div key={content.id} className="flex-shrink-0 w-[180px]">
              <ContentCard
                id={content.id}
                title={content.title}
                posterUrl={content.posterUrl}
                releaseYear={content.releaseYear}
                type={content.type}
              />
            </div>
          ))}
        </div>

        <button
          className="absolute right-0 top-0 bottom-0 z-10 bg-black/30 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
