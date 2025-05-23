import { initializeApp, getApps } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import { getAuth, browserPopupRedirectResolver } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

// Export auth with popup redirect resolver
export const auth = getAuth(app)
// Configure app verification for testing
auth.useDeviceLanguage();
if (process.env.NODE_ENV === 'development') {
  (auth as any).appVerificationDisabledForTesting = true; // Enable for development
}

export const db = getFirestore(app)
export const storage = getStorage(app)

// Only initialize analytics on the client side
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

// Helper function to create/update user profile
export const createUserProfile = async (uid: string, data: any) => {
  const userRef = doc(db, 'users', uid)
  await setDoc(userRef, { ...data, uid }, { merge: true })
  const userDoc = await getDoc(userRef)
  return userDoc.data()
}

export { analytics }