"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthProvider';
import { 
  Booking, 
  BookingBase, 
  BookingContextType, 
  BookingData, 
  BookingStatus 
} from '@/types/booking';

// Create BookingContext with proper typing and default values
const BookingContext = createContext<BookingContextType>({
  bookings: [],
  loading: false,
  error: null,
  fetchUserBookings: async () => {},
  createBooking: async () => ({ 
    id: '', 
    userId: '', 
    topic: '', 
    message: '', 
    date: '', 
    time: '', 
    duration: '', 
    status: BookingStatus.PENDING, 
    price: ''
  }),
  updateBookingStatus: async () => false,
  submitReview: async () => false,
  deleteBooking: async () => false,
  getFilteredBookings: () => [],
});

// Props type for the provider component
interface BookingProviderProps {
  children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all bookings for the current user
  const fetchUserBookings = async (): Promise<void> => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a query against the bookings collection for this user
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const bookingsData: Booking[] = [];

      for (const bookingDoc of querySnapshot.docs) {
        const bookingData = bookingDoc.data() as BookingBase;

        // Get instructor data
        try {
          const instructorDoc = bookingData.instructorRef ? 
            await getDoc(bookingData.instructorRef) : null;
          
          const instructorData = instructorDoc && instructorDoc.exists() ? 
            instructorDoc.data() : null;

          bookingsData.push({
            id: bookingDoc.id,
            userId: bookingData.userId,
            topic: bookingData.topic || '',
            message: bookingData.message || '',
            date: bookingData.date?.toDate ? 
              bookingData.date.toDate().toISOString().split('T')[0] : '',
            time: bookingData.time || '',
            duration: bookingData.duration || '',
            status: bookingData.status || BookingStatus.PENDING,
            price: bookingData.price || '',
            meetingLink: bookingData.meetingLink,
            recording: bookingData.recording,
            cancellationReason: bookingData.cancellationReason,
            hasLeftReview: bookingData.hasLeftReview,
            review: bookingData.review,
            instructor: instructorData ? {
              id: instructorDoc?.id || '',
              name: instructorData.name || '',
              avatar: instructorData.avatar,
              title: instructorData.title,
            } : undefined,
            createdAt: bookingData.createdAt?.toDate?.() ? 
              bookingData.createdAt.toDate().toISOString() : undefined,
            updatedAt: bookingData.updatedAt?.toDate?.() ? 
              bookingData.updatedAt.toDate().toISOString() : undefined,
          });
        } catch (err) {
          console.error("Error getting instructor data:", err);
          // Still include the booking even if instructor data fails
          bookingsData.push({
            id: bookingDoc.id,
            userId: bookingData.userId,
            topic: bookingData.topic || '',
            message: bookingData.message || '',
            date: bookingData.date?.toDate ? 
              bookingData.date.toDate().toISOString().split('T')[0] : '',
            time: bookingData.time || '',
            duration: bookingData.duration || '',
            status: bookingData.status || BookingStatus.PENDING,
            price: bookingData.price || '',
            meetingLink: bookingData.meetingLink,
            recording: bookingData.recording,
            cancellationReason: bookingData.cancellationReason,
            hasLeftReview: bookingData.hasLeftReview,
            review: bookingData.review,
          });
        }
      }

      setBookings(bookingsData);
    } catch (err) {
      console.error("Error fetching bookings: ", err);
      setError("Failed to fetch bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Create a new booking
  const createBooking = async (bookingData: BookingData): Promise<Booking> => {
    if (!user) throw new Error("User must be logged in to create a booking");

    try {
      // Reference to the instructor
      const instructorRef = doc(db, 'instructors', bookingData.instructorId);
      
      // Create the booking document
      const newBooking: BookingBase = {
        userId: user.uid,
        instructorRef: instructorRef,
        topic: bookingData.topic,
        message: bookingData.message || "",
        date: typeof bookingData.date === 'string' 
          ? Timestamp.fromDate(new Date(bookingData.date))
          : Timestamp.fromDate(bookingData.date),
        time: bookingData.time,
        duration: bookingData.duration || "60 minutes",
        status: BookingStatus.PENDING,
        price: bookingData.price,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(db, 'bookings'), newBooking);
      
      // Get the instructor data
      let instructorData;
      try {
        const instructorDoc = await getDoc(instructorRef);
        instructorData = instructorDoc.exists() ? instructorDoc.data() : null;
      } catch (err) {
        console.error("Error getting instructor data:", err);
      }
      
      // Return the newly created booking with its ID
      return {
        id: docRef.id,
        userId: user.uid,
        topic: bookingData.topic,
        message: bookingData.message || "",
        date: typeof bookingData.date === 'string' 
          ? bookingData.date 
          : bookingData.date.toISOString().split('T')[0],
        time: bookingData.time,
        duration: bookingData.duration || "60 minutes",
        status: BookingStatus.PENDING,
        price: bookingData.price,
        instructor: instructorData ? {
          id: bookingData.instructorId,
          name: instructorData.name || '',
          avatar: instructorData.avatar,
          title: instructorData.title,
        } : undefined,
      };
    } catch (error) {
      console.error("Error creating booking: ", error);
      throw error;
    }
  };

  // Update booking status
  const updateBookingStatus = async (
    bookingId: string, 
    newStatus: BookingStatus, 
    reason: string | null = null
  ): Promise<boolean> => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      const updateData: Record<string, any> = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      
      // If there's a cancellation reason, add it
      if (newStatus === BookingStatus.CANCELLED && reason) {
        updateData.cancellationReason = reason;
      }
      
      await updateDoc(bookingRef, updateData);
      
      // Update the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus, cancellationReason: reason || booking.cancellationReason } 
            : booking
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error updating booking status: ", error);
      throw error;
    }
  };

  // Submit a review for a completed booking
  const submitReview = async (
    bookingId: string, 
    rating: number, 
    comment: string
  ): Promise<boolean> => {
    if (!user) throw new Error("User must be logged in to submit a review");
    
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error("Booking not found");
      }
      
      const bookingData = bookingDoc.data() as BookingBase;
      
      // Check if the booking is completed
      if (bookingData.status !== BookingStatus.COMPLETED) {
        throw new Error("Can only review completed bookings");
      }
      
      // Add review to the booking
      const reviewTimestamp = serverTimestamp();
      await updateDoc(bookingRef, {
        review: {
          rating,
          comment,
          createdAt: reviewTimestamp,
        },
        hasLeftReview: true,
        updatedAt: reviewTimestamp,
      });
      
      // Also add the review to the instructor's reviews collection
      if (bookingData.instructorRef) {
        const reviewData = {
          bookingId,
          userId: user.uid,
          rating,
          comment,
          createdAt: reviewTimestamp,
        };
        
        await addDoc(
          collection(db, 'instructors', bookingData.instructorRef.id, 'reviews'), 
          reviewData
        );
      }
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { 
                ...booking, 
                hasLeftReview: true, 
                review: {
                  rating,
                  comment,
                  createdAt: new Date().toISOString(),
                }
              } 
            : booking
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error submitting review: ", error);
      throw error;
    }
  };

  // Delete a booking (only if it's pending)
  const deleteBooking = async (bookingId: string): Promise<boolean> => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error("Booking not found");
      }
      
      const bookingData = bookingDoc.data() as BookingBase;
      
      // Only allow deletion of pending bookings
      if (bookingData.status !== BookingStatus.PENDING) {
        throw new Error("Only pending bookings can be deleted");
      }
      
      // Delete the booking
      await deleteDoc(bookingRef);
      
      // Update local state
      setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId));
      
      return true;
    } catch (error) {
      console.error("Error deleting booking: ", error);
      throw error;
    }
  };

  // Function to get filtered bookings based on status
  const getFilteredBookings = (status: BookingStatus | 'all'): Booking[] => {
    if (status === 'all') return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  // Load bookings when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchUserBookings();
    } else {
      setBookings([]);
    }
  }, [user]);

  // Context value
  const value: BookingContextType = {
    bookings,
    loading,
    error,
    fetchUserBookings,
    createBooking,
    updateBookingStatus,
    submitReview,
    deleteBooking,
    getFilteredBookings,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

// Custom hook to use the booking context
export function useBookings(): BookingContextType {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}

// Export the booking status enum
export { BookingStatus };