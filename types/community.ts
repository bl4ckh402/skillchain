import { Timestamp } from "firebase/firestore"
import { ReactNode } from "react"

export interface Post {
    id?: string
    title: string
    content: string
    preview?: string // Short preview text
    author: {
        id: string
        name: string
        avatar: string
    }
    tags: string[]
    likes: number
    comments: number
    views: number
    replies?: number // For discussions
    createdAt: Date
    updatedAt: Date
    category: 'Smart Contracts' | 'DeFi' | 'NFTs' | 'Web3' | 'Governance' |
    'Security' | 'Privacy' | 'Frontend' | 'Interoperability' |
    'Cryptography' | 'General'
    type: 'discussion' | 'question' | 'showcase' | 'announcement'
    status: 'published' | 'draft' | 'archived' | 'locked'

    // Discussion specific fields
    isPinned?: boolean
    isHot?: boolean
    isResolved?: boolean
    hasAcceptedAnswer?: boolean
    lastActivity?: Date
    bestAnswer?: string // Reference to accepted answer comment ID

    // Media and attachments
    attachments?: {
        name: string
        url: string
        type: 'image' | 'video' | 'document' | 'code'
        size?: number
    }[]

    // Related content
    linkedCourse?: string
    linkedHackathon?: string

    // Moderation
    isModerated?: boolean
    moderationReason?: string
    reports?: number

    // Metrics
    score?: number // Calculated based on likes, views, comments
    trending?: number // Engagement velocity

    // SEO
    slug?: string
    meta?: {
        description?: string
        keywords?: string[]
    }
}

export interface Comment {
    id?: string
    postId: string
    content: string
    author: {
        id: string
        name: string
        avatar: string
    }
    likes: number
    createdAt: Date
    updatedAt: Date
    parentId?: string // For nested comments
    isEdited?: boolean
    isPinned?: boolean
    attachments?: {
        name: string
        url: string
        type: string
    }[]
}



export interface CommunityFilters {
    category?: string[]
    tags?: string[]
    timeRange?: 'today' | 'week' | 'month' | 'year' | 'all'
    sortBy?: 'latest' | 'popular' | 'unanswered'
    search?: string
}



export interface Category {
    name: string
    count: number
    icon?: ReactNode
}

export interface Contributor {
    id: string
    name: string
    avatar: string
    posts: number
    reputation: number
    joinedAt: Date
}

export interface CommunityEvent {
    id: string;
    title: string;
    description: string;
    type: 'workshop' | 'webinar' | 'conference' | 'meetup' | 'hackathon' | 'other';
    format: 'online' | 'in-person' | 'hybrid';
    date: string | Date | Timestamp;
    time: string;
    endDate?: string | Date | Timestamp;
    endTime?: string;
    timeZone: string;
    location?: {
        name: string;
        address?: string;
        city?: string;
        country?: string;
        virtual?: {
            platform: string;
            link: string;
        };
    };
    participants: number;
    maxParticipants?: number;
    organizer: {
        id: string;
        name: string;
        avatar: string;
        role?: string;
        bio?: string;
    };
    speakers?: {
        id: string
        name: string
        avatar: string
        title?: string
        company?: string
        bio?: string
    }[]
    agenda?: {
        time: string
        title: string
        description?: string
        speaker?: string
    }[]
    registrationDeadline?: Date
    isRegistered?: boolean
    isFeatured?: boolean
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
    cover?: string
    tags?: string[]
    prerequisites?: string[]
    requirements?: string[]
    resources?: {
        title: string
        type: string
        url: string
    }[]
    pricing?: {
        type: 'free' | 'paid'
        amount?: number
        currency?: string
        earlyBird?: {
            amount: number
            deadline: Date
        }
    }
    createdAt: Date
    updatedAt: Date
    createdBy: string
    visibility: 'public' | 'private' | 'unlisted'
}