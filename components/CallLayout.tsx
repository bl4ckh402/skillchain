'use client';

import { useEffect, useState } from 'react';
import {
  useCall,
  useCallStateHooks,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  ParticipantView,
  StreamVideoParticipant,
  CallControls,
} from '@stream-io/video-react-sdk';
import EndCallButton from './EndCallButton';
import { ResizablePanelGroup, ResizablePanel } from '@/components/ui/resizable';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Camera, CameraOff, MonitorUp } from 'lucide-react';

interface Message {
  id: string;
  user: {
    id: string;
    name?: string;
  };
  text: string;
  timestamp: Date;
}

const FloatingLocalParticipant = ({ participant }: { participant?: StreamVideoParticipant }) => {
  if (!participant) return null;
  
  return (
    <div className="fixed top-4 left-4 w-[240px] h-[135px] shadow-lg rounded-xl overflow-hidden z-10">
      <div className="w-full h-full" style={{ aspectRatio: '16/9' }}>
        <ParticipantView 
          participant={participant}
          muteAudio={false}
        />
      </div>
    </div>
  );
};

export default function CallLayout() {
  const call = useCall();
  const { useLocalParticipant, useParticipants, useCallCallingState } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const participants = useParticipants();
  const callingState = useCallCallingState();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white">Connecting to call...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Call Controls Header */}
      <header className="flex items-center justify-between p-4 bg-slate-900">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">Live Class</h1>
          <div className="text-sm text-slate-400">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CallControls />
          <EndCallButton />
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Main Video Area */}
        <ResizablePanel defaultSize={75} minSize={50}>
          <div className="relative h-full">
            <div className="h-full bg-slate-900">
              <SpeakerLayout participantsBarPosition="bottom" />
            </div>
            <FloatingLocalParticipant participant={localParticipant} />
          </div>
        </ResizablePanel>

        {/* Chat Area */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <Card className="h-full rounded-none border-l border-slate-800">
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-800 p-4">
                <h2 className="font-semibold text-white">Chat</h2>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{msg.user.name}</span>
                        <span className="text-xs text-slate-400">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t border-slate-800 p-4">
                <form className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-400"
                  />
                  <Button type="submit" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}