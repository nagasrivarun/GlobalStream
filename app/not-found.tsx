import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Film } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <Film className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-4xl font-bold text-white mb-4">404</h2>
        <h3 className="text-xl font-semibold text-white mb-4">Page Not Found</h3>
        <p className="text-gray-400 mb-6">
          The page you're looking for doesn't exist. Let's get you back to watching great content.
        </p>
        <Link href="/">
          <Button className="bg-red-600 hover:bg-red-700">Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
