"use client"

import { useEffect, useState } from 'react'
import { useCourseProgress } from '@/context/CourseProgressContext'
import { useCourses } from '@/context/CourseContext'
import { useRouter } from 'next/navigation'

// Hook to navigate to the correct lesson based on user progress
export function useNavigateToLesson(courseId: string) {
  const { getCurrentLesson, getNextLesson } = useCourseProgress()
  const { getCourseById } = useCourses()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to navigate to the appropriate lesson
  const navigateToLesson = async () => {
    try {
      setLoading(true)
      
      // Try to get current lesson first
      const currentLesson = await getCurrentLesson(courseId)
      
      if (currentLesson) {
        // User has a current lesson, navigate to it
        router.push(`/course/${courseId}/lesson/${currentLesson.lessonId}`)
        return
      }
      
      // If no current lesson, try to get next lesson
      const nextLesson = await getNextLesson(courseId)
      
      if (nextLesson) {
        // User has a next lesson, navigate to it
        router.push(`/course/${courseId}/lesson/${nextLesson.lessonId}`)
        return
      }
      
      // If no current or next lesson, navigate to first lesson
      const course = await getCourseById(courseId)
      
      if (course && course.modules && course.modules.length > 0) {
        const firstModule = course.modules[0]
        
        if (firstModule.lessons && firstModule.lessons.length > 0) {
          const firstLesson = firstModule.lessons[0]
          router.push(`/course/${courseId}/lesson/${firstLesson.id}`)
          return
        }
      }
      
      // If all else fails, just go to course page
      router.push(`/course/${courseId}`)
    } catch (error) {
      console.error('Error navigating to lesson:', error)
      setError('Failed to navigate to appropriate lesson')
      router.push(`/course/${courseId}`) // Fallback to course page
    } finally {
      setLoading(false)
    }
  }

  return { navigateToLesson, loading, error }
}

// Hook to get course completion status
export function useCourseCompletion(courseId: string) {
  const [completionData, setCompletionData] = useState({
    completionRate: 0,
    totalStudents: 0,
    completions: 0,
    loading: true,
    error: null as string | null
  })
  
  const { getCourseCompletionRate } = useCourseProgress()
  const { getCourseById } = useCourses()
  
  useEffect(() => {
    const fetchCompletionData = async () => {
      try {
        // Get course completion rate
        const completionRate = await getCourseCompletionRate(courseId)
        
        // Get course data to get total students and completions
        const course = await getCourseById(courseId)
        
        if (course) {
          setCompletionData({
            completionRate,
            totalStudents: course.students || 0,
            completions: course.completions || 0,
            loading: false,
            error: null
          })
        } else {
          setCompletionData({
            completionRate: 0,
            totalStudents: 0,
            completions: 0,
            loading: false,
            error: 'Course not found'
          })
        }
      } catch (error) {
        console.error('Error fetching completion data:', error)
        setCompletionData({
          completionRate: 0,
          totalStudents: 0,
          completions: 0,
          loading: false,
          error: 'Failed to load completion data'
        })
      }
    }
    
    fetchCompletionData()
  }, [courseId, getCourseCompletionRate, getCourseById])
  
  return completionData
}

// Hook to get personal course progress
export function usePersonalCourseProgress(courseId: string) {
  const [progressData, setProgressData] = useState({
    progress: 0,
    completedLessons: [] as string[],
    nextLesson: '',
    currentLesson: '',
    moduleProgress: {} as Record<string, number>,
    loading: true,
    error: null as string | null
  })
  
  const { getUserCourseProgress } = useCourseProgress()
  
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const progress = await getUserCourseProgress(courseId)
        
        if (progress) {
          setProgressData({
            progress: progress.progress,
            completedLessons: progress.completedLessons,
            nextLesson: progress.nextLesson,
            currentLesson: progress.currentLesson,
            moduleProgress: progress.moduleProgress,
            loading: false,
            error: null
          })
        } else {
          setProgressData({
            progress: 0,
            completedLessons: [],
            nextLesson: '',
            currentLesson: '',
            moduleProgress: {},
            loading: false,
            error: 'No progress data found'
          })
        }
      } catch (error) {
        console.error('Error fetching progress data:', error)
        setProgressData({
          progress: 0,
          completedLessons: [],
          nextLesson: '',
          currentLesson: '',
          moduleProgress: {},
          loading: false,
          error: 'Failed to load progress data'
        })
      }
    }
    
    fetchProgressData()
  }, [courseId, getUserCourseProgress])
  
  return progressData
}