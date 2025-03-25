"use client"

import { createContext, useContext, useState } from 'react'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc, increment, serverTimestamp, orderBy, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './AuthProvider'
import { Hackathon, HackathonFilters } from '@/types/hackathon'

interface HackathonContextType {
  hackathons: Hackathon[]
  loading: boolean
  filters: HackathonFilters
  setFilters: (filters: HackathonFilters) => void
  getHackathonById: (id: string) => Promise<Hackathon | null>
  createHackathon: (hackathon: Omit<Hackathon, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateHackathon: (id: string, hackathon: Partial<Hackathon>) => Promise<void>
  deleteHackathon: (id: string) => Promise<void>
  getHackathons: (filters?: HackathonFilters) => Promise<void>
  getFeaturedHackathons: () => Promise<Hackathon[]>
  getMyHackathons: () => Promise<Hackathon[]>
  registerForHackathon: (hackathonId: string) => Promise<void>
}

const HackathonContext = createContext<HackathonContextType | null>(null)

export function HackathonProvider({ children }: { children: React.ReactNode }) {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<HackathonFilters>({})
  const { user } = useAuth()

  const createHackathon = async (hackathon: Omit<Hackathon, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Must be logged in')
    
    try {
      const docRef = await addDoc(collection(db, 'hackathons'), {
        ...hackathon,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error: any) {
      throw new Error(`Error creating hackathon: ${error.message}`)
    }
  }

  const updateHackathon = async (id: string, hackathon: Partial<Hackathon>) => {
    try {
      const hackathonRef = doc(db, 'hackathons', id)
      await updateDoc(hackathonRef, {
        ...hackathon,
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      throw new Error(`Error updating hackathon: ${error.message}`)
    }
  }

  const deleteHackathon = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'hackathons', id))
    } catch (error: any) {
      throw new Error(`Error deleting hackathon: ${error.message}`)
    }
  }

  const getHackathons = async (filters?: HackathonFilters) => {
    setLoading(true)
    try {
      let hackathonsQuery = query(
        collection(db, 'hackathons'),
        orderBy('createdAt', 'desc')
      )

      if (filters?.status?.length) {
        hackathonsQuery = query(hackathonsQuery, where('status', 'in', filters.status))
      }

      if (filters?.tags?.length) {
        hackathonsQuery = query(hackathonsQuery, where('tags', 'array-contains-any', filters.tags))
      }

      const snapshot = await getDocs(hackathonsQuery)
      const hackathonsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Hackathon[]

      setHackathons(hackathonsList)
    } catch (error: any) {
      throw new Error(`Error fetching hackathons: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getFeaturedHackathons = async () => {
    try {
      const featuredQuery = query(
        collection(db, 'hackathons'),
        where('featured', '==', true),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(featuredQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Hackathon[]
    } catch (error: any) {
      throw new Error(`Error fetching featured hackathons: ${error.message}`)
    }
  }

  const getMyHackathons = async () => {
    if (!user) return []
    
    try {
      const registrationsQuery = query(
        collection(db, 'hackathon_participants'),
        where('userId', '==', user.uid)
      )
      const registrationsSnapshot = await getDocs(registrationsQuery)
      const hackathonIds = registrationsSnapshot.docs.map(doc => doc.data().hackathonId)

      if (!hackathonIds.length) return []

      const hackathonsQuery = query(
        collection(db, 'hackathons'),
        where('id', 'in', hackathonIds)
      )
      const hackathonsSnapshot = await getDocs(hackathonsQuery)
      return hackathonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Hackathon[]
    } catch (error: any) {
      throw new Error(`Error fetching my hackathons: ${error.message}`)
    }
  }

  const getHackathonById = async (id: string) => {
    try {
      const docRef = doc(db, 'hackathons', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Hackathon
      } else {
        return null
      }
    } catch (error: any) {
      throw new Error(`Error fetching hackathon: ${error.message}`)
    }
  }

  const registerForHackathon = async (hackathonId: string) => {
    if (!user) throw new Error('Must be logged in')

    try {
      const hackathonRef = doc(db, 'hackathons', hackathonId)
      const participantRef = doc(db, 'hackathon_participants', `${hackathonId}_${user.uid}`)
      
      await updateDoc(hackathonRef, {
        participants: increment(1)
      })

      await setDoc(participantRef, {
        hackathonId,
        userId: user.uid,
        registeredAt: serverTimestamp()
      })
    } catch (error: any) {
      throw new Error(`Error registering for hackathon: ${error.message}`)
    }
  }

  const value = {
    hackathons,
    loading,
    filters,
    setFilters,
    getHackathonById,
    createHackathon,
    updateHackathon,
    deleteHackathon,
    getHackathons,
    getFeaturedHackathons,
    getMyHackathons,
    registerForHackathon
  }

  return (
    <HackathonContext.Provider value={value}>
      {children}
    </HackathonContext.Provider>
  )
}

export const useHackathons = () => {
  const context = useContext(HackathonContext)
  if (!context) {
    throw new Error('useHackathons must be used within a HackathonProvider')
  }
  return context
}