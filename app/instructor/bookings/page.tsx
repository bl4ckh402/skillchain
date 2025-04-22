"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/footer"
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  MessageSquare,
  ArrowRight,
  Bell,
  Loader2,
} from "lucide-react"
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from "@/context/AuthProvider"
import { Booking, BookingStatus } from "@/types/booking"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

type SortBy = "date-desc" | "date-asc" | "price-desc" | "price-asc";

export default function InstructorBookingsPage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BookingStatus | "all">(BookingStatus.UPCOMING);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("date-desc");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch instructor bookings
  const fetchInstructorBookings = async () => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the instructor document reference
      const instructorRef = doc(db, 'instructors', user.uid);
      
      // Create a query against the bookings collection for this instructor
      const q = query(
        collection(db, 'bookings'),
        where('instructorRef', '==', instructorRef),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const bookingsData: Booking[] = [];

      for (const bookingDoc of querySnapshot.docs) {
        const bookingData = bookingDoc.data();

        // Get student data
        try {
          const studentDoc = await getDoc(doc(db, 'users', bookingData.userId));
          const studentData = studentDoc.exists() ? studentDoc.data() : null;

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
            student: studentData ? {
              id: studentDoc.id,
              name: studentData.displayName || 'Student',
              avatar: studentData.photoURL,
              email: studentData.email,
            } : undefined,
            createdAt: bookingData.createdAt?.toDate?.() ? 
              bookingData.createdAt.toDate().toISOString() : undefined,
            updatedAt: bookingData.updatedAt?.toDate?.() ? 
              bookingData.updatedAt.toDate().toISOString() : undefined,
          });
        } catch (err) {
          console.error("Error getting student data:", err);
          // Still include the booking even if student data fails
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
      console.error("Error fetching instructor bookings: ", err);
      setError("Failed to fetch bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle booking response (accept/decline)
  const handleBookingResponse = async (bookingId: string, action: 'accept' | 'decline') => {
    if (!selectedBooking) return;
    
    setIsSubmitting(true);
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      if (action === 'accept') {
        // Generate a meeting link (in real app, you'd integrate with a video service)
        const meetingId = Math.random().toString(36).substring(2, 10);
        const meetingLink = `https://yourvideomeeting.com/${meetingId}`;
        
        // Update booking to upcoming status with meeting link
        await updateDoc(bookingRef, {
          status: BookingStatus.UPCOMING,
          meetingLink: meetingLink,
          instructorMessage: responseMessage || null,
          updatedAt: serverTimestamp(),
        });
        
        // Update local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { 
                  ...booking, 
                  status: BookingStatus.UPCOMING, 
                  meetingLink: meetingLink,
                  instructorMessage: responseMessage || undefined
                } 
              : booking
          )
        );
        
        toast({
          title: "Booking accepted",
          description: "You have successfully accepted this booking request.",
        });
      } else {
        // Update booking to cancelled status with reason
        await updateDoc(bookingRef, {
          status: BookingStatus.CANCELLED,
          cancellationReason: responseMessage || "Declined by instructor",
          updatedAt: serverTimestamp(),
        });
        
        // Update local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { 
                  ...booking, 
                  status: BookingStatus.CANCELLED, 
                  cancellationReason: responseMessage || "Declined by instructor"
                } 
              : booking
          )
        );
        
        toast({
          title: "Booking declined",
          description: "You have declined this booking request.",
        });
      }
      
      setIsDialogOpen(false);
      setResponseMessage("");
    } catch (error) {
      toast({
        title: "Error updating booking",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark booking as completed
  const markBookingAsCompleted = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      await updateDoc(bookingRef, {
        status: BookingStatus.COMPLETED,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: BookingStatus.COMPLETED } 
            : booking
        )
      );
      
      toast({
        title: "Session completed",
        description: "The session has been marked as completed.",
      });
    } catch (error) {
      toast({
        title: "Error completing session",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding recording link
  const addRecordingLink = async (bookingId: string, recordingLink: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      
      await updateDoc(bookingRef, {
        recording: recordingLink,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, recording: recordingLink } 
            : booking
        )
      );
      
      toast({
        title: "Recording added",
        description: "Recording link has been added to the session.",
      });
    } catch (error) {
      toast({
        title: "Error adding recording",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get filtered bookings based on active tab and search query
  const getFilteredBookings = (): Booking[] => {
    if (!Array.isArray(bookings)) {
      return [];
    }

    let filtered: Booking[] = [];

    // First filter by status
    if (activeTab === "all") {
      filtered = [...bookings];
    } else {
      filtered = bookings.filter(booking => booking.status === activeTab);
    }

    // Then filter by search query if present
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        (booking.student?.name?.toLowerCase().includes(query) || false) ||
        (booking.topic?.toLowerCase().includes(query) || false) ||
        (booking.message?.toLowerCase().includes(query) || false)
      );
    }

    // Sort the results
    return sortBookings(filtered, sortBy);
  };

  // Sort bookings based on selected criteria
  const sortBookings = (bookingsToSort: Booking[], sortCriteria: SortBy): Booking[] => {
    if (!bookingsToSort || bookingsToSort.length === 0) {
      return [];
    }
    
    const sorted = [...bookingsToSort];

    switch (sortCriteria) {
      case "date-desc":
        return sorted.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
      case "date-asc":
        return sorted.sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime());
      case "price-desc":
        return sorted.sort((a, b) => {
          const priceA = parseFloat((a.price || '0').replace(/[^0-9.-]+/g, ""));
          const priceB = parseFloat((b.price || '0').replace(/[^0-9.-]+/g, ""));
          return priceB - priceA;
        });
      case "price-asc":
        return sorted.sort((a, b) => {
          const priceA = parseFloat((a.price || '0').replace(/[^0-9.-]+/g, ""));
          const priceB = parseFloat((b.price || '0').replace(/[^0-9.-]+/g, ""));
          return priceA - priceB;
        });
      default:
        return sorted;
    }
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    try {
      if (!dateString) return "";
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return dateString || "";
    }
  };

  // Get status badge
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.UPCOMING:
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Confirmed
          </Badge>
        );
      case BookingStatus.PENDING:
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case BookingStatus.COMPLETED:
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case BookingStatus.CANCELLED:
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get filtered and sorted bookings
  const filteredBookings = getFilteredBookings();

  // Load instructor bookings when component mounts
  useEffect(() => {
    if (user) {
      fetchInstructorBookings();
    } else {
      setBookings([]);
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Manage Bookings</h1>
                <p className="text-muted-foreground">View and manage your one-on-one session bookings</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                  onClick={() => window.location.href = "/instructor/availability"}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Availability
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              <p className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </p>
              <Button 
                variant="link" 
                className="text-red-700 dark:text-red-400 p-0 h-auto mt-1" 
                onClick={fetchInstructorBookings}
              >
                Try again
              </Button>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as BookingStatus | "all")} className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                <TabsTrigger
                  value={BookingStatus.UPCOMING}
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value={BookingStatus.PENDING}
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value={BookingStatus.COMPLETED}
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value={BookingStatus.CANCELLED}
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                >
                  Cancelled
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                >
                  All Bookings
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search bookings..."
                    className="pl-9 border-blue-100 dark:border-blue-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                  <SelectTrigger className="w-[180px] border-blue-100 dark:border-blue-900">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-slate-600 dark:text-slate-400">Loading your bookings...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <Card key={booking.id} className="border-blue-100 dark:border-blue-900 overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4 p-6 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                            <div className="flex items-center gap-3 mb-4">
                              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarImage src={booking.student?.avatar} alt={booking.student?.name} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                  {booking.student?.name
                                    ? booking.student.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                    : "??"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-slate-800 dark:text-slate-200">
                                  {booking.student?.name || "Student"}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Student</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  {formatDate(booking.date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-teal-500" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  {booking.time} ({booking.duration})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {booking.status === BookingStatus.UPCOMING && <Video className="h-4 w-4 text-amber-500" />}
                                  {booking.status === BookingStatus.PENDING && <AlertCircle className="h-4 w-4 text-amber-500" />}
                                  {booking.status === BookingStatus.COMPLETED && <CheckCircle className="h-4 w-4 text-green-500" />}
                                  {booking.status === BookingStatus.CANCELLED && <XCircle className="h-4 w-4 text-red-500" />}
                                  {getStatusBadge(booking.status)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div>
                                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-1">
                                  {booking.topic}
                                </h3>
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge
                                    variant="secondary"
                                    className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                                  >
                                    Video Session
                                  </Badge>
                                  <span className="text-sm text-slate-500 dark:text-slate-400">{booking.price}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{booking.message}</p>
                              </div>
                            </div>

                            {booking.status === BookingStatus.COMPLETED && booking.review && (
                              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg mb-4">
                                <div className="flex items-center gap-1 mb-1">
                                  <div className="flex">
                                    {[...Array(booking.review.rating)].map((_, i) => (
                                      <svg
                                        key={i}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-4 h-4 text-amber-500"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    Student Review
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{booking.review.comment}</p>
                              </div>
                            )}

                            {booking.status === BookingStatus.CANCELLED && booking.cancellationReason && (
                              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg mb-4">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                                  Cancellation Reason:
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{booking.cancellationReason}</p>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                              {booking.status === BookingStatus.PENDING && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Decline
                                  </Button>
                                </div>
                              )}

                              {booking.status === BookingStatus.UPCOMING && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                                    onClick={() => window.open(booking.meetingLink, "_blank")}
                                    disabled={!booking.meetingLink}
                                  >
                                    <Video className="mr-2 h-4 w-4" />
                                    Join Session
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                  >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Message Student
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950 dark:hover:text-green-300"
                                    onClick={() => markBookingAsCompleted(booking.id)}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark as Completed
                                  </Button>
                                </div>
                              )}

                              {booking.status === BookingStatus.COMPLETED && (
                                <div className="flex items-center gap-2">
                                  {booking.recording ? (
                                    <Button
                                      variant="outline"
                                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                      onClick={() => window.open(booking.recording, "_blank")}
                                    >
                                      <Video className="mr-2 h-4 w-4" />
                                      View Recording
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                      onClick={() => {
                                        const recordingUrl = prompt("Enter the recording URL:");
                                        if (recordingUrl) {
                                          addRecordingLink(booking.id, recordingUrl);
                                        }
                                      }}
                                    >
                                      <Video className="mr-2 h-4 w-4" />
                                      Add Recording
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                  >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Follow Up
                                  </Button>
                                </div>
                              )}

                              <Button
                                variant="ghost"
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                onClick={() => window.location.href = `/instructor/bookings/${booking.id}`}
                              >
                                View Details
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        {activeTab === BookingStatus.UPCOMING && <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                        {activeTab === BookingStatus.PENDING && (
                          <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        )}
                        {activeTab === BookingStatus.COMPLETED && (
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        )}
                        {activeTab === BookingStatus.CANCELLED && <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />}
                        {activeTab === "all" && <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                        No {activeTab} bookings
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        {activeTab === BookingStatus.UPCOMING && "You don't have any upcoming sessions scheduled."}
                        {activeTab === BookingStatus.PENDING && "You don't have any pending booking requests."}
                        {activeTab === BookingStatus.COMPLETED && "You haven't completed any sessions yet."}
                        {activeTab === BookingStatus.CANCELLED && "You don't have any cancelled bookings."}
                        {activeTab === "all" && "You don't have any bookings yet."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedBooking?.status === BookingStatus.PENDING ? "Respond to Booking Request" : "Booking Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedBooking?.status === BookingStatus.PENDING
                ? "Accept or decline this booking request from " + selectedBooking?.student?.name
                : "View details for booking with " + selectedBooking?.student?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedBooking && (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">Session Details</h4>
                  <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Topic:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{selectedBooking.topic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Date:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(selectedBooking.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Time:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{selectedBooking.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {selectedBooking.duration}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Price:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{selectedBooking.price}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">Student Message</h4>
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedBooking.message}</p>
                  </div>
                </div>

                {selectedBooking.status === BookingStatus.PENDING && (
                  <div className="space-y-2">
                    <label htmlFor="response" className="text-sm font-medium">
                      Your Response (Optional)
                    </label>
                    <Textarea
                      id="response"
                      placeholder="Add a message to the student..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            {selectedBooking?.status === BookingStatus.PENDING ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleBookingResponse(selectedBooking.id, 'decline')}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button
                  onClick={() => handleBookingResponse(selectedBooking.id, 'accept')}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsDialogOpen(false)}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )}