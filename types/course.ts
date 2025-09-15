export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  ALL_LEVELS = "all-levels",
}

export enum CourseStatus {
  DRAFT = "draft",
  REVIEW = "review",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum LessonType {
  VIDEO = "video",
  TEXT = "text",
  QUIZ = "quiz",
  EXERCISE = "exercise",
  PROJECT = "project",
}

export enum LessonStatus {
  LOCKED = "locked",
  UNLOCKED = "unlocked",
  COMPLETED = "completed",
}

export interface LessonContent {
  videoUrl?: string;
  textContent?: string;
  description?: string;
  transcript?: string;
  quiz?: QuizQuestion[];
  instructions?: string;
  solution?: string;
  requirements?: string;
  rubric?: string;
  attachments?: Attachment[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Attachment {
  name: string;
  url: string;
  type?: "image" | "video" | "document" | "code";
  size?: number;
}

export interface Lesson {
  completed: any;
  id: string;
  title: string;
  type: LessonType | string; // Allow string for backward compatibility
  duration: string; // Format can be "MM:SS" or "X hours Y minutes"
  content?: LessonContent;
  status?: LessonStatus;
  progress?: number;
  completedAt?: Date | null;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  completed?: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;

  bio: string;
  title?: string;
  specialties?: string[];
}

export interface RelatedCourse {
  id: string;
  title: string;
  image?: string;
  instructor: string;
  level: string;
  rating: number;
  students: number;
  price: string;
}

export interface Course {
  image: string;
  courseId: any;
  courseData: any;
  nextLesson: null;
  lessons: any;
  // Basic information
  id?: string; // Optional as it might not exist for new courses
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory?: string;
  level: CourseLevel;
  language: string;
  duration: string;
  price: string;
  discountPrice?: string;
  thumbnail?: string;
  previewVideo?: string;

  // Content organization
  modules: Module[];
  whatYouWillLearn: string[];
  requirements: string[];

  // Settings
  featured: boolean;
  status: CourseStatus;
  visibility: "public" | "unlisted" | "private";
  certificate: boolean;
  tags: string[];

  // Messages and communication
  welcomeMessage?: string;
  congratulationsMessage?: string;

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;

  // Instructor information
  instructor: Instructor;

  // Statistics
  rating?: number;
  reviews?: number;
  students?: number;
  totalLessons?: number;
  completions?: number;

  // Dates
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date;

  // Related content
  relatedCourses?: RelatedCourse[];

  // UI flags
  bestseller?: boolean;
  new?: boolean;
  trending?: boolean;

  // Additional optional properties
  progress?: number; // User's progress in the course
  nftCertificate?: boolean;
  paymentOptions?: {
    crypto: boolean;
    acceptedTokens?: string[];
  };

  // Metadata
  technologiesUsed?: string[];
  prerequisites?: string[];
  targetAudience?: string[];
}

// export interface BootcampSchedule {
//   startDate: string;
//   endDate: string;
//   timezone: string;
//   days: string[];
//   time: string;
// }

// export interface Bootcamp extends Course {
//   startDate: Date;
//   endDate: Date;
//   maxParticipants: number;
//   currentParticipants: number;
//   schedule: BootcampSchedule;
//   liveSessions: {
//     id: string;
//     title: string;
//     date: Date;
//     duration: string;
//     description: string;
//   }[];
//   mentors: Instructor[];
//   projectDeadlines: {
//     moduleId: string;
//     deadline: Date;
//   }[];
// }

export interface CourseFilters {
  category?: string[];
  level?: CourseLevel[];
  price?: {
    min: number;
    max: number;
  };
  rating?: number;
  duration?: string[];
  tags?: string[];
  search?: string;
  sort?: string;
}
