"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Footer } from "@/components/footer"
import {
  BookOpen,
  Play,
  Award,
  Star,
  Clock,
  Calendar,
  TrendingUp,
  BadgeIcon as Certificate,
  Users,
  Bell,
  CheckCircle2,
  Zap,
  Sparkles,
  Trophy,
  Bookmark,
  Filter,
} from "lucide-react"
import { useDashboard } from "@/context/DashboardProvider"
import { useAuth } from "@/context/AuthProvider"

export default function DashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const { dashboardData, loading, error, updateCourseProgress, issueCertificate } = useDashboard()

  if (loading) {
    // Helper function to safely get nested properties
  const getSafe = (obj, path, fallback = '') => {
    try {
      return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Something went wrong</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 max-w-md">
          <div className="text-blue-500 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">No dashboard data available</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Looks like you're new here! Start by enrolling in a course.</p>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    )
  }

  const {
    stats,
    enrolledCourses = [],
    participatedHackathons = [],
    appliedJobs = [],
    completedProjects = [],
    upcomingEvents = [],
    pastEvents = [],
    achievements = [],
    certificates = []
  } = dashboardData

  // Placeholder notifications (these would come from a real notifications system)
  const notifications = [
    {
      id: 1,
      title: "New lesson available",
      message: "A new lesson on 'Advanced Cryptography' has been added to your Blockchain Fundamentals course.",
      time: "2 hours ago",
      read: false,
      type: "course",
    },
    {
      id: 2,
      title: "Achievement unlocked",
      message: "Congratulations! You've earned the 'Smart Contract Specialist' achievement.",
      time: "1 day ago",
      read: true,
      type: "achievement",
    },
    {
      id: 3,
      title: "Course completion reminder",
      message: "You're 68% through Smart Contract Development. Keep going!",
      time: "3 days ago",
      read: true,
      type: "reminder",
    },
    {
      id: 4,
      title: "New comment on your question",
      message: "Maria Garcia replied to your question about gas optimization.",
      time: "1 week ago",
      read: true,
      type: "comment",
    },
  ]

  // Sample recommended courses (this would come from a recommendation system)
  const recommendedCourses = [
    {
      id: "rec1",
      title: "DeFi Protocols and Applications",
      instructor: "David Kim",
      instructorAvatar: "/images/instructors/david-kim.jpg",
      level: "Advanced",
      rating: 4.7,
      reviews: 82,
      price: "$89.99",
      image: "/images/courses/defi-protocols.jpg",
      tags: ["DeFi", "Yield Farming", "Liquidity"],
    },
    {
      id: "rec2",
      title: "Web3 Frontend Development",
      instructor: "James Wilson",
      instructorAvatar: "/images/instructors/james-wilson.jpg",
      level: "Intermediate",
      rating: 4.8,
      reviews: 56,
      price: "$74.99",
      image: "/images/courses/web3-frontend.jpg",
      tags: ["React", "Web3.js", "dApps"],
    },
  ]

  // Format stats for display
  const statsArray = [
    {
      title: "Courses Enrolled",
      value: (stats?.coursesEnrolled ?? 0).toString(),
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Hours Learned",
      value: (stats?.hoursLearned ?? 0).toString(),
      icon: <Clock className="h-5 w-5 text-teal-500" />,
    },
    {
      title: "Achievements", 
      value: achievements.filter(a => a.unlocked).length.toString(),
      icon: <Award className="h-5 w-5 text-amber-500" />,
    },
    {
      title: "Certificates",
      value: certificates.length.toString(), 
      icon: <Certificate className="h-5 w-5 text-purple-500" />,
    },
  ]
  
  // Helper function to format dates safely
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      if (typeof timestamp === 'object' && 'toDate' in timestamp) {
        return timestamp.toDate().toLocaleDateString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  // Helper function to get achievement icon component
  const getAchievementIcon = (achievement) => {
    // Use icon from data if available
    if (achievement.icon) {
      if (typeof achievement.icon === 'string' && achievement.icon.startsWith('<')) {
        // It's an SVG or HTML string
        return <div dangerouslySetInnerHTML={{ __html: achievement.icon }} />;
      } else if (typeof achievement.icon === 'string') {
        // It's an emoji or text
        return <div className="text-2xl">{achievement.icon}</div>;
      }
    }
    
    // Fallback icons based on type
    switch (achievement.type) {
      case 'course':
        return <BookOpen className="h-6 w-6 text-blue-500" />;
      case 'project':
        return <TrendingUp className="h-6 w-6 text-green-500" />;
      case 'hackathon':
        return <Zap className="h-6 w-6 text-amber-500" />;
      case 'community':
        return <Users className="h-6 w-6 text-purple-500" />;
      default:
        return <Award className="h-6 w-6 text-blue-500" />;
    }
  }
  
  // Handler for resuming a course
  const handleResumeCourse = (course) => {
    // This would navigate to the course and update lastAccessed
    console.log('Resuming course:', course.courseId);
    updateCourseProgress(course.courseId, {
      lastAccessed: new Date()
    });
    // Navigation would happen via Link component in the actual UI
  }
  
  // Handler for requesting a certificate
  const handleRequestCertificate = async (courseId) => {
    try {
      await issueCertificate(courseId);
      alert('Certificate issued successfully!');
    } catch (error) {
      console.error('Error issuing certificate:', error);
      alert('Failed to issue certificate. Please try again.');
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-white dark:border-slate-800">
                  <AvatarImage src={user?.photoURL || "/images/users/user-avatar.jpg"} alt={user?.displayName || "User"} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-xl">
                    {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Welcome back, {user?.displayName || "Learner"}!
                  </h1>
                  <p className="text-muted-foreground">Continue your blockchain learning journey</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                  <Badge className="ml-2 bg-blue-500 text-white">{notifications.filter((n) => !n.read).length}</Badge>
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white" asChild>
                  <Link href="/courses">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Courses
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-4">
            {statsArray.map((stat, index) => (
              <Card key={index} className="border-blue-100 dark:border-blue-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{stat.value}</p>
                    </div>
                    <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-950">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="mb-4 w-full justify-start bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="my-courses"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                My Courses
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="certificates"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Certificates
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Continue Learning Section */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Continue Learning</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course) => (
                      <Link href={`/course/${course.courseId}`} key={course.courseId} className="group">
                        <Card className="overflow-hidden transition-all hover:shadow-lg border-slate-200 dark:border-slate-800">
                          <div className="aspect-video w-full overflow-hidden relative">
                            <img
                              src={course.courseData.image || "/placeholder.svg"}
                              alt={course.courseData.title}
                              className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                              <div className="p-4 w-full">
                                <div className="flex items-center justify-between text-white mb-2">
                                  <div className="flex items-center gap-1">
                                    <Play className="h-4 w-4" />
                                    <span className="text-sm font-medium">Continue</span>
                                  </div>
                                  <div className="text-sm">
                                    {(course.progress?.completedLessons?.length || 0)}/{course.progress?.totalLessons || 0} lessons
                                  </div>
                                </div>
                                <Progress
                                  value={course.progress?.progress || 0}
                                  className="h-1.5 bg-white/30"
                                  indicatorClassName="bg-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="line-clamp-1 text-xl text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {course.courseData.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={course.courseData.instructor.avatar} alt={course.courseData.instructor.name} />
                                <AvatarFallback className="text-[8px] bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                  {course.courseData.instructor.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{course.courseData.instructor.name}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-medium">{course.progress?.progress || 0}%</span>
                              </div>
                              <Progress
                                value={course.progress?.progress || 0}
                                className="h-2 bg-slate-100 dark:bg-slate-800"
                                indicatorClassName="bg-gradient-to-r from-blue-500 to-teal-500"
                              />
                            </div>
                            <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                              <p>
                                Next:{" "}
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  {course.progress?.nextLesson || "Start the course"}
                                </span>
                              </p>
                            </div>
                          </CardContent>
                          <CardFooter className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span>
                                Last accessed {course.progress?.lastAccessed 
                                  ? formatDate(course.progress.lastAccessed) 
                                  : 'Never'}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50"
                              onClick={(e) => {
                                e.preventDefault();
                                handleResumeCourse(course);
                              }}
                            >
                              <Play className="mr-1 h-4 w-4" />
                              Resume
                            </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full p-8 text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                        <BookOpen className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-4">Start your learning journey by enrolling in a course</p>
                      <Button asChild>
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Achievements and Events Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Recent Achievements</h2>
                  <Card className="border-blue-100 dark:border-blue-900">
                    <CardContent className="p-6 space-y-4">
                      {achievements.filter(a => a.unlocked).length > 0 ? (
                        achievements
                          .filter(a => a.unlocked)
                          .slice(0, 3)
                          .map(achievement => (
                            <div key={achievement.id} className="flex items-start gap-4">
                              <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-950">
                                {getAchievementIcon(achievement)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-slate-800 dark:text-slate-200">{achievement.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{achievement.description}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  Unlocked on {formatDate(achievement.unlockedAt)}
                                </p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-6">
                          <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-950 mx-auto w-14 h-14 flex items-center justify-center mb-3">
                            <Trophy className="h-6 w-6 text-blue-500" />
                          </div>
                          <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-1">No achievements yet</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Complete courses and participate in activities to earn achievements
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        onClick={() => setActiveTab("achievements")}
                      >
                        View All Achievements
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Upcoming Events</h2>
                  <Card className="border-blue-100 dark:border-blue-900">
                    <CardContent className="p-6 space-y-4">
                      {upcomingEvents.length > 0 ? (
                        upcomingEvents.slice(0, 3).map(event => (
                          <div key={event.id} className="flex gap-4">
                            <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                              <img
                                src={event.cover || "/placeholder.svg"}
                                alt={event.title}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-800 dark:text-slate-200">{event.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span>
                                  {formatDate(event.date)}, {event.time || '12:00 PM'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                <Users className="h-4 w-4 text-teal-500" />
                                <span>{event.participants || 0} participants</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0 self-center border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                            >
                              Join
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-950 mx-auto w-14 h-14 flex items-center justify-center mb-3">
                            <Calendar className="h-6 w-6 text-blue-500" />
                          </div>
                          <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-1">No upcoming events</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Check back later for new community events
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        asChild
                      >
                        <Link href="/community">
                          View All Events
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              {/* Recommended Courses */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Recommended for You</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {recommendedCourses.map((course) => (
                    <Link href={`/course/${course.id}`} key={course.id} className="group">
                      <Card className="overflow-hidden transition-all hover:shadow-lg border-slate-200 dark:border-slate-800">
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={course.image || "/placeholder.svg"}
                            alt={course.title}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                          />
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge
                              className={`${
                                course.level === "Beginner"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : course.level === "Intermediate"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                    : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              }`}
                            >
                              {course.level}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                {course.rating}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">({course.reviews})</span>
                            </div>
                          </div>
                          <CardTitle className="line-clamp-1 text-xl text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                              <AvatarFallback className="text-[8px] bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                {course.instructor.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{course.instructor}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {course.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{course.price}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                          >
                            View Course
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}

                  {/* Browse more courses card */}
                  <Card className="overflow-hidden border-dashed border-2 border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center p-6 text-center h-full">
                    <div className="rounded-full bg-blue-50 p-4 dark:bg-blue-950 mb-4">
                      <Bookmark className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Discover More Courses</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Find more courses tailored to your interests and learning goals
                    </p>
                    <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white" asChild>
                      <Link href="/courses">Browse Marketplace</Link>
                    </Button>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* My Courses Tab */}
            <TabsContent value="my-courses" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">My Courses</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="in-progress" className="w-full">
                <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                  <TabsTrigger
                    value="in-progress"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                  >
                    In Progress
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                  >
                    Completed
                  </TabsTrigger>
                  <TabsTrigger
                    value="archived"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                  >
                    Archived
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="in-progress" className="mt-0">
                  <div className="space-y-4">
                    {enrolledCourses.filter(course => course.status === 'active' && (course.progress?.progress || 0) < 100).length > 0 ? (
                      enrolledCourses
                        .filter(course => course.status === 'active' && (course.progress?.progress || 0) < 100)
                        .map((course) => (
                          <Card
                            key={course.courseId}
                            className="overflow-hidden transition-all hover:shadow-md border-slate-200 dark:border-slate-800"
                          >
                            <div className="flex flex-col md:flex-row">
                              <div className="w-full md:w-1/4 lg:w-1/5">
                                <div className="aspect-video md:h-full w-full overflow-hidden">
                                  <img
                                    src={course.courseData.image || "/placeholder.svg"}
                                    alt={course.courseData.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                  <div className="space-y-1">
                                    <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200">{course.courseData.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      Instructor: {course.courseData.instructor.name}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                      <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4 text-blue-500" />
                                        <span>
                                          {(course.progress?.completedLessons?.length || 0)}/{course.progress?.totalLessons || 0} lessons
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-teal-500" />
                                        <span>Last accessed {formatDate(course.progress?.lastAccessed)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                      {course.progress?.progress || 0}% complete
                                    </div>
                                    <Progress
                                      value={course.progress?.progress || 0}
                                      className="h-2 w-full md:w-[200px] bg-slate-100 dark:bg-slate-800"
                                      indicatorClassName="bg-gradient-to-r from-blue-500 to-teal-500"
                                    />
                                  </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Next Lesson:</p>
                                    <p className="font-medium text-blue-600 dark:text-blue-400">
                                      {course.progress?.nextLesson || "Start the course"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                      asChild
                                    >
                                      <Link href={`/course/${course.courseId}`}>
                                        View Course
                                      </Link>
                                    </Button>
                                    <Button 
                                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                                      onClick={() => handleResumeCourse(course)}
                                    >
                                      <Play className="mr-2 h-4 w-4" />
                                      Continue
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-6">
                          <BookOpen className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
                          No courses in progress
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                          Enroll in a course to get started with your learning journey.
                        </p>
                        <Button className="mt-4" asChild>
                          <Link href="/courses">Browse Courses</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
                  <div className="space-y-4">
                    {enrolledCourses.filter(course => course.status === 'completed' || (course.progress?.progress || 0) === 100).length > 0 ? (
                      enrolledCourses
                        .filter(course => course.status === 'completed' || (course.progress?.progress || 0) === 100)
                        .map((course) => (
                          <Card
                            key={course.courseId}
                            className="overflow-hidden transition-all hover:shadow-md border-slate-200 dark:border-slate-800"
                          >
                            <div className="flex flex-col md:flex-row">
                              <div className="w-full md:w-1/4 lg:w-1/5">
                                <div className="aspect-video md:h-full w-full overflow-hidden">
                                  <img
                                    src={course.courseData.image || "/placeholder.svg"}
                                    alt={course.courseData.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200">{course.courseData.title}</h3>
                                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Completed
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      Instructor: {course.courseData.instructor.name}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                      <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4 text-blue-500" />
                                        <span>
                                          {course.progress?.totalLessons || 0} lessons
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-teal-500" />
                                        <span>Completed on {formatDate(course.progress?.lastAccessed)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Certificate:</p>
                                    <p className="font-medium text-blue-600 dark:text-blue-400">
                                      {certificates.some(cert => cert.courseId === course.courseId) 
                                        ? "Certificate issued"
                                        : "Certificate not issued yet"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                      asChild
                                    >
                                      <Link href={`/course/${course.courseId}`}>
                                        View Course
                                      </Link>
                                    </Button>
                                    {!certificates.some(cert => cert.courseId === course.courseId) && (
                                      <Button 
                                        className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                                        onClick={() => handleRequestCertificate(course.courseId)}
                                      >
                                        <Certificate className="mr-2 h-4 w-4" />
                                        Request Certificate
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-6">
                          <Trophy className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
                          No completed courses yet
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                          Keep learning and complete your courses to see them here.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="archived" className="mt-0">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-6">
                      <Bookmark className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">No archived courses</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm">You haven't archived any courses yet.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Achievements</h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {achievements.filter((a) => a.unlocked).length}
                  </span>{" "}
                  of {achievements.length} unlocked
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`overflow-hidden transition-all hover:shadow-md ${
                        achievement.unlocked
                          ? "border-blue-200 dark:border-blue-800"
                          : "border-slate-200 dark:border-slate-800 opacity-70"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`rounded-full p-4 mb-4 ${
                              achievement.unlocked ? "bg-blue-50 dark:bg-blue-950" : "bg-slate-100 dark:bg-slate-800"
                            }`}
                          >
                            {getAchievementIcon(achievement)}
                          </div>
                          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">
                            {achievement.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{achievement.description}</p>
                          {achievement.unlocked ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Unlocked on {formatDate(achievement.unlockedAt)}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                            >
                              Locked
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 p-6 w-20 h-20 flex items-center justify-center mb-4">
                      <Trophy className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No achievements yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Complete courses, participate in hackathons, and build projects to earn achievements
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Certificates</h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">{certificates.length}</span>{" "}
                  certificates earned
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {certificates.length > 0 ? (
                  certificates.map((certificate) => (
                    <Card
                      key={certificate.id}
                      className="overflow-hidden transition-all hover:shadow-md border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-2/5">
                          <div className="aspect-[4/3] w-full overflow-hidden">
                            <img
                              src={certificate.image || "/placeholder.svg"}
                              alt={certificate.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                        <div className="flex-1 p-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200">
                                {certificate.title}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Instructor: {certificate.instructorId}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span>Issued on {formatDate(certificate.issuedAt)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Certificate className="h-4 w-4 text-teal-500" />
                                <span>NFT Token ID: {certificate.tokenId}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                              >
                                View Certificate
                              </Button>
                              <Button
                                variant="outline"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                              >
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 p-6 w-20 h-20 flex items-center justify-center mb-4">
                      <Certificate className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No certificates yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Complete courses to earn certificates that demonstrate your skills
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
  }