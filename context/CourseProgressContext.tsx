"use client"

import { createContext, useContext, useState } from 'react'
import { doc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './AuthProvider'

interface CourseProgressContextType {
  loading: boolean
  getUserCourseProgress: (courseId: string) => Promise<CourseProgressData | null>
  updateLessonProgress: (courseId: string, lessonId: string, completed: boolean) => Promise<void>
  getNextLesson: (courseId: string) => Promise<{ moduleId: string, lessonId: string } | null>
  getCurrentLesson: (courseId: string) => Promise<{ moduleId: string, lessonId: string } | null>
  getCourseCompletionRate: (courseId: string) => Promise<number>
  markCourseCompleted: (courseId: string) => Promise<void>
  getEnrollmentStatus: (courseId: string) => Promise<EnrollmentStatus>
  getCachedProgress: (courseId: string, userId: string) => CourseProgressData | null
  setCachedProgress: (courseId: string, userId: string, data: CourseProgressData) => void
}

export interface CourseProgressData {
  progress: number
  completedLessons: string[]
  lastAccessedAt: Date
  currentLesson: string
  nextLesson: string
  status: 'active' | 'completed'
  totalLessons: number
  moduleProgress: Record<string, number>
}

export interface EnrollmentStatus {
  enrolled: boolean
  progress: number
  completed: boolean
  currentLesson: string | null
  nextLesson: string | null
  certificateIssued: boolean
}

const CourseProgressContext = createContext<CourseProgressContextType | null>(null)

export function CourseProgressProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const [progressCache, setProgressCache] = useState(new Map());

  const getCachedProgress = (courseId, userId) => {
    const key = `${userId}_${courseId}`;
    return progressCache.get(key);
  };

  const setCachedProgress = (courseId, userId, data) => {
    const key = `${userId}_${courseId}`;
    setProgressCache(new Map(progressCache.set(key, data)));
  };

  const updateLessonProgress = async (courseId, lessonId, completed) => {
    const cached = getCachedProgress(courseId, user.uid);
    if (cached) {
      return cached;
    }

    const result = await updateProgress(courseId, lessonId, completed);
    setCachedProgress(courseId, user.uid, result);
    return result;
  };

  const getUserCourseProgress = async (courseId: string): Promise<CourseProgressData | null> => {
    if (!user) return null
    
    setLoading(true)
    
    try {
      const enrollmentRef = doc(db, 'enrollments', `${user.uid}_${courseId}`)
      const enrollmentSnap = await getDoc(enrollmentRef)
      
      if (!enrollmentSnap.exists()) {
        return null
      }
      
      const enrollmentData = enrollmentSnap.data()
      
      return {
        progress: enrollmentData.progress.progress || 0,
        completedLessons: enrollmentData.progress.completedLessons || [],
        lastAccessedAt: enrollmentData.progress.lastAccessed?.toDate() || new Date(),
        currentLesson: enrollmentData.progress.currentLesson || '',
        nextLesson: enrollmentData.progress.nextLesson || '',
        status: enrollmentData.status || 'active',
        totalLessons: enrollmentData.progress.totalLessons || 0,
        moduleProgress: enrollmentData.progress.moduleProgress || {}
      }
    } catch (error) {
      console.error('Error getting user course progress:', error)
      return null
    } finally {
      setLoading(false)
    }
  }


  // Mark a course as completed and issue certificate
  const markCourseCompleted = async (courseId: string): Promise<void> => {
    if (!user) throw new Error('Authentication required')
    
    try {
      // Check if certificate already issued
      const certificatesQuery = query(
        collection(db, 'certificates'),
        where('userId', '==', user.uid),
        where('courseId', '==', courseId)
      )
      
      const certificatesSnap = await getDocs(certificatesQuery)
      
      if (certificatesSnap.empty) {
        // Issue certificate
        const certificateData = {
          courseId,
          userId: user.uid,
          issuedAt: serverTimestamp(),
          type: 'completion',
          metadata: {
            platform: 'BlockLearn',
            verification: true
          }
        }
        
        await collection(db, 'certificates').add(certificateData)
        
        // Update user stats
        const userStatsRef = doc(db, 'userStats', user.uid)
        const userStatsSnap = await getDoc(userStatsRef)
        
        if (userStatsSnap.exists()) {
          const userData = userStatsSnap.data()
          await updateDoc(userStatsRef, {
            certificatesEarned: (userData.certificatesEarned || 0) + 1,
            coursesCompleted: (userData.coursesCompleted || 0) + 1
          })
        } else {
          await doc(db, 'userStats', user.uid).set({
            userId: user.uid,
            certificatesEarned: 1,
            coursesCompleted: 1,
            hoursLearned: 0,
            achievements: 0,
            projectsCompleted: 0,
            hackathonsParticipated: 0,
            jobsApplied: 0,
            eventsAttended: 0
          })
        }
        
        // Update course completion stats
        const courseRef = doc(db, 'courses', courseId)
        const courseSnap = await getDoc(courseRef)
        
        if (courseSnap.exists()) {
          const courseData = courseSnap.data()
          await updateDoc(courseRef, {
            completions: (courseData.completions || 0) + 1
          })
        }

        // Update instructor stats
        const courseData = (await getDoc(doc(db, 'courses', courseId))).data()
        if (courseData && courseData.instructor && courseData.instructor.id) {
          const instructorId = courseData.instructor.id
          const instructorStatsRef = doc(db, 'instructorStats', instructorId)
          const instructorStatsSnap = await getDoc(instructorStatsRef)
          
          if (instructorStatsSnap.exists()) {
            await updateDoc(instructorStatsRef, {
              completedCourses: (instructorStatsSnap.data().completedCourses || 0) + 1
            })
          }
        }
      }
    } catch (error) {
      console.error('Error marking course as completed:', error)
      throw error
    }
  }

  // Get the next lesson for a user in a course
  const getNextLesson = async (courseId: string): Promise<{ moduleId: string, lessonId: string } | null> => {
    if (!user) return null
    
    try {
      const enrollmentRef = doc(db, 'enrollments', `${user.uid}_${courseId}`)
      const enrollmentSnap = await getDoc(enrollmentRef)
      
      if (!enrollmentSnap.exists()) {
        // Not enrolled, return first lesson
        const courseRef = doc(db, 'courses', courseId)
        const courseSnap = await getDoc(courseRef)
        
        if (courseSnap.exists() && courseSnap.data().modules && courseSnap.data().modules.length > 0) {
          const firstModule = courseSnap.data().modules[0]
          if (firstModule.lessons && firstModule.lessons.length > 0) {
            return {
              moduleId: firstModule.id,
              lessonId: firstModule.lessons[0].id
            }
          }
        }
        return null
      }
      
      const enrollmentData = enrollmentSnap.data()
      
      // If there's a next lesson stored, return it
      if (enrollmentData.progress && enrollmentData.progress.nextLesson) {
        // Find the module ID for this lesson
        const courseRef = doc(db, 'courses', courseId)
        const courseSnap = await getDoc(courseRef)
        
        if (courseSnap.exists()) {
          const courseData = courseSnap.data()
          let moduleId = ''
          
          courseData.modules.forEach(module => {
            module.lessons.forEach(lesson => {
              if (lesson.id === enrollmentData.progress.nextLesson) {
                moduleId = module.id
              }
            })
          })
          
          if (moduleId) {
            return {
              moduleId,
              lessonId: enrollmentData.progress.nextLesson
            }
          }
        }
      }
      
      // If course is completed or no next lesson, return null
      if (enrollmentData.status === 'completed' || !enrollmentData.progress.nextLesson) {
        return null
      }
      
      return null
    } catch (error) {
      console.error('Error getting next lesson:', error)
      return null
    }
  }

  // Get the current lesson for a user in a course
  const getCurrentLesson = async (courseId: string): Promise<{ moduleId: string, lessonId: string } | null> => {
    if (!user) return null
    
    try {
      const enrollmentRef = doc(db, 'enrollments', `${user.uid}_${courseId}`)
      const enrollmentSnap = await getDoc(enrollmentRef)
      
      if (!enrollmentSnap.exists()) {
        return null
      }
      
      const enrollmentData = enrollmentSnap.data()
      
      // If there's a current lesson stored, return it
      if (enrollmentData.progress && enrollmentData.progress.currentLesson) {
        // Find the module ID for this lesson
        const courseRef = doc(db, 'courses', courseId)
        const courseSnap = await getDoc(courseRef)
        
        if (courseSnap.exists()) {
          const courseData = courseSnap.data()
          let moduleId = ''
          
          courseData.modules.forEach(module => {
            module.lessons.forEach(lesson => {
              if (lesson.id === enrollmentData.progress.currentLesson) {
                moduleId = module.id
              }
            })
          })
          
          if (moduleId) {
            return {
              moduleId,
              lessonId: enrollmentData.progress.currentLesson
            }
          }
        }
      }
      
      // If no current lesson, try to get next lesson
      return await getNextLesson(courseId)
    } catch (error) {
      console.error('Error getting current lesson:', error)
      return null
    }
  }

  // Get the course completion rate (percentage of enrolled students who completed)
  const getCourseCompletionRate = async (courseId: string): Promise<number> => {
    try {
      const courseRef = doc(db, 'courses', courseId)
      const courseSnap = await getDoc(courseRef)
      
      if (!courseSnap.exists()) {
        return 0
      }
      
      const courseData = courseSnap.data()
      const totalStudents = courseData.students || 0
      const completions = courseData.completions || 0
      
      return totalStudents > 0 ? (completions / totalStudents) * 100 : 0
    } catch (error) {
      console.error('Error getting course completion rate:', error)
      return 0
    }
  }

  // Get enrollment status for a user in a course
  const getEnrollmentStatus = async (courseId: string): Promise<EnrollmentStatus> => {
    if (!user) {
      return { 
        enrolled: false, 
        progress: 0, 
        completed: false, 
        currentLesson: null, 
        nextLesson: null,
        certificateIssued: false
      }
    }
    
    try {
      const enrollmentRef = doc(db, 'enrollments', `${user.uid}_${courseId}`)
      const enrollmentSnap = await getDoc(enrollmentRef)
      
      if (!enrollmentSnap.exists()) {
        return { 
          enrolled: false, 
          progress: 0, 
          completed: false, 
          currentLesson: null, 
          nextLesson: null,
          certificateIssued: false
        }
      }
      
      const enrollmentData = enrollmentSnap.data()
      
      // Check if certificate is issued
      const certificatesQuery = query(
        collection(db, 'certificates'),
        where('userId', '==', user.uid),
        where('courseId', '==', courseId)
      )
      
      const certificatesSnap = await getDocs(certificatesQuery)
      const certificateIssued = !certificatesSnap.empty
      
      return {
        enrolled: true,
        progress: enrollmentData.progress?.progress || 0,
        completed: enrollmentData.status === 'completed',
        currentLesson: enrollmentData.progress?.currentLesson || null,
        nextLesson: enrollmentData.progress?.nextLesson || null,
        certificateIssued
      }
    } catch (error) {
      console.error('Error getting enrollment status:', error)
      return { 
        enrolled: false, 
        progress: 0, 
        completed: false, 
        currentLesson: null, 
        nextLesson: null,
        certificateIssued: false
      }
    }
  }

  return (
    <CourseProgressContext.Provider
      value={{
        loading,
        getUserCourseProgress,
        updateLessonProgress,
        getNextLesson,
        getCurrentLesson,
        getCourseCompletionRate,
        markCourseCompleted,
        getEnrollmentStatus,
        getCachedProgress,
        setCachedProgress
      }}
    >
      {children}
    </CourseProgressContext.Provider>
  )
}

export function useCourseProgress() {
  const context = useContext(CourseProgressContext)
  
  if (!context) {
    throw new Error('useCourseProgress must be used within a CourseProgressProvider')
  }
  
  return context
}