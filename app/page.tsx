import { MainNav } from "@/components/navigation/main-nav"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        {/* Your existing home page content */}
        <div className="container mx-auto py-8">
          <h1 className="text-4xl font-bold">Welcome to GlobalStream</h1>
          <p className="mt-4 text-xl">Your global streaming platform</p>
        </div>
      </main>
    </div>
  )
}
