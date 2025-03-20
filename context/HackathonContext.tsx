"use client"

import { createContext, useContext, useState } from 'react'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Hackathon {
  id?: string
  title: string
  organizer: string
  logo: string
  website: string
  startDate: Date
  endDate: Date
  location: string
  participants: number
  prizePool: string
  status: 'upcoming' | 'active' | 'completed'
  tags: string[]
  description: string
  image?: string
  featured: boolean
  sponsors: {
    name: string
    logo: string
  }[]
  timeline: {
    date: string
    event: string
    description: string
  }[]
  resources: {
    type: string
    title: string
    link: string
  }[]
  prizes: {
    title: string
    amount: string
    description: string
  }[]
  judges: {
    name: string
    title: string
    avatar: string
  }[]
}

interface HackathonFilters {
  status?: string[]
  tags?: string[]
}

interface HackathonsContextType {
  hackathons: Hackathon[]
  loading: boolean
  filters: HackathonFilters
  setFilters: (filters: HackathonFilters) => void
  createHackathon: (hackathon: Omit<Hackathon, 'id'>) => Promise<string>
  updateHackathon: (id: string, hackathon: Partial<Hackathon>) => Promise<void>
  deleteHackathon: (id: string) => Promise<void>
  getHackathons: (filters?: HackathonFilters) => Promise<void>
  getFeaturedHackathons: () => Promise<Hackathon[]>
  getHackathonsByOrganizer: (organizerId: string) => Promise<Hackathon[]>
  registerParticipant: (hackathonId: string, userId: string) => Promise<void>
}

const HackathonsContext = createContext<HackathonsContextType | null>(null)

export function HackathonsProvider({ children }: { children: React.ReactNode }) {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<HackathonFilters>({})

  const createHackathon = async (hackathon: Omit<Hackathon, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'hackathons'), hackathon)
      return docRef.id
    } catch (error: any) {
      throw new Error(`Error creating hackathon: ${error.message}`)
    }
  }

  const updateHackathon = async (id: string, hackathon: Partial<Hackathon>) => {
    try {
      const hackathonRef = doc(db, 'hackathons', id)
      await updateDoc(hackathonRef, hackathon)
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
      let hackathonsQuery = query(collection(db, 'hackathons'))

      if (filters) {
        if (filters.status?.length) {
          hackathonsQuery = query(hackathonsQuery, where('status', 'in', filters.status))
        }
        if (filters.tags?.length) {
          hackathonsQuery = query(hackathonsQuery, where('tags', 'array-contains-any', filters.tags))
        }
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
        where('featured', '==', true)
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

  const getHackathonsByOrganizer = async (organizerId: string) => {
    try {
      const organizerQuery = query(
        collection(db, 'hackathons'),
        where('organizerId', '==', organizerId)
      )
      const snapshot = await getDocs(organizerQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Hackathon[]
    } catch (error: any) {
      throw new Error(`Error fetching organizer hackathons: ${error.message}`)
    }
  }

  const registerParticipant = async (hackathonId: string, userId: string) => {
    try {
      const hackathonRef = doc(db, 'hackathons', hackathonId)
      const participantRef = doc(db, 'hackathon_participants', `${hackathonId}_${userId}`)
      
      await updateDoc(hackathonRef, {
        participants: increment(1)
      })

      await setDoc(participantRef, {
        hackathonId,
        userId,
        registeredAt: new Date()
      })
    } catch (error: any) {
      throw new Error(`Error registering participant: ${error.message}`)
    }
  }

  const value = {
    hackathons,
    loading,
    filters,
    setFilters,
    createHackathon,
    updateHackathon,
    deleteHackathon,
    getHackathons,
    getFeaturedHackathons,
    getHackathonsByOrganizer,
    registerParticipant
  }

  return (
    <HackathonsContext.Provider value={value}>
      {children}
    </HackathonsContext.Provider>
  )
}

export const useHackathons = () => {
  const context = useContext(HackathonsContext)
  if (!context) {
    throw new Error('useHackathons must be used within a HackathonsProvider')
  }
  return context
}