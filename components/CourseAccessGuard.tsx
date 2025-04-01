"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { PurchaseButton } from './PurchaseButton'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, LockIcon } from 'lucide-react'

export function CourseAccessGuard({ courseId, courseTitle, coursePrice, children }) {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      try {
        // First check if user is the course owner/instructor
        const courseRef = doc(db, 'courses', courseId)
        const courseDoc = await getDoc(courseRef)
       
        if (courseDoc.exists()) {
          const course = courseDoc.data()
          if (course.instructor?.id === user.uid) {
            setIsOwner(true)
            setHasAccess(true)
            setLoading(false)
            return
          }
        }

        // Check if user is enrolled in the course
        const enrollmentRef = doc(db, 'enrollments', `${user.uid}_${courseId}`)
        const enrollmentDoc = await getDoc(enrollmentRef)
       
        setHasAccess(enrollmentDoc.exists())
        setLoading(false)
      } catch (error) {
        console.error('Error checking course access:', error)
        setHasAccess(false)
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, courseId])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking access...</span>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <Card className="max-w-md mx-auto my-8">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <LockIcon className="h-12 w-12 text-primary/60" />
          </div>
          <CardTitle className="text-center">Course Access Required</CardTitle>
          <CardDescription className="text-center">
            Purchase this course to access all content and materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg font-semibold mb-2">{courseTitle}</p>
          <p className="text-center text-2xl font-bold text-primary">₦{coursePrice?.toLocaleString()}</p>
          <p className="text-center text-muted-foreground mt-2">
            One-time payment for lifetime access
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <PurchaseButton courseId={courseId} price={coursePrice} className="w-full" />
        </CardFooter>
      </Card>
    )
  }

  // User has access, show the course content
  return children
}