"use client";

import { useEffect, useState, useCallback } from "react";
import {
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
} from "lucide-react";

interface CallContentProps {
  onLeave?: () => void;
}

export function CallContent({ onLeave }: CallContentProps) {
  const call = useCall();
  const {
    useMicrophoneState,
    useCameraState,
    useScreenShareState,
    useParticipants,
  } = useCallStateHooks();
  const participants = useParticipants();
  // Get real-time states from the SDK hooks
  const {
    status: micStatus,
    microphone,
    isMute: isMuted,
  } = useMicrophoneState();
  const {
    status: cameraStatus,
    camera,
    isMute: isCameraMuted,
  } = useCameraState();
  const { status: screenShareStatus } = useScreenShareState();

  // Track device initialization state
  const [devicesReady, setDevicesReady] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  // Use the more reliable state indicators
  const isMicEnabled = !isMuted && micStatus === "enabled";
  const isCameraEnabled = !isCameraMuted && cameraStatus === "enabled";

  useEffect(() => {
    if (!call) return;

    const initializeDevices = async () => {
      try {
        const maxAttempts = 10;
        let attempts = 0;

        const waitForCallReady = () => {
          return new Promise<void>((resolve, reject) => {
            const checkState = () => {
              attempts++;
              const state = call.state.callingState;
              console.log(
                `Device init attempt ${attempts}: Call state is ${state}`
              );

              if (state === "joined") {
                resolve();
              } else if (attempts >= maxAttempts) {
                reject(new Error("Call not ready after max attempts"));
              } else {
                setTimeout(checkState, 500);
              }
            };
            checkState();
          });
        };

        await waitForCallReady();

        // Additional small delay for stability
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Enable devices individually with proper error handling
        console.log("Enabling devices...");

        try {
          await call.camera.enable();
          console.log("Camera enabled");
        } catch (cameraError) {
          console.warn("Camera enable failed:", cameraError);
        }

        try {
          if (call) {
            await call.microphone.enable();
          }
          console.log("Microphone enabled");
        } catch (micError) {
          console.warn("Microphone enable failed:", micError);
        }

        setDevicesReady(true);
        console.log("Devices initialization completed");
      } catch (error) {
        console.error("Device initialization failed:", error);
        setDevicesReady(true);
      }
    };

    // Only initialize once per call instance
    if (!initializationAttempted) {
      setInitializationAttempted(true);
      initializeDevices();
    }
  }, [call, initializationAttempted]);

  /**
   * Fixed microphone toggle - using direct API calls
   */
  const toggleMicrophone = useCallback(async () => {
    if (!call || !devicesReady) {
      console.warn("Call not ready for microphone toggle");
      return;
    }

    try {
      if (isMuted || micStatus === "disabled") {
        await call.microphone.enable();
      } else {
        await call.microphone.disable();
      }
    } catch (error) {
      console.error("Microphone toggle error:", error);
    }
  }, [call, devicesReady, micStatus, isMuted, microphone]);

  /**
   * Fixed camera toggle - using direct API calls
   */
  const { status: currentCameraStatus, isMute: currentIsCameraMuted } =
    useCameraState();

  const toggleCamera = useCallback(async () => {
    if (!call || !devicesReady) {
      console.warn("Call not ready for camera toggle");
      return;
    }

    try {
      if (currentIsCameraMuted || currentCameraStatus === "disabled") {
        await call.camera.enable();
      } else {
        await call.camera.disable();
      }
    } catch (error) {
      console.error("Camera toggle error:", error);
    }
  }, [call, devicesReady, currentCameraStatus, currentIsCameraMuted]);

  // Use the more reliable state indicators
  const isScreenSharing = screenShareStatus === "enabled";

  /**
   * Screen sharing toggle
   */
  const toggleScreenShare = useCallback(async () => {
    if (!call) return;

    try {
      if (isScreenSharing) {
        await call.screenShare.disable();
        console.log("Screen sharing stopped");
      } else {
        await call.screenShare.enable();
        console.log("Screen sharing started");
      }
    } catch (error) {
      console.error("Screen share toggle error:", error);
    }
  }, [call, isScreenSharing]);

  /**
   * Leave call with cleanup
   */
  const handleLeaveCall = useCallback(async () => {
    if (!call) {
      onLeave?.();
      return;
    }

    try {
      console.log("Leaving call...");

      // Quick cleanup - don't wait too long
      await Promise.race([
        Promise.all([
          call.camera
            .disable()
            .catch((e: any) => console.warn("Camera disable failed:", e)),
          call.microphone
            .disable()
            .catch((e: any) => console.warn("Mic disable failed:", e)),
          isScreenSharing
            ? call.screenShare
                .disable()
                .catch((e: any) =>
                  console.warn("Screen share disable failed:", e)
                )
            : Promise.resolve(),
        ]),
        new Promise((resolve) => setTimeout(resolve, 1500)), // 1.5 second timeout
      ]);

      await call.leave();
      console.log("Left call successfully");
    } catch (error) {
      console.error("Leave call error:", error);
    } finally {
      onLeave?.();
    }
  }, [call, isScreenSharing, onLeave]);

  // Filter participants to remove duplicates
  interface Participant {
    userId: string;
    [key: string]: any; // Allow other properties
  }

  // Make sure participants is defined before using it
  const uniqueParticipants = (participants as Participant[]).filter(
    (participant: Participant, index: number, self: Participant[]) =>
      index ===
      self.findIndex((p: Participant) => p.userId === participant.userId)
  );

  console.log(
    "Participants:",
    participants.length,
    "Unique:",
    uniqueParticipants.length
  );

  return (
    <div className="flex flex-col h-full">
      {/* Video Layout with duplicate prevention */}
      <div className="flex-1 bg-[#1A1D2D] relative overflow-hidden">
        {devicesReady ? (
          <SpeakerLayout
            participantsBarPosition="bottom"
            participantsBarLimit={undefined}
            ParticipantViewUIBar={null}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-white">
              Joining call... ({participants.length} participants)
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-[#232538] border-t border-gray-700">
        {/* Microphone */}
        <Button
          onClick={toggleMicrophone}
          variant={isMicEnabled ? "outline" : "destructive"}
          size="icon"
          className="w-12 h-12 transition-all rounded-full hover:scale-105"
          disabled={!devicesReady}
          title={isMicEnabled ? "Mute microphone" : "Unmute microphone"}
        >
          {isMicEnabled ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </Button>

        {/* Camera */}
        <Button
          onClick={toggleCamera}
          variant={isCameraEnabled ? "outline" : "destructive"}
          size="icon"
          className="w-12 h-12 transition-all rounded-full hover:scale-105"
          disabled={!devicesReady}
          title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {isCameraEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </Button>

        {/* Screen Share */}
        <Button
          onClick={toggleScreenShare}
          variant={isScreenSharing ? "default" : "outline"}
          size="icon"
          className={`w-12 h-12 rounded-full transition-all hover:scale-105 ${
            isScreenSharing ? "bg-blue-600 hover:bg-blue-700" : ""
          }`}
          disabled={!devicesReady}
          title={isScreenSharing ? "Stop screen share" : "Start screen share"}
        >
          {isScreenSharing ? (
            <ScreenShareOff className="w-5 h-5" />
          ) : (
            <ScreenShare className="w-5 h-5" />
          )}
        </Button>

        {/* Leave */}
        <Button
          onClick={handleLeaveCall}
          variant="destructive"
          size="icon"
          className="w-12 h-12 transition-all rounded-full hover:scale-105"
          title="Leave call"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
function useCameraState(): { status: any; isMute: any } {
  throw new Error("Function not implemented.");
}

function onLeave() {
  throw new Error("Function not implemented.");
}
