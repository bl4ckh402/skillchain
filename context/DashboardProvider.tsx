"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { collection, query, where, getDocs, doc, getDoc, orderBy, updateDoc, increment, serverTimestamp, arrayUnion, setDoc, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './AuthProvider'
import { useCourses } from './CourseContext'
import { useHackathons } from './HackathonContext'
import { useJobs } from './JobsProvider'
import { useProjects } from './ProjectContext'
import { useCommunity } from './CommunityProvider'
// import { CommunityEvent } from '@/types/community';
import { CommunityEvent } from '@/types/community';
import { Certificate, DashboardData, DashboardStats, EnrollmentDocument, FirestoreEnrolledCourse, UserAchievement, UserProgress } from '@/types/dashboard'
import { Project } from '@/types/project'
import { Job } from '@/types/job'
import { Hackathon } from '@/types/hackathon'

interface DashboardContextType {
  dashboardData: DashboardData | null
  loading: boolean
  error: string | null
  refreshDashboard: () => Promise<void>
}

interface FirestoreAchievement {
  id: string;
  title?: string;
  description?: string;
  type?: 'course' | 'project' | 'hackathon' | 'community';
  unlockedAt?: Timestamp;
  icon?: string;
  unlocked?: boolean;
}

interface FirestoreCertificate {
  id: string;
  courseId?: string;
  title?: string;
  issuedAt?: Timestamp;
  instructorId?: string;
  tokenId?: string;
  image?: string;
  metadata?: {
    grade?: number;
    skills?: string[];
    projects?: string[];
  };
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()
  const { getCourseById } = useCourses()
  const { getHackathonById } = useHackathons()
  const { getJobById } = useJobs()
  const { getProjectById } = useProjects()
  const { getUpcomingEvents } = useCommunity()

  useEffect(() => {
    if (user) {
      refreshDashboard();
      const unsubscribeProgress = onSnapshot(
        query(collection(db, 'enrollments'), where('userId', '==', user.uid)),
        () => refreshDashboard()
      );
  
      return () => {
        unsubscribeProgress();
      };
    }
  }, [user]);

  const fetchUserProgress = async (userId: string) => {
    const progressRef = collection(db, 'userProgress')
    const q = query(progressRef, where('userId', '==', userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const issueCertificate = async (courseId: string) => {
    if (!user) return;
  
    try {
      const certificateData: Certificate = {
        id: `${user.uid}_${courseId}`,
        courseId,
        title: '', // Get from course data
        issuedAt: new Date(),
        instructorId: '', // Get from course data
        tokenId: '', // Generate or get from blockchain
        image: '', // Generate certificate image
        metadata: {
          grade: 0, // Calculate from assignments
          skills: [], // Get from course data
          projects: [] // Get from completed projects
        }
      };
  
      await setDoc(doc(db, 'certificates', certificateData.id), certificateData);
      
      // Update user stats
      const userStatsRef = doc(db, 'userStats', user.uid);
      await updateDoc(userStatsRef, {
        certificates: increment(1)
      });
  
      await refreshDashboard();
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw error;
    }
  }

  const checkAndGrantAchievements = async (userId: string) => {
    const userStatsRef = doc(db, 'userStats', userId);
    const userStats = await getDoc(userStatsRef);
    const stats = userStats.data();
  
    const achievements = [];
  
    if (stats?.completedCourses >= 1) {
      achievements.push({
        id: 'first_course',
        title: 'Course Pioneer',
        description: 'Completed your first course',
        type: 'course',
        unlockedAt: serverTimestamp()
      });
    }
  
    // Grant achievements
    for (const achievement of achievements) {
      const achievementRef = doc(db, 'userAchievements', `${userId}_${achievement.id}`);
      await setDoc(achievementRef, achievement, { merge: true });
    }
  }

  const fetchUserCourses = async (userId: string) => {
    try {
      const enrollmentsRef = collection(db, 'enrollments'); // Changed from 'courses' to 'enrollments'
      const q = query(
        enrollmentsRef,
        where('userId', '==', userId),
        orderBy('enrolledAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const enrollments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnrollmentDocument[];
  
      const coursesData = await Promise.all(
        enrollments.map(async (enrollment) => {
          const courseDoc = await getDoc(doc(db, 'courses', enrollment.courseId));
          const courseData = courseDoc.data();
          const instructorDoc = await getDoc(doc(db, 'users', courseData?.instructorId));
          const instructorData = instructorDoc.data();
          
          if (!courseData || !instructorData) {
            throw new Error('Course or instructor data not found');
          }
  
          return {
            courseId: enrollment.courseId,
            userId: userId,
            enrolledAt: enrollment.enrolledAt,
            status: enrollment.status || 'active',
            progress: {
              progress: enrollment.progress?.progress || 0,
              lastAccessed: enrollment.progress?.lastAccessed,
              completedLessons: enrollment.progress?.completedLessons || [],
              totalLessons: enrollment.progress?.totalLessons || 0,
              nextLesson: enrollment.progress?.nextLesson || '',
              currentLesson: enrollment.progress?.currentLesson || ''
            },
            courseData: {
              id: courseDoc.id,
              title: courseData.title,
              description: courseData.description,
              image: courseData.image,
              ...courseData,
              instructor: {
                id: instructorDoc.id,
                name: `${instructorData.firstName} ${instructorData.lastName}`,
                avatar: instructorData.photoURL || '',
                bio: instructorData.bio || ''
              }
            }
          } satisfies FirestoreEnrolledCourse;
        })
      );
  
      return coursesData;
    } catch (error) {
      console.error('Error fetching user courses:', error);
      throw error;
    }
  };

  const fetchUserHackathons = async (userId: string) => {
    const participationsRef = collection(db, 'hackathonParticipations')
    const q = query(participationsRef, where('userId', '==', userId))
    const snapshot = await getDocs(q)
    
    return Promise.all(
      snapshot.docs.map(async (doc) => {
        const hackathonId = doc.data().hackathonId
        return getHackathonById(hackathonId)
      })
    )
  }

  const fetchUserJobs = async (userId: string) => {
    const applicationsRef = collection(db, 'jobApplications')
    const q = query(applicationsRef, where('userId', '==', userId))
    const snapshot = await getDocs(q)
    
    return Promise.all(
      snapshot.docs.map(async (doc) => {
        const jobId = doc.data().jobId
        return getJobById(jobId)
      })
    )
  }

  const fetchUserProjects = async (userId: string) => {
    const projectsRef = collection(db, 'projects')
    const q = query(projectsRef, where('userId', '==', userId))
    const snapshot = await getDocs(q)
    
    return Promise.all(
      snapshot.docs.map(async (doc) => {
        const projectId = doc.id
        return getProjectById(projectId)
      })
    )
  }

  const fetchUserEvents = async (userId: string) => {
    const registrationsRef = collection(db, 'eventRegistrations');
    const q = query(registrationsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const eventIds = snapshot.docs.map(doc => doc.data().eventId);
    const events = await getUpcomingEvents();
    
    const now = new Date();
  
    // Type guard function
    const isValidEvent = (attendinevent: any): attendinevent is CommunityEvent => {
      return (
        typeof attendinevent === 'object' &&
        attendinevent !== null &&
        'id' in attendinevent &&
        'date' in attendinevent
      );
    };
  
    const userEvents = events.filter((attendinevent): attendinevent is CommunityEvent => {
      if (!isValidEvent(attendinevent)) {
        console.warn('Invalid attendinevent data:', attendinevent);
        return false;
      }
      return eventIds.includes(attendinevent.id);
    });
    
    const getEventDate = (attendinevent: CommunityEvent): Date => {
      if (!attendinevent.date) return now;
      
      if (typeof attendinevent.date === 'string') {
        return new Date(attendinevent.date);
      }
      
      if (attendinevent.date instanceof Date) {
        return attendinevent.date;
      }
      
      if ('toDate' in attendinevent.date) {
        return attendinevent.date.toDate();
      }
      
      return now;
    };
    
    return {
      upcoming: userEvents.filter(attendinevent => getEventDate(attendinevent) > now),
      past: userEvents.filter(attendinevent => getEventDate(attendinevent) <= now)
    };
  };

  const updateCourseProgress = async (courseId: string, progressData: Partial<UserProgress>) => {
    if (!user) return;
  
    const enrollmentRef = doc(db, 'enrollments', `${user.uid}_${courseId}`);
    
    try {
      await updateDoc(enrollmentRef, {
        'progress.progress': progressData.progress,
        'progress.lastAccessed': serverTimestamp(),
        'progress.completedLessons': arrayUnion(...(progressData.completedLessons || [])),
        'progress.currentLesson': progressData.currentLesson
      });
  
      // Update user stats if needed
      if (progressData.progress === 100) {
        const userStatsRef = doc(db, 'userStats', user.uid);
        await updateDoc(userStatsRef, {
          completedCourses: increment(1),
          hoursLearned: increment(progressData.totalLessons || 0)
        });
      }
  
      await refreshDashboard();
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  }

  const fetchUserAchievements = async (userId: string) => {
    const achievementsRef = collection(db, 'userAchievements')
    const q = query(achievementsRef, 
      where('userId', '==', userId),
      orderBy('unlockedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const fetchUserCertificates = async (userId: string) => {
    const certificatesRef = collection(db, 'certificates')
    const q = query(certificatesRef, 
      where('userId', '==', userId),
      orderBy('issuedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const fetchDashboardStats = async (userId: string) => {
    const statsRef = doc(db, 'userStats', userId)
    const snapshot = await getDoc(statsRef)
    return snapshot.data()
  }

  const refreshDashboard = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
  
      const [
        courses,
        hackathons,
        jobs,
        projects,
        eventData,
        achievementsData,
        certificatesData,
        statsData
      ] = await Promise.all([
        fetchUserCourses(user.uid),
        fetchUserHackathons(user.uid),
        fetchUserJobs(user.uid),
        fetchUserProjects(user.uid),
        fetchUserEvents(user.uid),
        fetchUserAchievements(user.uid),
        fetchUserCertificates(user.uid),
        fetchDashboardStats(user.uid)
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
        eventsAttended: statsData?.eventsAttended ?? 0
      };
  
      // Filter out null values from arrays
      const validHackathons = hackathons.filter((h): h is Hackathon => h !== null);
      const validJobs = jobs.filter((j): j is Job => j !== null);
      const validProjects = projects.filter((p): p is Project => p !== null);
  
      // Map achievements and certificates to correct types
      const achievements: UserAchievement[] = (achievementsData as FirestoreAchievement[]).map(a => ({
        id: a.id,
        title: a.title || '',
        description: a.description || '',
        type: a.type || 'course',
        unlockedAt: a.unlockedAt?.toDate() || new Date(),
        icon: a.icon || '',
        unlocked: a.unlocked || false
      }));
    
      const certificates: Certificate[] = (certificatesData as FirestoreCertificate[]).map(c => ({
        id: c.id,
        courseId: c.courseId || '',
        title: c.title || '',
        issuedAt: c.issuedAt?.toDate() || new Date(),
        instructorId: c.instructorId || '',
        tokenId: c.tokenId || '',
        image: c.image || '',
        metadata: {
          grade: c.metadata?.grade ?? 0,
          skills: c.metadata?.skills ?? [],
          projects: c.metadata?.projects ?? []
        }
      }));
  
      setDashboardData({
        stats,
        enrolledCourses: courses,
        participatedHackathons: validHackathons,
        appliedJobs: validJobs,
        completedProjects: validProjects,
        upcomingEvents: eventData.upcoming,
        pastEvents: eventData.past,
        achievements,
        certificates
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshDashboard()
    }
  }, [user])

  const value = {
    dashboardData,
    loading,
    error,
    refreshDashboard
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}