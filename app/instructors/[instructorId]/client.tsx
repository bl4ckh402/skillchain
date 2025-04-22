"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Footer } from "@/components/footer"
import { useToast } from "@/components/ui/use-toast"
import { Star, BookOpen, Users, Calendar, Clock, Award, MessageSquare, ExternalLink, Mail, Video, Sparkles, CheckCircle2, Github, Twitter, Linkedin, Globe } from 'lucide-react'

// Type definitions
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
  email?: string
  about?: string
  experience?: {
    title: string
    company: string
    period: string
    description: string
  }[]
  education?: {
    degree: string
    institution: string
    year: string
  }[]
  certifications?: {
    name: string
    issuer: string
    year: string
  }[]
}

interface Course {
  id: string
  title: string
  description: string
  image: string
  price: number
  rating: number
  reviews: number
  students: number
  level: string
  duration: string
  instructor: {
    id: string
    name: string
    avatar: string
  }
  published?: boolean
}

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: any
  courseId?: string
  courseName?: string
  instructorId?: string
}

export default function InstructorProfileClient({ instructorId }: { instructorId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("courses")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInstructorData()
  }, [instructorId])

  const fetchInstructorData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch instructor data
      const instructorDoc = await getDoc(doc(db, "users", instructorId))
      
      if (!instructorDoc.exists()) {
        setError("Instructor not found")
        setLoading(false)
        return
      }
      
      const instructorData = {
        id: instructorDoc.id,
        ...instructorDoc.data()
      } as Instructor
      
      // Verify this is an instructor account
      if (instructorData.role !== 'instructor') {
        setError("This user is not an instructor")
        setLoading(false)
        return
      }
      
      setInstructor(instructorData)
      
      // Fetch instructor's courses
      try {
        const coursesQuery = query(
          collection(db, "courses"),
          where("instructor.id", "==", instructorId),
          where("published", "==", true),
          orderBy("createdAt", "desc")
        )
        
        const coursesSnapshot = await getDocs(coursesQuery)
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[]
        
        setCourses(coursesData)
      } catch (err) {
        console.error("Error fetching courses:", err)
        // Continue even if courses fail to load
      }
      
      // Fetch instructor's reviews
      try {
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("instructorId", "==", instructorId),
          orderBy("date", "desc"),
          limit(10)
        )
        
        const reviewsSnapshot = await getDocs(reviewsQuery)
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Review[]
        
        setReviews(reviewsData)
      } catch (err) {
        console.error("Error fetching reviews:", err)
        // Continue even if reviews fail to load
      }
    } catch (error) {
      console.error("Error fetching instructor data:", error)
      setError("Failed to load instructor profile. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Function to get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  // Function to format the instructor's full name
  const getFullName = (instructor: Instructor) => {
    return `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || 'Unnamed Instructor'
  }

  // Function to format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date'
    
    try {
      if (typeof timestamp === 'object' && 'toDate' in timestamp) {
        return timestamp.toDate().toLocaleDateString()
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString()
      }
      return new Date(timestamp).toLocaleDateString()
    } catch (error) {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar skeleton */}
              <div className="w-full md:w-1/3 lg:w-1/4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center mb-6">
                      <Skeleton className="h-32 w-32 rounded-full mb-4" />
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-24 mb-4" />
                      <div className="flex gap-2 mb-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main content skeleton */}
              <div className="flex-1">
                <Skeleton className="h-10 w-48 mb-6" />
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-full mb-6" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-64 rounded-lg" />
                  <Skeleton className="h-64 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !instructor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            {error || "Instructor Not Found"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error 
              ? "We encountered an error loading this instructor profile." 
              : "The instructor you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link href="/instructors">Browse Instructors</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-800">
                <AvatarImage src={instructor.photoURL} alt={getFullName(instructor)} />
                <AvatarFallback className="text-3xl bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  {getInitials(instructor.firstName, instructor.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    {getFullName(instructor)}
                  </h1>
                  {instructor.verified && (
                    <Badge className="bg-blue-500">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Verified Expert
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-lg mb-3">{instructor.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {instructor.expertise?.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      <span className="text-lg font-bold">{instructor.rating || 0}</span>
                      <span className="text-muted-foreground">({instructor.reviews || 0} reviews)</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>{instructor.students || 0} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-teal-500" />
                        <span>{instructor.courses || 0} courses</span>
                      </div>
                    </div>
                    {instructor.socialLinks && (
                      <div className="flex gap-2 mb-4">
                        {instructor.socialLinks.twitter && (
                          <Link 
                            href={instructor.socialLinks.twitter} 
                            target="_blank" 
                            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-900 dark:hover:text-blue-300"
                          >
                            <Twitter className="h-4 w-4" />
                          </Link>
                        )}
                        {instructor.socialLinks.linkedin && (
                          <Link 
                            href={instructor.socialLinks.linkedin} 
                            target="_blank" 
                            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-900 dark:hover:text-blue-300"
                          >
                            <Linkedin className="h-4 w-4" />
                          </Link>
                        )}
                        {instructor.socialLinks.github && (
                          <Link 
                            href={instructor.socialLinks.github} 
                            target="_blank" 
                            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-900 dark:hover:text-blue-300"
                          >
                            <Github className="h-4 w-4" />
                          </Link>
                        )}
                        {instructor.socialLinks.website && (
                          <Link 
                            href={instructor.socialLinks.website} 
                            target="_blank" 
                            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-900 dark:hover:text-blue-300"
                          >
                            <Globe className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    )}
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white mb-4"
                      asChild
                    >
                      <Link href={`/instructors/${instructor.id}/book`}>
                        Book a Session
                      </Link>
                    </Button>
                    {instructor.email && (
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        asChild
                      >
                        <Link href={`mailto:${instructor.email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Contact Instructor
                        </Link>
                      </Button>
                    )}
                  </div>
                  <Separator className="mb-4" />
                  <div className="space-y-4">
                    {instructor.hourlyRate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Hourly Rate:</span>
                        <span className="font-medium">${instructor.hourlyRate}/hour</span>
                      </div>
                    )}
                    {instructor.languages && instructor.languages.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Languages:</span>
                        <span className="font-medium">{instructor.languages.join(', ')}</span>
                      </div>
                    )}
                    {instructor.joinedAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Member Since:</span>
                        <span className="font-medium">{formatDate(instructor.joinedAt)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 w-full justify-start bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                  <TabsTrigger
                    value="courses"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                  >
                    Courses
                  </TabsTrigger>
                  <TabsTrigger
                    value="about"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                  >
                    About
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Courses by {getFullName(instructor)}</h2>
                  
                  {courses.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      {courses.map((course) => (
                        <Card key={course.id} className="overflow-hidden transition-all hover:shadow-md">
                          <div className="aspect-video w-full overflow-hidden">
                            <img
                              src={course.image || "/placeholder.svg"}
                              alt={course.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl">{course.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="ml-1">{course.rating || 0}</span>
                                <span className="text-muted-foreground ml-1">({course.reviews || 0} reviews)</span>
                              </div>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">{course.level}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span>{course.students || 0} students</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-teal-500" />
                                <span>{course.duration}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <div className="font-bold text-lg">${course.price || 0}</div>
                            <Button asChild>
                              <Link href={`/course/${course.id}`}>
                                View Course
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                        No courses available
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        This instructor hasn't published any courses yet. Check back later or book a one-on-one session.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* About Tab */}
                <TabsContent value="about" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">About {getFullName(instructor)}</h2>
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{instructor.about || instructor.bio || "No information provided."}</p>
                    </div>
                  </div>

                  {instructor.experience && instructor.experience.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Experience</h3>
                      <div className="space-y-4">
                        {instructor.experience.map((exp, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div>
                                  <h4 className="font-bold">{exp.title}</h4>
                                  <p className="text-muted-foreground">{exp.company}</p>
                                </div>
                                <Badge variant="outline">{exp.period}</Badge>
                              </div>
                              {exp.description && (
                                <p className="text-sm mt-2">{exp.description}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {instructor.education && instructor.education.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Education</h3>
                      <div className="space-y-4">
                        {instructor.education.map((edu, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div>
                                  <h4 className="font-bold">{edu.degree}</h4>
                                  <p className="text-muted-foreground">{edu.institution}</p>
                                </div>
                                <Badge variant="outline">{edu.year}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {instructor.certifications && instructor.certifications.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Certifications</h3>
                      <div className="space-y-4">
                        {instructor.certifications.map((cert, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div>
                                  <h4 className="font-bold">{cert.name}</h4>
                                  <p className="text-muted-foreground">{cert.issuer}</p>
                                </div>
                                <Badge variant="outline">{cert.year}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Student Reviews</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-amber-500" />
                        <span className="ml-1 font-bold text-lg">{instructor.rating || 0}</span>
                      </div>
                      <span className="text-muted-foreground">({instructor.reviews || 0} reviews)</span>
                    </div>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarImage src={review.userAvatar} alt={review.userName} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                  {review.userName?.substring(0, 2).toUpperCase() || "??"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                  <div>
                                    <h4 className="font-bold">{review.userName}</h4>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <span>{formatDate(review.date)}</span>
                                      {review.courseName && (
                                        <>
                                          <span>•</span>
                                          <span>{review.courseName}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? "text-amber-500 fill-amber-500" : "text-slate-300 dark:text-slate-600"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm">{review.comment}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                        No reviews yet
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        This instructor hasn't received any reviews yet. Be the first to leave a review after taking a course or session.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}