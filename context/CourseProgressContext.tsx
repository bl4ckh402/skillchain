"use client"

import { createContext, useContext, useState } from 'react'
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, serverTimestamp, increment } from 'firebase/firestore'
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
  checkAccessStatus: (courseId: string) => Promise<{ hasAccess: boolean, enrollmentStatus: EnrollmentStatus | null }>
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
  enrolledAt?: Date
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

  // Check if user has access to a course
  const checkAccessStatus = async (courseId: string): Promise<{ hasAccess: boolean, enrollmentStatus: EnrollmentStatus | null }> => {
    if (!user) {
      return { hasAccess: false, enrollmentStatus: null };
    }

    try {
      // Get enrollment status
      const enrollmentStatus = await getEnrollmentStatus(courseId);
      
      // User has access if they're enrolled
      if (enrollmentStatus.enrolled) {
        return { hasAccess: true, enrollmentStatus };
      }
      
      // Check if it's a free course
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      
      if (courseSnap.exists()) {
        const courseData = courseSnap.data();
        if (courseData.price === "0" || courseData.price === "0.00" || courseData.price === "" || !courseData.price) {
          // Free course - automatically enroll the user
          await setDoc(doc(db, 'enrollments', `${user.uid}_${courseId}`), {
            userId: user.uid,
            courseId: courseId,
            enrolledAt: serverTimestamp(),
            status: 'active',
            progress: {
              progress: 0,
              completedLessons: [],
              lastAccessed: serverTimestamp(),
              totalLessons: calculateTotalLessons(courseData)
            }
          });
          
          // Update course student count
          await updateDoc(courseRef, {
            students: increment(1)
          });
          
          // Return updated status
          return { 
            hasAccess: true, 
            enrollmentStatus: {
              enrolled: true,
              progress: 0,
              completed: false,
              currentLesson: null,
              nextLesson: null,
              certificateIssued: false,
              enrolledAt: new Date()
            }
          };
        }
      }
      
      // Not enrolled and not a free course
      return { hasAccess: false, enrollmentStatus };
    } catch (error) {
      console.error('Error checking access status:', error);
      return { hasAccess: false, enrollmentStatus: null };
    }
  };

  // Calculate total number of lessons in a course
  const calculateTotalLessons = (courseData) => {
    let totalLessons = 0;
    if (courseData.modules && Array.isArray(courseData.modules)) {
      courseData.modules.forEach(module => {
        if (module.lessons && Array.isArray(module.lessons)) {
          totalLessons += module.lessons.length;
        }
      });
    }
    return totalLessons;
  };

  // Calculate course progress based on completed lessons
  const calculateProgress = (completedLessons: string[], totalLessons: number): number => {
    if (totalLessons === 0) return 0;
    return Math.min(Math.round((completedLessons.length / totalLessons) * 100), 100);
  };

  // Find the next lesson after the current one in course structure
  const findNextLesson = (courseData, currentLessonId: string): string | null => {
    let foundCurrent = false;
    let nextLessonId = null;
    
    // Iterate through modules and lessons
    for (const module of courseData.modules) {
      for (let i = 0; i < module.lessons.length; i++) {
        const lesson = module.lessons[i];
        
        // If we found the current lesson in the previous iteration, this is the next one
        if (foundCurrent) {
          nextLessonId = lesson.id;
          return nextLessonId;
        }
        
        // Mark that we found the current lesson
        if (lesson.id === currentLessonId) {
          foundCurrent = true;
          
          // Check if there's another lesson in this module
          if (i < module.lessons.length - 1) {
            nextLessonId = module.lessons[i + 1].id;
            return nextLessonId;
          }
        }
      }
      
      // If we found the current lesson but didn't find a next lesson in the same module,
      // look for the first lesson in the next module
      if (foundCurrent && module.lessons.length > 0) {
        const moduleIndex = courseData.modules.findIndex(m => m.id === module.id);
        if (moduleIndex < courseData.modules.length - 1) {
          const nextModule = courseData.modules[moduleIndex + 1];
          if (nextModule.lessons && nextModule.lessons.length > 0) {
            nextLessonId = nextModule.lessons[0].id;
            return nextLessonId;
          }
        }
      }
    }
    
    return nextLessonId;
  };

  // Update lesson progress for a user
  const updateLessonProgress = async (courseId: string, lessonId: string, completed: boolean): Promise<void> => {
    if (!user) throw new Error('Authentication required');
    
    setLoading(true);
    
    try {
      // Get the course data to calculate progress and find next lesson
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      
      if (!courseSnap.exists()) {
        throw new Error('Course not found');
      }
      
      const courseData = courseSnap.data();
      const totalLessons = calculateTotalLessons(courseData);
      
      // Get enrollment data
      const enrollmentRef = doc(db, 'enrollments', `${user.uid}_${courseId}`);
      const enrollmentSnap = await getDoc(enrollmentRef);
      
      // If not enrolled yet, create enrollment
      if (!enrollmentSnap.exists()) {
        await setDoc(enrollmentRef, {
          userId: user.uid,
          courseId: courseId,
          enrolledAt: serverTimestamp(),
          status: 'active',
          progress: {
            progress: completed ? (1 / totalLessons) * 100 : 0,
            completedLessons: completed ? [lessonId] : [],
            currentLesson: lessonId,
            nextLesson: findNextLesson(courseData, lessonId),
            lastAccessed: serverTimestamp(),
            totalLessons: totalLessons
          }
        });
        
        // Update course student count
        await updateDoc(courseRef, {
          students: increment(1)
        });
        
        return;
      }
      
      // Update existing enrollment
      const enrollmentData = enrollmentSnap.data();
      const completedLessons = enrollmentData.progress?.completedLessons || [];
      
      let updatedLessons = [...completedLessons];
      if (completed && !updatedLessons.includes(lessonId)) {
        updatedLessons.push(lessonId);
      } else if (!completed && updatedLessons.includes(lessonId)) {
        updatedLessons = updatedLessons.filter(id => id !== lessonId);
      }
      
      // Calculate new progress percentage
      const newProgress = calculateProgress(updatedLessons, totalLessons);
      
      // Determine if the course is completed
      const courseCompleted = newProgress >= 100;
      
      // Find the next lesson
      let nextLessonId = findNextLesson(courseData, lessonId);
      
      // Update enrollment document
      await updateDoc(enrollmentRef, {
        "progress.progress": newProgress,
        "progress.completedLessons": updatedLessons,
        "progress.currentLesson": lessonId,
        "progress.nextLesson": nextLessonId,
        "progress.lastAccessed": serverTimestamp(),
        "status": courseCompleted ? 'completed' : 'active'
      });
      
      // If course is completed, issue certificate
      if (courseCompleted && enrollmentData.status !== 'completed') {
        await markCourseCompleted(courseId);
      }
      
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserCourseProgress = async (courseId: string): Promise<CourseProgressData | null> => {
    if (!user) return null
    
    // Check if we have cached data
    const cachedData = getCachedProgress(courseId, user.uid);
    if (cachedData) {
      return cachedData;
    }
    
    setLoading(true)
    
    try {
      const enrollmentRef = doc(db, 'enrollments', `${user.uid}_${courseId}`)
      const enrollmentSnap = await getDoc(enrollmentRef)
      
      if (!enrollmentSnap.exists()) {
        return null
      }
      
      const enrollmentData = enrollmentSnap.data()
      
      const progressData = {
        progress: enrollmentData.progress?.progress || 0,
        completedLessons: enrollmentData.progress?.completedLessons || [],
        lastAccessedAt: enrollmentData.progress?.lastAccessed?.toDate() || new Date(),
        currentLesson: enrollmentData.progress?.currentLesson || '',
        nextLesson: enrollmentData.progress?.nextLesson || '',
        status: enrollmentData.status || 'active',
        totalLessons: enrollmentData.progress?.totalLessons || 0,
        moduleProgress: enrollmentData.progress?.moduleProgress || {}
      }
      
      // Cache the data
      setCachedProgress(courseId, user.uid, progressData);
      
      return progressData;
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
        certificateIssued,
        enrolledAt: enrollmentData.enrolledAt?.toDate() || null
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
        setCachedProgress,
        checkAccessStatus
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