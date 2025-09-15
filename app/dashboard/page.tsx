"use client";

import {
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";
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
} from "lucide-react";
import { useDashboard } from "@/context/DashboardProvider";
import { useAuth } from "@/context/AuthProvider";
import { Timestamp } from "firebase/firestore";
import { UserAchievement } from "@/types/dashboard";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState("overview");
  const {
    dashboardData,
    loading: dashboardLoading,
    error,
    updateCourseProgress,
    issueCertificate,
  } = useDashboard();
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});

  const toggleJobExpand = (jobId: string) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };
  if (dashboardLoading) {
    // Helper function to safely get nested properties
    const getSafe = (obj: any, path: string, fallback = "") => {
      try {
        return (
          path
            .split(".")
            .reduce(
              (o: { [x: string]: any }, p: string | number) =>
                o ? o[p] : undefined,
              obj
            ) || fallback
        );
      } catch (error) {
        return fallback;
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent animate-spin"></div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-8 text-center">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
            Something went wrong
          </h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">{error}</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-8 text-center">
          <div className="mb-4 text-6xl text-blue-500">📊</div>
          <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
            No dashboard data available
          </h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Looks like you're new here! Start by enrolling in a course.
          </p>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    );
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
    certificates = [],
  } = dashboardData;

  // Format stats for display
  const statsArray = [
    {
      title: "Courses Enrolled",
      value: (stats?.coursesEnrolled ?? 0).toString(),
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
    },
    {
      title: "Hours Learned",
      value: (stats?.hoursLearned ?? 0).toString(),
      icon: <Clock className="w-5 h-5 text-teal-500" />,
    },
    {
      title: "Achievements",
      value: achievements.filter((a) => a.unlocked).length.toString(),
      icon: <Award className="w-5 h-5 text-amber-500" />,
    },
    {
      title: "Certificates",
      value: certificates.length.toString(),
      icon: <Certificate className="w-5 h-5 text-purple-500" />,
    },
  ];

  // Helper function to format dates safely
  const formatDate = (timestamp: string | number | Date | Timestamp) => {
    if (!timestamp) return "Unknown date";

    try {
      if (typeof timestamp === "object" && "toDate" in timestamp) {
        return timestamp.toDate().toLocaleDateString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Helper function to get achievement icon component
  const getAchievementIcon = (achievement: UserAchievement) => {
    // Use icon from data if available
    if (achievement.icon) {
      if (
        typeof achievement.icon === "string" &&
        achievement.icon.startsWith("<")
      ) {
        // It's an SVG or HTML string
        return <div dangerouslySetInnerHTML={{ __html: achievement.icon }} />;
      } else if (typeof achievement.icon === "string") {
        // It's an emoji or text
        return <div className="text-2xl">{achievement.icon}</div>;
      }
    }

    // Fallback icons based on type
    switch (achievement.type) {
      case "course":
        return <BookOpen className="w-6 h-6 text-blue-500" />;
      case "project":
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case "hackathon":
        return <Zap className="w-6 h-6 text-amber-500" />;
      case "community":
        return <Users className="w-6 h-6 text-purple-500" />;
      default:
        return <Award className="w-6 h-6 text-blue-500" />;
    }
  };

  // Define types for course and progress
  type CourseProgress = {
    progress?: number;
    completedLessons?: string[];
    totalLessons?: number;
    lastAccessed?: Date | string | Timestamp;
    nextLesson?: string;
  };

  type EnrolledCourse = {
    courseId: string;
    status: string;
    courseData: {
      title: string;
      thumbnail?: string;
      instructor: {
        name: string;
        avatar?: string;
      };
    };
    progress?: CourseProgress;
  };

  // Handler for resuming a course
  const handleResumeCourse = (course: EnrolledCourse) => {
    // This would navigate to the course and update lastAccessed
    console.log("Resuming course:", course.courseId);
    updateCourseProgress(course.courseId, {
      lastAccessed: new Date(),
    });
    // Navigation would happen via Link component in the actual UI
  };

  // Handler for requesting a certificate
  const handleRequestCertificate = async (courseId: string) => {
    try {
      await issueCertificate(courseId);
      alert("Certificate issued successfully!");
    } catch (error) {
      console.error("Error issuing certificate:", error);
      alert("Failed to issue certificate. Please try again.");
    }
  };

  const getStatusBadge = (
    status:
      | string
      | number
      | bigint
      | boolean
      | ReactElement<unknown, string | JSXElementConstructor<any>>
      | Iterable<ReactNode>
      | ReactPortal
      | Promise<
          | string
          | number
          | bigint
          | boolean
          | ReactPortal
          | ReactElement<unknown, string | JSXElementConstructor<any>>
          | Iterable<ReactNode>
          | null
          | undefined
        >
      | null
      | undefined
  ) => {
    switch (status) {
      case "applied":
        return (
          <Badge className="text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
            Applied
          </Badge>
        );
      case "under_review":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            Under Review
          </Badge>
        );
      case "interview":
        return (
          <Badge className="text-purple-700 bg-purple-100 dark:bg-purple-900 dark:text-purple-300">
            Interview
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="text-red-700 border-red-200 dark:border-red-800 dark:text-red-400"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to check if application is instructor application
  const isInstructorApplication = (application: {
    isInstructorApplication: boolean;
  }) => {
    return application.isInstructorApplication === true;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="py-8 bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-4 border-white dark:border-slate-800">
                  <AvatarImage
                    src={user?.photoURL!}
                    alt={user?.displayName || "User"}
                  />
                  {/* <AvatarFallback className="text-xl text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                    {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "U"}
                  </AvatarFallback> */}
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Welcome back, {user?.displayName || "Learner"}!
                  </h1>
                  <p className="text-muted-foreground">
                    Continue your blockchain learning journey
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {/* <Badge className="ml-2 text-white bg-blue-500">{notifications.filter((n) => !n.read).length}</Badge> */}
                </Button>
                <Button
                  className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  asChild
                >
                  <Link href="/marketplace">
                    <BookOpen className="w-4 h-4 mr-2" />
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
              <Card
                key={index}
                className="border-blue-100 dark:border-blue-900"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {stat.value}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="justify-start w-full p-1 mb-4 rounded-lg bg-slate-100 dark:bg-slate-800/50">
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
                value="applied-jobs"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Applied Jobs
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
                <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Continue Learning
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {enrolledCourses.length > 0 ? (
                    enrolledCourses
                      .filter(
                        (course) =>
                          typeof course.progress === "object" &&
                          course.progress !== null
                      )
                      .map((course, index) => (
                        <Link
                          href={`/course/${course.courseId}`}
                          key={index}
                          className="group"
                        >
                          <Card className="overflow-hidden transition-all hover:shadow-lg border-slate-200 dark:border-slate-800">
                            <div className="relative w-full overflow-hidden aspect-video">
                              <img
                                src={course.courseData.thumbnail!}
                                alt={course.courseData.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent">
                                <div className="w-full p-4">
                                  <div className="flex items-center justify-between mb-2 text-white">
                                    <div className="flex items-center gap-1">
                                      <Play className="w-4 h-4" />
                                      <span className="text-sm font-medium">
                                        Continue
                                      </span>
                                    </div>
                                    <div className="text-sm">
                                      {typeof course.progress === "object" &&
                                      course.progress !== null &&
                                      "completedLessons" in course.progress
                                        ? typeof course.progress === "object" &&
                                          course.progress !== null &&
                                          "completedLessons" in course.progress
                                          ? (course.progress as CourseProgress)
                                              .completedLessons?.length || 0
                                          : 0
                                        : 0}{" "}
                                      lessons completed
                                    </div>
                                  </div>
                                  <Progress
                                    value={
                                      typeof course.progress === "object" &&
                                      course.progress !== null &&
                                      "progress" in course.progress
                                        ? (course.progress as CourseProgress)
                                            .progress || 0
                                        : typeof course.progress === "number"
                                        ? course.progress
                                        : 0
                                    }
                                    className="h-1.5 bg-white/30"
                                    indicatorClassName="bg-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xl transition-colors line-clamp-1 text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {course.courseData.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Avatar className="w-4 h-4">
                                  <AvatarImage
                                    src={course.courseData.instructor.avatar}
                                    alt={course.courseData.instructor.name}
                                  />
                                  <AvatarFallback className="text-[8px] bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                    {course.courseData.instructor.name
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">
                                  {course.courseData.instructor.name}
                                </span>
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Progress</span>
                                  <span className="font-medium">
                                    {typeof course.progress === "object" &&
                                    course.progress !== null &&
                                    "progress" in course.progress
                                      ? (course.progress as CourseProgress)
                                          .progress || 0
                                      : typeof course.progress === "number"
                                      ? course.progress
                                      : 0}
                                    %
                                  </span>
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
                                    {course.progress?.nextLesson ||
                                      "Start the course"}
                                  </span>
                                </p>
                              </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>
                                  Last accessed{" "}
                                  {course.progress?.lastAccessed
                                    ? formatDate(course.progress.lastAccessed)
                                    : "Never"}
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
                                <Play className="w-4 h-4 mr-1" />
                                Resume
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))
                  ) : (
                    <div className="p-8 text-center col-span-full">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/30">
                        <BookOpen className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="mb-2 text-lg font-medium">
                        No courses yet
                      </h3>
                      <p className="mb-4 text-slate-500 dark:text-slate-400">
                        Start your learning journey by enrolling in a course
                      </p>
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
                  <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Recent Achievements
                  </h2>
                  <Card className="border-blue-100 dark:border-blue-900">
                    <CardContent className="p-6 space-y-4">
                      {achievements.filter((a) => a.unlocked).length > 0 ? (
                        achievements
                          .filter((a) => a.unlocked)
                          .slice(0, 3)
                          .map((achievement) => (
                            <div
                              key={achievement.id}
                              className="flex items-start gap-4"
                            >
                              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950">
                                {getAchievementIcon(achievement)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-slate-800 dark:text-slate-200">
                                  {achievement.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {achievement.description}
                                </p>
                                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                  Unlocked on{" "}
                                  {formatDate(achievement.unlockedAt)}
                                </p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="py-6 text-center">
                          <div className="flex items-center justify-center p-3 mx-auto mb-3 rounded-full bg-blue-50 dark:bg-blue-950 w-14 h-14">
                            <Trophy className="w-6 h-6 text-blue-500" />
                          </div>
                          <h3 className="mb-1 font-medium text-slate-800 dark:text-slate-200">
                            No achievements yet
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Complete courses and participate in activities to
                            earn achievements
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        onClick={() => setActiveTab("achievements")}
                      >
                        View All Achievements
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div>
                  <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Upcoming Events
                  </h2>
                  <Card className="border-blue-100 dark:border-blue-900">
                    <CardContent className="p-6 space-y-4">
                      {upcomingEvents.length > 0 ? (
                        upcomingEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className="flex gap-4">
                            <div className="w-16 h-16 overflow-hidden rounded-md shrink-0">
                              <img
                                src={event.cover || "/placeholder.svg"}
                                alt={event.title}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-800 dark:text-slate-200">
                                {event.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>
                                  {formatDate(event.date)},{" "}
                                  {event.time || "12:00 PM"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                <Users className="w-4 h-4 text-teal-500" />
                                <span>
                                  {event.participants || 0} participants
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="self-center text-blue-600 border-blue-200 shrink-0 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                            >
                              Join
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center">
                          <div className="flex items-center justify-center p-3 mx-auto mb-3 rounded-full bg-blue-50 dark:bg-blue-950 w-14 h-14">
                            <Calendar className="w-6 h-6 text-blue-500" />
                          </div>
                          <h3 className="mb-1 font-medium text-slate-800 dark:text-slate-200">
                            No upcoming events
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Check back later for new community events
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        asChild
                      >
                        <Link href="/community">View All Events</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* My Courses Tab */}
            <TabsContent value="my-courses" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  My Courses
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="in-progress" className="w-full">
                <TabsList className="p-1 mb-4 rounded-lg bg-slate-100 dark:bg-slate-800/50">
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
                    {enrolledCourses.filter(
                      (course) =>
                        course.status === "active" &&
                        (course.progress?.progress || 0) < 100
                    ).length > 0 ? (
                      enrolledCourses
                        .filter(
                          (course) =>
                            typeof course === "object" &&
                            course !== null &&
                            course.status === "active" &&
                            (course.progress?.progress || 0) < 100
                        )
                        // Only map courses where progress is an object (CourseProgress)
                        // .filter(
                        //   (course) =>
                        //     typeof course.progress === "object" &&
                        //     course.progress !== null
                        // )
                        // Only map courses where progress is an object (CourseProgress)
                        .filter(
                          (course) =>
                            typeof course.progress === "object" &&
                            course.progress !== null
                        )
                        .map((course, index) => (
                          <Card
                            key={index}
                            className="overflow-hidden transition-all hover:shadow-md border-slate-200 dark:border-slate-800"
                          >
                            <div className="flex flex-col md:flex-row">
                              <div className="w-full md:w-1/4 lg:w-1/5">
                                <div className="w-full overflow-hidden aspect-video md:h-full">
                                  <img
                                    src={course.courseData.thumbnail}
                                    alt={course.courseData.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                  <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                      {course.courseData.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      Instructor:{" "}
                                      {course.courseData.instructor.name}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                      <div className="flex items-center gap-1">
                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                        <span>
                                          {course.progress?.completedLessons
                                            ?.length || 0}
                                          /{course.progress?.totalLessons || 0}{" "}
                                          lessons
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-teal-500" />
                                        <span>
                                          Last accessed{" "}
                                          {formatDate(
                                            course.progress?.lastAccessed as
                                              | string
                                              | number
                                              | Date
                                              | Timestamp
                                          )}
                                        </span>
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
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                      Next Lesson:
                                    </p>
                                    <p className="font-medium text-blue-600 dark:text-blue-400">
                                      {course.progress?.nextLesson ||
                                        "Start the course"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                      asChild
                                    >
                                      <Link href={`/course/${course.courseId}`}>
                                        View Course
                                      </Link>
                                    </Button>
                                    <Button
                                      className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                                      onClick={() => handleResumeCourse(course)}
                                    >
                                      <Play className="w-4 h-4 mr-2" />
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
                        <div className="p-6 bg-blue-100 rounded-full dark:bg-blue-900/30">
                          <BookOpen className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
                          No courses in progress
                        </h3>
                        <p className="max-w-sm mt-2 text-sm text-muted-foreground">
                          Enroll in a course to get started with your learning
                          journey.
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
                    {(enrolledCourses as EnrolledCourse[]).filter(
                      (course) =>
                        typeof course === "object" &&
                        course !== null &&
                        (course.status === "completed" ||
                          (typeof course.progress === "object" &&
                            course.progress !== null &&
                            (course.progress.progress || 0) === 100))
                    ).length > 0 ? (
                      (enrolledCourses as EnrolledCourse[])
                        .filter(
                          (course) =>
                            typeof course === "object" &&
                            course !== null &&
                            (course.status === "completed" ||
                              (course.progress?.progress || 0) === 100)
                        )
                        .map((course) => (
                          <Card
                            key={course.courseId}
                            className="overflow-hidden transition-all hover:shadow-md border-slate-200 dark:border-slate-800"
                          >
                            <div className="flex flex-col md:flex-row">
                              <div className="w-full md:w-1/4 lg:w-1/5">
                                <div className="w-full overflow-hidden aspect-video md:h-full">
                                  <img
                                    src={
                                      course.courseData.thumbnail ||
                                      "/placeholder.svg"
                                    }
                                    alt={course.courseData.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                        {course.courseData.title}
                                      </h3>
                                      <Badge className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Completed
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      Instructor:{" "}
                                      {course.courseData.instructor.name}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                      <div className="flex items-center gap-1">
                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                        <span>
                                          {course.progress?.totalLessons || 0}{" "}
                                          lessons
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-teal-500" />
                                        <span>
                                          Completed on{" "}
                                          {course.progress &&
                                          typeof course.progress === "object" &&
                                          "lastAccessed" in course.progress
                                            ? formatDate(
                                                (
                                                  course.progress as CourseProgress
                                                ).lastAccessed ?? ""
                                              )
                                            : "Unknown date"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                      Certificate:
                                    </p>
                                    <p className="font-medium text-blue-600 dark:text-blue-400">
                                      {certificates.some(
                                        (cert) =>
                                          cert.courseId === course.courseId
                                      )
                                        ? "Certificate issued"
                                        : "Certificate not issued yet"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                      asChild
                                    >
                                      <Link href={`/course/${course.courseId}`}>
                                        View Course
                                      </Link>
                                    </Button>
                                    {!certificates.some(
                                      (cert) =>
                                        cert.courseId === course.courseId
                                    ) && (
                                      <Button
                                        className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                                        onClick={() =>
                                          handleRequestCertificate(
                                            course.courseId
                                          )
                                        }
                                      >
                                        <Certificate className="w-4 h-4 mr-2" />
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
                        <div className="p-6 bg-blue-100 rounded-full dark:bg-blue-900/30">
                          <Trophy className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
                          No completed courses yet
                        </h3>
                        <p className="max-w-sm mt-2 text-sm text-muted-foreground">
                          Keep learning and complete your courses to see them
                          here.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="archived" className="mt-0">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-6 bg-blue-100 rounded-full dark:bg-blue-900/30">
                      <Bookmark className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
                      No archived courses
                    </h3>
                    <p className="max-w-sm mt-2 text-sm text-muted-foreground">
                      You haven't archived any courses yet.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Achievements
                </h2>
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
                              achievement.unlocked
                                ? "bg-blue-50 dark:bg-blue-950"
                                : "bg-slate-100 dark:bg-slate-800"
                            }`}
                          >
                            {getAchievementIcon(achievement)}
                          </div>
                          <h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                            {achievement.title}
                          </h3>
                          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                            {achievement.description}
                          </p>
                          {achievement.unlocked ? (
                            <Badge className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
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
                  <div className="py-12 text-center col-span-full">
                    <div className="flex items-center justify-center w-20 h-20 p-6 mx-auto mb-4 bg-blue-100 rounded-full dark:bg-blue-900/30">
                      <Trophy className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-slate-800 dark:text-slate-200">
                      No achievements yet
                    </h3>
                    <p className="max-w-md mx-auto text-sm text-slate-500 dark:text-slate-400">
                      Complete courses, participate in hackathons, and build
                      projects to earn achievements
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Certificates Tab */}
            <TabsContent value="certificates" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Certificates
                </h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {certificates.length}
                  </span>{" "}
                  certificates earned
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {certificates.length > 0 ? (
                  certificates.map((certificate) => (
                    <Card
                      key={certificate.id}
                      className="overflow-hidden transition-all border-blue-200 hover:shadow-md dark:border-blue-800"
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
                              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                {certificate.title}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Instructor: {certificate.instructorId}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>
                                  Issued on {formatDate(certificate.issuedAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Certificate className="w-4 h-4 text-teal-500" />
                                <span>
                                  Certificate ID: {certificate.tokenId}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                              >
                                View Certificate
                              </Button>
                              <Button
                                variant="outline"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
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
                  <div className="py-12 text-center col-span-full">
                    <div className="flex items-center justify-center w-20 h-20 p-6 mx-auto mb-4 bg-blue-100 rounded-full dark:bg-blue-900/30">
                      <Certificate className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-slate-800 dark:text-slate-200">
                      No certificates yet
                    </h3>
                    <p className="max-w-md mx-auto text-sm text-slate-500 dark:text-slate-400">
                      Complete courses to earn certificates that demonstrate
                      your skills
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
  );
}
