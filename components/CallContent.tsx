'use client';

import { useEffect } from 'react';
import { CallControls, SpeakerLayout, useCall } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';

interface CallContentProps {
  onLeave?: () => void;
}

export function CallContent({ onLeave }: CallContentProps) {
  const router = useRouter();
  const call = useCall();

  if (!call) {
    throw new Error('CallContent must be used within a StreamCall component');
  }

  useEffect(() => {
    // Enable camera and mic by default when joining
    call.camera.enable();
    call.microphone.enable();

    return () => {
      // Cleanup: disable camera and mic when component unmounts
      call.camera.disable();
      call.microphone.disable();
    };
  }, [call]);

  const handleLeave = () => {
    if (onLeave) {
      onLeave();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      <div className="flex-1">
        <SpeakerLayout 
          participantsBarPosition="right"
          mirrorLocalParticipantVideo={true}
          pageArrowsVisible={true}
          muted={false}
        />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-20">
        <CallControls onLeave={handleLeave} />
      </div>
    </div>
  );
}