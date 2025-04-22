"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Clock, Video, ArrowRight, Download } from "lucide-react"
import { Footer } from "@/components/footer"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("id")
  const [countdown, setCountdown] = useState(10)

  // In a real app, you would fetch the booking details from an API
  // For now, we'll use mock data
  const bookingDetails = {
    id: bookingId || "booking-123456",
    instructorName: "Dr. Alex Johnson",
    instructorAvatar: "/images/instructors/alex-johnson.jpg",
    date: "June 15, 2023",
    time: "14:00",
    duration: "60 minutes",
    topic: "Smart Contract Development Help",
    price: "$60",
    status: "confirmed",
    meetingLink: "https://blocklearn.meet/abc123",
    calendarLink:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=BlockLearn Session with Dr. Alex Johnson&dates=20230615T140000Z/20230615T150000Z&details=Smart Contract Development Help",
  }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-4 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground">
                Your session with {bookingDetails.instructorName} has been scheduled.
              </p>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-blue-100 dark:border-blue-900 mb-6">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">Session Details</CardTitle>
                <CardDescription>Your upcoming one-on-one session</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{bookingDetails.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-teal-100 p-2 dark:bg-teal-900">
                      <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Time</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {bookingDetails.time} ({bookingDetails.duration})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                      <Video className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Session Type</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">Video Session</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{bookingDetails.price}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Topic</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{bookingDetails.topic}</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">
                    How to join your session
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    You'll receive an email with a link to join the session. You can also access it from your dashboard
                    or click the button below at the scheduled time.
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                    onClick={() => window.open(bookingDetails.meetingLink, "_blank")}
                  >
                    Join Session
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-b-lg flex justify-between">
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  onClick={() => window.open(bookingDetails.calendarLink, "_blank")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </CardFooter>
            </Card>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You will be redirected to your bookings in {countdown} seconds...
              </p>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                onClick={() => (window.location.href = "/bookings")}
              >
                View All Bookings
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

