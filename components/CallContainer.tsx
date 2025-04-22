'use client';

import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { StreamCall, StreamVideo, StreamTheme } from '@stream-io/video-react-sdk';
import CallLayout from './CallLayout';
import { useState, useEffect } from 'react';

// Import the styles for Stream's UI components
import '@stream-io/video-react-sdk/dist/css/styles.css';

interface CallContainerProps {
  callId: string;
}

export default function CallContainer({ callId }: CallContainerProps) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<any>(null);

  useEffect(() => {
    if (!client || !callId) return;

    const streamCall = client.call('default', callId);
    streamCall.join({ create: true }).then(() => {
      setCall(streamCall);
    }).catch(error => {
      console.error('Error joining call:', error);
    });

    return () => {
      streamCall.leave();
    };
  }, [client, callId]);

  if (!call) {
    return <div>Loading call...</div>;
  }

  return (
    <StreamCall call={call}>
      <StreamTheme>
        <CallLayout />
      </StreamTheme>
    </StreamCall>
  );
}