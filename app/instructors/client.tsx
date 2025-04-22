"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, orderBy, limit, startAfter, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Footer } from "@/components/footer"
import { Search, Filter, Star, BookOpen, Users, Calendar, ChevronRight, MessageSquare, Clock, Award, Sparkles } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

// Define instructor type
interface Instructor {
  id: string
  firstName: string
  lastName: string
  photoURL: string
  bio: string
  expertise: string[]
  rating: number
  reviews: number
  students: number
  courses: number
  hourlyRate?: number
  availability?: string[]
  featured?: boolean
  verified?: boolean
  joinedAt?: any
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  }
  languages?: string[]
  role?: string // Adding role for proper filtering
  approved?: boolean // Adding approved status
}

export default function InstructorsClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [featuredInstructors, setFeaturedInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [expertiseFilter, setExpertiseFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("rating")
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // List of expertise areas for filtering
  const expertiseAreas = [
    "Smart Contracts",
    "DeFi",
    "NFTs",
    "Web3",
    "Solidity",
    "Ethereum",
    "Bitcoin",
    "Blockchain Architecture",
    "Cryptography",
    "dApp Development",
  ]

  useEffect(() => {
    fetchInstructors(true)
    fetchFeaturedInstructors()
  }, [sortBy, expertiseFilter])

  const fetchInstructors = async (filterChanged = false) => {
    try {
      if (filterChanged) {
        setLoading(true)
        setLastVisible(null) // Reset pagination when filters change
      } else {
        setLoadingMore(true) // Show loading more indicator
      }
      
      // Create base query
      let instructorsQuery: any = query(
        collection(db, "users"),
        where("role", "==", "instructor")
      )
      
      // Add expertise filter if selected
      if (expertiseFilter !== "all") {
        instructorsQuery = query(
          collection(db, "users"),
          where("role", "==", "instructor")
        //   where("approved", "==", true),
        //   where("expertise", "array-contains", expertiseFilter)
        )
      }
      
      // Add sorting
      switch (sortBy) {
        case "rating":
          instructorsQuery = query(instructorsQuery, orderBy("rating", "desc"))
          break
        case "students":
          instructorsQuery = query(instructorsQuery, orderBy("students", "desc"))
          break
        case "courses":
          instructorsQuery = query(instructorsQuery, orderBy("courses", "desc"))
          break
        case "newest":
          instructorsQuery = query(instructorsQuery, orderBy("joinedAt", "desc"))
          break
      }
      
      // Add pagination
      instructorsQuery = query(instructorsQuery, limit(12))
      
      // Add startAfter if we're paginating
      if (lastVisible && !filterChanged) {
        instructorsQuery = query(instructorsQuery, startAfter(lastVisible))
      }
      
      const snapshot = await getDocs(instructorsQuery)
      
      // Check if we have more results
      setHasMore(snapshot.docs.length === 12)
      
      // Set the last visible document for pagination
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
      } else {
        setLastVisible(null)
      }
      
      // Map the documents to our Instructor type
      const instructorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Instructor[]
      
      // If this is a new search/filter, replace the list
      // Otherwise append to the existing list
      if (filterChanged) {
        setInstructors(instructorsList)
      } else {
        setInstructors(prev => [...prev, ...instructorsList])
      }
    } catch (error) {
      console.error("Error fetching instructors:", error)
      toast({
        title: "Error loading instructors",
        description: "There was a problem loading the instructor list. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const fetchFeaturedInstructors = async () => {
    try {
      const featuredQuery = query(
        collection(db, "users"),
        where("role", "==", "instructor"),
        where("featured", "==", true),
        where("approved", "==", true),
        limit(4)
      )
      
      const snapshot = await getDocs(featuredQuery)
      const featuredList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Instructor[]
      
      setFeaturedInstructors(featuredList)
    } catch (error) {
      console.error("Error fetching featured instructors:", error)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      fetchInstructors(true)
      return
    }
    
    // Client-side filtering - in a real app, you might want to use Algolia or another search service
    setLoading(true)
    
    // Create a new query for all instructors but with a larger limit
    const searchAllQuery = query(
      collection(db, "users"),
      where("role", "==", "instructor"),
      where("approved", "==", true),
      limit(100) // Larger limit for search
    )
    
    getDocs(searchAllQuery)
      .then(snapshot => {
        const allInstructors = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Instructor[]
        
        // Filter client-side based on the search query
        const searchTerms = searchQuery.toLowerCase().split(' ')
        const filtered = allInstructors.filter(instructor => {
          const fullName = `${instructor.firstName || ''} ${instructor.lastName || ''}`.toLowerCase()
          const bio = (instructor.bio || '').toLowerCase()
          const expertise = instructor.expertise?.map(e => e.toLowerCase()) || []
          
          return searchTerms.some(term => 
            fullName.includes(term) || 
            bio.includes(term) || 
            expertise.some(exp => exp.includes(term))
          )
        })
        
        setInstructors(filtered)
        setHasMore(false) // Disable pagination for search results
      })
      .catch(error => {
        console.error("Error searching instructors:", error)
        toast({
          title: "Search failed",
          description: "There was a problem performing your search. Please try again.",
          variant: "destructive"
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleFilterChange = (value: string) => {
    setExpertiseFilter(value)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const loadMore = () => {
    if (!loadingMore) {
      fetchInstructors(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setExpertiseFilter("all")
    setSortBy("rating")
  }

  // Function to get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  // Function to format the instructor's full name
  const getFullName = (instructor: Instructor) => {
    return `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || 'Unnamed Instructor'
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Learn from Blockchain Experts
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Connect with industry-leading instructors specializing in blockchain technology, 
                  smart contracts, DeFi, and more.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search instructors..."
                    className="w-full bg-background pl-8 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Instructors */}
        <section className="w-full py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Instructors</h2>
                <p className="text-muted-foreground">
                  Top-rated blockchain experts ready to help you master the technology
                </p>
              </div>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                onClick={() => window.scrollTo({ top: document.getElementById('all-instructors')?.offsetTop, behavior: 'smooth' })}
              >
                View All Instructors
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-4">
              {featuredInstructors.length > 0 ? (
                featuredInstructors.map((instructor) => (
                  <Card key={instructor.id} className="overflow-hidden transition-all hover:shadow-lg">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full bg-gradient-to-r from-blue-400 to-teal-400">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Avatar className="h-24 w-24 border-4 border-white">
                            <AvatarImage src={instructor.photoURL} alt={getFullName(instructor)} />
                            <AvatarFallback className="text-2xl bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                              {getInitials(instructor.firstName, instructor.lastName)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        {instructor.verified && (
                          <Badge className="absolute top-2 right-2 bg-blue-500">
                            <Sparkles className="mr-1 h-3 w-3" />
                            Verified Expert
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 text-center">
                      <CardTitle className="text-xl mb-1">{getFullName(instructor)}</CardTitle>
                      <CardDescription className="mb-4 line-clamp-2">
                        {instructor.bio || "Blockchain instructor and expert"}
                      </CardDescription>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {instructor.expertise?.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {skill}
                          </Badge>
                        ))}
                        {(instructor.expertise?.length || 0) > 3 && (
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            +{(instructor.expertise?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Star className="mr-1 h-4 w-4 text-amber-500" />
                          <span>{instructor.rating || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4 text-blue-500" />
                          <span>{instructor.students || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="mr-1 h-4 w-4 text-teal-500" />
                          <span>{instructor.courses || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700" asChild>
                        <Link href={`/instructors/${instructor.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                // Skeleton loading state for featured instructors
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={`skeleton-${index}`} className="overflow-hidden">
                    <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Skeleton className="h-24 w-24 rounded-full" />
                      </div>
                    </div>
                    <CardContent className="p-6 text-center">
                      <Skeleton className="h-6 w-32 mx-auto mb-2" />
                      <Skeleton className="h-4 w-full mx-auto mb-4" />
                      <div className="flex justify-center gap-2 mb-4">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* All Instructors */}
        <section id="all-instructors" className="w-full py-12 md:py-16 lg:py-20 bg-slate-50 dark:bg-slate-900/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">All Instructors</h2>
                <p className="text-muted-foreground">
                  Browse our community of blockchain instructors
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={expertiseFilter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by expertise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Expertise</SelectItem>
                    {expertiseAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="students">Most Students</SelectItem>
                    <SelectItem value="courses">Most Courses</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading && instructors.length === 0 ? (
                // Skeleton loading state
                Array.from({ length: 8 }).map((_, index) => (
                  <Card key={`skeleton-${index}`} className="overflow-hidden">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))
              ) : instructors.length > 0 ? (
                instructors.map((instructor) => (
                  <Card key={instructor.id} className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={instructor.photoURL} alt={getFullName(instructor)} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                            {getInitials(instructor.firstName, instructor.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{getFullName(instructor)}</CardTitle>
                          <CardDescription className="flex items-center">
                            <Star className="mr-1 h-3 w-3 text-amber-500" />
                            <span>{instructor.rating || 0} ({instructor.reviews || 0} reviews)</span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {instructor.bio || "Blockchain instructor and expert"}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {instructor.expertise?.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {skill}
                          </Badge>
                        ))}
                        {(instructor.expertise?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(instructor.expertise?.length || 0) - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="mr-1 h-3 w-3 text-blue-500" />
                          <span>{instructor.students || 0} students</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="mr-1 h-3 w-3 text-teal-500" />
                          <span>{instructor.courses || 0} courses</span>
                        </div>
                        {instructor.hourlyRate && (
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3 text-purple-500" />
                            <span>${instructor.hourlyRate}/hour</span>
                          </div>
                        )}
                        {instructor.languages && (
                          <div className="flex items-center">
                            <MessageSquare className="mr-1 h-3 w-3 text-orange-500" />
                            <span>{instructor.languages.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/instructors/${instructor.id}`}>
                          View Profile
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/instructors/${instructor.id}/book`}>
                          Book Session
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-6 mb-4">
                    <Users className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                    No instructors found
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                    {searchQuery 
                      ? `No instructors match your search for "${searchQuery}"`
                      : expertiseFilter !== "all" 
                        ? `No instructors found with expertise in ${expertiseFilter}`
                        : "No instructors are available at the moment"}
                  </p>
                  <Button onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>

            {hasMore && instructors.length > 0 && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    "Load More Instructors"
                  )}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Become an Instructor CTA */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                  Join Our Community
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Share Your Blockchain Knowledge
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Become an instructor on BlockLearn and help others master blockchain technology. 
                  Create courses, host live sessions, and build your reputation in the community.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                    asChild
                  >
                    <Link href="/become-instructor">
                      Become an Instructor
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/instructor-faq">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[300px] w-[300px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 dark:from-blue-400 dark:to-teal-400 rounded-full opacity-20 blur-3xl"></div>
                  <div className="relative h-full w-full rounded-xl border bg-background p-4 shadow-xl">
                    <div className="flex h-full w-full flex-col rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500"></div>
                          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-xs">Instructor Dashboard</div>
                      </div>
                      <div className="flex-1 p-2 text-xs font-mono overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-xs">
                              JD
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">Jane Doe</div>
                            <div className="text-muted-foreground text-[10px]">Blockchain Instructor</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Total Students</span>
                            <span className="text-primary">1,245</span>
                          </div>
                          <div className="h-1.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Course Ratings</span>
                            <span className="text-primary">4.8/5.0</span>
                          </div>
                          <div className="h-1.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                            <div className="h-full w-[95%] bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Total Earnings</span>
                            <span className="text-primary">$12,450</span>
                          </div>
                          <div className="h-1.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                            <div className="h-full w-1/2 bg-blue-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}