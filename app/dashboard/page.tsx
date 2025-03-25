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
  const {user}=useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const { dashboardData, loading, error } = useDashboard()

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!dashboardData) {
    return <div>No dashboard data available</div>
  }

  const {
    stats,
    enrolledCourses,
    participatedHackathons,
    appliedJobs,
    completedProjects,
    upcomingEvents,
    achievements,
    certificates
  } = dashboardData


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

  const recommendedCourses = [
    {
      id: 4,
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
      id: 5,
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

  const statsArray = [
    {
      title: "Courses Enrolled",
      value: (dashboardData?.stats?.coursesEnrolled ?? 0).toString(),
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Hours Learned",
      value: (dashboardData?.stats?.hoursLearned ?? 0).toString(),
      icon: <Clock className="h-5 w-5 text-teal-500" />,
    },
    {
      title: "Achievements", 
      value: (dashboardData?.stats?.achievements ?? 0).toString(),
      icon: <Award className="h-5 w-5 text-amber-500" />,
    },
    {
      title: "Certificates",
      value: (dashboardData?.stats?.certificates ?? 0).toString(), 
      icon: <Certificate className="h-5 w-5 text-purple-500" />,
    },
  ]

  

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-white dark:border-slate-800">
                  <AvatarImage src="/images/users/user-avatar.jpg" alt="User" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-xl">
                    {user?.displayName?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Welcome back, {user?.displayName}!</h1>
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
                <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Courses
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
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

            <TabsContent value="overview" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Continue Learning</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {enrolledCourses.map((course) => (
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
                                  {course.progress.completedLessons}/{course.progress.totalLessons} lessons
                                </div>
                              </div>
                              <Progress
                                value={course.progress.progress}
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
                              <span className="font-medium">{course.progress.progress}%</span>
                            </div>
                            <Progress
                              value={course.progress.progress}
                              className="h-2 bg-slate-100 dark:bg-slate-800"
                              indicatorClassName="bg-gradient-to-r from-blue-500 to-teal-500"
                            />
                          </div>
                          <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                            <p>
                              Next:{" "}
                              <span className="font-medium text-blue-600 dark:text-blue-400">{course.progress.nextLesson}</span>
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>Last accessed {course.progress.lastAccessed?.toDate().toLocaleDateString()}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50"
                          >
                            <Play className="mr-1 h-4 w-4" />
                            Resume
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Recent Achievements</h2>
                  <Card className="border-blue-100 dark:border-blue-900">
                    <CardContent className="p-6 space-y-4">
                      {achievements
                        .filter((a) => a.unlocked)
                        .slice(0, 3)
                        .map((achievement) => (
                          <div key={achievement.id} className="flex items-start gap-4">
                            <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-950">{achievement.icon}</div>
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-800 dark:text-slate-200">{achievement.title}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{achievement.description}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
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
                      {upcomingEvents.map((attendinevent) => (
                        <div key={attendinevent.id} className="flex gap-4">
                          <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                            <img
                              src={attendinevent.cover || "/placeholder.svg"}
                              alt={attendinevent.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-800 dark:text-slate-200">{attendinevent.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span>
                                {attendinevent.date.toLocaleString()}, {attendinevent.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                              <Users className="h-4 w-4 text-teal-500" />
                              <span>{attendinevent.participants} participants</span>
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
                      ))}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        View All Events
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>

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
                  <Card className="overflow-hidden border-dashed border-2 border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center p-6 text-center h-full">
                    <div className="rounded-full bg-blue-50 p-4 dark:bg-blue-950 mb-4">
                      <Bookmark className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Discover More Courses</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Find more courses tailored to your interests and learning goals
                    </p>
                    <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                      Browse Marketplace
                    </Button>
                  </Card>
                </div>
              </div>
            </TabsContent>

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
                    {enrolledCourses.map((course) => (
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
                                      {course.progress.completedLessons}/{course.progress.totalLessons} lessons
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-teal-500" />
                                    <span>Last accessed {course.progress.lastAccessed.toDate().toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {course.progress.progress}% complete
                                </div>
                                <Progress
                                  value={course.progress.progress}
                                  className="h-2 w-full md:w-[200px] bg-slate-100 dark:bg-slate-800"
                                  indicatorClassName="bg-gradient-to-r from-blue-500 to-teal-500"
                                />
                              </div>
                            </div>
                            <Separator className="my-4" />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Next Lesson:</p>
                                <p className="font-medium text-blue-600 dark:text-blue-400">{course.progress.nextLesson}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                >
                                  View Course
                                </Button>
                                <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                                  <Play className="mr-2 h-4 w-4" />
                                  Continue
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
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
                {achievements.map((achievement) => (
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
                          {achievement.icon}
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{achievement.description}</p>
                        {achievement.unlocked ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Unlocked on {achievement.unlockedAt.toLocaleDateString()}
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
                ))}
              </div>
            </TabsContent>

            <TabsContent value="certificates" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Certificates</h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">{certificates.length}</span>{" "}
                  certificates earned
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {certificates.map((certificate) => (
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
                              <span>Issued on {certificate.issuedAt.toLocaleDateString()}</span>
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
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

