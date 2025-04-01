
export enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz' | 'exercise' | 'project'
  duration: string
  content: {
    videoUrl?: string
    description?: string
    transcript?: string
    textContent?: string
    quiz?: {
      question: string
      options: string[]
      correctAnswer: number
    }[]
    attachments?: {
      name: string
      url: string
    }[]
  }
  completed?: boolean
}

export interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  completed?: boolean
}

export interface Course {
    // Existing base fields
    id?: string
    title: string
    description: string
    category: string
    level: CourseLevel
    price: string
    image?: string
    featured: boolean
    status: CourseStatus
  
    // New tags related fields
    tags: string[]
    bestseller?: boolean
    new?: boolean
    trending?: boolean
    featured_category?: string[]
    skillLevel?: string
    topicTags: string[]
    technologiesUsed: string[]
    prerequisites?: string[]
    targetAudience?: string[]
    certification?: {
      type: 'basic' | 'professional' | 'expert'
      validityPeriod?: string
      accreditation?: string[]
    }
  
    // UI display tags
    uiTags?: {
      badge?: 'new' | 'bestseller' | 'trending' | 'featured'
      badgeColor?: string
      highlight?: boolean
      promotional?: boolean
    }
  
    // Existing course content fields
    modules: Module[]
    currentModule?: Module
    whatYouWillLearn: string[]
    requirements: string[]
    instructor: {
      id: string
      name: string
      avatar: string
      bio: string
    }
  
    // Existing metadata fields
    rating?: number
    reviews?: number
    students?: number
    duration: string
    createdAt: Date
    updatedAt: Date
    language: string
    
    // Existing feature flags
    certificate: boolean
    nftCertificate: boolean
    paymentOptions: {
      crypto: boolean
      acceptedTokens?: string[]
    }
    forum: boolean
    visibility: 'public' | 'unlisted' | 'private'
    
    // SEO and categorization
    seoTags?: string[]
    categories?: string[]
    subCategories?: string[]
    difficultyLevel?: 'beginner' | 'intermediate' | 'advanced'
    
    // Search optimization
    searchKeywords?: string[]
    searchCategories?: string[]
    primaryTopic?: string
  }

export interface CourseFilters {
  category?: string[]
  level?: CourseLevel[]
  price?: {
    min: number
    max: number
  }
  rating?: number
  duration?: string[]
  tags?: string[]
  search?: string
  sort?: string;
}