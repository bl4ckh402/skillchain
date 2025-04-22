// types/instructor-booking.ts
import { BookingStatus } from './booking';

export interface Student {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface InstructorBooking {
  id: string;
  userId: string;
  topic: string;
  message: string;
  date: string;
  time: string;
  duration: string;
  status: BookingStatus;
  price: string;
  meetingLink?: string;
  recording?: string;
  cancellationReason?: string;
  hasLeftReview?: boolean;
  instructorMessage?: string;
  review?: {
    rating: number;
    comment: string;
    createdAt: string | Date;
  };
  student?: Student;
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailabilitySlot {
  id: string;
  day: number; // 0-6 for Sunday-Saturday
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string; // Format: "HH:MM" in 24-hour format
  isAvailable: boolean;
}

export interface AvailabilitySettings {
  instructorId: string;
  slots: AvailabilitySlot[];
  bufferTime: number; // Minutes between sessions
  advanceBookingDays: number; // How many days in advance bookings can be made
  sessionDurations: string[]; // Available session durations (e.g., "30 minutes", "60 minutes")
  pricing: {
    [duration: string]: number; // Map of duration to price
  };
  autoAccept: boolean; // Whether to automatically accept bookings that fit availability
}