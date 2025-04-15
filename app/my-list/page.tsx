"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Navbar from "@/components/navbar"
import ContentCard from "@/components/content-card"
import ProtectedRoute from "@/components/protected-route"

interface Content {
  id: string
  title: string
  poster_url: string | null
  release_year: number | null
  type: string
}

interface UserContent {
  id: string
  content: Content
}

export default function MyListPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [myList, setMyList] = useState<UserContent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMyList = async () => {
      try {
        const response = await fetch("/api/mylist")

        if (!response.ok) {
          throw new Error("Failed to fetch my list")
        }

        const data = await response.json()
        setMyList(data)
      } catch (error) {
        console.error("Error fetching my list:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchMyList()
    }
  }, [session])

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen pt-20 pb-10 bg-black">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-white">My List</h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
          ) : myList.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 mb-4">Your list is empty</p>
              <button onClick={() => router.push("/browse")} className="text-red-600 hover:underline">
                Browse content to add to your list
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {myList.map((item) => (
                <ContentCard
                  key={item.id}
                  id={item.content.id}
                  title={item.content.title}
                  posterUrl={item.content.poster_url || ""}
                  releaseYear={item.content.release_year || undefined}
                  type={item.content.type}
                  isInMyList={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
