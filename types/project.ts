export interface TeamMember {
    id: string
    name: string
    avatar: string
    role: string
    links?: {
      github?: string
      linkedin?: string
      twitter?: string
    }
    skills: string[]
  }
  
  export interface Project {
    id?: string
    title: string
    team: string
    hackathonId: string
    hackathonTitle: string
    description: string
    fullDescription: string
    images: string[]
    demoUrl?: string
    repoUrl?: string
    technologies: string[]
    teamMembers: TeamMember[]
    status: 'submitted' | 'winner' | 'runner-up' | 'finalist'
    prizeWon?: {
      title: string
      amount: string
      position: number
    }
    submittedAt: Date
    createdBy: string
    createdAt: Date
    updatedAt: Date
    views: number
    likes: string[]
  }

  export interface WinningProject {
    id?: string
    project: string
    team: string
    hackathonId: string
    hackathonTitle: string
    description: string
    image: string
    technologies: string[]
    repoUrl?: string
    demoUrl?: string
    teamMembers: {
      id: string
      name: string
      role: string
      avatar: string
    }[]
    prizeWon: {
      title: string
      amount: string
    }
    submittedAt: Date
    createdAt: Date
    updatedAt: Date
  }