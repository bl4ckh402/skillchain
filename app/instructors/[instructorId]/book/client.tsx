"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parse } from "date-fns"
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthProvider"
import { useBookings } from "@/context/BookingProvider"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Footer } from "@/components/footer"
import {
  CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Users,
  Star,
  MessageSquare,
  Video,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { BookingStatus } from "@/types/booking"
import { Instructor, AvailabilitySettings, AvailabilitySlot } from "@/types/instructor-booking"

interface TimeSlot {
  date: Date;
  time: string;
}

export default function InstructorBookingClient({ instructorId }: { instructorId: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const { createBooking } = useBookings()
  const { toast } = useToast()
  
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [bookingDetails, setBookingDetails] = useState({
    topic: "",
    message: "",
    duration: "60 minutes", // Default duration
  })

  // Fetch instructor and availability data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if user is logged in
        if (!user) {
          setError("Please log in to book a session")
          setLoading(false)
          return
        }

        // Fetch instructor data
        const instructorDoc = await getDoc(doc(db, "users", instructorId))
        
        if (!instructorDoc.exists()) {
          setError("Instructor not found")
          setLoading(false)
          return
        }
        
        const instructorData = {
          id: instructorDoc.id,
          ...instructorDoc.data()
        } as Instructor
        
        // Verify this is an instructor account
        if (instructorData.role !== 'instructor') {
          setError("This user is not an instructor")
          setLoading(false)
          return
        }
        
        setInstructor(instructorData)

        // Fetch instructor availability settings
        const settingsRef = doc(db, 'instructorSettings', instructorId)
        const settingsDoc = await getDoc(settingsRef)
        
        if (settingsDoc.exists()) {
          const settingsData = settingsDoc.data() as AvailabilitySettings
          setAvailabilitySettings(settingsData)
          
          // Generate available slots from the settings
          generateAvailableSlots(settingsData.slots)
        } else {
          // Create a default availability object
          const defaultSettings: AvailabilitySettings = {
            instructorId: instructorId,
            slots: generateDefaultSlots(),
            bufferTime: 15,
            advanceBookingDays: 30,
            sessionDurations: ["60 minutes"],
            pricing: {
              "60 minutes": instructorData.hourlyRate || 60,
            },
            autoAccept: false
          }
          
          setAvailabilitySettings(defaultSettings)
          generateAvailableSlots(defaultSettings.slots)
        }
        
        // Also fetch existing bookings to filter out slots that are already booked
        fetchExistingBookings(instructorId)
        
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load instructor information. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [instructorId, user])

  // Generate default availability slots (weekdays 9 AM - 5 PM)
  const generateDefaultSlots = (): AvailabilitySlot[] => {
    const slots: AvailabilitySlot[] = []
    
    // Create slots for Monday-Friday (1-5), 9 AM - 5 PM
    for (let day = 1; day <= 5; day++) {
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // Skip 4:30 PM as it would end at 5:30 PM
          if (hour === 16 && minute === 30) continue
          
          const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          const endMinute = minute + 30;
          const endHour = endMinute === 60 ? hour + 1 : hour;
          const normalizedEndMinute = endMinute % 60;
          const endTime = `${endHour.toString().padStart(2, "0")}:${normalizedEndMinute.toString().padStart(2, "0")}`;
          
          slots.push({
            id: `${day}-${startTime}-${endTime}`,
            day,
            startTime,
            endTime,
            isAvailable: true,
          })
        }
      }
    }
    
    return slots
  }

  // Convert availability slots to actual dates and times
  const generateAvailableSlots = (slots: AvailabilitySlot[]) => {
    const today = new Date()
    const availableDates: TimeSlot[] = []
    
    // Generate dates for the next 4 weeks
    for (let week = 0; week < 4; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = addDays(addWeeks(startOfWeek(today), week), day)
        
        // Get the day of week (0-6, where 0 is Sunday)
        const dayOfWeek = currentDate.getDay()
        
        // Find slots for this day of week
        const slotsForDay = slots.filter(slot => slot.day === dayOfWeek && slot.isAvailable)
        
        // Add each time slot to the available dates
        slotsForDay.forEach(slot => {
          availableDates.push({
            date: currentDate,
            time: slot.startTime,
          })
        })
      }
    }
    
    setAvailableSlots(availableDates)
  }

  // Fetch existing bookings to filter out unavailable slots
  const fetchExistingBookings = async (instructorId: string) => {
    try {
      const instructorRef = doc(db, 'instructors', instructorId)
      
      // Query bookings for this instructor that are upcoming or pending
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('instructorRef', '==', instructorRef),
        where('status', 'in', [BookingStatus.UPCOMING, BookingStatus.PENDING])
      )
      
      const bookingsSnapshot = await getDocs(bookingsQuery)
      
      // Map of dates and times that are already booked
      const bookedSlots: {[key: string]: boolean} = {}
      
      bookingsSnapshot.forEach(doc => {
        const booking = doc.data()
        if (booking.date && booking.time) {
          // Convert Firestore timestamp to Date
          const bookingDate = booking.date.toDate()
          const dateStr = format(bookingDate, 'yyyy-MM-dd')
          const timeStr = booking.time
          
          // Create a key for this date and time
          const key = `${dateStr}-${timeStr}`
          bookedSlots[key] = true
        }
      })
      
      // Filter out the booked slots from available slots
      if (Object.keys(bookedSlots).length > 0) {
        setAvailableSlots(prevSlots => 
          prevSlots.filter(slot => {
            const dateStr = format(slot.date, 'yyyy-MM-dd')
            const key = `${dateStr}-${slot.time}`
            return !bookedSlots[key]
          })
        )
      }
    } catch (err) {
      console.error("Error fetching existing bookings:", err)
      // Continue even if this fails, as it's not critical
    }
  }

  // Get available slots for the selected date
  const getAvailableSlotsForDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return []
    
    return availableSlots
      .filter(slot => isSameDay(slot.date, selectedDate))
      .map(slot => slot.time)
      .sort((a, b) => {
        const timeA = parse(a, 'HH:mm', new Date())
        const timeB = parse(b, 'HH:mm', new Date())
        return timeA.getTime() - timeB.getTime()
      })
  }

  // Get the dates that have available slots
  const getDatesWithAvailability = () => {
    const uniqueDates = new Set<string>()
    
    availableSlots.forEach(slot => {
      uniqueDates.add(format(slot.date, 'yyyy-MM-dd'))
    })
    
    return Array.from(uniqueDates).map(dateStr => new Date(dateStr))
  }

  // Available time slots for the selected date
  const availableTimesForDate = date ? getAvailableSlotsForDate(date) : []

  // Handle week navigation
  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1))
  }

  // Generate week days for the calendar view
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  // Get price for selected duration
  const getPrice = (duration: string) => {
    if (!availabilitySettings) return 0
    
    return availabilitySettings.pricing[duration] || 0
  }

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!date || !selectedSlot || !instructor || !user) return
    
    setSubmitting(true)
    
    try {
      // Create booking data
      const bookingData = {
        instructorId: instructor.id,
        topic: bookingDetails.topic,
        message: bookingDetails.message,
        date: date,
        time: selectedSlot,
        duration: bookingDetails.duration,
        price: `$${getPrice(bookingDetails.duration)}`,
      }
      
      // Create the booking
      const booking = await createBooking(bookingData)
      
      // Show success message
      toast({
        title: "Booking request submitted!",
        description: "Your booking request has been sent to the instructor.",
      })
      
      // Close dialog
      setIsDialogOpen(false)
      
      // Redirect to bookings page
      router.push('/bookings')
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "There was a problem creating your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Function to get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  // Function to format the instructor's full name
  const getFullName = (instructor: Instructor) => {
    return `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || 'Unnamed Instructor'
  }

  // Handle duration change
  const handleDurationChange = (duration: string) => {
    setBookingDetails(prev => ({
      ...prev,
      duration
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Book a Session</h1>
                  <p className="text-muted-foreground">Loading instructor details...</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full lg:col-span-2" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !instructor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            {error || "Unable to load booking page"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error === "Please log in to book a session" 
              ? "You need to be logged in to book a session with an instructor." 
              : "We encountered an error loading the instructor's booking information."}
          </p>
          {error === "Please log in to book a session" ? (
            <Button asChild>
              <Link href={`/login?redirect=/instructors/${instructorId}/book`}>Log In</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/instructors/${instructorId}`}>View Instructor Profile</Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Book a Session</h1>
                <p className="text-muted-foreground">Schedule a one-on-one session with {getFullName(instructor)}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Instructor Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Instructor Profile Card */}
            <Card className="border-blue-100 dark:border-blue-900 lg:col-span-1">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                    <AvatarImage src={instructor.photoURL} alt={getFullName(instructor)} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      {getInitials(instructor.firstName, instructor.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-slate-800 dark:text-slate-200">{getFullName(instructor)}</CardTitle>
                    <CardDescription>{instructor.expertise?.[0] || "Blockchain Instructor"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{instructor.rating || 0}</span>
                    <span className="text-sm text-muted-foreground">({instructor.reviews || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">{instructor.students || 0} students</span>
                  </div>
                </div>

                <Separator className="bg-blue-100 dark:bg-blue-900" />

                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {instructor.expertise?.map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator className="bg-blue-100 dark:bg-blue-900" />

                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">About</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{instructor.bio}</p>
                </div>

                <Separator className="bg-blue-100 dark:bg-blue-900" />

                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Session Rates</h3>
                  <div className="space-y-2">
                    {availabilitySettings?.sessionDurations.map(duration => (
                      <div key={duration} className="flex items-center justify-between">
                        <span className="text-sm">{duration}</span>
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          {availabilitySettings.pricing[duration] || instructor.hourlyRate || 60}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Calendar and Slots */}
            <Card className="border-blue-100 dark:border-blue-900 lg:col-span-2">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">Select Date & Time</CardTitle>
                <CardDescription>Choose a date and available time slot for your session</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="calendar" className="w-full">
                  <TabsList className="mb-4 w-full justify-start bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                    <TabsTrigger
                      value="calendar"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                    >
                      Calendar View
                    </TabsTrigger>
                    <TabsTrigger
                      value="weekly"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                    >
                      Weekly View
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="calendar" className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/2">
                        <div className="border border-blue-100 dark:border-blue-900 rounded-lg overflow-hidden">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="w-full"
                            disabled={(date) => {
                              // Disable dates in the past
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              if (date < today) return true;
                              
                              // Disable dates beyond the advance booking days
                              const maxDate = new Date();
                              maxDate.setDate(maxDate.getDate() + (availabilitySettings?.advanceBookingDays || 30));
                              if (date > maxDate) return true;
                              
                              // Disable dates that don't have availability
                              const dateStr = format(date, 'yyyy-MM-dd');
                              return !availableSlots.some(slot => format(slot.date, 'yyyy-MM-dd') === dateStr);
                            }}
                          />
                        </div>
                      </div>
                      <div className="md:w-1/2">
                        <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-3">
                          {date ? (
                            <>Available times for {format(date, "EEEE, MMMM d, yyyy")}</>
                          ) : (
                            <>Select a date to see available times</>
                          )}
                        </h3>
                        {date ? (
                          availableTimesForDate.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {availableTimesForDate.map((slot) => (
                                <Button
                                key={slot}
                                variant={selectedSlot === slot ? "default" : "outline"}
                                className={`
                                  ${
                                    selectedSlot === slot
                                      ? "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                                      : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                  }
                                `}
                                onClick={() => setSelectedSlot(slot)}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                {slot}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                            <p className="text-muted-foreground">No available slots for this date</p>
                          </div>
                        )
                      ) : (
                        <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                          <CalendarIcon className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                          <p className="text-muted-foreground">Please select a date to view available time slots</p>
                        </div>
                      )}
                    </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="weekly" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="outline"
                        onClick={goToPreviousWeek}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous Week
                      </Button>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">
                        {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
                      </h3>
                      <Button
                        variant="outline"
                        onClick={goToNextWeek}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        Next Week
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day, index) => (
                        <div key={index} className="text-center">
                          <div className="font-medium text-sm mb-1">{format(day, "EEE")}</div>
                          <div
                            className={`
                              rounded-full w-8 h-8 mx-auto flex items-center justify-center text-sm mb-2 cursor-pointer
                              ${
                                isSameDay(day, date as Date)
                                  ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white"
                                  : "hover:bg-blue-50 dark:hover:bg-blue-950"
                              }
                            `}
                            onClick={() => setDate(day)}
                          >
                            {format(day, "d")}
                          </div>
                          {/* <div className="text-xs text-muted-foreground">
                            {instructor.availability.find((avail) => isSameDay(avail.date, day))
                              ? `${instructor.availability.find((avail) => isSameDay(avail.date, day))?.slots.length} slots`
                              : "No slots"}
                          </div> */}
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4 bg-blue-100 dark:bg-blue-900" />

                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-3">
                        {date ? (
                          <>Available times for {format(date, "EEEE, MMMM d")}</>
                        ) : (
                          <>Select a date to see available times</>
                        )}
                      </h3>
                      {date ? (
                        availableSlots.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {availableTimesForDate.map((slot) => (
                              <Button
                                key={slot}
                                variant={selectedSlot === slot ? "default" : "outline"}
                                className={`
                                  ${
                                    selectedSlot === slot
                                      ? "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                                      : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                  }
                                `}
                                onClick={() => setSelectedSlot(slot)}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                {slot}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                            <p className="text-muted-foreground">No available slots for this date</p>
                          </div>
                        )
                      ) : (
                        <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                          <CalendarIcon className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                          <p className="text-muted-foreground">Please select a date to view available time slots</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {availabilitySettings?.sessionDurations.length! > 1 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-3">Session Duration</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availabilitySettings?.sessionDurations.map((duration) => (
                        <Button
                          key={duration}
                          variant={bookingDetails.duration === duration ? "default" : "outline"}
                          className={`
                            ${
                              bookingDetails.duration === duration
                                ? "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                                : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                            }
                          `}
                          onClick={() => handleDurationChange(duration)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {duration}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-b-lg flex justify-between">
                <div>
                  {date && selectedSlot && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-800 dark:text-slate-200">Selected:</span>{" "}
                      {format(date, "MMMM d, yyyy")} at {selectedSlot}
                    </div>
                  )}
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <Button
                    disabled={!date || !selectedSlot}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Book This Slot
                  </Button>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Confirm Your Booking</DialogTitle>
                      <DialogDescription>
                        You're booking a session with {getFullName(instructor)} on {date && format(date, "MMMM d, yyyy")} at{" "}
                        {selectedSlot}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="topic" className="text-sm font-medium">
                          Session Topic
                        </label>
                        <input
                          id="topic"
                          className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md"
                          placeholder="e.g., Smart Contract Development Help"
                          value={bookingDetails.topic}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, topic: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          Message to Instructor (Optional)
                        </label>
                        <Textarea
                          id="message"
                          placeholder="Describe what you'd like to discuss or any questions you have"
                          value={bookingDetails.message}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, message: e.target.value })}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Session Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Date:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {date && format(date, "MMMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Time:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{selectedSlot}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{bookingDetails.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Price:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              ${getPrice(bookingDetails.duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleConfirmBooking}
                        className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                        disabled={!bookingDetails.topic || submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>

          {/* Session Types */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Session Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                      <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-slate-800 dark:text-slate-200">Video Session</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    One-on-one video call with the instructor to discuss topics, get personalized guidance, and ask
                    questions in real-time.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Screen sharing for code reviews</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Interactive whiteboard for explanations</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Session recording available afterward</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-teal-100 p-2 dark:bg-teal-900">
                      <MessageSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <CardTitle className="text-slate-800 dark:text-slate-200">Code Review</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get expert feedback on your code, projects, or smart contracts with detailed explanations and
                    improvement suggestions.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>In-depth code analysis</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Security vulnerability detection</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Best practices recommendations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                      <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-slate-800 dark:text-slate-200">Career Guidance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get personalized career advice, portfolio reviews, and guidance on breaking into the blockchain
                    industry.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Resume and portfolio review</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Job search and interview preparation</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Industry insights and networking tips</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    How do one-on-one sessions work?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    After booking, you'll receive a confirmation email with a link to join the video call at the
                    scheduled time. Sessions are conducted through our secure platform with features like screen sharing
                    and interactive whiteboards.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    What if I need to reschedule?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    You can reschedule or cancel your session up to 24 hours before the scheduled time without any
                    penalty. Changes made with less than 24 hours notice may incur a fee.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    How do I prepare for my session?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    To make the most of your session, prepare specific questions or topics you want to discuss. If
                    you're sharing code, have it ready and accessible. Test your camera and microphone before the
                    session starts.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Are sessions recorded?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Yes, sessions are recorded for your reference. You'll have access to the recording for 30 days after
                    the session. These recordings are private and only accessible to you and the instructor.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
