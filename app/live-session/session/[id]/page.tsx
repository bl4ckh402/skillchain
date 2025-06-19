"use client";

import { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  StreamCall,
  useCallStateHooks,
  Call,
  useCall,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useVideo } from "@/context/StreamClientProvider";
import { Button } from "@/components/ui/button";
import PreJoinSetup from "@/components/PreJoinSetup";
import { CallContent } from "@/components/CallContent";
import { Loader, X, Users, Settings, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";

// Import the Stream Video React SDK styles
import "@stream-io/video-react-sdk/dist/css/styles.css";

function ParticipantsPanel() {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  const uniqueParticipants = useMemo(() => {
    const seen = new Set<string>();
    return participants.filter((participant) => {
      // Skip if we've already seen this user
      if (seen.has(participant.userId)) {
        return false;
      }
      seen.add(participant.userId);
      return true;
    });
  }, [participants]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        {uniqueParticipants.length} participant
        {uniqueParticipants.length !== 1 ? "s" : ""} in the session
      </p>

      <div className="space-y-2">
        {uniqueParticipants.map((participant) => {
          const displayName = participant.name || participant.userId;
          const initial = displayName[0]?.toUpperCase() || "?";

          return (
            <div
              key={participant.userId}
              className="flex items-center gap-3 p-2 hover:bg-[#2A2D3F] rounded-md"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-full">
                <span className="text-white">{initial}</span>
              </div>
              <div>
                <p className="text-white">{displayName}</p>
                <p className="text-xs text-gray-400">
                  {participant.isLocalParticipant ? "You" : "Participant"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsPanel() {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const micState = useMicrophoneState();
  const cameraState = useCameraState();
  const call = useCall();

  const handleMicrophoneChange = async (deviceId: string) => {
    try {
      await call?.microphone.select(deviceId);
    } catch (error) {
      console.error("Failed to change microphone:", error);
    }
  };

  const handleCameraChange = async (deviceId: string) => {
    try {
      await call?.camera.select(deviceId);
    } catch (error) {
      console.error("Failed to change camera:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 font-medium text-white">Device Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-400">
              Microphone
            </label>
            <select
              className="w-full bg-[#1A1D2D] text-white border border-gray-700 rounded-md p-2"
              value={micState.selectedDevice}
              onChange={(e) => handleMicrophoneChange(e.target.value)}
            >
              {micState.devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-400">Camera</label>
            <select
              className="w-full bg-[#1A1D2D] text-white border border-gray-700 rounded-md p-2"
              value={cameraState.selectedDevice}
              onChange={(e) => handleCameraChange(e.target.value)}
            >
              {cameraState.devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { joinCall, leaveCall, getCall } = useVideo();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callInstance, setCallInstance] = useState<Call | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null);
  const [meetingTime, setMeetingTime] = useState<string>("00:00");
  const [isPreJoinComplete, setIsPreJoinComplete] = useState(false);
  const [joinAttempted, setJoinAttempted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasJoinedRef = useRef(false);
  const startTimeRef = useRef<Date | null>(null);
  const client = useStreamVideoClient();

  // Get session ID from URL
  const sessionId = params?.id as string;

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID is missing");
      setLoading(false);
      return;
    }

    const initCall = async () => {
      try {
        // Check if we already have this call
        let call = getCall(sessionId);

        if (!call && client) {
          // Create the call (second parameter false means don't auto-join)
          call = await joinCall(sessionId, false);
        }

        if (!call) {
          throw new Error("Could not initialize session");
        }

        // Check if call is already ended
        if (call.state.callingState === "left") {
          throw new Error("This session has already ended");
        }

        setCallInstance(call);
        setLoading(false);
      } catch (err) {
        console.error("Failed to initialize session:", err);

        let errorMessage = "Failed to initialize the session.";

        if (err instanceof Error) {
          if (
            err.message.includes("not found") ||
            err.message.includes("ended") ||
            err.message.includes("Can't find call")
          ) {
            errorMessage = "This session doesn't exist or has already ended.";
          } else if (
            err.message.includes("permission") ||
            err.message.includes("token")
          ) {
            errorMessage = "Authentication error. Please sign in again.";
          } else if (err.message.includes("already ended")) {
            errorMessage = "This session has already ended.";
          }
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    initCall();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (sessionId && hasJoinedRef.current) {
        leaveCall(sessionId).catch(console.error);
      }
    };
  }, [sessionId, joinCall, getCall, leaveCall, client]);

  const handleJoinSession = async () => {
    if (!callInstance || joinAttempted) return;

    setJoinAttempted(true);

    try {
      // Check if already joined
      if (
        hasJoinedRef.current ||
        callInstance.state.callingState === "joined"
      ) {
        console.log("Already joined the session");
        hasJoinedRef.current = true;
        setIsPreJoinComplete(true);
        return;
      }

      console.log("Joining session...");

      await joinCall(sessionId, true);

      hasJoinedRef.current = true;
      setIsPreJoinComplete(true);

      // Start the meeting timer
      startTimeRef.current = new Date();
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = new Date();
          const diffMs = now.getTime() - startTimeRef.current.getTime();
          const minutes = Math.floor(diffMs / 60000);
          const seconds = Math.floor((diffMs % 60000) / 1000);
          setMeetingTime(
            `${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`
          );
        }
      }, 1000);
    } catch (err) {
      console.error("Failed to join session:", err);
      setJoinAttempted(false);

      let errorMessage = "Failed to join the session. Please try again.";

      if (err instanceof Error) {
        if (
          err.message.includes("permission") ||
          err.message.includes("token")
        ) {
          errorMessage = "Authentication error. Please sign in again.";
        } else if (
          err.message.includes("not found") ||
          err.message.includes("ended") ||
          err.message.includes("Can't find call")
        ) {
          errorMessage = "This session doesn't exist or has already ended.";
        } else if (err.message.includes("already a member")) {
          errorMessage = "You're already in this session.";
        }
      }

      setError(errorMessage);
    }
  };

  const handleLeaveSession = async () => {
    try {
      if (sessionId) {
        hasJoinedRef.current = false;
        await leaveCall(sessionId);

        // If user is instructor, update session status
        const sessionsQuery = query(
          collection(db, "sessions"),
          where("id", "==", sessionId)
        );
        const snapshot = await getDocs(sessionsQuery);

        if (!snapshot.empty) {
          const sessionDoc = snapshot.docs[0];
          const sessionData = sessionDoc.data();

          if (sessionData.instructorId === user?.uid) {
            await updateDoc(doc(db, "sessions", sessionDoc.id), {
              status: "ended",
            });
          }
        }
      }
      router.push("/live-session");
    } catch (err) {
      console.error("Error leaving session:", err);
      setError("Failed to leave session. Please try again.");
    }
  };

  const toggleSidebar = (panel: string) => {
    if (activeSidebar === panel) {
      setActiveSidebar(null);
    } else {
      setActiveSidebar(panel);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#202124] flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-10 w-10 animate-spin mx-auto mb-4 text-[#8ab4f8]" />
          <p className="text-xl text-white">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#202124] flex items-center justify-center">
        <div className="max-w-md p-6 text-center">
          <X className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="mb-3 text-2xl font-bold text-white">Session Error</h2>
          <p className="mb-6 text-gray-300">{error}</p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-[#8ab4f8] hover:bg-[#669df6] text-[#202124]"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!callInstance) return null;

  if (!isPreJoinComplete) {
    return (
      <StreamCall call={callInstance}>
        <PreJoinSetup onJoinAction={handleJoinSession} />
      </StreamCall>
    );
  }

  return (
    <StreamCall call={callInstance}>
      <div className="min-h-screen bg-[#1A1D2D] flex flex-col">
        <header className="bg-[#232538] px-4 py-3 flex justify-between items-center border-b border-gray-700 sticky top-0 z-10">
          <div className="flex items-center">
            <span className="text-sm font-medium text-white">
              {meetingTime}
            </span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-sm text-gray-400">{sessionId}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-[#3c4043] rounded-full h-9 w-9"
                    onClick={() => toggleSidebar("info")}
                  >
                    <Info className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Meeting details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        <div className="relative flex flex-row flex-1 h-full">
          <div className="flex-1 flex flex-col items-center justify-center relative bg-[#1A1D2D]">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full text-white">
                  <Loader className="mr-2 animate-spin" />
                  Loading call...
                </div>
              }
            >
              <CallContent onLeave={handleLeaveSession} />
            </Suspense>
          </div>

          <div className="hidden md:flex flex-col w-80 bg-[#232538] border-l border-gray-700 h-full">
            <Tabs defaultValue="participants" className="flex flex-col h-full">
              <TabsList className="grid grid-cols-2 bg-[#1D1F31] rounded-none">
                <TabsTrigger value="participants">
                  <Users className="w-4 h-4 mr-2" />
                  People
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="participants"
                className="flex-1 p-4 overflow-y-auto"
              >
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <Loader className="animate-spin" />
                    </div>
                  }
                >
                  <ParticipantsPanel />
                </Suspense>
              </TabsContent>
              <TabsContent
                value="settings"
                className="flex-1 p-4 overflow-y-auto"
              >
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <Loader className="animate-spin" />
                    </div>
                  }
                >
                  <SettingsPanel />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </StreamCall>
  );
}
