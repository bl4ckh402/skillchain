import { Call } from '@stream-io/video-react-sdk';

export interface CallSession {
  id: string;
  title: string;
  callObject: Call | null;
  type: string;
  createdAt: Date;
  instructorId: string;
  status: 'active' | 'ended' | 'scheduled';
  participants: string[];
}