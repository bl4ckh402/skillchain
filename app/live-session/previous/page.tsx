"use client";
import { useEffect } from "react";
import Layout from "@/components/layout";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVideo } from "@/context/StreamClientProvider";
import { useToast } from "@/components/ui/use-toast";

export default function PreviousSessionsPage() {
  const { recentSessions, fetchSessions, isClientReady } = useVideo();
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
      <h1 className="mb-8 text-3xl font-bold text-white">Previous Sessions</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {recentSessions.length > 0 ? (
          recentSessions.map((session) => (
            <PreviousSessionCard
              key={session.id}
              title={session.title}
              date={formatDate(session.createdAt)}
              startTime={formatTime(session.createdAt)}
              students={session.participants?.length || 0}
              type={session.type || "lecture"}
            />
          ))
        ) : (
          <div className="col-span-2 bg-[#232538] rounded-lg p-8 text-center">
            <p className="mb-4 text-gray-400">No previous sessions found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function PreviousSessionCard({
  title,
  date,
  startTime,
  students,
  type,
}: {
  title: string;
  date: string;
  startTime: string;
  students: number;
  type: string;
}) {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "workshop":
        return "bg-blue-500/20 text-blue-400";
      case "review":
        return "bg-amber-500/20 text-amber-400";
      default:
        return "bg-emerald-500/20 text-emerald-400";
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
      <p className="mb-2 text-gray-400">{date}</p>
      <p className="mb-6 text-gray-400">{startTime}</p>

      <div className="flex items-center">
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
    </Card>
  );
}
