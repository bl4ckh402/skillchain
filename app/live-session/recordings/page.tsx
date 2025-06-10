import Layout from "@/components/layout";
import { Video, Play, Share2, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecordingsPage() {
  const recordings: any[] = [];

  return (
    <Layout>
      <h1 className="mb-8 text-3xl font-bold text-white">Session Recordings</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
  );
}

function RecordingCard({
  id,
  title,
  course,
  date,
  duration,
  views,
}: {
  id: string;
  title: string;
  course: string;
  date: string;
  duration: string;
  views: number;
}) {
  return (
    <Card className="bg-[#232538] border-0 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="mb-1">
          <Video className="w-5 h-5 text-gray-400" />
        </div>
        <Badge className="text-purple-400 bg-purple-500/20 hover:bg-purple-500/30">
          Recording
        </Badge>
      </div>
      <h3 className="mb-1 text-xl font-medium text-white">{title}</h3>
      <p className="mb-2 text-sm text-emerald-400">{course}</p>
      <p className="mb-4 text-gray-400">{date}</p>

      <div className="flex justify-between mb-6 text-gray-400">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          <span>{duration}</span>
        </div>
        <div className="text-sm">{views} views</div>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1 text-white bg-emerald-600 hover:bg-emerald-700">
          <Play className="w-4 h-4 mr-2" />
          Play
        </Button>
        <Button variant="outline" className="text-gray-300 border-gray-700">
          <Download className="w-4 h-4" />
          <span className="sr-only">Download</span>
        </Button>
        <Button variant="outline" className="text-gray-300 border-gray-700">
          <Share2 className="w-4 h-4" />
          <span className="sr-only">Share</span>
        </Button>
      </div>
    </Card>
  );
}
