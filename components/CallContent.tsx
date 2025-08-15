"use client";

import { useEffect, useState } from "react";
import {
  CallControls,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  Video,
  VideoOff,
} from "lucide-react";

interface CallContentProps {
  onLeave?: () => void;
}

export function CallContent({ onLeave }: CallContentProps) {
  const call = useCall();
  const { useLocalParticipant, useParticipants } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const participants = useParticipants();
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Initialize video and audio states
  useEffect(() => {
    if (call) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((videoStream) => call.publishVideoStream(videoStream))
        .catch(console.error);
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((audioStream) => call.publishAudioStream(audioStream))
        .catch(console.error);
    }
  }, [call]);

  const toggleVideo = async () => {
    if (!call) return;
    try {
      if (isVideoEnabled) {
        await call.camera.disable();
      } else {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        await call.publishVideoStream(videoStream);
      }
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  const toggleAudio = async () => {
    if (!call) return;
    try {
      if (isAudioEnabled) {
        await call.camera.disable();
        // OR you can use mic.disable() if available
      } else {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        await call.publishAudioStream(audioStream);
      }
      setIsAudioEnabled(!isAudioEnabled);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  const toggleScreenShare = async () => {
    if (!call) return;
    try {
      if (isScreenSharing) {
        await call.screenShare.disable();
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        await call.publishScreenShareStream(stream);
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Video Grid */}
      <div className="flex-1 p-4">
        <SpeakerLayout />
      </div>
      {/* Controls Bar */}
      <div className="flex items-center justify-center gap-4 p-4 bg-[#232538]">
        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? "outline" : "destructive"}
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          {isAudioEnabled ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? "outline" : "destructive"}
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          {isVideoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          onClick={toggleScreenShare}
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          {isScreenSharing ? (
            <ScreenShare className="w-5 h-5 text-blue-500" />
          ) : (
            <ScreenShare className="w-5 h-5" />
          )}
        </Button>

        <Button
          onClick={onLeave}
          variant="destructive"
          size="icon"
          className="w-12 h-12 rounded-full"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
