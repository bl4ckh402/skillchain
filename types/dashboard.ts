import { ReactNode } from "react"
import { Course } from "./course"
import { Hackathon } from "./hackathon"
import { Job } from "./job"
import { Project } from "./project"
import { CommunityEvent } from "./community"
import { Timestamp } from "firebase/firestore"

export interface DashboardStats {
  coursesEnrolled?: number
  hoursLearned?: number
  achievements?: number
  certificates?: number
  // totalRevenue?: number;
  // monthlyRevenue?: number;
  projectsCompleted?: number
  hackathonsParticipated?: number
  jobsApplied?: number
  eventsAttended?: number
}

export interface FirestoreEnrolledCourse {
  courseId: string;
  userId: string;
  enrolledAt: Timestamp;
  status: 'active' | 'completed' | 'paused';
  progress: {
    progress: number;
    lastAccessed: Timestamp;
    completedLessons: string[];
    totalLessons: number;
    nextLesson: string;
    currentLesson: string;
  };
  courseData: {
    id: string;
    title: string;
    description: string;
    image?: string;
    instructor: {
      id: string;
      name: string;
      avatar: string;
      bio: string;
    };
    // [key: string]: any;
  };
}

export interface EnrollmentDocument {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: Timestamp;
  status: 'active' | 'completed' | 'paused';
  progress: {
    progress: number;
    lastAccessed: Timestamp;
    completedLessons: string[];
    totalLessons: number;
    nextLesson: string;
    currentLesson: string;
  };
}

export interface UserProgress {
  courseId: string
  progress: number
  lastAccessed: Date
  completedLessons: string[]
  totalLessons: number        
  nextLesson: string         
  currentLesson: string
  notes?: string[]
  assignments?: {
    id: string
    status: 'completed' | 'pending' | 'overdue'
    grade?: number
    submittedAt?: Date
  }[]
}

export interface UserAchievement {
  id: string
  title: string
  description: string
  type: 'course' | 'project' | 'hackathon' | 'community'
  unlockedAt: Date
  icon: string
  unlocked: boolean
}

export interface Certificate {
  id: string
  courseId: string
  title: string
  issuedAt: Date
  instructorId: string
  tokenId: string
  image: string    // Add this
  metadata: {
    grade: number
    skills: string[]
    projects?: string[]
  }
}

export interface DashboardData {
  stats: DashboardStats
  enrolledCourses: FirestoreEnrolledCourse[]
  participatedHackathons: Hackathon[]
  appliedJobs: Job[]
  completedProjects: Project[]
  upcomingEvents: CommunityEvent[]
  pastEvents: CommunityEvent[]
  achievements: UserAchievement[]
  certificates: Certificate[]
}