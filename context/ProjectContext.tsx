"use client"

import { createContext, useContext, useState } from 'react'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  doc, 
  updateDoc, 
  increment,
  orderBy, 
  serverTimestamp,
  getDoc, 
  arrayUnion,
  limit
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { Project, TeamMember } from '@/types/project'
import { useAuth } from './AuthProvider'

interface ProjectContextType {
  submitProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateProject: (id: string, project: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  getWinningProjects: (limitCount:number) => Promise<Project[]>
  getProjectsByHackathon: (hackathonId: string) => Promise<Project[]>
  getProjectById: (projectId: string) => Promise<Project | null>
  likeProject: (projectId: string) => Promise<void>
  uploadProjectImage: (file: File) => Promise<string>
  addTeamMember: (projectId: string, member: TeamMember) => Promise<void>
  removeTeamMember: (projectId: string, memberId: string) => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | null>(null)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const uploadProjectImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('Must be logged in')

    const fileRef = ref(storage, `project-images/${Date.now()}_${file.name}`)
    await uploadBytes(fileRef, file)
    return getDownloadURL(fileRef)
  }

  const getProjectById = async (id: string) => {
    try {
      const docRef = doc(db, 'projects', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Project
      }
      return null
    } catch (error: any) {
      throw new Error(`Error fetching project: ${error.message}`)
    }
  }

  const submitProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Must be logged in')

    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...project,
        views: 0,
        likes: [],
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error: any) {
      throw new Error(`Error submitting project: ${error.message}`)
    }
  }

  const updateProject = async (id: string, project: Partial<Project>) => {
    try {
      const projectRef = doc(db, 'projects', id)
      await updateDoc(projectRef, {
        ...project,
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      throw new Error(`Error updating project: ${error.message}`)
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id))
    } catch (error: any) {
      throw new Error(`Error deleting project: ${error.message}`)
    }
  }

  const getWinningProjects = async (limitCount:number) => {
    try {
      const q = query(
        collection(db, 'projects'),
        where('status', 'in', ['winner', 'runner-up', 'finalist']),
        orderBy('prizeWon.position', 'asc'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Project[]
    } catch (error: any) {
      throw new Error(`Error fetching winning projects: ${error.message}`)
    }
  }

  const getProjectsByHackathon = async (hackathonId: string) => {
    try {
      const q = query(
        collection(db, 'projects'),
        where('hackathonId', '==', hackathonId),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[]
    } catch (error: any) {
      throw new Error(`Error fetching hackathon projects: ${error.message}`)
    }
  }

  // const getProjectById = async (projectId: string) => {
  //   try {
  //     const docRef = doc(db, 'projects', projectId)
  //     const docSnap = await getDoc(docRef)
  //     if (docSnap.exists()) {
  //       // Increment view count
  //       await updateDoc(docRef, {
  //         views: increment(1)
  //       })
  //       return {
  //         id: docSnap.id,
  //         ...docSnap.data()
  //       } as Project
  //     }
  //     return null
  //   } catch (error: any) {
  //     throw new Error(`Error fetching project: ${error.message}`)
  //   }
  // }

  const likeProject = async (projectId: string) => {
    if (!user) throw new Error('Must be logged in')

    try {
      const projectRef = doc(db, 'projects', projectId)
      const projectSnap = await getDoc(projectRef)
      
      if (!projectSnap.exists()) throw new Error('Project not found')
      
      const likes = projectSnap.data().likes || []
      
      if (likes.includes(user.uid)) {
        // Unlike
        await updateDoc(projectRef, {
          likes: likes.filter((id: string) => id !== user.uid)
        })
      } else {
        // Like
        await updateDoc(projectRef, {
          likes: [...likes, user.uid]
        })
      }
    } catch (error: any) {
      throw new Error(`Error liking project: ${error.message}`)
    }
  }

  const addTeamMember = async (projectId: string, member: TeamMember) => {
    try {
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        teamMembers: arrayUnion(member),
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      throw new Error(`Error adding team member: ${error.message}`)
    }
  }

  const removeTeamMember = async (projectId: string, memberId: string) => {
    try {
      const projectRef = doc(db, 'projects', projectId)
      const projectSnap = await getDoc(projectRef)
      
      if (!projectSnap.exists()) throw new Error('Project not found')
      
      const teamMembers = projectSnap.data().teamMembers || []
      await updateDoc(projectRef, {
        teamMembers: teamMembers.filter((m: TeamMember) => m.id !== memberId),
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      throw new Error(`Error removing team member: ${error.message}`)
    }
  }

  const value = {
    submitProject,
    updateProject,
    deleteProject,
    getWinningProjects,
    getProjectsByHackathon,
    getProjectById,
    likeProject,
    uploadProjectImage,
    addTeamMember,
    removeTeamMember,
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}