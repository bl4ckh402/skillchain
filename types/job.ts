// Enums for fixed values
export enum JobType {
    FULL_TIME = 'Full-time',
    PART_TIME = 'Part-time',
    CONTRACT = 'Contract',
    FREELANCE = 'Freelance'
}

export enum JobStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CLOSED = 'closed'
}

// Base job interface
export interface Job {
    id?: string
    title: string
    company: string
    logo: string
    location: string
    type: JobType
    salary: string
    tags: string[]
    description: string
    requirements: string[]
    responsibilities: string[]
    aboutCompany: string
    website: string
    featured: boolean
    postedBy: {
        id: string
        name: string
        avatar: string
    }
    postedAt: Date
    expiresAt: Date
    status: JobStatus
    applications?: string[] // Array of user IDs who applied
    savedBy?: string[] // Array of user IDs who saved
    employees?: number // Company size
    founded?: string // Company founding year
    relatedCourses?: Array<{
        id: string
        title: string
        image?: string
        instructor: string
        level: string
        rating: number
        students: number
        price: string
    }>
}

// Filter value types
export type ArrayFilterValue = string[]
export type RangeFilterValue = { min: number; max: number }
export type SearchFilterValue = string

// Filter types with proper discrimination
export interface JobFilters {
    type: ArrayFilterValue
    location: ArrayFilterValue
    tags: ArrayFilterValue
    experience: ArrayFilterValue
    search?: SearchFilterValue
    salaryRange?: RangeFilterValue
}

// Type guard functions
export const isArrayFilter = (value: any): value is ArrayFilterValue => {
    return Array.isArray(value)
}

export const isRangeFilter = (value: any): value is RangeFilterValue => {
    return typeof value === 'object' && 'min' in value && 'max' in value
}

export const isSearchFilter = (value: any): value is SearchFilterValue => {
    return typeof value === 'string'
}

// Helper type for filter operations
export type FilterOperation<T> = {
    add: (value: string) => T
    remove: (value: string) => T
    clear: () => T
    has: (value: string) => boolean
}

// Application related types
export interface JobApplication {
    jobId: string
    userId: string
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
    appliedAt: Date
    updatedAt: Date
}

export interface SavedJob {
    jobId: string
    userId: string
    savedAt: Date
}