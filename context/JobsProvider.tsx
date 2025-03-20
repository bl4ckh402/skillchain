"use client"

import { createContext, useContext, useState } from 'react'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Job, JobFilters } from '@/types/job'

interface JobsContextType {
  jobs: Job[]
  loading: boolean
  filters: JobFilters
  setFilters: (filters: JobFilters) => void
  createJob: (job: Omit<Job, 'id' | 'postedAt'>) => Promise<string>
  updateJob: (id: string, job: Partial<Job>) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  getJobs: (filters?: JobFilters) => Promise<void>
  getFeaturedJobs: () => Promise<Job[]>
  getJobsByUser: (userId: string) => Promise<Job[]>
  applyForJob: (jobId: string) => Promise<void>
  saveJob: (jobId: string) => Promise<void>
}

const JobsContext = createContext<JobsContextType | null>(null)

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<JobFilters>({ type: [], location: [], tags: [], salaryRange: undefined, experience: [] })

  const createJob = async (job: Omit<Job, 'id' | 'postedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'jobs'), {
        ...job
      })
      return docRef.id
    } catch (error: any) {
      throw new Error(`Error creating job: ${error.message}`)
    }
  }

  const updateJob = async (id: string, job: Partial<Job>) => {
    try {
      const jobRef = doc(db, 'jobs', id)
      await updateDoc(jobRef, job)
    } catch (error: any) {
      throw new Error(`Error updating job: ${error.message}`)
    }
  }

  const deleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', id))
    } catch (error: any) {
      throw new Error(`Error deleting job: ${error.message}`)
    }
  }

  const getJobs = async (filters?: JobFilters) => {
    setLoading(true)
    try {
      let jobsQuery = query(collection(db, 'jobs'))

      if (filters) {
        if (filters.type?.length) {
          jobsQuery = query(jobsQuery, where('type', 'in', filters.type))
        }
        if (filters.location?.length) {
          jobsQuery = query(jobsQuery, where('location', 'in', filters.location))
        }
        if (filters.tags?.length) {
          jobsQuery = query(jobsQuery, where('tags', 'array-contains-any', filters.tags))
        }
      }

      const snapshot = await getDocs(jobsQuery)
      const jobsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[]

      setJobs(jobsList)
    } catch (error: any) {
      throw new Error(`Error fetching jobs: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getFeaturedJobs = async () => {
    try {
      const featuredQuery = query(
        collection(db, 'jobs'),
        where('featured', '==', true)
      )
      const snapshot = await getDocs(featuredQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[]
    } catch (error: any) {
      throw new Error(`Error fetching featured jobs: ${error.message}`)
    }
  }

  const getJobsByUser = async (userId: string) => {
    try {
      const userJobsQuery = query(
        collection(db, 'jobs'),
        where('postedBy', '==', userId)
      )
      const snapshot = await getDocs(userJobsQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[]
    } catch (error: any) {
      throw new Error(`Error fetching user jobs: ${error.message}`)
    }
  }

  const applyForJob = async (jobId: string) => {
    if (!auth.currentUser) throw new Error('Must be logged in')
    const jobRef = doc(db, 'jobs', jobId)
    await updateDoc(jobRef, {
      applications: arrayUnion(auth.currentUser.uid)
    })
  }
  
  const saveJob = async (jobId: string) => {
    if (!auth.currentUser) throw new Error('Must be logged in')
    const userRef = doc(db, 'users', auth.currentUser.uid)
    await updateDoc(userRef, {
      savedJobs: arrayUnion(jobId)
    })
  }

  const value = {
    jobs,
    loading,
    filters,
    setFilters,
    createJob,
    updateJob,
    deleteJob,
    getJobs,
    getFeaturedJobs,
    getJobsByUser,
    applyForJob,
    saveJob
  }

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  )
}

export const useJobs = () => {
  const context = useContext(JobsContext)
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider')
  }
  return context
}