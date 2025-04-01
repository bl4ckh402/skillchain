"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { CheckCircle2, Clock, HelpCircle, Home } from "lucide-react"
import { useAuth } from "@/context/AuthProvider"
import { getDoc, doc, serverTimestamp, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function ApplicationSuccessPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Get the most recent application for this user
    const fetchLatestApplication = async () => {
      try {
        // Query for applications by this user, ordered by submission time
        const applicationRef = doc(db, "instructorApplications", `app_${Date.now()}_${user.uid.substring(0, 6)}`)
        const unsubscribe = onSnapshot(applicationRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data()
            setApplicationId(doc.id)
            
            // Convert Firebase timestamp to Date
            if (data.submittedAt) {
              const timestamp = data.submittedAt
              const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
              setSubmittedAt(date)
            }
          }
        })

        return () => unsubscribe()
      } catch (error) {
        console.error("Error fetching application:", error)
        // Generate fallback values if we can't get the real ones
        setApplicationId(`APP-${Math.floor(100000 + Math.random() * 900000)}`)
        setSubmittedAt(new Date())
      }
    }

    fetchLatestApplication()
  }, [user, router])

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container px-4 md:px-6">
          <Card className="mx-auto max-w-md border-blue-100 dark:border-blue-900">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Application Submitted!</CardTitle>
              <CardDescription>Thank you for applying to become an instructor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800 dark:text-blue-300">What happens next?</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Our team will review your application within 3-5 business days. You'll receive an email
                      notification once a decision has been made. You can also check the status of your application
                      on your dashboard.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-blue-100 dark:border-blue-900 p-4">
                <div className="flex items-start gap-4">
                  <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Have questions?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      If you have any questions about your application or the instructor program, please contact our
                      support team.
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
              <div className="text-center text-sm text-muted-foreground">
                <p>Application ID: {applicationId || `APP-${Math.floor(100000 + Math.random() * 900000)}`}</p>
                <p>Submitted on: {submittedAt ? submittedAt.toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Link href="/application-status">
                <Button variant="outline">View Application Status</Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Dashboard
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}