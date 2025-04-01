"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, FileText, HelpCircle, Home, MessageSquare, RefreshCw, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/context/AuthProvider"
import { useInstructorApplication } from "@/context/InstructorApplicationContext"
import { toast } from "@/components/ui/use-toast"

export default function ApplicationStatusPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { getApplicationStatus } = useInstructorApplication()
  const [isLoading, setIsLoading] = useState(true)
  const [application, setApplication] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your application status.",
        variant: "destructive"
      })
      router.push("/login?redirect=/application-status")
      return
    }

    const fetchApplicationStatus = async () => {
      setIsLoading(true)
      try {
        const applicationData = await getApplicationStatus()
        
        if (applicationData) {
          setApplication(applicationData)
        } else {
          // If no application is found, redirect to the application page
          toast({
            title: "No Application Found",
            description: "You haven't submitted an instructor application yet.",
            variant: "destructive"
          })
          router.push("/become-instructor")
        }
      } catch (error) {
        console.error("Error fetching application status:", error)
        toast({
          title: "Error",
          description: "Failed to retrieve your application status. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplicationStatus()
  }, [user, getApplicationStatus, router])

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
          >
            Under Review
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
            Not Approved
          </Badge>
        )
      default:
        return null
    }
  }

  // Format dates correctly
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    
    // Handle Firebase timestamp
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString()
    }
    
    // Handle Date objects or timestamp numbers
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter">Application Status</h1>
              <p className="text-muted-foreground">Track the status of your instructor application</p>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8 md:px-6">
          <div className="mx-auto max-w-2xl">
            {isLoading ? (
              <Card className="border-blue-100 dark:border-blue-900">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="text-muted-foreground">Loading your application status...</p>
                  </div>
                </CardContent>
              </Card>
            ) : application ? (
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Instructor Application</CardTitle>
                      <CardDescription>Application ID: {application.id}</CardDescription>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Submitted on:</span>
                      <span>{formatDate(application.submittedAt)}</span>
                    </div>
                    {application.reviewedAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Reviewed on:</span>
                        <span>{formatDate(application.reviewedAt)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {application.status === "pending" && (
                    <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Application Under Review</AlertTitle>
                      <AlertDescription>
                        Our team is currently reviewing your application. This process typically takes 3-5 business
                        days.
                      </AlertDescription>
                    </Alert>
                  )}

                  {application.status === "approved" && (
                    <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Application Approved!</AlertTitle>
                      <AlertDescription>
                        Congratulations! Your application to become an instructor has been approved. You can now start
                        creating courses on the platform.
                      </AlertDescription>
                    </Alert>
                  )}

                  {application.status === "rejected" && (
                    <Alert className="bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
                      <X className="h-4 w-4" />
                      <AlertTitle>Application Not Approved</AlertTitle>
                      <AlertDescription>
                        We've reviewed your application and unfortunately, we're unable to approve it at this time.
                      </AlertDescription>
                    </Alert>
                  )}

                  {application.feedback && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Feedback</h3>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-start gap-4">
                          <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <p className="text-sm">{application.feedback}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {application.nextSteps && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Next Steps</h3>
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                        <div className="flex items-start gap-4">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-blue-700 dark:text-blue-400">{application.nextSteps}</p>

                            {application.status === "approved" && (
                              <div className="mt-4">
                                <Link href="/instructor/onboarding">
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                                  >
                                    Start Onboarding
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-blue-100 dark:border-blue-900 p-4">
                    <div className="flex items-start gap-4">
                      <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Need Help?</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          If you have any questions about your application or need further clarification, our support
                          team is here to help.
                        </p>
                        <Link
                          href="/support"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                        >
                          Contact Support
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href="/dashboard">
                    <Button variant="outline">
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>

                  {application.status === "rejected" && (
                    <Link href="/become-instructor">
                      <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                        Apply Again
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <Card className="border-blue-100 dark:border-blue-900">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <HelpCircle className="h-12 w-12 text-blue-500" />
                    <h2 className="text-xl font-semibold">No Application Found</h2>
                    <p className="text-muted-foreground">
                      You haven't submitted an instructor application yet.
                    </p>
                    <Link href="/become-instructor">
                      <Button className="mt-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                        Apply to Become an Instructor
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}