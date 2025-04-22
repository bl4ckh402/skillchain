import Layout from "@/components/layout"
import { Video, Play, Share2, Download, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function RecordingsPage() {
  const recordings = [
    {
      id: "js-fundamentals-03-15",
      title: "JavaScript Fundamentals",
      course: "Web Development Fundamentals",
      date: "March 15, 2024",
      duration: "1hr 33mins",
      views: 45,
    },
    {
      id: "css-grid-03-14",
      title: "CSS Grid & Flexbox Workshop",
      course: "Frontend Design Mastery",
      date: "March 14, 2024",
      duration: "1hr 45mins",
      views: 38,
    },
    {
      id: "react-hooks-03-13",
      title: "React Hooks Deep Dive",
      course: "Frontend Framework Specialization",
      date: "March 13, 2024",
      duration: "1hr 20mins",
      views: 52,
    },
    {
      id: "api-integration-03-12",
      title: "API Integration Techniques",
      course: "Full Stack Development",
      date: "March 12, 2024",
      duration: "1hr 15mins",
      views: 33,
    },
  ]

  return (
    <Layout>
      <h1 className="text-white text-3xl font-bold mb-8">Session Recordings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recordings.map((recording, index) => (
          <RecordingCard
            key={index}
            id={recording.id}
            title={recording.title}
            course={recording.course}
            date={recording.date}
            duration={recording.duration}
            views={recording.views}
          />
        ))}
      </div>
    </Layout>
  )
}

function RecordingCard({
  id,
  title,
  course,
  date,
  duration,
  views,
}: {
  id: string
  title: string
  course: string
  date: string
  duration: string
  views: number
}) {
  return (
    <Card className="bg-[#232538] border-0 p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="mb-1">
          <Video className="h-5 w-5 text-gray-400" />
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">Recording</Badge>
      </div>
      <h3 className="text-white text-xl font-medium mb-1">{title}</h3>
      <p className="text-emerald-400 text-sm mb-2">{course}</p>
      <p className="text-gray-400 mb-4">{date}</p>

      <div className="flex justify-between text-gray-400 mb-6">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>{duration}</span>
        </div>
        <div className="text-sm">{views} views</div>
      </div>

      <div className="flex gap-3">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1">
          <Play className="h-4 w-4 mr-2" />
          Play
        </Button>
        <Button variant="outline" className="text-gray-300 border-gray-700">
          <Download className="h-4 w-4" />
          <span className="sr-only">Download</span>
        </Button>
        <Button variant="outline" className="text-gray-300 border-gray-700">
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </div>
    </Card>
  )
}
