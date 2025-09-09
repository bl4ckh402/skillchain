"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  UserCredential,
  getIdToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
} from "firebase/auth";

interface UserProfile {
  uid: string;
  email: string | null;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  enrolledCourses?: string[];
  createdCourses?: string[];
  role: "student" | "instructor" | "admin";
  is2FAEnabled?: boolean;
  twoFactorSecret?: string;
}

interface AuthContextType {
  enable2FA: () => Promise<{ qrCodeUrl: string; secret: string }>;
  verify2FA: (code: string) => Promise<boolean>;
  disable2FA: () => Promise<void>;
  is2FAEnabled: boolean;
  promoteToInstructor: (userId: string) => Promise<void>;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.data() as UserProfile | null;
  };

  // Create or update user profile in Firestore
  const createUserProfileDoc = async (
    uid: string,
    data: Partial<UserProfile>
  ) => {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, { ...data, uid }, { merge: true });
    return await fetchUserProfile(uid);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();
        if (userData?.emailVerified) {
          setUser(firebaseUser); // Only set user if verified
          setUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            photoURL: userData.photoURL,
            enrolledCourses: userData.enrolledCourses,
            createdCourses: userData.createdCourses,
            role: userData.role,
            is2FAEnabled: userData.is2FAEnabled,
            twoFactorSecret: userData.twoFactorSecret,
          });
        } else {
          setUser(null); // Not verified, not logged in
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const enable2FA = async () => {
    if (!user) throw new Error("User not authenticated");
    try {
      const response = await fetch("/api/token/generate-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getIdToken(user)}`,
        },
      });
      if (!response.ok) throw new Error("Failed to enable 2FA");

      const data = await response.json();
      return {
        qrCodeUrl: data.qrCodeUrl,
        secret: data.secret,
      };
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      throw error;
    }
  };

  const verify2FA = async (code: string) => {
    if (!user) throw new Error("User not authenticated");
    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          code,
        }),
      });
      if (!response.ok) throw new Error("Invalid Verification code");

      setIs2FAEnabled(true);
      return true;
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      throw error;
    }
  };

  const disable2FA = async () => {
    if (!user) throw new Error("Must be logged in");

    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error("Failed to disable 2FA");
      }

      await updateDoc(doc(db, "users", user.uid), {
        is2FAEnabled: false,
      });

      setIs2FAEnabled(false);
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<void> => {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await createUserProfileDoc(user.uid, {
      email: user.email,
      firstName,
      lastName,
      enrolledCourses: [],
      createdCourses: [],
      role: "student",
    });
    // No return value needed for Promise<void>
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { user } = userCredential;

      // Get the user document from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      // If user exists in Firestore
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // If user doesn't have a role assigned yet
        if (!userData.role) {
          // Check if user has created courses
          const coursesQuery = query(
            collection(db, "courses"),
            where("instructor.id", "==", user.uid)
          );

          const coursesSnapshot = await getDocs(coursesQuery);

          // If user has created at least one course, assign instructor role
          if (!coursesSnapshot.empty) {
            await updateDoc(doc(db, "users", user.uid), {
              role: "instructor",
            });
          }
        }
      }
      return userCredential;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    const names = user.displayName?.split(" ") || ["", ""];
    const userDoc = await getDoc(doc(db, "users", user.uid));
    await createUserProfileDoc(user.uid, {
      email: user.email,
      firstName: names[0],
      lastName: names[1],
      photoURL: user.photoURL!,
      enrolledCourses: [],
      createdCourses: [],
      role: userDoc.exists() ? userDoc.data().role : "student",
    });
  };

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    const names = user.displayName?.split(" ") || ["", ""];
    const userDoc = await getDoc(doc(db, "users", user.uid));
    await createUserProfileDoc(user.uid, {
      email: user.email,
      firstName: names[0],
      lastName: names[1],
      photoURL: user.photoURL!,
      enrolledCourses: [],
      createdCourses: [],
      role: userDoc.exists() ? userDoc.data().role : "student",
    });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await createUserProfileDoc(user.uid, data);
    const updatedProfile = await fetchUserProfile(user.uid);
    setUserProfile(updatedProfile);
  };

  const promoteToInstructor = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: "instructor" });
    if (user && user.uid === userId) {
      const updatedProfile = await fetchUserProfile(userId);
      setUserProfile(updatedProfile);
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!user) throw new Error("Must be logged in");

    try {
      // First verify the current password
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Then update to the new password
      await firebaseUpdatePassword(user, newPassword);
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        throw new Error("Current password is incorrect");
      }
      throw error;
    }
  };

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
    updateUserProfile,
    promoteToInstructor,
    updatePassword,
    enable2FA,
    verify2FA,
    disable2FA,
    is2FAEnabled,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
