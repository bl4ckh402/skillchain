"use client"
import { useEffect } from "react"
import Layout from "@/components/layout"
import { Calendar, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useVideo } from "@/context/StreamClientProvider"
import { useToast } from "@/components/ui/use-toast"

export default function UpcomingSessionsPage() {
  const { upcomingSessions, fetchSessions, isClientReady } = useVideo()
  const { toast } = useToast()

  // Fetch sessions when component mounts
  useEffect(() => {
    if (isClientReady) {
      fetchSessions()
    }
  }, [isClientReady, fetchSessions])

  // Format date string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format time string
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Layout>
      <h1 className="text-white text-3xl font-bold mb-8">Upcoming Sessions</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {upcomingSessions.length > 0 ? (
          upcomingSessions.map((session) => (
            <SessionCard
              key={session.id}
              title={session.title}
              date={formatDate(session.createdAt)}
              time={formatTime(session.createdAt)}
              students={session.participants?.length || 0}
              type={session.type || "lecture"}
            />
          ))
        ) : (
          <div className="col-span-2 bg-[#232538] rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">
              No upcoming sessions scheduled
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

function SessionCard({
  title,
  date,
  time,
  students,
  type,
}: {
  title: string
  date: string
  time: string
  students: number
  type: string
}) {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "workshop":
        return "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
      case "review":
        return "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
      default:
        return "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "workshop":
        return "Workshop"
      case "review":
        return "Review Session"
      default:
        return "Lecture"
    }
  }

  return (
    <Card className="bg-[#232538] border-0 p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="mb-1">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        <Badge className={getBadgeColor(type)}>{getTypeLabel(type)}</Badge>
      </div>
      <h3 className="text-white text-xl font-medium mb-1">{title}</h3>
      <p className="text-gray-400 mb-6">
        {date} - {time}
      </p>

      <div className="flex items-center mb-4">
        <div className="flex -space-x-2">
          {[...Array(Math.min(4, students))].map((_, i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full bg-gray-500 border-2 border-[#232538] flex items-center justify-center text-xs text-white"
            >
              {i + 1}
            </div>
          ))}
        </div>
        {students > 4 && (
          <div className="h-8 w-8 rounded-full bg-gray-700 border-2 border-[#232538] flex items-center justify-center text-xs text-white ml-1">
            +{students - 4}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Start Session</Button>
        <Button variant="outline" className="text-gray-300 border-gray-700">
          <Copy className="h-4 w-4 mr-2" />
          Copy Invitation
        </Button>
      </div>
    </Card>
  )
}
