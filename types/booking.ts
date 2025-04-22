// types/booking.ts
import { DocumentReference, Timestamp } from 'firebase/firestore';

// Booking Status Enum
export enum BookingStatus {
  PENDING = 'pending',
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Instructor related types
export interface Instructor {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  bio?: string;
  specialties?: string[];
  hourlyRate?: number;
  rating?: number;
}

// Student related types
export interface Student {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

// Review types
export interface Review {
  rating: number;
  comment: string;
  createdAt: Timestamp | string | Date;
}

// Booking types
export interface BookingData {
  instructorId: string;
  topic: string;
  message?: string;
  date: Date | string;
  time: string;
  duration: string;
  price: string;
}

export interface BookingBase {
  userId: string;
  instructorRef: DocumentReference;
  topic: string;
  message: string;
  date: Timestamp;
  time: string;
  duration: string;
  status: BookingStatus;
  price: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  meetingLink?: string;
  recording?: string;
  cancellationReason?: string;
  hasLeftReview?: boolean;
  instructorMessage?: string;
  review?: Review;
}

export interface Booking {
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
  review?: Review;
  instructor?: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
  };
  student?: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Context types
export interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchUserBookings: () => Promise<void>;
  createBooking: (bookingData: BookingData) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, newStatus: BookingStatus, reason?: string | null) => Promise<boolean>;
  submitReview: (bookingId: string, rating: number, comment: string) => Promise<boolean>;
  deleteBooking: (bookingId: string) => Promise<boolean>;
  getFilteredBookings: (status: BookingStatus | 'all') => Booking[];
}