"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Footer } from "@/components/footer"
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Building,
  Filter,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  GraduationCap,
  Bookmark,
  Share2,
  X,
} from "lucide-react"
import { useJobs } from "@/context/JobsProvider"
import { useAuth } from "@/context/AuthProvider"
import { PostButton } from "@/components/post-button"
import { useEffect, useState } from "react"
import { Job, JobFilters, JobType } from "@/types/job"
import { toast } from "@/components/ui/use-toast"
import { EmptyState } from "@/components/empty-state"
import { WysiwygDisplayer } from "@/components/wysiwyg-displayer"

export default function JobsPage() {
  const { jobs, loading, filters, setFilters, getJobs, getFeaturedJobs } = useJobs()
  const { user } = useAuth()
  interface Company {
    name: string;
    logo: string;
    openPositions: number;
  }

  const [featuredCompanies, setFeaturedCompanies] = useState<Company[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<JobFilters>({
    type: [],
    location: [],
    tags: [],
    experience: [],
    salaryRange: undefined,
    search: undefined
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("newest")
  const jobsPerPage = 5

  useEffect(() => {
    loadJobs()
    loadFeaturedCompanies()
  }, [])

  useEffect(() => {
    // Apply filters whenever they change in the context
    setActiveFilters(filters)
  }, [filters])

  const loadJobs = async () => {
    try {
      await getJobs(filters)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive"
      })
    }
  }

  const loadFeaturedCompanies = async () => {
    try {
      const featured = await getFeaturedJobs()
      
      const companies = featured.reduce<Company[]>((acc, job) => {
        const company = acc.find(c => c.name === job.company)
        if (!company) {
          acc.push({
            name: job.company,
            logo: job.logo,
            openPositions: 1
          })
        } else {
          company.openPositions++
        }
        return acc
      }, [])
      setFeaturedCompanies(companies)
    } catch (error) {
      console.error("Failed to load featured companies:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update the active filters with search query
    const newFilters = {
      ...activeFilters,
      search: searchQuery
    }
    
    // Apply the filters
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page
  }

  const handleFilterChange = (filterType: keyof JobFilters, value: string) => {
    setActiveFilters(prev => {
      const currentFilters = { ...prev }
      
      // Handle different filter types
      switch (filterType) {
        case 'type':
        case 'location':
        case 'tags':
        case 'experience':
          const arrayFilter = [...(currentFilters[filterType] as string[])]
          if (arrayFilter.includes(value)) {
            // Remove the value if it already exists
            const newArray = arrayFilter.filter(v => v !== value)
            return { ...currentFilters, [filterType]: newArray }
          } else {
            // Add the value if it doesn't exist
            return { ...currentFilters, [filterType]: [...arrayFilter, value] }
          }
          
        case 'salaryRange':
          // Parse salary range from value string (format: "50-80", "80-100", etc.)
          const [min, max] = value.split('-').map(Number)
          return { ...currentFilters, salaryRange: { min, max } }
          
        default:
          return currentFilters
      }
    })
  }

  const handleClearFilter = (filterType: keyof JobFilters, value?: string) => {
    setActiveFilters(prev => {
      const currentFilters = { ...prev }
      
      if (value && (filterType === 'type' || filterType === 'location' || filterType === 'tags' || filterType === 'experience')) {
        // Remove specific value from array filter
        const arrayFilter = [...(currentFilters[filterType] as string[])]
        return { ...currentFilters, [filterType]: arrayFilter.filter(v => v !== value) }
      } else {
        // Clear the entire filter
        switch (filterType) {
          case 'type':
          case 'location':
          case 'tags':
          case 'experience':
            return { ...currentFilters, [filterType]: [] }
          case 'salaryRange':
            return { ...currentFilters, salaryRange: undefined }
          case 'search':
            setSearchQuery('')
            return { ...currentFilters, search: undefined }
          default:
            return currentFilters
        }
      }
    })
  }

  const applyFilters = () => {
    setFilters(activeFilters)
    setCurrentPage(1) // Reset to first page when applying new filters
  }

  const clearAllFilters = () => {
    const emptyFilters: JobFilters = {
      type: [],
      location: [],
      tags: [],
      experience: [],
      salaryRange: undefined,
      search: undefined
    }
    setActiveFilters(emptyFilters)
    setFilters(emptyFilters)
    setSearchQuery('')
    setCurrentPage(1)
  }

  // Filter jobs based on current active filters (client-side filtering)
  const filteredJobs = jobs.filter(job => {
    // Filter by search query (title, company, tags)
    if (activeFilters.search) {
      const searchLower = activeFilters.search.toLowerCase()
      const matchesSearch = 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchLower))
      
      if (!matchesSearch) return false
    }
    
    // Filter by job type
    if (activeFilters.type.length > 0 && !activeFilters.type.includes(job.type)) {
      return false
    }
    
    // Filter by location
    if (activeFilters.location.length > 0) {
      const locationMatches = activeFilters.location.some(loc => 
        job.location.toLowerCase().includes(loc.toLowerCase())
      )
      if (!locationMatches) return false
    }
    
    // Filter by tags/skills
    if (activeFilters.tags.length > 0) {
      const hasMatchingTag = activeFilters.tags.some(tag => 
        job.tags.some(jobTag => jobTag.toLowerCase().includes(tag.toLowerCase()))
      )
      if (!hasMatchingTag) return false
    }
    
    // Filter by salary range
    if (activeFilters.salaryRange) {
      // Extract numeric values from salary string (e.g. "$80K - $100K" -> [80, 100])
      const salaryText = job.salary.replace(/[^0-9-]/g, '')
      const salaryParts = salaryText.split('-').map(part => parseInt(part.trim()))
      
      if (salaryParts.length >= 2) {
        const minSalary = salaryParts[0]
        const maxSalary = salaryParts[1]
        
        if (minSalary > activeFilters.salaryRange.max || maxSalary < activeFilters.salaryRange.min) {
          return false
        }
      }
    }
    
    return true
  })

  // Sort the filtered jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      case 'salary-high':
        // Extract the max salary for comparison
        const aMax = parseInt(a.salary.replace(/[^0-9-]/g, '').split('-')[1] || '0')
        const bMax = parseInt(b.salary.replace(/[^0-9-]/g, '').split('-')[1] || '0')
        return bMax - aMax
      case 'salary-low':
        const aMin = parseInt(a.salary.replace(/[^0-9-]/g, '').split('-')[0] || '0')
        const bMin = parseInt(b.salary.replace(/[^0-9-]/g, '').split('-')[0] || '0')
        return aMin - bMin
      case 'relevance':
        // If there's a search query, sort by how well the job matches the query
        if (activeFilters.search) {
          const query = activeFilters.search.toLowerCase()
          const scoreA = getRelevanceScore(a, query)
          const scoreB = getRelevanceScore(b, query)
          return scoreB - scoreA
        }
        return 0
      default:
        return 0
    }
  })

  // Calculate relevance score for sorting by relevance
  const getRelevanceScore = (job: Job, query: string) => {
    let score = 0
    if (job.title.toLowerCase().includes(query)) score += 5
    if (job.company.toLowerCase().includes(query)) score += 3
    score += job.tags.filter(tag => tag.toLowerCase().includes(query)).length * 2
    return score
  }

  // Pagination
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage)
  const paginatedJobs = sortedJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Categorize jobs by field
  const jobsByCategory = {
    development: sortedJobs.filter(job =>
      job.tags.some(tag => ["Solidity", "Smart Contracts", "Web3.js", "Ethereum", "React"].includes(tag))
    ),
    design: sortedJobs.filter(job =>
      job.tags.some(tag => ["UI", "UX", "Design", "Figma"].includes(tag))
    ),
    marketing: sortedJobs.filter(job =>
      job.tags.some(tag => ["Marketing", "Content", "Social Media", "Growth"].includes(tag))
    ),
    business: sortedJobs.filter(job =>
      job.tags.some(tag => ["Product Management", "Finance", "DeFi"].includes(tag))
    )
  }

  // Active filter count
  const activeFilterCount = 
    activeFilters.type.length +
    activeFilters.location.length +
    activeFilters.tags.length +
    activeFilters.experience.length +
    (activeFilters.salaryRange ? 1 : 0) +
    (activeFilters.search ? 1 : 0)

  const JobsList = ({ jobs }: { jobs: Job[] }) => {
    return (
      <div className="space-y-4">
        {jobs.map((job) => (
          <Link href={`/jobs/${job.id}`} key={job.id}>
            <Card
              className={`transition-all hover:shadow-md ${job.featured ? "border-2 border-blue-300 dark:border-blue-700" : "border-slate-200 dark:border-slate-800"}`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800">
                    <AvatarImage src={job.logo} alt={job.company} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      {job.company.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{job.title}</h3>
                        {job.featured && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <Building className="mr-1 h-4 w-4 text-blue-500" />
                        {job.company}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {/* Use WysiwygDisplayer to properly render HTML content */}
                      <WysiwygDisplayer content={job.description} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {job.tags.length > 3 && (
                        <Badge variant="outline" className="font-normal">
                          +{job.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-sm">
                    <Badge
                      variant={
                        job.type === JobType.FULL_TIME
                          ? "default"
                          : job.type === JobType.CONTRACT
                            ? "outline"
                            : "secondary"
                      }
                      className={
                        job.type === JobType.FULL_TIME
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : job.type === JobType.CONTRACT
                            ? "border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                            : ""
                      }
                    >
                      {job.type}
                    </Badge>
                    <div className="flex items-center text-slate-500 dark:text-slate-400">
                      <MapPin className="mr-1 h-4 w-4 text-teal-500" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-slate-500 dark:text-slate-400">
                      <DollarSign className="mr-1 h-4 w-4 text-green-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{job.salary}</span>
                    </div>
                    <div className="flex items-center text-slate-500 dark:text-slate-400">
                      <Clock className="mr-1 h-4 w-4 text-blue-500" />
                      {new Date(job.postedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-12">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl">
              <Badge className="mb-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white">Web3 Careers</Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-4 text-slate-800 dark:text-slate-100">
                Blockchain & Web3 Jobs
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Find the best blockchain and Web3 jobs from top companies worldwide
              </p>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search jobs by title, company, or skills..."
                    className="pl-9 bg-background border-blue-100 dark:border-blue-900 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                >
                  Find Jobs
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] border-blue-200 dark:border-blue-800">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="salary-high">Salary (High to Low)</SelectItem>
                    <SelectItem value="salary-low">Salary (Low to High)</SelectItem>
                    <SelectItem value="relevance">Relevance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-medium text-slate-700 dark:text-slate-300">{sortedJobs.length}</span> jobs
              </div>
            </div>

            {/* Active filters display */}
            {activeFilterCount > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Active Filters</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="h-8 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {activeFilters.search && (
                    <Badge variant="secondary" className="text-xs px-2 py-1 gap-1 font-normal">
                      Search: {activeFilters.search}
                      <button onClick={() => handleClearFilter('search')} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {activeFilters.type.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs px-2 py-1 gap-1 font-normal">
                      Type: {type}
                      <button onClick={() => handleClearFilter('type', type)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {activeFilters.location.map(location => (
                    <Badge key={location} variant="secondary" className="text-xs px-2 py-1 gap-1 font-normal">
                      Location: {location}
                      <button onClick={() => handleClearFilter('location', location)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {activeFilters.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-1 gap-1 font-normal">
                      Skill: {tag}
                      <button onClick={() => handleClearFilter('tags', tag)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {activeFilters.experience.map(exp => (
                    <Badge key={exp} variant="secondary" className="text-xs px-2 py-1 gap-1 font-normal">
                      Experience: {exp}
                      <button onClick={() => handleClearFilter('experience', exp)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {activeFilters.salaryRange && (
                    <Badge variant="secondary" className="text-xs px-2 py-1 gap-1 font-normal">
                      Salary: ${activeFilters.salaryRange.min}K - ${activeFilters.salaryRange.max}K
                      <button onClick={() => handleClearFilter('salaryRange')} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr]">
              <div className="space-y-6">
                <Card className="border-blue-100 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Job Type</h3>
                        <div className="space-y-1">
                          {[JobType.FULL_TIME, JobType.PART_TIME, JobType.CONTRACT, JobType.FREELANCE].map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={type.toLowerCase()}
                                checked={activeFilters.type.includes(type)}
                                onChange={() => handleFilterChange("type", type)}
                                className="h-4 w-4 rounded border-slate-300"
                              />
                              <label htmlFor={type.toLowerCase()}>{type}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-blue-100 dark:bg-blue-900" />

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Location</h3>
                        <div className="space-y-1">
                          {["Remote", "United States", "Europe", "Asia"].map(location => (
                            <div key={location} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={location.toLowerCase().replace(/\s+/g, '-')}
                                checked={activeFilters.location.includes(location)}
                                onChange={() => handleFilterChange("location", location)}
                                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                              />
                              <label 
                                htmlFor={location.toLowerCase().replace(/\s+/g, '-')} 
                                className="text-sm text-slate-700 dark:text-slate-300"
                              >
                                {location}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-blue-100 dark:bg-blue-900" />

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Experience Level</h3>
                        <div className="space-y-1">
                          {["Entry Level", "Mid Level", "Senior Level"].map(exp => (
                            <div key={exp} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={exp.toLowerCase().replace(/\s+/g, '-')}
                                checked={activeFilters.experience.includes(exp)}
                                onChange={() => handleFilterChange("experience", exp)}
                                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                              />
                              <label 
                                htmlFor={exp.toLowerCase().replace(/\s+/g, '-')} 
                                className="text-sm text-slate-700 dark:text-slate-300"
                              >
                                {exp}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-blue-100 dark:bg-blue-900" />

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Skills</h3>
                        <div className="space-y-1">
                          {["Solidity", "Web3.js", "React", "Rust"].map(skill => (
                            <div key={skill} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={skill.toLowerCase()}
                                checked={activeFilters.tags.includes(skill)}
                                onChange={() => handleFilterChange("tags", skill)}
                                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                              />
                              <label 
                                htmlFor={skill.toLowerCase()} 
                                className="text-sm text-slate-700 dark:text-slate-300"
                              >
                                {skill}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-blue-100 dark:bg-blue-900" />

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Salary Range</h3>
                        <div className="space-y-1">
                          {[
                            { id: "salary-50-80", label: "$50K - $80K", value: "50-80" },
                            { id: "salary-80-100", label: "$80K - $100K", value: "80-100" },
                            { id: "salary-100-130", label: "$100K - $130K", value: "100-130" },
                            { id: "salary-130-200", label: "$130K+", value: "130-200" }
                          ].map(salary => (
                            <div key={salary.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={salary.id}
                                checked={activeFilters.salaryRange?.min === parseInt(salary.value.split('-')[0])}
                                onChange={() => handleFilterChange("salaryRange", salary.value)}
                                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                              />
                              <label 
                                htmlFor={salary.id} 
                                className="text-sm text-slate-700 dark:text-slate-300"
                              >
                                {salary.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={applyFilters}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle>Featured Companies</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {featuredCompanies.map((company, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={company.logo} alt={company.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                              {company.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{company.name}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {company.openPositions} open positions
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                    >
                      All Jobs
                    </TabsTrigger>
                    <TabsTrigger
                      value="development"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                    >
                      Development
                    </TabsTrigger>
                    <TabsTrigger
                      value="design"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                    >
                      Design
                    </TabsTrigger>
                    <TabsTrigger
                      value="marketing"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                    >
                      Marketing
                    </TabsTrigger>
                    <TabsTrigger
                      value="business"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                    >
                      Business
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-0">
                    {filteredJobs.length > 0 ? (
                      <JobsList jobs={filteredJobs} />
                    ) : (
                      <EmptyState
                        title="No jobs available"
                        description="We don't have any jobs matching your criteria right now. Try adjusting your filters or check back later."
                        icon={<Briefcase className="h-10 w-10 text-blue-500" />}
                      />
                    )}
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        3
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="development" className="mt-0">
                    {jobsByCategory.development.length > 0 ? (
                      <JobsList jobs={jobsByCategory.development} />
                    ) : (
                      <EmptyState
                        title="No development jobs available"
                        description="We don't have any development positions open right now. Check back later or browse other categories."
                        icon={<Briefcase className="h-10 w-10 text-blue-500" />}
                      />
                    )}
                  </TabsContent>

                    

                  <TabsContent value="business" className="mt-0">
                    {jobsByCategory.business.length > 0 ? (
                      <JobsList jobs={jobsByCategory.business} />
                    ) : (
                      <EmptyState
                        title="No Business jobs available"
                        description="We don't have any B/D positions open right now. Check back later or browse other categories."
                        icon={<Briefcase className="h-10 w-10 text-blue-500" />}
                      />
                    )}
                  </TabsContent>

                  {/* Empty states for other tabs */}
                  <TabsContent value="design" className="mt-0">
                    {jobsByCategory.design.length > 0 ? (
                      <JobsList jobs={jobsByCategory.design} />
                    ) : (
                      <EmptyState
                        title="No design jobs available"
                        description="We don't have any design positions open right now. Check back later or browse other categories."
                        icon={<Briefcase className="h-10 w-10 text-blue-500" />}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="marketing" className="mt-0">
                    {jobsByCategory.marketing.length > 0 ? (
                      <JobsList jobs={jobsByCategory.marketing} />
                    ) : (
                      <EmptyState
                        title="No marketing jobs available"
                        description="We don't have any marketing positions open right now. Check back later or browse other categories."
                        icon={<Briefcase className="h-10 w-10 text-blue-500" />}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div className="mt-12 rounded-lg border bg-gradient-to-br from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 p-6 border-blue-200 dark:border-blue-800">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    Looking for blockchain talent?
                  </h2>
                  <p className="text-muted-foreground">
                    Post your job listing and reach thousands of qualified blockchain professionals
                  </p>
                </div>
                {/* <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Jobs
                  </Button>

                  <PostButton type="job" />
                  <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Post a Job
                  </Button> 
                </div>*/}
              </div>
            </div>

            {/* <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Career Resources</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-blue-100 dark:border-blue-900">
                  <CardContent className="p-6">
                    <div className="rounded-full bg-blue-50 p-3 w-fit dark:bg-blue-950 mb-4">
                      <GraduationCap className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">
                      Blockchain Career Guide
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Learn about different career paths in the blockchain industry and how to get started.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                    >
                      Read Guide
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 dark:border-blue-900">
                  <CardContent className="p-6">
                    <div className="rounded-full bg-blue-50 p-3 w-fit dark:bg-blue-950 mb-4">
                      <Briefcase className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Resume Templates</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Download blockchain-specific resume templates to highlight your skills and experience.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                    >
                      Get Templates
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 dark:border-blue-900">
                  <CardContent className="p-6">
                    <div className="rounded-full bg-blue-50 p-3 w-fit dark:bg-blue-950 mb-4">
                      <Bookmark className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">Interview Preparation</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Practice with common blockchain and Web3 interview questions and coding challenges.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                    >
                      Start Practicing
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div> */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

