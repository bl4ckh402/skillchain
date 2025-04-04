"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Play, BookOpen, Award } from 'lucide-react'
import { usePayment } from '@/context/PaymentProvider'
import { useAuth } from '@/context/AuthProvider'
import { useCourseProgress } from '@/context/CourseProgressContext'
import { useRouter } from 'next/navigation'

interface PurchaseButtonProps {
  courseId: string
  price: number
  className?: string
  size?: "default" | "sm" | "lg" | "icon" | null
}

export function PurchaseButton({ 
  courseId, 
  price, 
  className = '',
  size = "lg"
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(true)
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    enrolled: boolean
    completed: boolean
    progress: number
    currentLesson: string | null
    nextLesson: string | null
    certificateIssued: boolean
  }>({
    enrolled: false,
    completed: false,
    progress: 0,
    currentLesson: null,
    nextLesson: null,
    certificateIssued: false
  })

  const { initializePayment, processingPayment } = usePayment()
  const { user } = useAuth()
  const { getEnrollmentStatus } = useCourseProgress()
  const router = useRouter()

  // Check if user is enrolled in this course
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) {
        setCheckingEnrollment(false)
        return
      }

      try {
        const status = await getEnrollmentStatus(courseId)
        setEnrollmentStatus(status)
      } catch (error) {
        console.error('Error checking enrollment status:', error)
      } finally {
        setCheckingEnrollment(false)
      }
    }

    checkStatus()
  }, [user, courseId, getEnrollmentStatus])

  const handlePurchase = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=/course/${courseId}`)
      return
    }
    
    setLoading(true)
    try {
      // Initialize payment with Paystack
      const result = await initializePayment(courseId)
      if (result && result.authorizationUrl) {
        // Redirect to Paystack checkout page
        window.location.href = result.authorizationUrl
      }
    } catch (error) {
      console.error('Error purchasing course:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleContinueCourse = () => {
    if (enrollmentStatus.currentLesson) {
      router.push(`/course/${courseId}/lesson/${enrollmentStatus.currentLesson}`)
    } else if (enrollmentStatus.nextLesson) {
      router.push(`/course/${courseId}/lesson/${enrollmentStatus.nextLesson}`)
    } else {
      router.push(`/course/${courseId}`)
    }
  }
  
  const handleStartCourse = () => {
    if (enrollmentStatus.nextLesson) {
      router.push(`/course/${courseId}/lesson/${enrollmentStatus.nextLesson}`)
    } else {
      router.push(`/course/${courseId}`)
    }
  }

  const handleViewCertificate = () => {
    router.push(`/dashboard?courseId=${courseId}`)
  }

  // Show loading state while checking enrollment
  if (checkingEnrollment) {
    return (
      <Button disabled className={`w-full ${className}`} size={size}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking access...
      </Button>
    )
  }

  // If enrolled and completed with certificate, show certificate button
  if (enrollmentStatus.enrolled && enrollmentStatus.completed && enrollmentStatus.certificateIssued) {
    return (
      <Button 
        onClick={handleViewCertificate} 
        className={`w-full ${className}`}
        size={size}
        variant="default"
      >
        <Award className="mr-2 h-4 w-4" />
        View Certificate
      </Button>
    )
  }

  // If enrolled and in progress, show continue button
  if (enrollmentStatus.enrolled && enrollmentStatus.progress > 0 && !enrollmentStatus.completed) {
    return (
      <Button 
        onClick={handleContinueCourse} 
        className={`w-full ${className}`}
        size={size}
        variant="default"
      >
        <Play className="mr-2 h-4 w-4" />
        Continue Course ({Math.round(enrollmentStatus.progress)}%)
      </Button>
    )
  }

  // If enrolled but not started, show start button
  if (enrollmentStatus.enrolled && enrollmentStatus.progress === 0) {
    return (
      <Button 
        onClick={handleStartCourse} 
        className={`w-full ${className}`}
        size={size}
        variant="default"
      >
        <BookOpen className="mr-2 h-4 w-4" />
        Start Course
      </Button>
    )
  }

  // Otherwise show purchase button
  const isLoading = loading || processingPayment
  return (
    <Button 
      onClick={handlePurchase} 
      disabled={isLoading}
      className={`w-full ${className}`}
      size={size}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>Purchase for ${price.toLocaleString()}</>
      )}
    </Button>
  )
}