import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Job } from '@/types/job'

export function useJob(id: string) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJob() {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', id))
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() } as Job)
        } else {
          setError('Job not found')
        }
      } catch (err) {
        setError('Failed to load job')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  return { job, loading, error }
}