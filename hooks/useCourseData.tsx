"use client"

import { useState, useEffect } from 'react'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthProvider'

interface CourseDataResult {
  course: any | null
  isOwner: boolean
  isEnrolled: boolean
  currentTab: string
  progress: any | null
  enrollmentStatus: 'none' | 'enrolled' | 'completed'
  loading: boolean
  error: string | null
  setCurrentTab: (tab: string) => void
  fetchCourseData: () => Promise<void>
}

export function useCourseData(courseId: string): CourseDataResult {
  const [course, setCourse] = useState<any | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [progress, setProgress] = useState<any | null>(null)
  const [enrollmentStatus, setEnrollmentStatus] = useState<'none' | 'enrolled' | 'completed'>('none')
  const [currentTab, setCurrentTab] = useState('curriculum')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchCourseData = async () => {
    if (!courseId) {
      setError('Course ID is required')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch course data
      const courseRef = doc(db, 'courses', courseId)
      const courseSnap = await getDoc(courseRef)

      if (!courseSnap.exists()) {
        setError('Course not found')
        setLoading(false)
        return
      }

      const courseData = {
        id: courseSnap.id,
        ...courseSnap.data(),
        // Set default values for properties that might be undefined
        instructor: courseSnap.data().instructor || {
          name: 'Unknown Instructor',
          bio: 'No bio available',
          avatar: '/placeholder-avatar.png',
        },
        modules: courseSnap.data().modules || [],
        whatYouWillLearn: courseSnap.data().whatYouWillLearn || [],
        requirements: courseSnap.data().requirements || [],
      }

      setCourse(courseData)

      // Check if user is logged in
      if (!user) {
        setIsOwner(false)
        setIsEnrolled(false)
        setEnrollmentStatus('none')
        setLoading(false)
        return
      }

      // Check if user is the course owner
      if (courseData.instructor?.id === user.uid) {
        setIsOwner(true)
        setIsEnrolled(true)
        setEnrollmentStatus('enrolled')
      } else {
        setIsOwner(false)

        // Check if user is enrolled
        const enrollmentRef = doc(db, 'enrollments', `${user.uid}_${courseId}`)
        const enrollmentSnap = await getDoc(enrollmentRef)

        if (enrollmentSnap.exists()) {
          const enrollmentData = enrollmentSnap.data()
          setIsEnrolled(true)
          setProgress(enrollmentData.progress || null)
          setEnrollmentStatus(enrollmentData.status === 'completed' ? 'completed' : 'enrolled')
        } else {
          setIsEnrolled(false)
          setProgress(null)
          setEnrollmentStatus('none')
        }
      }

      // Check if user has a certificate for this course
      if (user) {
        const certificatesQuery = query(
          collection(db, 'certificates'),
          where('userId', '==', user.uid),
          where('courseId', '==', courseId)
        )
        
        const certificatesSnap = await getDocs(certificatesQuery)
        
        if (!certificatesSnap.empty) {
          setEnrollmentStatus('completed')
        }
      }
    } catch (err) {
      console.error('Error fetching course data:', err)
      setError('Failed to load course data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourseData()
  }, [courseId, user])

  return {
    course,
    isOwner,
    isEnrolled,
    currentTab,
    progress,
    enrollmentStatus,
    loading,
    error,
    setCurrentTab,
    fetchCourseData
  }
}