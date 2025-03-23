"use client"

import { createContext, useContext, useState } from 'react'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, limit, serverTimestamp, increment, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { Course, CourseFilters, CourseStatus } from '@/types/course'
import { useAuth } from './AuthProvider'

interface CourseContextType {
  courses: Course[]
  loading: boolean
  filters: CourseFilters
  setFilters: (filters: CourseFilters) => void
  createCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  publishCourse: (id: string) => Promise<void>
  archiveCourse: (id: string) => Promise<void>
  getFeaturedCourses: () => Promise<Course[]>
  getMyCourses: () => Promise<Course[]>
  getCoursesByInstructor: (instructorId: string) => Promise<Course[]>
  searchCourses: (query: string) => Promise<Course[]>
  enrollInCourse: (courseId: string) => Promise<void>
  uploadCourseImage: (file: File) => Promise<string>
}

const CourseContext = createContext<CourseContextType | null>(null)

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<CourseFilters>({})
  const { user } = useAuth()

  const createCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Must be logged in')
    
    try {
      const docRef = await addDoc(collection(db, 'courses'), {
        ...course,
        students: 0,
        rating: 0,
        reviews: 0,
        status: CourseStatus.DRAFT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        instructor: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || '',
          bio: ''
        }
      })
      return docRef.id
    } catch (error: any) {
      throw new Error(`Error creating course: ${error.message}`)
    }
  }

  const updateCourse = async (id: string, course: Partial<Course>) => {
    try {
      const courseRef = doc(db, 'courses', id)
      await updateDoc(courseRef, {
        ...course,
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      throw new Error(`Error updating course: ${error.message}`)
    }
  }

  const deleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'courses', id))
    } catch (error: any) {
      throw new Error(`Error deleting course: ${error.message}`)
    }
  }

  const publishCourse = async (id: string) => {
    try {
      const courseRef = doc(db, 'courses', id)
      await updateDoc(courseRef, {
        status: CourseStatus.PUBLISHED,
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      throw new Error(`Error publishing course: ${error.message}`)
    }
  }

  const archiveCourse = async (id: string) => {
    try {
      const courseRef = doc(db, 'courses', id)
      await updateDoc(courseRef, {
        status: CourseStatus.ARCHIVED,
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      throw new Error(`Error archiving course: ${error.message}`)
    }
  }

  const getFeaturedCourses = async () => {
    try {
      const q = query(
        collection(db, 'courses'),
        where('status', '==', CourseStatus.PUBLISHED),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(6)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Record<string, any>)
      })) as Course[]
    } catch (error: any) {
      throw new Error(`Error fetching featured courses: ${error.message}`)
    }
  }

  const getMyCourses = async () => {
    if (!user) return []
    
    try {
      const q = query(
        collection(db, 'courses'),
        where('instructor.id', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Record<string, any>)
      })) as Course[]
    } catch (error: any) {
      throw new Error(`Error fetching my courses: ${error.message}`)
    }
  }

  const getCoursesByInstructor = async (instructorId: string) => {
    try {
      const q = query(
        collection(db, 'courses'),
        where('instructor.id', '==', instructorId),
        where('status', '==', CourseStatus.PUBLISHED),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[]
    } catch (error: any) {
      throw new Error(`Error fetching instructor courses: ${error.message}`)
    }
  }

  const searchCourses = async (question:string) => {
    try {
      // Basic search implementation - can be improved with Algolia or similar
      const q = query(
        collection(db, 'courses'),
        where('status', '==', CourseStatus.PUBLISHED),
        orderBy('title')
      )
      const snapshot = await getDocs(q)
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[]
      
      return courses.filter(course => 
        course.title.toLowerCase().includes(question.toLowerCase()) ||
        course.description.toLowerCase().includes(question.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(question.toLowerCase()))
      )
    } catch (error: any) {
      throw new Error(`Error searching courses: ${error.message}`)
    }
  }

  const enrollInCourse = async (courseId: string) => {
    if (!user) throw new Error('Must be logged in')

    try {
      const courseRef = doc(db, 'courses', courseId)
      const enrollmentRef = doc(db, 'enrollments', `${courseId}_${user.uid}`)
      
      await updateDoc(courseRef, {
        students: increment(1)
      })

      await setDoc(enrollmentRef, {
        courseId,
        userId: user.uid,
        enrolledAt: serverTimestamp(),
        progress: 0,
        completed: false
      })
    } catch (error: any) {
      throw new Error(`Error enrolling in course: ${error.message}`)
    }
  }

  const uploadCourseImage = async (file: File) => {
    if (!user) throw new Error('Must be logged in')

    try {
      const storageRef = ref(storage, `courses/${user.uid}/${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      return url
    } catch (error: any) {
      throw new Error(`Error uploading image: ${error.message}`)
    }
  }

  const value = {
    courses,
    loading,
    filters,
    setFilters,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    archiveCourse,
    getFeaturedCourses,
    getMyCourses,
    getCoursesByInstructor,
    searchCourses,
    enrollInCourse,
    uploadCourseImage
  }

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  )
}

export const useCourses = () => {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider')
  }
  return context
}