"use client";

import { createContext, useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Course, CourseFilters, CourseStatus } from "@/types/course";
import { useAuth } from "./AuthProvider";
import { FirestoreEnrolledCourse } from "@/types/dashboard";
import { getApp } from "firebase/app";
import { getStorage } from "firebase/storage";

try {
  const app = getApp();
  console.log("Firebase app initialized successfully:", app.name);
  const storage = getStorage(app);
  console.log("Firebase storage initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
}
interface CourseContextType {
  courses: Course[];
  loading: boolean;
  filters: CourseFilters;
  setFilters: (filters: CourseFilters) => void;
  createCourse: (
    course: Omit<Course, "id" | "createdAt" | "updatedAt">
  ) => Promise<string>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  publishCourse: (id: string) => Promise<void>;
  archiveCourse: (id: string) => Promise<void>;
  getPublishedCourses: () => Promise<void>;
  issueCertificate: (courseId: string) => Promise<void>;
  getCourseById: (id: string) => Promise<Course | null>;
  getFeaturedCourses: () => Promise<Course[]>;
  getMyCourses: () => Promise<Course[]>;
  getCoursesByInstructor: (instructorId: string) => Promise<Course[]>;
  searchCourses: (query: string) => Promise<Course[]>;
  enrollInCourse: (courseId: string) => Promise<void>;
  uploadCourseImage: (file: File) => Promise<string>;
  trackProgress: (
    courseId: string,
    lessonId: string,
    completed: boolean
  ) => Promise<void>;
  getCourseProgress: (courseId: string) => Promise<number>;
}

const CourseContext = createContext<CourseContextType | null>(null);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<CourseFilters>({});
  const { user } = useAuth();

  const createCourse = async (
    course: Omit<Course, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!user) throw new Error("Must be logged in");

    try {
      const docRef = await addDoc(collection(db, "courses"), {
        ...course,
        students: 0,
        rating: 0,
        reviews: 0,
        status: CourseStatus.DRAFT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        instructor: {
          id: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || "",
          bio: "",
        },
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Error creating course: ${error.message}`);
    }
  };

  const issueCertificate = async (courseId: string) => {
    if (!user) throw new Error("Must be logged in");

    try {
      const certificateData = {
        courseId,
        userId: user.uid,
        issuedAt: serverTimestamp(),
        type: "completion",
        metadata: {
          platform: "BlockLearn",
          verification: true,
        },
      };

      await addDoc(collection(db, "certificates"), certificateData);

      // Update user stats
      await updateDoc(doc(db, "userStats", user.uid), {
        certificatesEarned: increment(1),
        coursesCompleted: increment(1),
      });
    } catch (error: any) {
      console.error("Error issuing certificate:", error);
      throw error;
    }
  };

  const updateCourse = async (
    courseId: string,
    courseData: Partial<Course>
  ): Promise<void> => {
    if (!user) throw new Error("Must be logged in to update a course");

    try {
      const courseRef = doc(db, "courses", courseId);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        throw new Error("Course not found");
      }

      if (courseDoc.data().instructor.id !== user.uid) {
        throw new Error("Not authorized to update this course");
      }

      await updateDoc(courseRef, {
        ...courseData,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update course: ${error.message}`);
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, "courses", id));
    } catch (error: any) {
      throw new Error(`Error deleting course: ${error.message}`);
    }
  };

  const publishCourse = async (id: string) => {
    try {
      const courseRef = doc(db, "courses", id);
      await updateDoc(courseRef, {
        status: CourseStatus.PUBLISHED,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(`Error publishing course: ${error.message}`);
    }
  };

  const archiveCourse = async (id: string) => {
    try {
      const courseRef = doc(db, "courses", id);
      await updateDoc(courseRef, {
        status: CourseStatus.ARCHIVED,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(`Error archiving course: ${error.message}`);
    }
  };

  const getFeaturedCourses = async () => {
    try {
      const q = query(
        collection(db, "courses"),
        where("status", "==", CourseStatus.PUBLISHED),
        where("featured", "==", true),
        orderBy("createdAt", "desc"),
        limit(6)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Record<string, any>),
      })) as Course[];
    } catch (error: any) {
      throw new Error(`Error fetching featured courses: ${error.message}`);
    }
  };

  const getMyCourses = async () => {
    if (!user) return [];

    try {
      const q = query(
        collection(db, "courses"),
        where("instructor.id", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Record<string, any>),
      })) as Course[];
    } catch (error: any) {
      throw new Error(`Error fetching my courses: ${error.message}`);
    }
  };

  const getCoursesByInstructor = async (instructorId: string) => {
    try {
      const q = query(
        collection(db, "courses"),
        where("instructor.id", "==", instructorId),
        where("status", "==", CourseStatus.PUBLISHED),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
    } catch (error: any) {
      throw new Error(`Error fetching instructor courses: ${error.message}`);
    }
  };

  const searchCourses = async (question: string) => {
    try {
      // Basic search implementation - can be improved with Algolia or similar
      const q = query(
        collection(db, "courses"),
        where("status", "==", CourseStatus.PUBLISHED),
        orderBy("title")
      );
      const snapshot = await getDocs(q);
      const courses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];

      return courses.filter(
        (course) =>
          course.title.toLowerCase().includes(question.toLowerCase()) ||
          course.description.toLowerCase().includes(question.toLowerCase()) ||
          course.tags.some((tag) =>
            tag.toLowerCase().includes(question.toLowerCase())
          )
      );
    } catch (error: any) {
      throw new Error(`Error searching courses: ${error.message}`);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) throw new Error("Must be logged in");

    try {
      const courseRef = doc(db, "courses", courseId);
      const courseSnapshot = await getDoc(courseRef);
      const course = courseSnapshot.data();
      if (!course) throw new Error("Course not found");
      
      const enrollmentRef = doc(db, "enrollments", `${courseId}_${user.uid}`);

      await updateDoc(courseRef, {
        students: increment(1),
      });

      await setDoc(enrollmentRef, {
        courseId,
        userId: user.uid,
        enrolledAt: serverTimestamp(),
        status: "active",
        progress: {
          progress: 0,
          completedLessons: [],
          lastAccessed: serverTimestamp(),
          totalLessons: course?.lessons?.length || 0,
          nextLesson: course.modules?.[0]?.lessons?.[0]?.id || "",
          currentLesson: "",
          moduleProgress: {},
        },
      });
    } catch (error: any) {
      throw new Error(`Error enrolling in course: ${error.message}`);
    }
  };

  const getCourseById = async (id: string) => {
    try {
      const docRef = doc(db, "courses", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Course;
      } else {
        return null;
      }
    } catch (error: any) {
      throw new Error(`Error fetching course: ${error.message}`);
    }
  };

  const uploadCourseImage = async (file: File) => {
    if (!user) throw new Error("Must be logged in");

    try {
      const storageRef = ref(storage, `courses/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error: any) {
      throw new Error(`Error uploading image: ${error.message}`);
    }
  };

  const trackProgress = async (
    courseId: string,
    lessonId: string,
    completed: boolean
  ) => {
    if (!user) throw new Error("Must be logged in");

    try {
      const enrollmentRef = doc(db, "enrollments", `${user.uid}_${courseId}`);
      const enrollmentDoc = await getDoc(enrollmentRef);

      if (!enrollmentDoc.exists()) {
        throw new Error("Not enrolled in course");
      }

      const enrollment = enrollmentDoc.data() as FirestoreEnrolledCourse;
      const updatedCompletedLessons = completed
        ? [...enrollment.progress.completedLessons, lessonId]
        : enrollment.progress.completedLessons.filter((id: string) => id !== lessonId);

      // Calculate progress percentage
      const totalLessons = enrollment.progress.totalLessons;
      const progress = (updatedCompletedLessons.length / totalLessons) * 100;

      await updateDoc(enrollmentRef, {
        "progress.completedLessons": updatedCompletedLessons,
        "progress.progress": progress,
        "progress.lastAccessed": serverTimestamp(),
        status: progress === 100 ? "completed" : "active",
      });

      // If course completed, issue certificate
      if (progress === 100) {
        await issueCertificate(courseId);
      }
    } catch (error: any) {
      throw new Error(`Error tracking progress: ${error.message}`);
    }
  };

  const getCourseProgress = async (courseId: string) => {
    if (!user) return 0;

    try {
      const enrollmentRef = doc(db, "enrollments", `${user.uid}_${courseId}`);
      const enrollmentDoc = await getDoc(enrollmentRef);

      if (!enrollmentDoc.exists()) return 0;

      const enrollment = enrollmentDoc.data() as FirestoreEnrolledCourse;
      return enrollment.progress.progress;
    } catch (error) {
      console.error("Error getting course progress:", error);
      return 0;
    }
  };

  const getPublishedCourses = async () => {
    try {
      const q = query(
        collection(db, "courses"),
        where("status", "==", CourseStatus.PUBLISHED),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      let coursesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Record<string, any>),
      })) as Course[];
      setCourses(coursesData);
    } catch (error: any) {
      throw new Error(`Error fetching published courses: ${error.message}`);
    }
  };

  const value = {
    courses,
    loading,
    filters,
    setFilters,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    archiveCourse,
    getFeaturedCourses,
    getMyCourses,
    getCoursesByInstructor,
    searchCourses,
    enrollInCourse,
    uploadCourseImage,
    getCourseById,
    trackProgress,
    getCourseProgress,
    getPublishedCourses,
    issueCertificate,
  };

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
}

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourses must be used within a CourseProvider");
  }
  return context;
};
