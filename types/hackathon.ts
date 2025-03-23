export interface Hackathon {
    id?: string
    title: string
    organizer: string
    logo: string
    website: string
    startDate: Date
    endDate: Date
    location: string
    participants: number
    prizePool: string
    status: 'upcoming' | 'active' | 'completed'
    tags: string[]
    description: string
    image?: string
    progress: number
    featured: boolean
    sponsors: {
      name: string
      logo: string
    }[]
    timeline: {
      date: string
      event: string
      description: string
    }[]
    resources: {
      type: string
      title: string
      url: string
    }[]
    prizes: {
      title: string
      amount: string
      description: string
    }[]
    judges: {
      name: string
      title: string
      avatar: string
    }[]
    createdBy: string
    createdAt: Date
    updatedAt: Date
  }
  
  export interface HackathonFilters {
    status?: ('upcoming' | 'active' | 'completed')[]
    tags?: string[]
    search?: string
  }