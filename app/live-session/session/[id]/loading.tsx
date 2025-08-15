"use client";

import { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  StreamCall,
  useCallStateHooks,
  Call,
  useStreamVideoClient,
  useCall,
} from "@stream-io/video-react-sdk";
import { useVideo } from "@/context/StreamClientProvider";
import { Button } from "@/components/ui/button";
import PreJoinSetup from "@/components/PreJoinSetup";
import { CallContent } from "@/components/CallContent";
import { Loader, X, Users, Settings, Info, ArrowLeft } from "lucide-react";
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
import "@stream-io/video-react-sdk/dist/css/styles.css";

interface User {
  uid: string;
  [key: string]: any;
}
function ParticipantsPanel() {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  const uniqueParticipants = useMemo(() => {
    const seen = new Set<string>();
    return participants.filter((participant) => {
      if (seen.has(participant.userId)) return false;
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
          const displayName =
            participant.name || participant.userId || "Unknown";
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
  const handleScreenShareChange = async (deviceId: string) => {
    try {
      if (call?.screenShare) {
        await call.screenShare.select();
      }
    } catch (error) {
      console.error("Failed to change screen share:", error);
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
              value={micState.selectedDevice || ""}
              onChange={(e) => handleMicrophoneChange(e.target.value)}
              aria-label="Select Microphone"
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
              value={cameraState.selectedDevice || ""}
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

function InfoPanel({ sessionId }: { sessionId: string }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-white">Meeting Details</h3>
      <p className="text-sm text-gray-400">Session ID: {sessionId}</p>
      <p className="text-sm text-gray-400">
        Join Link: {typeof window !== "undefined" ? window.location.href : ""}
      </p>
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

  const sessionId = params?.id as string;

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID is missing");
      setLoading(false);
      return;
    }
    if (!client) {
      setError("Video client not initialized");
      setLoading(false);
      return;
    }

    const initCall = async () => {
      try {
        let call = getCall(sessionId);
        if (!call) {
          try {
            call = await joinCall(sessionId, false);
          } catch (getError) {
            console.log("Call not found, creating new call...");
            const callObject = client.call("default", sessionId);
            await callObject.getOrCreate();
            call = callObject;
          }
        }

        if (!call) {
          throw new Error("Could not initialize session");
        }

        const callingState = call.state.callingState;
        if (callingState === "left" || callingState === "unknown") {
          throw new Error("This session has already ended or is invalid");
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
      const callingState = callInstance.state.callingState;
      if (
        hasJoinedRef.current ||
        callingState === "joined" ||
        callingState === "joining"
      ) {
        console.log("Already joined or joining the session");
        hasJoinedRef.current = true;
        setIsPreJoinComplete(true);
        return;
      }

      console.log("Joining session...");
      await callInstance.join();

      hasJoinedRef.current = true;
      setIsPreJoinComplete(true);

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
      if (sessionId && hasJoinedRef.current) {
        hasJoinedRef.current = false;
        await leaveCall(sessionId);
        if (user?.uid) {
          const sessionsQuery = query(
            collection(db, "sessions"),
            where("id", "==", sessionId)
          );
          const snapshot = await getDocs(sessionsQuery);
          if (!snapshot.empty) {
            const sessionDoc = snapshot.docs[0];
            const sessionData = sessionDoc.data();
            if (sessionData.instructorId === user.uid) {
              await updateDoc(doc(db, "sessions", sessionDoc.id), {
                status: "ended",
              });
            }
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
    setActiveSidebar(activeSidebar === panel ? null : panel);
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
            aria-label="Return to dashboard"
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
        <div className="min-h-screen bg-[#1A1D2D] flex flex-col">
          <header className="bg-[#232538] px-4 py-3 flex justify-between items-center border-b border-gray-700 sticky top-0 z-10">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
            <span className="text-sm text-gray-400">Session Setup</span>
          </header>
          <div className="flex items-center justify-center flex-1 p-4">
            <PreJoinSetup onJoinAction={handleJoinSession} />
          </div>
        </div>
      </StreamCall>
    );
  }

  const sidebarClass = `fixed top-0 right-0 h-full w-80 bg-[#232538] border-l border-gray-700 transform ${
    activeSidebar ? "translate-x-0" : "translate-x-full"
  } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:block z-50 max-h-full overflow-y-auto`;

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
                    onClick={() => toggleSidebar("participants")}
                    aria-label="View participants"
                  >
                    <Users className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Participants</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-[#3c4043] rounded-full h-9 w-9"
                    onClick={() => toggleSidebar("settings")}
                    aria-label="View settings"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-[#3c4043] rounded-full h-9 w-9"
                    onClick={() => toggleSidebar("info")}
                    aria-label="View meeting details"
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

        <div className="relative flex flex-1 overflow-hidden">
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
          <div className={sidebarClass}>
            <div className="flex justify-end p-2 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveSidebar(null)}
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>
            <Tabs
              defaultValue={activeSidebar || "participants"}
              className="flex flex-col h-full"
            >
              <TabsList className="grid grid-cols-3 bg-[#1D1F31] rounded-none">
                <TabsTrigger value="participants">People</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="info">Details</TabsTrigger>
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
              <TabsContent value="info" className="flex-1 p-4 overflow-y-auto">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <Loader className="animate-spin" />
                    </div>
                  }
                >
                  <InfoPanel sessionId={sessionId || ""} />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </StreamCall>
  );
}
