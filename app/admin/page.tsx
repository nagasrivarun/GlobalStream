import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Film, Users, Play, Calendar } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = createClient()

  // Get content count
  const { count: contentCount } = await supabase.from("content").select("*", { count: "exact", head: true })

  // Get user count
  const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true })

  // Get recent content
  const { data: recentContent } = await supabase
    .from("content")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Content</CardTitle>
            <Film className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Subscriptions</CardTitle>
            <Play className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recently Added Content</h2>
        <div className="bg-gray-800 rounded-md border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-medium">Title</th>
                <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                <th className="text-left p-4 text-gray-400 font-medium">Release Year</th>
                <th className="text-left p-4 text-gray-400 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {recentContent?.map((content) => (
                <tr key={content.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4">{content.title}</td>
                  <td className="p-4">{content.type}</td>
                  <td className="p-4">{content.release_year}</td>
                  <td className="p-4">{new Date(content.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!recentContent || recentContent.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-400">
                    No content found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
