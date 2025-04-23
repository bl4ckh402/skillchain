"use client"

import { createContext, useContext, useState } from "react"
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  serverTimestamp,
  getDoc,
  increment,
  setDoc,
  arrayUnion,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "./AuthProvider"
import { Bootcamp } from "@/types/bootcamp"

interface BootcampFilters {
  category?: string[]
  level?: string[]
  status?: string[]
  search?: string
  sort?: string
}

interface BootcampContextType {
  bootcamps: Bootcamp[]
  loading: boolean
  filters: BootcampFilters
  setFilters: (filters: BootcampFilters) => void
  createBootcamp: (bootcamp: Omit<Bootcamp, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateBootcamp: (id: string, bootcamp: Partial<Bootcamp>) => Promise<void>
  deleteBootcamp: (id: string) => Promise<void>
  getBootcampById: (id: string) => Promise<Bootcamp | null>
  getBootcamps: (filters?: BootcampFilters) => Promise<Bootcamp[]>
  getFeaturedBootcamps: () => Promise<Bootcamp[]>
  getMyBootcamps: () => Promise<Bootcamp[]>
  enrollInBootcamp: (bootcampId: string) => Promise<void>
  uploadBootcampImage: (file: File) => Promise<string>
  addMentor: (bootcampId: string, mentorId: string) => Promise<void>
  removeMentor: (bootcampId: string, mentorId: string) => Promise<void>
  addLiveSession: (bootcampId: string, session: { title: string; date: Date; duration: string; description: string }) => Promise<void>
  removeLiveSession: (bootcampId: string, sessionId: string) => Promise<void>
}

const BootcampContext = createContext<BootcampContextType | null>(null)

export function BootcampProvider({ children }: { children: React.ReactNode }) {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<BootcampFilters>({})
  const { user } = useAuth()

  const createBootcamp = async (bootcamp: Omit<Bootcamp, "id" | "createdAt" | "updatedAt">) => {
    if (!user) throw new Error("Must be logged in")

    try {
      const docRef = await addDoc(collection(db, "bootcamps"), {
        ...bootcamp,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        currentParticipants: 0,
        instructor: {
          id: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || "",
          bio: "",
        },
      })
      return docRef.id
    } catch (error: any) {
      throw new Error(`Error creating bootcamp: ${error.message}`)
    }
  }

  const updateBootcamp = async (id: string, bootcamp: Partial<Bootcamp>) => {
    try {
      const docRef = doc(db, "bootcamps", id)
      await updateDoc(docRef, {
        ...bootcamp,
        updatedAt: serverTimestamp(),
      })
    } catch (error: any) {
      throw new Error(`Error updating bootcamp: ${error.message}`)
    }
  }

  const deleteBootcamp = async (id: string) => {
    try {
      await deleteDoc(doc(db, "bootcamps", id))
    } catch (error: any) {
      throw new Error(`Error deleting bootcamp: ${error.message}`)
    }
  }

  const getBootcampById = async (id: string) => {
    try {
      const docRef = doc(db, "bootcamps", id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Bootcamp
      }
      return null
    } catch (error: any) {
      throw new Error(`Error fetching bootcamp: ${error.message}`)
    }
  }

  const getBootcamps = async (filters?: BootcampFilters) => {
    setLoading(true)
    try {
      let bootcampsQuery = query(collection(db, "bootcamps"))

      if (filters?.category?.length) {
        bootcampsQuery = query(bootcampsQuery, where("category", "in", filters.category))
      }

      if (filters?.level?.length) {
        bootcampsQuery = query(bootcampsQuery, where("level", "in", filters.level))
      }

      if (filters?.status?.length) {
        bootcampsQuery = query(bootcampsQuery, where("status", "in", filters.status))
      }

      bootcampsQuery = query(bootcampsQuery, orderBy("createdAt", "desc"))

      const snapshot = await getDocs(bootcampsQuery)
      const bootcampsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Bootcamp[]

      setBootcamps(bootcampsList)
      return bootcampsList
    } catch (error: any) {
      throw new Error(`Error fetching bootcamps: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getFeaturedBootcamps = async () => {
    try {
      const featuredQuery = query(
        collection(db, "bootcamps"),
        where("featured", "==", true),
        orderBy("createdAt", "desc")
      )
      const snapshot = await getDocs(featuredQuery)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Bootcamp[]
    } catch (error: any) {
      throw new Error(`Error fetching featured bootcamps: ${error.message}`)
    }
  }

  const getMyBootcamps = async () => {
    if (!user) throw new Error("Must be logged in")

    try {
      console.log("Current user ID:", user.uid) // Debug log
      
      const myBootcampsQuery = query(
        collection(db, "bootcamps"),
        where("instructor.id", "==", user.uid),
        orderBy("createdAt", "desc")
      )

      console.log("Query constructed") // Debug log
      
      const snapshot = await getDocs(myBootcampsQuery)
      console.log("Query executed, found documents:", snapshot.size) // Debug log
      
      // Debug log each document
      snapshot.forEach(doc => {
        console.log("Document data:", doc.id, doc.data())
      })

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Bootcamp[]
    } catch (error: any) {
      console.error("Full error details:", error) // More detailed error logging
      throw new Error(`Error fetching my bootcamps: ${error.message}`)
    }
  }

  const enrollInBootcamp = async (bootcampId: string) => {
    if (!user) throw new Error("Must be logged in")

    try {
      const bootcampRef = doc(db, "bootcamps", bootcampId)
      const enrollmentRef = doc(db, "bootcamp_enrollments", `${bootcampId}_${user.uid}`)

      // Update bootcamp participants count
      await updateDoc(bootcampRef, {
        currentParticipants: increment(1),
      })

      // Create enrollment record
      await setDoc(enrollmentRef, {
        bootcampId,
        userId: user.uid,
        enrolledAt: serverTimestamp(),
        status: "active",
      })
    } catch (error: any) {
      throw new Error(`Error enrolling in bootcamp: ${error.message}`)
    }
  }

  const uploadBootcampImage = async (file: File) => {
    if (!user) throw new Error("Must be logged in")

    try {
      const fileRef = ref(storage, `bootcamp-images/${Date.now()}_${file.name}`)
      await uploadBytes(fileRef, file)
      return getDownloadURL(fileRef)
    } catch (error: any) {
      throw new Error(`Error uploading image: ${error.message}`)
    }
  }

  const addMentor = async (bootcampId: string, mentorId: string) => {
    try {
      const mentorDoc = await getDoc(doc(db, "users", mentorId))
      if (!mentorDoc.exists()) throw new Error("Mentor not found")

      const mentorData = mentorDoc.data()
      const mentor = {
        id: mentorId,
        name: mentorData.displayName || "Anonymous",
        avatar: mentorData.photoURL || "",
        bio: mentorData.bio || "",
      }

      await updateDoc(doc(db, "bootcamps", bootcampId), {
        mentors: increment(1),
        "mentors.list": arrayUnion(mentor),
      })
    } catch (error: any) {
      throw new Error(`Error adding mentor: ${error.message}`)
    }
  }

  const removeMentor = async (bootcampId: string, mentorId: string) => {
    try {
      const bootcampDoc = await getDoc(doc(db, "bootcamps", bootcampId))
      if (!bootcampDoc.exists()) throw new Error("Bootcamp not found")

      const bootcampData = bootcampDoc.data()
      const updatedMentors = bootcampData.mentors.list.filter(
        (mentor: any) => mentor.id !== mentorId
      )

      await updateDoc(doc(db, "bootcamps", bootcampId), {
        mentors: increment(-1),
        "mentors.list": updatedMentors,
      })
    } catch (error: any) {
      throw new Error(`Error removing mentor: ${error.message}`)
    }
  }

  const addLiveSession = async (bootcampId: string, session: { title: string; date: Date; duration: string; description: string }) => {
    try {
      await updateDoc(doc(db, "bootcamps", bootcampId), {
        liveSessions: arrayUnion({
          id: crypto.randomUUID(),
          ...session,
        }),
      })
    } catch (error: any) {
      throw new Error(`Error adding live session: ${error.message}`)
    }
  }

  const removeLiveSession = async (bootcampId: string, sessionId: string) => {
    try {
      const bootcampDoc = await getDoc(doc(db, "bootcamps", bootcampId))
      if (!bootcampDoc.exists()) throw new Error("Bootcamp not found")

      const bootcampData = bootcampDoc.data()
      const updatedSessions = bootcampData.liveSessions.filter(
        (session: any) => session.id !== sessionId
      )

      await updateDoc(doc(db, "bootcamps", bootcampId), {
        liveSessions: updatedSessions,
      })
    } catch (error: any) {
      throw new Error(`Error removing live session: ${error.message}`)
    }
  }

  const value = {
    bootcamps,
    loading,
    filters,
    setFilters,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampById,
    getBootcamps,
    getFeaturedBootcamps,
    getMyBootcamps,
    enrollInBootcamp,
    uploadBootcampImage,
    addMentor,
    removeMentor,
    addLiveSession,
    removeLiveSession,
  }

  return (
    <BootcampContext.Provider value={value}>
      {children}
    </BootcampContext.Provider>
  )
}

export const useBootcamps = () => {
  const context = useContext(BootcampContext)
  if (!context) {
    throw new Error("useBootcamps must be used within a BootcampProvider")
  }
  return context
}