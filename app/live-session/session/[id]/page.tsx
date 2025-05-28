"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  StreamCall,
  useCallStateHooks,
  Call,
  useCall,
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

  // Track unique participants by userId
  const uniqueParticipants = participants.reduce((acc, participant) => {
    if (!acc.some((p) => p.userId === participant.userId)) {
      acc.push(participant);
    }
    return acc;
  }, [] as typeof participants);

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
  const { joinCall, leaveCall, endCall, getCall } = useVideo();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callInstance, setCallInstance] = useState<Call | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null);
  const [meetingTime, setMeetingTime] = useState<string>("00:00");
  const [isPreJoinComplete, setIsPreJoinComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasJoinedRef = useRef(false);

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

        if (!call) {
          // Initialize the call without joining
          call = await joinCall(sessionId, true);
        }

        if (!call) {
          throw new Error("Could not initialize session");
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setCallInstance(call);
        setLoading(false);
      } catch (err) {
        // Handle different error scenarios
        let errorMessage =
          "Failed to initialize the session. The session may have ended or is invalid.";

        if (err instanceof Error && err.message) {
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
            errorMessage =
              "Authentication error. Please refresh the page or sign in again.";
          }
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    //     console.error("Failed to initialize session:", err);
    //     setError(
    //       "Failed to initialize the session. The session may have ended or is invalid."
    //     );
    //     setLoading(false);
    //   }
    // };

    initCall();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (sessionId && hasJoinedRef.current) {
        leaveCall(sessionId).catch(console.error);
      }
    };
  }, [sessionId, joinCall, getCall, leaveCall]);

  const handleJoinSession = async () => {
    if (!callInstance || hasJoinedRef.current) return;

    try {
      // Check current call state more thoroughly
      const currentState = callInstance.state.callingState;
      console.log("Current call state before joining:", currentState);

      // Directly call join() if not already joined

      if (callInstance.state.callingState === "joined") {
        console.log("Already joined the session, updating state.");
        //await callInstance.join();
        hasJoinedRef.current = true;
        setIsPreJoinComplete(true);
        return;
      }

      // Log the call state before joining
      console.log("Call state before joining:", callInstance.state);

      // Directly call join() if not already joined
      await callInstance.join();
      hasJoinedRef.current = true;
      setIsPreJoinComplete(true);
    } catch (err) {
      console.error("Failed to join session:", err);

      // More detailed error handling with specific user messages
      let errorMessage = "Failed to join the session. Please try again.";
      // Check for specific error conditions
      if (err instanceof Error) {
        if (err.message.includes("already joined")) {
          console.log("Already joined error caught, trying to continue");
          hasJoinedRef.current = true;
          setIsPreJoinComplete(true);
          return;
        }
        const error = err as Error;
        if (error.message && typeof error.message === "string") {
          if (
            error.message.includes("permission") ||
            error.message.includes("token")
          ) {
            errorMessage =
              "Authentication error. Please refresh the page or sign in again.";
          } else if (
            error.message.includes("not found") ||
            error.message.includes("ended") ||
            error.message.includes("Can't find call")
          ) {
            errorMessage = "This session may have ended or been canceled.";
          }
        }

        setError(errorMessage);
      }
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

  // Show pre-join setup if not completed
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
              fallback={<div className="text-white">Loading call...</div>}
            >
              <CallContent onLeave={handleLeaveSession} />
            </Suspense>
          </div>

          <div className="hidden md:flex flex-col w-80 bg-[#232538] border-l border-gray-700 h-full">
            <Tabs defaultValue="participants" className="flex flex-col h-full">
              <TabsList className="grid grid-cols-2 bg-[#1D1F31] rounded-none">
                <TabsTrigger value="participants">
                  <Users className="w-4 h-4 mr-2" />
                  Participants
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
                <Suspense fallback={<div>Loading participants...</div>}>
                  <ParticipantsPanel />
                </Suspense>
              </TabsContent>
              <TabsContent
                value="settings"
                className="flex-1 p-4 overflow-y-auto"
              >
                <Suspense fallback={<div>Loading settings...</div>}>
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
