"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useCourses } from "@/context/CourseContext";
import { useRouter } from "next/navigation";
import { Course, CourseStatus, Module } from "@/types/course";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/footer";
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  BarChart3,
  Edit,
  Eye,
  Settings,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  MessageSquare,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  PauseCircle,
  Trash2,
  BanknoteIcon,
  Loader2,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "./ui/use-toast";
import { EnrolledBootcamps } from "./enrolled-bootcamps";
import Link from "next/link";
interface InstructorStats {
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  publishedCourses: number;
  monthlyStudentsChange: number;
  monthlyRevenueChange: number;
  monthlyRatingChange: number;
}

interface Activity {
  id: string;
  type: "review" | "enrollment" | "comment" | "revenue";
  content: string;
  timestamp: Timestamp;
  courseId: string;
  courseName: string;
}

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const {
    courses: allCourses,
    loading: coursesLoading,
    deleteCourse,
  } = useCourses();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("courses");
  const [stats, setStats] = useState<InstructorStats>({
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    publishedCourses: 0,
    monthlyStudentsChange: 0,
    monthlyRevenueChange: 0,
    monthlyRatingChange: 0,
  });
  const [courses, setCourses] = useState<Course[] | null>();
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubaccount, setHasSubaccount] = useState(false);
  const [subaccount, setSubaccount] = useState<{
    percentageCharge?: number;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchInstructorData = async () => {
      try {
        setLoading(true);

        // Fetch instructor's courses
        const coursesRef = collection(db, "courses");
        const coursesQuery = query(
          coursesRef,
          where("instructor.id", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        const coursesData = coursesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Untitled Course",
            description: data.description || "No description available",
            shortDescription: data.shortDescription || "", // <-- Add this line
            category: data.category || "Uncategorized",
            level: data.level || "Beginner",
            price: data.price || "0",
            image: data.image || "",
            featured: data.featured || false,
            status: data.status || "draft",
            tags: data.tags || [],
            modules: data.modules || [],
            lessons: data.lessons || [],
            whatYouWillLearn: data.whatYouWillLearn || [],
            requirements: data.requirements || [],
            instructor: data.instructor || {
              id: "",
              name: "",
              avatar: "",
              bio: "",
            },
            rating: data.rating || 0,
            reviews: data.reviews || 0,
            students: data.students || 0,
            duration: data.duration || "0h",
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            language: data.language || "English",
            certificate: data.certificate || false,
            nftCertificate: data.nftCertificate || false,
            paymentOptions: data.paymentOptions || { crypto: false },
            forum: data.forum || false,
            visibility: data.visibility || "public",
            completionRate: 0,
            progress: 0,
            revenue: 0,
            topicTag: data.topicTag || "",
            technologyUsed: data.technologyUsed || [],
          };
        });
        setCourses(coursesData);

        // Calculate current month's stats
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const prevMonthStart = startOfMonth(
          new Date(now.getFullYear(), now.getMonth() - 1)
        );
        const prevMonthEnd = endOfMonth(
          new Date(now.getFullYear(), now.getMonth() - 1)
        );

        const enrollmentsRef = collection(db, "enrollments");

        // Convert to Firestore Timestamp when using in queries
        const currentMonthEnrollments = await getDocs(
          query(
            enrollmentsRef,
            where(
              "courseId",
              "in",
              coursesData.map((c) => c.id)
            ),
            where("enrolledAt", ">=", Timestamp.fromDate(monthStart)),
            where("enrolledAt", "<=", Timestamp.fromDate(monthEnd))
          )
        );

        const prevMonthEnrollments = await getDocs(
          query(
            enrollmentsRef,
            where(
              "courseId",
              "in",
              coursesData.map((c) => c.id)
            ),
            where("enrolledAt", ">=", Timestamp.fromDate(prevMonthStart)),
            where("enrolledAt", "<=", Timestamp.fromDate(prevMonthEnd))
          )
        );

        // Calculate stats
        const publishedCourses = coursesData.filter(
          (c) => c.status === "published"
        );
        const totalStudents = publishedCourses.reduce(
          (acc, cur) => acc + (cur.students || 0),
          0
        );
        const totalRevenue = publishedCourses.reduce(
          (acc, cur) => acc + (cur.revenue || 0),
          0
        );
        const ratings = publishedCourses.map((c) => c.rating).filter(Boolean);
        const averageRating = ratings.length
          ? ratings.reduce((acc, cur) => acc + cur, 0) / ratings.length
          : 0;

        const currentMonthStudents = currentMonthEnrollments.size;
        const prevMonthStudents = prevMonthEnrollments.size || 1; // Avoid division by zero
        const studentChange =
          ((currentMonthStudents - prevMonthStudents) / prevMonthStudents) *
          100;

        setStats({
          totalStudents,
          totalRevenue,
          averageRating,
          publishedCourses: publishedCourses.length,
          monthlyStudentsChange: studentChange || 0,
          monthlyRevenueChange: 0,
          monthlyRatingChange: 0,
        });

        // Fetch recent activities
        const activitiesRef = collection(db, "courseActivities");
        const activitiesQuery = query(
          activitiesRef,
          where("instructorId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activities = activitiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Format timestamp
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));
        setRecentActivities(activities);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching instructor data:", error);
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [user, router]);

  const handleCreateCourse = () => {
    router.push("/create");
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/instructor/course/edit/${courseId}`);
  };

  const handlePreviewCourse = (courseId: string) => {
    router.push(`/instructor/course/preview/${courseId}`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev?.filter((c) => c.id !== courseId));
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const statsArray = [
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      icon: <Users className="w-5 h-5 text-blue-500" />,
      change: `${
        stats.monthlyStudentsChange > 0 ? "+" : ""
      }${stats.monthlyStudentsChange.toFixed(1)}% this month`,
      trend:
        stats.monthlyStudentsChange > 0
          ? "up"
          : stats.monthlyStudentsChange < 0
          ? "down"
          : "neutral",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
      change: `${
        stats.monthlyRevenueChange > 0 ? "+" : ""
      }${stats.monthlyRevenueChange.toFixed(1)}% this month`,
      trend:
        stats.monthlyRevenueChange > 0
          ? "up"
          : stats.monthlyRevenueChange < 0
          ? "down"
          : "neutral",
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toFixed(2),
      icon: <Star className="w-5 h-5 text-amber-500" />,
      change: `${
        stats.monthlyRatingChange > 0 ? "+" : ""
      }${stats.monthlyRatingChange.toFixed(1)} this month`,
      trend:
        stats.monthlyRatingChange > 0
          ? "up"
          : stats.monthlyRatingChange < 0
          ? "down"
          : "neutral",
    },
    {
      title: "Published Courses",
      value: stats.publishedCourses.toString(),
      icon: <BookOpen className="w-5 h-5 text-teal-500" />,
      change: "From last month",
      trend: "neutral",
    },
  ];

  const formattedActivities = recentActivities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    content: activity.content,
    time: formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true }),
  }));

  const getStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case "published":
        return (
          <Badge className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
          >
            <FileText className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="py-8 bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                  Instructor Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage your courses and track your performance
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
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
                      <p
                        className={`text-xs ${
                          stat.trend === "up"
                            ? "text-green-600 dark:text-green-400"
                            : stat.trend === "down"
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {stat.change}
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
          <div>
            <Link
              href="/instructors/payments"
              className="block transition-all hover:shadow-md"
            >
              <Card className="border-blue-100 cursor-pointer dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700">
                <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-950">
                  <CardTitle>Payment Setup</CardTitle>
                  <CardDescription>
                    Configure your payment details to receive earnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BanknoteIcon className="w-8 h-8 mr-2 text-blue-500" />
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {hasSubaccount
                            ? "Bank account connected"
                            : "Setup your bank account"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hasSubaccount
                            ? `You receive ${
                                100 - (subaccount?.percentageCharge || 0)
                              }% of each payment`
                            : "Configure to start receiving payments"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md dark:bg-slate-900 dark:border-blue-800 dark:text-blue-400">
                      {hasSubaccount ? "Manage" : "Setup"}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-1"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="justify-start w-full p-1 mb-4 rounded-lg bg-slate-100 dark:bg-slate-800/50">
              <TabsTrigger
                value="courses"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                My Courses
              </TabsTrigger>
              <TabsTrigger
                value="bootcamps"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Bootcamps
              </TabsTrigger>
              {/* <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="earnings"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Earnings
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
              >
                Reviews
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="courses" className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search your courses..."
                    className="border-blue-100 pl-9 dark:border-blue-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px] border-blue-100 dark:border-blue-900">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Sort
                  </Button>
                </div>

                <div className="space-y-4">
                  {courses?.map((course) => (
                    <Card
                      key={course.id}
                      className={`overflow-hidden transition-all hover:shadow-md ${
                        course.featured
                          ? "border-blue-300 dark:border-blue-700"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 lg:w-1/5">
                          <div className="w-full overflow-hidden aspect-video md:h-full">
                            <img
                              src={
                                course.thumbnail ||
                                "/placeholder.svg?height=200&width=300"
                              }
                              alt={course.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                  {course.title}
                                </h3>
                                {course.featured && (
                                  <Badge className="text-white bg-gradient-to-r from-amber-500 to-yellow-500">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                {course.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                <Badge
                                  variant="secondary"
                                  className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                                >
                                  {course.category}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="w-4 h-4 text-blue-500" />
                                  <span>
                                    {course.modules?.length || 0} modules •{" "}
                                    {course.modules.map(
                                      (module: Module) => module.lessons.length
                                    ) || 0}{" "}
                                    lessons
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-teal-500" />
                                  <span>{course.duration}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(course.status)}
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                Last updated:{" "}
                                {course.updatedAt?.toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                Students
                              </span>
                              <span className="flex items-center font-medium text-slate-800 dark:text-slate-200">
                                <Users className="w-4 h-4 mr-1 text-blue-500" />
                                {course.students}
                              </span>
                            </div>
                            {course.status === "draft" && (
                              <div className="flex flex-col col-span-3">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                  Completion Progress
                                </span>
                              </div>
                            )}
                          </div>

                          <Separator className="my-4" />

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                onClick={() => handleEditCourse(course.id!)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Course
                              </Button>
                              <Button
                                variant="outline"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                onClick={() => handlePreviewCourse(course.id!)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                                onClick={() => handleDeleteCourse(course.id!)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                            {course.status === "published" && (
                              <Button className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                                View Analytics
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bootcamps" className="space-y-6">
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                  <CardTitle className="text-slate-800 dark:text-slate-200">
                    My Bootcamps
                  </CardTitle>
                  <CardDescription>
                    View and manage your enrolled bootcamps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EnrolledBootcamps bootcamps={courses ?? []} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* <TabsContent value="analytics" className="space-y-6">
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                  <CardTitle className="text-slate-800 dark:text-slate-200">
                    Course Performance
                  </CardTitle>
                  <CardDescription>
                    Overview of your course performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center border border-dashed rounded-lg h-80 border-slate-200 dark:border-slate-800">
                    <div className="text-center">
                      <BarChart3 className="w-10 h-10 mx-auto mb-4 text-blue-500" />
                      <h3 className="mb-2 text-lg font-medium text-slate-800 dark:text-slate-200">
                        Analytics Dashboard
                      </h3>
                      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
                        Detailed analytics charts and metrics will be displayed
                        here, showing student engagement, course completion
                        rates, and revenue trends.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-blue-100 dark:border-blue-900">
                  <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                    <CardTitle className="text-slate-800 dark:text-slate-200">
                      Student Engagement
                    </CardTitle>
                    <CardDescription>
                      How students are interacting with your courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {courses&&courses
                        .filter((course) => course.status === "published")
                        .map((course) => (
                          <div key={course.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {course.title}
                              </span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {course.students} students
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Average completion rate across all students
                            </p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 dark:border-blue-900">
                  <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                    <CardTitle className="text-slate-800 dark:text-slate-200">
                      Recent Activities
                    </CardTitle>
                    <CardDescription>
                      Latest activities related to your courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3"
                        >
                          <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-950">
                            {activity.type === "review" && (
                              <Star className="w-4 h-4 text-amber-500" />
                            )}
                            {activity.type === "enrollment" && (
                              <Users className="w-4 h-4 text-blue-500" />
                            )}
                            {activity.type === "comment" && (
                              <MessageSquare className="w-4 h-4 text-teal-500" />
                            )}
                            {activity.type === "revenue" && (
                              <DollarSign className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {activity.content}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                    >
                      View All Activities
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-6">
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                  <CardTitle className="text-slate-800 dark:text-slate-200">
                    Earnings Overview
                  </CardTitle>
                  <CardDescription>
                    Summary of your earnings from course sales
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Total Earnings
                      </p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                        $6,420
                      </p>
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12% from last month
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        This Month
                      </p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                        $840
                      </p>
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +5% from last month
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Pending Payout
                      </p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                        $320
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Next payout on June 15
                      </p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-800 dark:text-slate-200">
                      Earnings by Course
                    </h3>
                    <div className="space-y-4">
                      {courses&&courses
                        .filter((course) => course.status === "published")
                        .map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage
                                  src={course.image}
                                  alt={course.title}
                                />
                                <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                  {course.title.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                  {course.title}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {course.students} students
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-slate-800 dark:text-slate-200">
                                {course.revenue}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Lifetime earnings
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                  <CardTitle className="text-slate-800 dark:text-slate-200">
                    Payment History
                  </CardTitle>
                  <CardDescription>Record of your past payouts</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          May 2023 Payout
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Processed on May 15, 2023
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          $780
                        </p>
                        <Badge className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">
                          Completed
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          April 2023 Payout
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Processed on April 15, 2023
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          $620
                        </p>
                        <Badge className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">
                          Completed
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          March 2023 Payout
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Processed on March 15, 2023
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-800 dark:text-slate-200"></p>
                          $540
                        </p>
                        <Badge className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">
                          Completed
                        </Badge>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  >
                    View All Transactions
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                  <CardTitle className="text-slate-800 dark:text-slate-200">
                    Course Reviews
                  </CardTitle>
                  <CardDescription>
                    Student feedback on your courses
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                          <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                          <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                          <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                          <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                          <span className="ml-2 text-2xl font-bold text-slate-800 dark:text-slate-200">
                            4.75
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Average rating across all courses
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[180px] border-blue-100 dark:border-blue-900">
                            <SelectValue placeholder="Filter by course" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {courses&&courses
                              .filter((course) => course.status === "published")
                              .map((course) => (
                                <SelectItem
                                  key={course.id}
                                  value={course.id!.toString()}
                                >
                                  {course.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-blue-100 dark:bg-blue-900" />

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src="/images/users/user-1.jpg"
                              alt="User"
                            />
                            <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                              JD
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                  John Doe
                                </p>
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                  </div>
                                  <span>•</span>
                                  <span>Blockchain Fundamentals</span>
                                </div>
                              </div>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                2 days ago
                              </span>
                            </div>
                            <p className="mt-2 text-slate-700 dark:text-slate-300">
                              This course was exactly what I needed to
                              understand blockchain technology. The explanations
                              were clear and the practical examples really
                              helped solidify the concepts. Highly recommended!
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src="/images/users/user-2.jpg"
                              alt="User"
                            />
                            <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                              AS
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                  Alice Smith
                                </p>
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                  </div>
                                  <span>•</span>
                                  <span>Smart Contract Development</span>
                                </div>
                              </div>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                1 week ago
                              </span>
                            </div>
                            <p className="mt-2 text-slate-700 dark:text-slate-300">
                              Great course on Solidity development. The
                              instructor really knows their stuff and explains
                              complex topics in an accessible way. I would have
                              liked more advanced examples, but overall very
                              satisfied.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src="/images/users/user-3.jpg"
                              alt="User"
                            />
                            <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                              RJ
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                  Robert Johnson
                                </p>
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                  </div>
                                  <span>•</span>
                                  <span>Blockchain Fundamentals</span>
                                </div>
                              </div>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                2 weeks ago
                              </span>
                            </div>
                            <p className="mt-2 text-slate-700 dark:text-slate-300">
                              I've taken several blockchain courses, and this is
                              by far the best one. The content is up-to-date and
                              the instructor is clearly passionate about the
                              subject. The interactive exercises were
                              particularly helpful.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  ></Button>
                </CardFooter>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
