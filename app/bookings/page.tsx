"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
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
  Users,
  ArrowRight,
  Star,
  Download,
  Loader2,
} from "lucide-react"
import { useBookings, BookingStatus } from "@/context/BookingProvider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Booking } from "@/types/booking"

type SortBy = "date-desc" | "date-asc" | "price-desc" | "price-asc";

export default function StudentBookingsPage() {
  const {
    bookings = [], // Provide a default empty array
    loading,
    error,
    fetchUserBookings,
    updateBookingStatus,
    submitReview,
  } = useBookings();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<BookingStatus | "all">(BookingStatus.UPCOMING);
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("date-desc");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle tab change and reset search/sort
  const handleTabChange = (tab: BookingStatus | "all") => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  // Get filtered bookings based on active tab and search query
  const getFilteredBookings = (): Booking[] => {
    // Make sure bookings is an array before filtering
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
        (booking.instructor?.name?.toLowerCase().includes(query) || false) ||
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

  // Handle submitting a review
  const handleSubmitReview = async (): Promise<void> => {
    if (!selectedBooking) return;
    
    setIsSubmitting(true);
    try {
      await submitReview(selectedBooking.id, reviewRating, reviewComment);
      toast({
        title: "Review submitted!",
        description: "Thank you for sharing your feedback.",
      });
      setReviewDialogOpen(false);
      setReviewRating(5);
      setReviewComment("");
    } catch (error) {
      toast({
        title: "Failed to submit review",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancelling a booking
  const handleCancelBooking = async (): Promise<void> => {
    if (!selectedBooking) return;
    
    setIsSubmitting(true);
    try {
      await updateBookingStatus(
        selectedBooking.id, 
        BookingStatus.CANCELLED, 
        cancelReason || "Cancelled by user."
      );
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled.",
      });
      setCancelDialogOpen(false);
      setCancelReason("");
    } catch (error) {
      toast({
        title: "Failed to cancel booking",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the date for display
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

  // Refresh bookings when the component mounts
  useEffect(() => {
    if (fetchUserBookings) {
      fetchUserBookings();
    }
  }, [fetchUserBookings]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">My Bookings</h1>
                <p className="text-muted-foreground">Manage your one-on-one sessions with instructors</p>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                onClick={() => (window.location.href = "/instructors")}
              >
                <Users className="mr-2 h-4 w-4" />
                Browse Instructors
              </Button>
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
                onClick={fetchUserBookings}
              >
                Try again
              </Button>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as BookingStatus | "all")} className="w-full">
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
                {/* Filter button - could expand this functionality later */}
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
                                <AvatarImage src={booking.instructor?.avatar} alt={booking.instructor?.name} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                  {booking.instructor?.name
                                    ? booking.instructor.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                    : "??"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-slate-800 dark:text-slate-200">
                                  {booking.instructor?.name || "Instructor"}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {booking.instructor?.title || ""}
                                </p>
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

                            {booking.status === BookingStatus.CANCELLED && booking.cancellationReason && (
                              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg mb-4">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                                  Cancellation Reason:
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{booking.cancellationReason}</p>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
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
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Add to Calendar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setCancelDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel
                                  </Button>
                                </div>
                              )}

                              {booking.status === BookingStatus.PENDING && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setCancelDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Request
                                  </Button>
                                </div>
                              )}

                              {booking.status === BookingStatus.COMPLETED && (
                                <div className="flex items-center gap-2">
                                  {booking.recording && (
                                    <Button
                                      variant="outline"
                                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                      onClick={() => window.open(booking.recording, "_blank")}
                                    >
                                      <Video className="mr-2 h-4 w-4" />
                                      View Recording
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Notes
                                  </Button>
                                  {!booking.hasLeftReview && (
                                    <Button
                                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                                      onClick={() => {
                                        setSelectedBooking(booking);
                                        setReviewDialogOpen(true);
                                      }}
                                    >
                                      <Star className="mr-2 h-4 w-4" />
                                      Leave Review
                                    </Button>
                                  )}
                                </div>
                              )}

                              <Button
                                variant="ghost"
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                onClick={() => window.location.href = `/bookings/${booking.id}`}
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
                        {activeTab === BookingStatus.PENDING && <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                        {activeTab === BookingStatus.COMPLETED && <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />}
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

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {selectedBooking?.instructor?.name} to help other students.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setReviewRating(star)} 
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        reviewRating >= star ? "text-amber-500 fill-amber-500" : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block"
              >
                Your Review
              </label>
              <textarea
                id="review-comment"
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-md min-h-[120px]"
                placeholder="Share your experience with this instructor..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              ></textarea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview} 
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your booking with {selectedBooking?.instructor?.name}?
              {selectedBooking?.status === BookingStatus.UPCOMING && " Cancellations made less than 24 hours before the session may be subject to a fee."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="cancel-reason"
                className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 block"
              >
                Reason for cancellation
              </label>
              <textarea
                id="cancel-reason"
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-md"
                placeholder="Please provide a reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              ></textarea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}