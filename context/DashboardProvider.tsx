"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  updateDoc,
  increment,
  serverTimestamp,
  arrayUnion,
  setDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { useCourses } from "./CourseContext";
import { useHackathons } from "./HackathonContext";
import { useJobs } from "./JobsProvider";
import { useProjects } from "./ProjectContext";
import { useCommunity } from "./CommunityProvider";
import { CommunityEvent } from "@/types/community";
import {
  Certificate,
  DashboardData,
  DashboardStats,
  EnrollmentDocument,
  UserAchievement,
  UserProgress,
} from "@/types/dashboard";
import { Project } from "@/types/project";
import { Job } from "@/types/job";
import { Hackathon } from "@/types/hackathon";

interface DashboardContextType {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  updateCourseProgress: (courseId: string, progressData: Partial<UserProgress>) => Promise<void>;
  issueCertificate: (courseId: string) => Promise<void>;
}

interface FirestoreAchievement {
  id: string;
  title?: string;
  description?: string;
  type?: "course" | "project" | "hackathon" | "community";
  unlockedAt?: Timestamp;
  icon?: string;
  unlocked?: boolean;
  userId?: string; // Added userId field
}

interface FirestoreCertificate {
  id: string;
  courseId?: string;
  title?: string;
  issuedAt?: Timestamp;
  instructorId?: string;
  tokenId?: string;
  image?: string;
  userId?: string; // Added userId field
  metadata?: {
    grade?: number;
    skills?: string[];
    projects?: string[];
  };
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { getCourseById } = useCourses();
  const { getHackathonById } = useHackathons();
  const { getJobById } = useJobs();
  const { getProjectById } = useProjects();
  const { getUpcomingEvents } = useCommunity();

  useEffect(() => {
    if (user) {
      refreshDashboard();
      
      // Set up real-time listeners for enrollments
      const unsubscribeProgress = onSnapshot(
        query(collection(db, "enrollments"), where("userId", "==", user.uid)),
        () => refreshDashboard()
      );
      
      // Set up real-time listeners for achievements
      const unsubscribeAchievements = onSnapshot(
        query(collection(db, "userAchievements"), where("userId", "==", user.uid)),
        () => refreshDashboard()
      );
      
      // Set up real-time listeners for certificates
      const unsubscribeCertificates = onSnapshot(
        query(collection(db, "certificates"), where("userId", "==", user.uid)),
        () => refreshDashboard()
      );

      return () => {
        unsubscribeProgress();
        unsubscribeAchievements();
        unsubscribeCertificates();
      };
    }
  }, [user]);

  const issueCertificate = async (courseId: string) => {
    if (!user) return;

    try {
      // Get course data to populate certificate
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      if (!courseDoc.exists()) {
        throw new Error("Course not found");
      }
      
      const courseData = courseDoc.data();
      const courseTitle = courseData.title || "Unnamed Course";
      const instructorId = courseData.instructor?.id || "unknown";
      
      // Generate a random token ID for demo purposes
      const tokenId = Math.random().toString(36).substring(2, 10);
      
      const certificateData: FirestoreCertificate = {
        id: `${user.uid}_${courseId}`,
        userId: user.uid,
        courseId,
        title: courseTitle,
        issuedAt: Timestamp.now(),
        instructorId,
        tokenId,
        image: courseData.certificateTemplate || "/images/default-certificate.jpg", 
        metadata: {
          grade: 100, // Default value, should be calculated from assignments
          skills: courseData.skills || [],
          projects: [],
        },
      };

      await setDoc(
        doc(db, "certificates", certificateData.id),
        certificateData
      );

      // Ensure userStats document exists
      const userStatsRef = doc(db, "userStats", user.uid);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (!userStatsDoc.exists()) {
        // Create initial stats document if it doesn't exist
        await setDoc(userStatsRef, {
          userId: user.uid,
          coursesEnrolled: 1,
          hoursLearned: 0,
          achievements: 0,
          certificates: 1,
          projectsCompleted: 0,
          hackathonsParticipated: 0,
          jobsApplied: 0,
          eventsAttended: 0,
        });
      } else {
        // Update existing stats
        await updateDoc(userStatsRef, {
          certificates: increment(1),
        });
      }

      await refreshDashboard();
      return;
    } catch (error) {
      console.error("Error issuing certificate:", error);
      throw error;
    }
  };

  const checkAndGrantAchievements = async (userId: string) => {
    try {
      // Ensure userStats document exists
      const userStatsRef = doc(db, "userStats", userId);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (!userStatsDoc.exists()) {
        // Create initial stats document if it doesn't exist
        await setDoc(userStatsRef, {
          userId,
          coursesEnrolled: 0,
          hoursLearned: 0,
          achievements: 0,
          certificates: 0,
          projectsCompleted: 0,
          hackathonsParticipated: 0,
          jobsApplied: 0,
          eventsAttended: 0,
        });
        return; // No achievements to grant for a new user
      }
      
      const stats = userStatsDoc.data();
      const achievements = [];

      // Check for achievements
      if (stats?.completedCourses >= 1) {
        achievements.push({
          id: "first_course",
          title: "Course Pioneer",
          description: "Completed your first course",
          type: "course",
          unlockedAt: serverTimestamp(),
          unlocked: true,
          icon: "🏆",
          userId,
        });
      }
      
      if (stats?.completedCourses >= 5) {
        achievements.push({
          id: "course_master",
          title: "Course Master",
          description: "Completed 5 courses",
          type: "course",
          unlockedAt: serverTimestamp(),
          unlocked: true,
          icon: "🎓",
          userId,
        });
      }
      
      if (stats?.projectsCompleted >= 1) {
        achievements.push({
          id: "first_project",
          title: "Project Builder",
          description: "Completed your first project",
          type: "project",
          unlockedAt: serverTimestamp(),
          unlocked: true,
          icon: "🛠️",
          userId,
        });
      }
      
      if (stats?.hackathonsParticipated >= 1) {
        achievements.push({
          id: "hackathon_participant",
          title: "Hackathon Participant",
          description: "Participated in your first hackathon",
          type: "hackathon",
          unlockedAt: serverTimestamp(),
          unlocked: true,
          icon: "🚀",
          userId,
        });
      }

      // Grant achievements
      for (const achievement of achievements) {
        const achievementRef = doc(
          db,
          "userAchievements",
          `${userId}_${achievement.id}`
        );
        
        // Check if achievement already exists
        const existingAchievement = await getDoc(achievementRef);
        if (!existingAchievement.exists()) {
          await setDoc(achievementRef, achievement);
          
          // Update stats counter
          await updateDoc(userStatsRef, {
            achievements: increment(1),
          });
        }
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };

  const fetchUserCourses = async (userId: string) => {
    try {
      const enrollmentsRef = collection(db, "enrollments");
      const q = query(
        enrollmentsRef,
        where("userId", "==", userId),
        orderBy("enrolledAt", "desc")
      );

      const snapshot = await getDocs(q);
      const enrollments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EnrollmentDocument[];

      const coursesData = await Promise.all(
        enrollments.map(async (enrollment) => {
          try {
            const courseDoc = await getDoc(
              doc(db, "courses", enrollment.courseId)
            );
            
            if (!courseDoc.exists()) {
              console.warn(`Course not found: ${enrollment.courseId}`);
              return null;
            }
            
            const courseData = courseDoc.data();

            // Create default progress object if missing
            const progress = enrollment.progress || {
              progress: 0,
              lastAccessed: Timestamp.now(),
              completedLessons: [],
              totalLessons: 0,
              nextLesson: "",
              currentLesson: "",
            };

            // Handle instructor data
            let instructorData = {
              firstName: "Unknown",
              lastName: "Instructor",
              photoURL: null,
              bio: "",
            };
            
            if (courseData.instructor?.id) {
              try {
                const instructorDoc = await getDoc(
                  doc(db, "users", courseData.instructor.id)
                );
                if (instructorDoc.exists()) {
                  instructorData = instructorDoc.data();
                }
              } catch (instructorError) {
                console.error("Error fetching instructor:", instructorError);
              }
            }

            return {
              courseId: enrollment.courseId,
              userId,
              enrolledAt: enrollment.enrolledAt,
              status: enrollment.status || "active",
              progress: {
                progress: progress.progress || 0,
                lastAccessed: progress.lastAccessed || Timestamp.now(),
                completedLessons: progress.completedLessons || [],
                totalLessons: progress.totalLessons || 0,
                nextLesson: progress.nextLesson || "",
                currentLesson: progress.currentLesson || "",
              },
              courseData: {
                id: courseDoc.id,
                title: courseData.title || "Unnamed Course",
                description: courseData.description || "",
                image: courseData.image || "",
                ...courseData,
                instructor: {
                  id: courseData.instructor?.id || "unknown",
                  name: `${instructorData.firstName || "Unknown"} ${instructorData.lastName || "Instructor"}`,
                  avatar: instructorData.photoURL || "",
                  bio: instructorData.bio || "",
                },
              },
            } satisfies FirestoreEnrolledCourse;
          } catch (error) {
            console.error(`Error processing course ${enrollment.courseId}:`, error);
            return null;
          }
        })
      );

      // Filter out null values
      return coursesData.filter(
        (course): course is FirestoreEnrolledCourse => course !== null
      );
    } catch (error) {
      console.error("Error fetching user courses:", error);
      throw error;
    }
  };

  const fetchUserHackathons = async (userId: string) => {
    try {
      const participationsRef = collection(db, "hackathonParticipations");
      const q = query(participationsRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      return Promise.all(
        snapshot.docs.map(async (doc) => {
          try {
            const hackathonId = doc.data().hackathonId;
            return await getHackathonById(hackathonId);
          } catch (error) {
            console.error(`Error fetching hackathon:`, error);
            return null;
          }
        })
      );
    } catch (error) {
      console.error("Error fetching user hackathons:", error);
      return [];
    }
  };

  const fetchUserJobs = async (userId: string) => {
    try {
      const applicationsRef = collection(db, "jobApplications");
      const q = query(applicationsRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      return Promise.all(
        snapshot.docs.map(async (doc) => {
          try {
            const jobId = doc.data().jobId;
            return await getJobById(jobId);
          } catch (error) {
            console.error(`Error fetching job:`, error);
            return null;
          }
        })
      );
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      return [];
    }
  };

  const fetchUserProjects = async (userId: string) => {
    try {
      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      return Promise.all(
        snapshot.docs.map(async (doc) => {
          try {
            const projectId = doc.id;
            return await getProjectById(projectId);
          } catch (error) {
            console.error(`Error fetching project:`, error);
            return null;
          }
        })
      );
    } catch (error) {
      console.error("Error fetching user projects:", error);
      return [];
    }
  };

  const fetchUserEvents = async (userId: string) => {
    try {
      const registrationsRef = collection(db, "eventRegistrations");
      const q = query(registrationsRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      const eventIds = snapshot.docs.map((doc) => doc.data().eventId);
      const events = await getUpcomingEvents();

      const now = new Date();

      // Type guard function
      const isValidEvent = (
        event: any
      ): event is CommunityEvent => {
        return (
          typeof event === "object" &&
          event !== null &&
          "id" in event &&
          "date" in event
        );
      };

      // Filter to get only registered events
      const userEvents = events.filter(
        (event): event is CommunityEvent => {
          if (!isValidEvent(event)) {
            console.warn("Invalid event data:", event);
            return false;
          }
          return eventIds.includes(event.id);
        }
      );

      // Helper function to normalize date
      const getEventDate = (event: CommunityEvent): Date => {
        if (!event.date) return now;

        if (typeof event.date === "string") {
          return new Date(event.date);
        }

        if (event.date instanceof Date) {
          return event.date;
        }

        if (typeof event.date === 'object' && 'toDate' in event.date && typeof event.date.toDate === 'function') {
          return event.date.toDate();
        }

        return now;
      };

      // Split into upcoming and past events
      return {
        upcoming: userEvents.filter(
          (event) => getEventDate(event) > now
        ),
        past: userEvents.filter(
          (event) => getEventDate(event) <= now
        ),
      };
    } catch (error) {
      console.error("Error fetching user events:", error);
      return { upcoming: [], past: [] };
    }
  };

  const updateCourseProgress = async (
    courseId: string,
    progressData: Partial<UserProgress>
  ) => {
    if (!user) return;

    try {
      const enrollmentId = `${user.uid}_${courseId}`;
      const enrollmentRef = doc(db, "enrollments", enrollmentId);
      
      // Check if enrollment exists
      const enrollmentDoc = await getDoc(enrollmentRef);
      if (!enrollmentDoc.exists()) {
        throw new Error("Enrollment not found");
      }
      
      const currentData = enrollmentDoc.data();
      const currentProgress = currentData.progress || {
        progress: 0,
        completedLessons: [],
        totalLessons: 0,
        currentLesson: "",
        nextLesson: "",
        lastAccessed: Timestamp.now()
      };
      
      // Prepare update object
      const updateObj: any = {
        "progress.lastAccessed": serverTimestamp(),
      };
      
      // Only update fields that are provided
      if (progressData.progress !== undefined) {
        updateObj["progress.progress"] = progressData.progress;
      }
      
      if (progressData.currentLesson !== undefined) {
        updateObj["progress.currentLesson"] = progressData.currentLesson;
      }
      
      if (progressData.nextLesson !== undefined) {
        updateObj["progress.nextLesson"] = progressData.nextLesson;
      }
      
      // Handle completed lessons
      if (progressData.completedLessons && progressData.completedLessons.length > 0) {
        // Get current completed lessons to avoid duplicates
        const existingLessons = new Set(currentProgress.completedLessons || []);
        
        // Add new lessons
        progressData.completedLessons.forEach(lesson => existingLessons.add(lesson));
        
        // Convert back to array and update
        updateObj["progress.completedLessons"] = Array.from(existingLessons);
      }

      await updateDoc(enrollmentRef, updateObj);

      // Check if course is completed
      if (progressData.progress === 100) {
        // Update user stats
        const userStatsRef = doc(db, "userStats", user.uid);
        const userStatsDoc = await getDoc(userStatsRef);
        
        if (!userStatsDoc.exists()) {
          // Create initial stats document if it doesn't exist
          await setDoc(userStatsRef, {
            userId: user.uid,
            completedCourses: 1,
            coursesEnrolled: 1,
            hoursLearned: progressData.totalLessons || 0,
            achievements: 0,
            certificates: 0,
            projectsCompleted: 0,
            hackathonsParticipated: 0,
            jobsApplied: 0,
            eventsAttended: 0,
          });
        } else {
          // Update existing stats
          await updateDoc(userStatsRef, {
            completedCourses: increment(1),
            hoursLearned: increment(progressData.totalLessons || 0),
          });
        }
        
        // Update enrollment status
        await updateDoc(enrollmentRef, {
          status: "completed"
        });
        
        // Check for achievements
        await checkAndGrantAchievements(user.uid);
      }

      await refreshDashboard();
    } catch (error) {
      console.error("Error updating course progress:", error);
      throw error;
    }
  };

  const fetchUserAchievements = async (userId: string) => {
    try {
      const achievementsRef = collection(db, "userAchievements");
      const q = query(
        achievementsRef,
        where("userId", "==", userId),
        orderBy("unlockedAt", "desc")
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc) => {
        const data = doc.data() as FirestoreAchievement;
        return {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          type: data.type || "course",
          unlockedAt: data.unlockedAt?.toDate() || new Date(),
          icon: data.icon || "",
          unlocked: data.unlocked || false,
        } satisfies UserAchievement;
      });
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      return [];
    }
  };

  const fetchUserCertificates = async (userId: string) => {
    try {
      const certificatesRef = collection(db, "certificates");
      const q = query(
        certificatesRef,
        where("userId", "==", userId),
        orderBy("issuedAt", "desc")
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc) => {
        const data = doc.data() as FirestoreCertificate;
        return {
          id: doc.id,
          courseId: data.courseId || "",
          title: data.title || "",
          issuedAt: data.issuedAt?.toDate() || new Date(),
          instructorId: data.instructorId || "",
          tokenId: data.tokenId || "",
          image: data.image || "",
          metadata: {
            grade: data.metadata?.grade ?? 0,
            skills: data.metadata?.skills ?? [],
            projects: data.metadata?.projects ?? [],
          },
        } satisfies Certificate;
      });
    } catch (error) {
      console.error("Error fetching user certificates:", error);
      return [];
    }
  };

  const fetchDashboardStats = async (userId: string) => {
    try {
      const statsRef = doc(db, "userStats", userId);
      const snapshot = await getDoc(statsRef);
      
      if (!snapshot.exists()) {
        // Create default stats document if it doesn't exist
        const defaultStats = {
          userId,
          coursesEnrolled: 0,
          hoursLearned: 0,
          achievements: 0,
          certificates: 0,
          projectsCompleted: 0,
          hackathonsParticipated: 0,
          jobsApplied: 0,
          eventsAttended: 0,
        };
        
        await setDoc(statsRef, defaultStats);
        return defaultStats;
      }
      
      return snapshot.data();
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return null;
    }
  };

  const refreshDashboard = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [
        courses,
        hackathons,
        jobs,
        projects,
        eventData,
        achievementsData,
        certificatesData,
        statsData,
      ] = await Promise.all([
        fetchUserCourses(user.uid),
        fetchUserHackathons(user.uid),
        fetchUserJobs(user.uid),
        fetchUserProjects(user.uid),
        fetchUserEvents(user.uid),
        fetchUserAchievements(user.uid),
        fetchUserCertificates(user.uid),
        fetchDashboardStats(user.uid),
      ]);

      // Handle undefined stats
      const stats: DashboardStats = {
        coursesEnrolled: statsData?.coursesEnrolled ?? 0,
        hoursLearned: statsData?.hoursLearned ?? 0,
        achievements: statsData?.achievements ?? 0,
        certificates: statsData?.certificates ?? 0,
        projectsCompleted: statsData?.projectsCompleted ?? 0,
        hackathonsParticipated: statsData?.hackathonsParticipated ?? 0,
        jobsApplied: statsData?.jobsApplied ?? 0,
        eventsAttended: statsData?.eventsAttended ?? 0,
      };

      // Filter out null values from arrays
      const validHackathons = hackathons.filter(
        (h): h is Hackathon => h !== null
      );
      const validJobs = jobs.filter((j): j is Job => j !== null);
      const validProjects = projects.filter((p): p is Project => p !== null);

      setDashboardData({
        stats,
        enrolledCourses: courses,
        participatedHackathons: validHackathons,
        appliedJobs: validJobs,
        completedProjects: validProjects,
        upcomingEvents: eventData.upcoming,
        pastEvents: eventData.past,
        achievements: achievementsData,
        certificates: certificatesData,
      });
    } catch (err: any) {
      setError(err.message);
      console.error("Dashboard refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    dashboardData,
    loading,
    error,
    refreshDashboard,
    updateCourseProgress,
    issueCertificate,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};