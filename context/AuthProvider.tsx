"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail
} from 'firebase/auth'

interface UserProfile {
  uid: string
  email: string | null
  firstName?: string
  lastName?: string
  photoURL?: string
  enrolledCourses?: string[]
  createdCourses?: string[]
  role: 'student' | 'instructor' | 'admin'
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid))
    return userDoc.data() as UserProfile | null
  }

  // Create or update user profile in Firestore
  const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, { ...data, uid }, { merge: true })
    return await fetchUserProfile(uid)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const profile = await fetchUserProfile(user.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await createUserProfile(user.uid, {
      email: user.email,
      firstName,
      lastName,
      enrolledCourses: [],
      createdCourses: [],
      role: 'student'
    })
  }

  const signIn = async (email: string, password: string) => {
  try {
    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    // Get the user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    // If user exists in Firestore
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // If user doesn't have a role assigned yet
      if (!userData.role) {
        // Check if user has created courses
        const coursesQuery = query(
          collection(db, 'courses'),
          where('instructor.id', '==', user.uid)
        );
        
        const coursesSnapshot = await getDocs(coursesQuery);
        
        // If user has created at least one course, assign instructor role
        if (!coursesSnapshot.empty) {
          await updateDoc(doc(db, 'users', user.uid), {
            role: 'instructor'
          });

        }
      }
    }
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};



  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    const names = user.displayName?.split(' ') || ['', '']
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    await createUserProfile(user.uid, {
      email: user.email,
      firstName: names[0],
      lastName: names[1],
      photoURL: user.photoURL!,
      enrolledCourses: [],
      createdCourses: [],
      role: userDoc.exists() ? userDoc.data().role : 'student'
    })
  }

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    const names = user.displayName?.split(' ') || ['', '']
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    await createUserProfile(user.uid, {
      email: user.email,
      firstName: names[0],
      lastName: names[1],
      photoURL: user.photoURL!,
      enrolledCourses: [],
      createdCourses: [],
      role: userDoc.exists() ? userDoc.data().role : 'student'
    })
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return
    await createUserProfile(user.uid, data)
    const updatedProfile = await fetchUserProfile(user.uid)
    setUserProfile(updatedProfile)
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    resetPassword,
    updateUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}