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
} from "lucide-react"
import { useJobs } from "@/context/JobsProvider"
import { useAuth } from "@/context/AuthProvider"
import { PostButton } from "@/components/post-button"
import { useEffect, useState } from "react"
import { Job, JobFilters } from "@/types/job"
import { toast } from "@/components/ui/use-toast"
import { EmptyState } from "@/components/empty-state"

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
    salaryRange: undefined
  })

  useEffect(() => {
    loadJobs()
    loadFeaturedCompanies()
  }, [])

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


  const JobsList = ({ jobs }: { jobs: any[] }) => {
    return (
      <div className="space-y-4">
        {filteredJobs.map((job: any) => (
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
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag: any, index: any) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-sm">
                    <Badge
                      variant={
                        job.type === "Full-time"
                          ? "default"
                          : job.type === "Contract"
                            ? "outline"
                            : "secondary"
                      }
                      className={
                        job.type === "Full-time"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : job.type === "Contract"
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

  const loadFeaturedCompanies = async () => {
    try {
      const featured = await getFeaturedJobs()
      interface Company {
        name: string;
        logo: string;
        openPositions: number;
      }

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

  const jobsByCategory = {
    development: jobs.filter(job =>
      job.tags.some(tag => ["Solidity", "Smart Contracts", "Web3.js", "Ethereum", "React"].includes(tag))
    ),
    design: jobs.filter(job =>
      job.tags.some(tag => ["UI", "UX", "Design", "Figma"].includes(tag))
    ),
    marketing: jobs.filter(job =>
      job.tags.some(tag => ["Marketing", "Content", "Social Media", "Growth"].includes(tag))
    ),
    business: jobs.filter(job =>
      job.tags.some(tag => ["Product Management", "Finance", "DeFi"].includes(tag))
    )
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({
      ...filters,
      search: searchQuery
    })
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
          const arrayFilter = currentFilters[filterType] as string[]
          if (arrayFilter.includes(value)) {
            currentFilters[filterType] = arrayFilter.filter(v => v !== value)
          } else {
            currentFilters[filterType] = [...arrayFilter, value]
          }
          break
          
        case 'search':
          currentFilters.search = value
          break
          
        case 'salaryRange':
          
          const [min, max] = value.split('-').map(Number)
          currentFilters.salaryRange = { min, max }
          break
      }
  
      return currentFilters
    })
  }

  const applyFilters = () => {
    setFilters(activeFilters)
  }

  const filteredJobs = jobs.filter(job => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return (
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    return true
  })

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
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Select defaultValue="newest">
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
                Showing <span className="font-medium text-slate-700 dark:text-slate-300">{filteredJobs.length}</span> jobs
              </div>
            </div>

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
                          {["Full-time", "Part-time", "Contract", "Freelance"].map(type => (
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
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="remote"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="remote" className="text-sm text-slate-700 dark:text-slate-300">
                              Remote
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="us"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="us" className="text-sm text-slate-700 dark:text-slate-300">
                              United States
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="europe"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="europe" className="text-sm text-slate-700 dark:text-slate-300">
                              Europe
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="asia"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="asia" className="text-sm text-slate-700 dark:text-slate-300">
                              Asia
                            </label>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-blue-100 dark:bg-blue-900" />

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Experience Level</h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="entry"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="entry" className="text-sm text-slate-700 dark:text-slate-300">
                              Entry Level
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="mid"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="mid" className="text-sm text-slate-700 dark:text-slate-300">
                              Mid Level
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="senior"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="senior" className="text-sm text-slate-700 dark:text-slate-300">
                              Senior Level
                            </label>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-blue-100 dark:bg-blue-900" />

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Skills</h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="solidity"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="solidity" className="text-sm text-slate-700 dark:text-slate-300">
                              Solidity
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="web3js"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="web3js" className="text-sm text-slate-700 dark:text-slate-300">
                              Web3.js
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="react"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="react" className="text-sm text-slate-700 dark:text-slate-300">
                              React
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="rust"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="rust" className="text-sm text-slate-700 dark:text-slate-300">
                              Rust
                            </label>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-blue-100 dark:bg-blue-900" />

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Salary Range</h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="salary-50"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="salary-50" className="text-sm text-slate-700 dark:text-slate-300">
                              $50K - $80K
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="salary-80"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="salary-80" className="text-sm text-slate-700 dark:text-slate-300">
                              $80K - $100K
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="salary-100"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="salary-100" className="text-sm text-slate-700 dark:text-slate-300">
                              $100K - $130K
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="salary-130"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="salary-130" className="text-sm text-slate-700 dark:text-slate-300">
                              $130K+
                            </label>
                          </div>
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Jobs
                  </Button>

                  <PostButton type="job" />
                  {/* <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Post a Job
                  </Button> */}
                </div>
              </div>
            </div>

            <div className="mt-12">
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

