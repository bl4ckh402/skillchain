"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthProvider'
import { toast } from '@/components/ui/use-toast'

// Required course ID for instructor eligibility
let REQUIRED_COURSE_ID = "" // Replace with your actual intro course ID

const getFirstCourseId = async (): Promise<string> => {
  try {
    const coursesQuery = query(
      collection(db, "courses"),
      orderBy("createdAt"),
      limit(1)
    );
    
    const coursesSnapshot = await getDocs(coursesQuery);
    
    if (!coursesSnapshot.empty) {
      return coursesSnapshot.docs[0].id;
    }
    
    return "";
  } catch (error) {
    console.error("Error fetching first course:", error);
    return "";
  }
};


export interface InstructorApplication {
  id: string
  userId: string
  fullName: string
  email: string
  expertise: string
  experience: string
  experienceLevel: string
  teachingExperience?: string
  courseIdeas: string
  motivation: string
  timeCommitment: string
  linkedinProfile?: string
  githubProfile?: string
  portfolioUrl?: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  feedback?: string
  nextSteps?: string
  isInstructorApplication: boolean
}

interface InstructorApplicationContextType {
  checkEligibility: () => Promise<boolean>
  getApplicationStatus: () => Promise<InstructorApplication | null>
  submitApplication: (application: Omit<InstructorApplication, 'id' | 'userId' | 'email' | 'status' | 'submittedAt'>) => Promise<string>
  isEligibilityLoading: boolean
  isEligible: boolean | null
  hasCompletedRequiredCourse: boolean | null
}


const InstructorApplicationContext = createContext<InstructorApplicationContextType | null>(null)

export function InstructorApplicationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isEligibilityLoading, setIsEligibilityLoading] = useState(false)
  const [isEligible, setIsEligible] = useState<boolean | null>(null)
  const [hasCompletedRequiredCourse, setHasCompletedRequiredCourse] = useState<boolean | null>(null)

  // Function to set the required course ID (used by component)
  const setRequiredCourseId = (courseId: string) => {
    if (courseId) {
      REQUIRED_COURSE_ID = courseId;
    }
  };

  /**
   * Check if the user is eligible to apply to become an instructor
   * The main requirement is completion of the introductory course
   */
  const checkEligibility = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to check your eligibility.",
        variant: "destructive"
      })
      return false
    }

    setIsEligibilityLoading(true)
    try {
      // If REQUIRED_COURSE_ID is empty, try to get it
      if (!REQUIRED_COURSE_ID) {
        REQUIRED_COURSE_ID = await getFirstCourseId();
        
        if (!REQUIRED_COURSE_ID) {
          toast({
            title: "Error",
            description: "Could not determine the required course. Please try again.",
            variant: "destructive"
          });
          return false;
        }
      }
      
      // Check if the user has already been approved as an instructor
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.data()
      
      if (userData?.role === 'instructor') {
        setIsEligible(true)
        return true
      }

      // Check if the user has already applied and the application is pending
      const existingApplicationQuery = query(
        collection(db, 'instructorApplications'),
        where('userId', '==', user.uid),
        where('status', '==', 'pending')
      )
      const existingApplicationSnapshot = await getDocs(existingApplicationQuery)
      
      if (!existingApplicationSnapshot.empty) {
        // User has a pending application
        setIsEligible(false)
        return false
      }

      // First check enrollments
      const enrollmentRef = doc(db, 'enrollments', `${user.uid}_${REQUIRED_COURSE_ID}`);
      const enrollmentSnap = await getDoc(enrollmentRef);
      
      if (enrollmentSnap.exists()) {
        const enrollmentData = enrollmentSnap.data();
        // Check if course is completed (100% progress or status 'completed')
        const courseCompleted = (enrollmentData.progress?.progress === 100) || 
                              (enrollmentData.status === 'completed');
        
        setHasCompletedRequiredCourse(courseCompleted);
        setIsEligible(courseCompleted);
        return courseCompleted;
      }
      
      // Fallback to progress collection if enrollment doesn't show completion
      const progressDoc = await getDoc(doc(db, `users/${user.uid}/progress`, REQUIRED_COURSE_ID))
      
      if (progressDoc.exists()) {
        const progressData = progressDoc.data()
        const courseCompleted = progressData.overallProgress === 100
        
        setHasCompletedRequiredCourse(courseCompleted)
        setIsEligible(courseCompleted)
        return courseCompleted
      } else {
        // User hasn't started the required course
        setHasCompletedRequiredCourse(false)
        setIsEligible(false)
        return false
      }
    } catch (error) {
      console.error("Error checking eligibility:", error)
      toast({
        title: "Error",
        description: "Failed to check eligibility. Please try again later.",
        variant: "destructive"
      })
      return false
    } finally {
      setIsEligibilityLoading(false)
    }
  }

  /**
   * Get the current status of the user's instructor application
   */
  const getApplicationStatus = async (): Promise<InstructorApplication | null> => {
    if (!user) return null

    try {
      const applicationQuery = query(
        collection(db, 'instructorApplications'),
        where('userId', '==', user.uid)
      )
      const applicationSnapshot = await getDocs(applicationQuery)

      if (!applicationSnapshot.empty) {
        // Return the most recent application
        const applications = applicationSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as InstructorApplication))
        
        // Sort by submission date, most recent first
        applications.sort((a, b) => {
          const dateA = a.submittedAt instanceof Date ? a.submittedAt : new Date(a.submittedAt)
          const dateB = b.submittedAt instanceof Date ? b.submittedAt : new Date(b.submittedAt)
          return dateB.getTime() - dateA.getTime()
        })
        
        return applications[0]
      }
      
      return null
    } catch (error) {
      console.error("Error getting application status:", error)
      return null
    }
  }

  /**
   * Submit a new instructor application
   */
  const submitApplication = async (application: Partial<InstructorApplication>): Promise<string> => {
    if (!user) {
      throw new Error("You must be logged in to submit an application")
    }

    try {
      // Generate a unique ID for the application
      const applicationId = `app_${Date.now()}_${user.uid.substring(0, 6)}`
      
      // Create the application document
      await setDoc(doc(db, 'instructorApplications', applicationId), {
        ...application,
        id: applicationId,
        userId: user.uid,
        email: user.email,
        status: 'pending',
        submittedAt: serverTimestamp(),
        isInstructorApplication: true, // Flag to identify this record
      })

      return applicationId
    } catch (error) {
      console.error("Error submitting application:", error)
      throw new Error("Failed to submit application. Please try again.")
    }
  }

  const value = {
    checkEligibility,
    getApplicationStatus,
    submitApplication,
    isEligibilityLoading,
    isEligible,
    hasCompletedRequiredCourse,
    setRequiredCourseId
  }

  return (
    <InstructorApplicationContext.Provider value={value}>
      {children}
    </InstructorApplicationContext.Provider>
  )
}

export const useInstructorApplication = () => {
  const context = useContext(InstructorApplicationContext)
  if (!context) {
    throw new Error("useInstructorApplication must be used within an InstructorApplicationProvider")
  }
  return context
}