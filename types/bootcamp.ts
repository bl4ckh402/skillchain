import { CourseLevel, LessonType, LessonStatus, Module, Instructor } from './course'
import { Timestamp } from 'firebase/firestore'

export enum BootcampStatus {
  DRAFT = "draft",
  UPCOMING = "upcoming",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELED = "canceled",
}

export enum ApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  WAITLISTED = "waitlisted",
}

export interface BootcampSchedule {
  // startDate: string
  // endDate: string
  timezone: string
  days: string[]
  time: string
}

export interface BootcampInstructor {
  id: string
  name: string
  avatar?: string
  bio: string
  expertise?: string[]
  rating?: number
  totalStudents?: number
}

export interface TeachingAssistant {
  id: string
  name: string
  avatar?: string
  bio: string
}

export interface BootcampProject {
  id: string
  title: string
  description: string
  image?: string
  deadline?: string
  technologies: string[]
}

export interface LessonContent {
  videoUrl?: string
  description?: string
  assignment?: string
  attachments?: {
    name: string
    url: string
    type: string
  }[]
  startTime?: string // For live sessions
  endTime?: string // For live sessions
  meetingLink?: string // For live sessions
  recordingUrl?: string // For recorded live sessions
}

export interface BootcampLesson {
  id: string
  title: string
  description: string
  type: "video" | "live" | "assignment" | "quiz"
  duration: string
  order: number
  moduleId: string
  content: LessonContent
  requiredFor?: string[] // IDs of lessons that require this lesson to be completed first
}

export interface BootcampModule {
  id: string
  title: string
  description: string
  order: number
  lessons: BootcampLesson[]
}

export interface Bootcamp {
  id: string
  title: string
  shortDescription: string
  description: string
  price: string
  duration: string
  status: BootcampStatus
  maxStudents: number
  currentStudents: number
  instructor: BootcampInstructor
  teachingAssistants?: TeachingAssistant[]
  schedule: BootcampSchedule
  curriculum: BootcampModule[]
  whatYouWillLearn: string[]
  requirements: string[]
  projects?: BootcampProject[]
  tools?: string[]
  image?: string
  thumbnail?: string
  tags: string[]
  placementRate?: number
  rating?: number
  totalReviews?: number
  createdAt: string
  updatedAt: string
  // Additional properties used in the application
  modules?: BootcampModule[] // For compatibility with Course interface
  featured?: boolean
  visibility?: 'public' | 'unlisted' | 'private'
  certificate?: boolean
  currentParticipants?: number
  maxParticipants?: number
  liveSessions?: {
    id: string
    title: string
    date: Date
    duration: string
    description: string
  }[]
  mentors?: Instructor[]
  projectDeadlines?: {
    moduleId: string
    deadline: Date
  }[]
  startDate?: Date
  endDate?: Date
}

export interface BootcampApplication {
  id: string
  bootcampId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  education: string
  workExperience: string
  motivation: string
  portfolio?: string
  github?: string
  linkedin?: string
  status: ApplicationStatus
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  feedback?: string
}

export interface BootcampProgress {
  progress: number
  completedLessons: string[]
  lastAccessed: Date
  currentLesson: string
  nextLesson: string
  totalLessons: number
  moduleProgress: Record<string, number>
  attendanceRecord: Record<string, boolean>
}

export interface BootcampEnrollment {
  userId: string
  bootcampId: string
  enrolledAt: Date
  status: "active" | "completed" | "dropped"
  progress: BootcampProgress
  certificate?: {
    issued: boolean
    issuedAt?: Date
    certificateUrl?: string
  }
}

export interface BootcampReview {
  id: string
  bootcampId: string
  userId: string
  rating: number
  review: string
  createdAt: string
  updatedAt: string
}