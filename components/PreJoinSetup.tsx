"use client";

import { useState, useEffect } from "react";
import {
  DeviceSettings,
  VideoPreview,
  useCall
} from "@stream-io/video-react-sdk";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface PreJoinSetupProps {
  onJoinAction: () => void;
}

export default function PreJoinSetup({ onJoinAction }: PreJoinSetupProps) {
  const call = useCall();
  const [isDevicesReady, setIsDevicesReady] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  if (!call) {
    throw new Error("PreJoinSetup must be used within a StreamCall component");
  }

  useEffect(() => {
    // Request permissions and setup devices
    const setupDevices = async () => {
      try {
        // Request camera and microphone permissions
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setIsDevicesReady(true);
      } catch (err) {
        console.error("Error getting media devices:", err);
        // Still allow joining even if permissions are denied
        setIsDevicesReady(true);
      }
    };

    setupDevices();

    // Cleanup function
    return () => {
      call.camera.disable();
      call.microphone.disable();
    };
  }, [call]);

  const handleJoin = () => {
    // Apply initial device states before joining
    if (isAudioEnabled) {
      call.microphone.enable();
    } else {
      call.microphone.disable();
    }

    if (isVideoEnabled) {
      call.camera.enable();
    } else {
      call.camera.disable();
    }

    onJoinAction();
  };

  if (!isDevicesReady) {
    return (
      <div className="min-h-screen bg-[#202124] flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-10 w-10 animate-spin mx-auto mb-4 text-[#8ab4f8]" />
          <p className="text-xl text-white">Setting up your devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#202124] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to join?</h2>
          <p className="text-gray-400">Check your audio and video</p>
        </div>

        <div className="bg-[#232538] rounded-lg p-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
            <VideoPreview />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-white flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAudioEnabled}
                  onChange={(e) => setIsAudioEnabled(e.target.checked)}
                  className="rounded border-gray-700"
                />
                Enable microphone
              </label>
              <label className="text-white flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isVideoEnabled}
                  onChange={(e) => setIsVideoEnabled(e.target.checked)}
                  className="rounded border-gray-700"
                />
                Enable camera
              </label>
            </div>

            <DeviceSettings />
          </div>
        </div>

        <Button
          onClick={handleJoin}
          className="w-full bg-[#8ab4f8] hover:bg-[#669df6] text-[#202124]"
        >
          Join Session
        </Button>
      </div>
    </div>
  );
}