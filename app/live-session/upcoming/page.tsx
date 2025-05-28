"use client";
import { useEffect } from "react";
import Layout from "@/components/layout";
import { Calendar, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVideo } from "@/context/StreamClientProvider";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function UpcomingSessionsPage() {
  const { upcomingSessions, fetchSessions, isClientReady } = useVideo();
  const { toast } = useToast();

  // Fetch sessions when component mounts
  useEffect(() => {
    if (isClientReady) {
      fetchSessions();
    }
  }, [isClientReady, fetchSessions]);

  // Format date string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time string
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Layout>
      <h1 className="mb-8 text-3xl font-bold text-white">Upcoming Sessions</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {upcomingSessions.length > 0 ? (
          upcomingSessions.map((session) => (
            <SessionCard
              key={session.id}
              title={session.title}
              date={formatDate(session.createdAt)}
              time={formatTime(session.createdAt)}
              students={session.participants?.length || 0}
              type={session.type || "lecture"}
              id={session.id}
            />
          ))
        ) : (
          <div className="col-span-2 bg-[#232538] rounded-lg p-8 text-center">
            <p className="mb-4 text-gray-400">No upcoming sessions scheduled</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
function SessionCard({
  title,
  date,
  time,
  students,
  type,
  id,
}: {
  title: string;
  date: string;
  time: string;
  students: number;
  type: string;
  id: string;
}) {
  const router = useRouter();

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "workshop":
        return "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30";
      case "review":
        return "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "workshop":
        return "Workshop";
      case "review":
        return "Review Session";
      default:
        return "Lecture";
    }
  };

  return (
    <Card className="bg-[#232538] border-0 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="mb-1">
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <Badge className={getBadgeColor(type)}>{getTypeLabel(type)}</Badge>
      </div>
      <h3 className="mb-1 text-xl font-medium text-white">{title}</h3>
      <p className="mb-6 text-gray-400">
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
        <Button
          className="text-white bg-emerald-600 hover:bg-emerald-700"
          onClick={() => router.push(`/session/${id}`)}
        >
          Join Session
        </Button>
        <Button variant="outline" className="text-gray-300 border-gray-700">
          <Copy className="w-4 h-4 mr-2" />
          Copy Invitation
        </Button>
      </div>
    </Card>
  );
}
