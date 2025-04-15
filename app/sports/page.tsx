import Link from "next/link"
import Image from "next/image"
import { Calendar, Filter, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SportsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with navigation is in layout */}
      <div className="pt-24 pb-8 container">
        <h1 className="text-3xl font-bold mb-6">Sports</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div className="flex flex-wrap gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] bg-background/80">
                <SelectValue placeholder="Sport Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="f1">Formula 1</SelectItem>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="golf">Golf</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] bg-background/80">
                <SelectValue placeholder="League" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leagues</SelectItem>
                <SelectItem value="premier">Premier League</SelectItem>
                <SelectItem value="laliga">La Liga</SelectItem>
                <SelectItem value="nba">NBA</SelectItem>
                <SelectItem value="nfl">NFL</SelectItem>
                <SelectItem value="f1">Formula 1</SelectItem>
                <SelectItem value="tennis">Grand Slam</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative w-full md:w-auto">
            <Input type="search" placeholder="Search sports..." className="w-full md:w-[250px] bg-background/80" />
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="bg-background/10 border-b border-muted w-full justify-start rounded-none h-auto p-0 overflow-x-auto">
            <TabsTrigger
              value="live"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Live Now
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="highlights"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Highlights
            </TabsTrigger>
            <TabsTrigger
              value="documentaries"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Documentaries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <LiveSportCard key={i} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Today</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <UpcomingSportCard key={i} hours={i + 1} />
                ))}
              </div>

              <h3 className="text-xl font-semibold pt-6">Tomorrow</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <UpcomingSportCard key={i} hours={24 + i} />
                ))}
              </div>

              <h3 className="text-xl font-semibold pt-6">This Weekend</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <UpcomingSportCard key={i} hours={48 + i} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="highlights" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <HighlightCard key={i} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documentaries" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <DocumentaryCard key={i} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Popular Leagues */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Popular Leagues</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <LeagueCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LiveSportCard() {
  return (
    <Link href="/sports/match/123" className="relative overflow-hidden rounded-lg group">
      <div className="aspect-video relative">
        <Image
          src="/placeholder.svg?height=400&width=600"
          alt="Live sport"
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>
      <div className="absolute top-3 left-3">
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-600 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          LIVE
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=30&width=30"
              alt="Team 1"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="font-medium text-sm">Team A</span>
          </div>
          <span className="font-bold">2</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=30&width=30"
              alt="Team 2"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="font-medium text-sm">Team B</span>
          </div>
          <span className="font-bold">1</span>
        </div>
        <div className="mt-2 text-xs text-gray-300">
          <span>65:12 | Premier League</span>
        </div>
      </div>
    </Link>
  )
}

function UpcomingSportCard({ hours }: { hours: number }) {
  return (
    <Link
      href="/sports/match/123"
      className="relative overflow-hidden rounded-lg group border border-gray-800 hover:border-gray-700"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-600">
            {hours < 24 ? (
              `Starting in ${hours}h`
            ) : (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {new Date(Date.now() + hours * 3600000).toLocaleDateString()}
              </span>
            )}
          </span>
          <span className="text-xs text-gray-400">Premier League</span>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="Team 1"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-medium">Team A</span>
          </div>
          <span className="text-xs text-gray-400">VS</span>
          <div className="flex items-center gap-3">
            <span className="font-medium">Team B</span>
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="Team 2"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
        </div>

        <Button variant="outline" className="w-full">
          Set Reminder
        </Button>
      </div>
    </Link>
  )
}

function HighlightCard() {
  return (
    <Link href="/sports/highlight/123" className="group">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        <Image
          src="/placeholder.svg?height=400&width=600"
          alt="Highlight thumbnail"
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Button size="icon" className="rounded-full h-12 w-12 bg-primary/90 hover:bg-primary">
            <Play className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
          <p className="font-medium text-sm">Team A vs Team B - Match Highlights</p>
          <p className="text-xs text-gray-300 mt-1">Premier League • 3 days ago</p>
        </div>
      </div>
    </Link>
  )
}

function DocumentaryCard() {
  return (
    <Link href="/sports/documentary/123" className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
        <Image
          src="/placeholder.svg?height=450&width=300"
          alt="Documentary thumbnail"
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="font-bold text-lg">The Last Dance</p>
          <p className="text-sm text-gray-300 mt-1">The story of Michael Jordan and the Chicago Bulls</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>2020</span>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <span>10 Episodes</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function LeagueCard() {
  return (
    <Link href="/sports/league/123" className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center p-6 border border-gray-800 hover:border-gray-700">
        <Image
          src="/placeholder.svg?height=100&width=100"
          alt="League logo"
          width={80}
          height={80}
          className="object-contain transition-transform group-hover:scale-110"
        />
      </div>
      <p className="text-center mt-2 font-medium text-sm">Premier League</p>
    </Link>
  )
}
