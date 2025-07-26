"use client";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Layout from "@/components/layout";
import {
  Calendar,
  Users,
  CalendarClock,
  Video,
  Plus,
  Copy,
  BookOpen,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useVideo } from "@/context/StreamClientProvider";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SessionCreatedDialog } from "@/components/session-created-dialog";
import { ScheduleSessionDialog } from "@/components/schedule-session-dialog";

export default function LiveSessionPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [joinCallId, setJoinCallId] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showSessionCreated, setShowSessionCreated] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const totalStudents = 0;
  const activeCourses = 0;
  const {
    createCall,
    joinCall,
    upcomingSessions,
    recentSessions,
    fetchSessions,
    isClientReady,
  } = useVideo();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch sessions when component mounts
  useEffect(() => {
    if (isClientReady) {
      fetchSessions();
    }
  }, [isClientReady, fetchSessions]);

  // Format time as HH:MM
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  // Format date as Day, DD Month YYYY
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format session time
  const formatSessionTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format session date
  const formatSessionDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle creating a new session
  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) {
      toast({
        title: "Session title required",
        description: "Please enter a title for your session",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingSession(true);

    try {
      // Create a new call using the Video context
      const session = await createCall(sessionTitle);

      // Update session info for displaying to user
      setSessionInfo({
        id: session.id,
        title: sessionTitle,
      });

      // Show success dialog
      setShowCreateDialog(false);
      setShowSessionCreated(true);
      setSessionTitle("");

      // Refresh the sessions list
      await fetchSessions();

      // After meeting is created
      router.push(`/live-session/session/${session.id}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      toast({
        title: "Failed to create session",
        description:
          "There was an error creating your session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Handle joining a session
  const handleJoinSession = async () => {
    if (!joinCallId.trim()) {
      toast({
        title: "Session ID required",
        description: "Please enter a valid session ID",
        variant: "destructive",
      });
      return;
    }

    try {
      // Extract call ID from invitation link if necessary
      let callId = joinCallId.trim();
      if (callId.includes("/")) {
        const parts = callId.split("/");
        callId = parts[parts.length - 1];
      }

      // Join the call
      const call = await joinCall(callId, true);

      if (call) {
        // Navigate to the session page
        router.push(`/live-session/session/${callId}`);
      }
    } catch (error) {
      console.error("Failed to join session:", error);
      toast({
        title: "Failed to join session",
        description:
          error instanceof Error
            ? error.message
            : "The session ID may be invalid or the session has ended.",
        variant: "destructive",
      });
    }
  };

  // Handle starting an existing session
  const handleStartSession = async (callId: string) => {
    try {
      // Join the call (create if it doesn't exist)
      const call = await joinCall(callId, true);

      if (call) {
        // Navigate to the session page
        router.push(`/live-session/session/${callId}`);
      }
    } catch (error) {
      console.error("Failed to start session:", error);
      toast({
        title: "Failed to start session",
        description:
          "There was an error starting your session. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle copying invitation link
  const handleCopyInvitation = (callId: string) => {
    const inviteLink = `${window.location.origin}/join/${callId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Invitation link copied",
      description: "Share this link with your students to join the session.",
    });
  };

  // Get the next upcoming session (if any)
  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  return (
    <Layout>
      {/* Upcoming session notification */}
      <div className="mb-6">
        {nextSession ? (
          <p className="text-gray-400">
            Upcoming Session at: {formatSessionTime(nextSession.createdAt)}
          </p>
        ) : (
          <p className="text-gray-400">No upcoming sessions scheduled</p>
        )}
      </div>

      {/* Current time display */}
      <div
        className="relative p-8 mb-8 overflow-hidden rounded-xl"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(26, 29, 45, 0.8), rgba(26, 29, 45, 0.6))",
          backgroundSize: "cover",
        }}
      >
        <div className="relative z-10">
          <h1 className="font-bold text-white text-7xl">
            {formatTime(currentTime).split(" ")[0]}
            <span className="ml-2 text-3xl">
              {formatTime(currentTime).split(" ")[1]}
            </span>
          </h1>
          <p className="mt-2 text-xl text-gray-300">
            {formatDate(currentTime)}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full">
          {/* <Image
            src="/api/placeholder/400/300"
            alt="Decorative"
            width={400}
            height={300}
            className="object-cover h-full"
          /> */}
        </div>
      </div>

      {/* Instructor stats */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        <Card className="bg-[#232538] border-0 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-emerald-500/20">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-medium text-gray-400">Total Students</h3>
          </div>
          <p className="text-3xl font-bold text-white">{totalStudents}</p>
        </Card>

        <Card className="bg-[#232538] border-0 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-blue-500/20">
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-medium text-gray-400">Active Courses</h3>
          </div>
          <p className="text-3xl font-bold text-white">{activeCourses}</p>
        </Card>

        <Card className="bg-[#232538] border-0 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-purple-500/20">
              <Video className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-medium text-gray-400">Recorded Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {recentSessions.length}
          </p>
        </Card>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 gap-4 mb-10 md:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          icon={<Plus className="w-6 h-6 text-white" />}
          title="New Session"
          description="Start a live class session"
          bgColor="bg-emerald-600"
          onClick={() => setShowCreateDialog(true)}
        />
        <ActionCard
          icon={<Users className="w-6 h-6 text-white" />}
          title="Join Session"
          description="via invitation link"
          bgColor="bg-blue-500"
          onClick={() => setShowJoinDialog(true)}
        />
        <ActionCard
          icon={<CalendarClock className="w-6 h-6 text-white" />}
          title="Schedule Session"
          description="Plan your class sessions"
          bgColor="bg-purple-600"
          onClick={() => setShowScheduleDialog(true)}
        />
        <ActionCard
          icon={<Video className="w-6 h-6 text-white" />}
          title="View Recordings"
          description="Session recordings"
          bgColor="bg-amber-500"
          onClick={() => router.push("/live-session/previous")}
        />
      </div>

      {/* Today's sessions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">
            Today's Upcoming Sessions
          </h2>
          <Button variant="link" className="text-gray-400">
            See all
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {upcomingSessions.length > 0 ? (
            upcomingSessions
              .slice(0, 2)
              .map((session: any) => (
                <SessionCard
                  key={session.id}
                  title={session.title}
                  course="Your Course"
                  date={formatSessionDate(session.createdAt)}
                  time={formatSessionTime(session.createdAt)}
                  students={18}
                  callId={session.id}
                  onStartSession={handleStartSession}
                  onCopyInvitation={handleCopyInvitation}
                />
              ))
          ) : (
            <div className="col-span-2 bg-[#232538] rounded-lg p-8 text-center">
              <p className="mb-4 text-gray-400">
                No upcoming sessions scheduled for today
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Session
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create session dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#1A1D2D] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a title for your session. Students will use this to identify
              your class.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Session Title"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="bg-[#232538] border-gray-700 text-white"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="text-gray-300 border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSession}
              className="text-white bg-emerald-600 hover:bg-emerald-700"
              disabled={isCreatingSession}
            >
              {isCreatingSession ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Session"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join session dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-[#1A1D2D] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Join Session</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the session ID or paste the invitation link.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Session ID or Invitation Link"
              value={joinCallId}
              onChange={(e) => setJoinCallId(e.target.value)}
              className="bg-[#232538] border-gray-700 text-white"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJoinDialog(false)}
              className="text-gray-300 border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinSession}
              className="text-white bg-blue-500 hover:bg-blue-600"
            >
              Join Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session created dialog */}
      {showSessionCreated && sessionInfo && (
        <SessionCreatedDialog
          onClose={() => setShowSessionCreated(false)}
          sessionId={sessionInfo.id}
          sessionTitle={sessionInfo.title}
          onStartSession={() => handleStartSession(sessionInfo.id)}
          onCopyInvitation={() => handleCopyInvitation(sessionInfo.id)}
        />
      )}

      {/* Schedule session dialog */}
      <ScheduleSessionDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
      />
    </Layout>
  );
}

function ActionCard({
  icon,
  title,
  description,
  bgColor,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`${bgColor} p-6 text-white cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-md bg-white/20">
        {icon}
      </div>
      <h3 className="mb-1 text-xl font-bold">{title}</h3>
      <p className="text-sm text-white/80">{description}</p>
    </Card>
  );
}

function SessionCard({
  title,
  course,
  date,
  time,
  students,
  callId,
  onStartSession,
  onCopyInvitation,
}: {
  title: string;
  course: string;
  date: string;
  time: string;
  students: number;
  callId: string;
  onStartSession: (callId: string) => void;
  onCopyInvitation: (callId: string) => void;
}) {
  return (
    <Card className="bg-[#232538] border-0 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="mb-1">
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
          Live Session
        </Badge>
      </div>
      <h3 className="mb-1 text-xl font-medium text-white">{title}</h3>
      <p className="mb-2 text-sm text-emerald-400">{course}</p>
      <p className="mb-6 text-gray-400">
        {date} - {time}
      </p>

      <div className="flex items-center mb-4">
        <div className="flex -space-x-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full bg-gray-500 border-2 border-[#232538] flex items-center justify-center text-xs text-white"
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="h-8 w-8 rounded-full bg-gray-700 border-2 border-[#232538] flex items-center justify-center text-xs text-white ml-1">
          +{students - 4}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          className="text-white bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onStartSession(callId)}
        >
          Start Session
        </Button>
        <Button
          variant="outline"
          className="text-gray-300 border-gray-700"
          onClick={() => onCopyInvitation(callId)}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Invitation
        </Button>
      </div>
    </Card>
  );
}
