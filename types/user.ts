export enum UserRole {
  STUDENT = "student",
  INSTRUCTOR = "instructor",
  ADMIN = "admin",
}

export enum AccountStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  DELETED = "deleted",
}

export interface UserProfile {
  id: string;
  uid: string; // Firebase auth UID
  firstName: string;
  lastName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  status: AccountStatus;
  bio?: string;
  socialLinks?: {
    website?: string;
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  phoneNumber?: string;
  location?: string;

  // Course related
  enrolledCourses?: string[]; // Array of course IDs
  completedCourses?: string[];
  createdCourses?: string[];
  savedCourses?: string[];
  certificates?: {
    courseId: string;
    certId: string;
    issuedAt: Date;
    txHash?: string; // For NFT certificates
  }[];

  // Preferences
  preferences?: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    theme?: "light" | "dark" | "system";
    language?: string;
  };

  // Payment & Wallet
  wallet?: {
    address?: string;
    balance?: string;
    transactions?: {
      id: string;
      type: "purchase" | "withdrawal" | "refund";
      amount: string;
      currency: string;
      status: "pending" | "completed" | "failed";
      timestamp: Date;
      txHash?: string;
    }[];
  };

  // Progress tracking
  progress?: {
    [courseId: string]: {
      completedLessons: string[];
      completedModules: string[];
      quizScores: {
        [quizId: string]: number;
      };
      lastAccessedAt: Date;
      totalTimeSpent: number;
      overallProgress: number;
    };
  };

  // Achievements & Gamification
  achievements?: {
    id: string;
    name: string;
    description: string;
    earnedAt: Date;
    badge: string;
  }[];
  experience?: number;
  level?: number;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    courseUpdates: boolean;
    achievements: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "connections";
    showProgress: boolean;
    showAchievements: boolean;
  };
  display: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: Date;
    loginHistory: {
      timestamp: Date;
      ip: string;
      device: string;
      location?: string;
    }[];
  };
}

export interface Instructor extends UserProfile {
  expertise: string[];
  education?: {
    institution: string;
    degree: string;
    field: string;
    year: string;
  }[];
  workExperience?: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  rating?: number;
  reviews?: number;
  totalStudents?: number;
  earnings?: {
    total: string;
    pending: string;
    lastPayout: {
      amount: string;
      date: Date;
      method: string;
    };
  };
  featured?: boolean;
  verified?: boolean;
}
