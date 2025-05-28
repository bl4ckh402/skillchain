import { Call } from "@stream-io/video-react-sdk";

export interface CallSession {
  id: string;
  docId?: string; // Firestore document ID
  title: string;
  type: string;
  createdAt: Date;
  scheduledFor?: Date;
  instructorId: string;
  status: "active" | "scheduled" | "ended" | "recording";
  participants: string[];
  recordingUrl?: string;
  isRecording: boolean;
  duration?: string;
  callObject: Call | null;
  views?: number;
  endedAt?: Date;
  invitedEmails?: string[];
  customMessage?: string;
}

export interface ParticipantInfo {
  id: string;
  name: string;
  email?: string;
  image?: string;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: "text" | "system";
}

export interface SessionInvite {
  sessionId: string;
  sessionTitle: string;
  instructorName: string;
  scheduledFor?: Date;
  joinLink: string;
  customMessage?: string;
}
