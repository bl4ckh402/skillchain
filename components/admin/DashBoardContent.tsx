// components/admin/DashboardContent.tsx
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
import {
  Users,
  BookOpen,
  GraduationCap,
  Building,
  Calendar,
  Activity,
  Award,
  CheckCircle,
  ExternalLink,
  FileText,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserManagement from "./UserManagement";
import InstructorApplications from "./InstructorApplications";

export default function AdminDashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    totalStudents: 0,
    activeEnrollments: 0,
    pendingApplications: 0,
    jobsPosted: 0,
    totalRevenue: 0,
    coursesCompleted: 0,
    certificatesIssued: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);

        // Fetch user stats
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;

        let totalInstructors = 0;
        let totalStudents = 0;

        usersSnapshot.docs.forEach((doc) => {
          const userData = doc.data();
          if (userData.role === "instructor") totalInstructors++;
          if (userData.role === "student") totalStudents++;
        });

        // Fetch course stats
        const coursesQuery = query(collection(db, "courses"));
        const coursesSnapshot = await getDocs(coursesQuery);
        const totalCourses = coursesSnapshot.size;

        // Fetch enrollment stats
        const enrollmentsQuery = query(collection(db, "enrollments"));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const activeEnrollments = enrollmentsSnapshot.size;

        // Fetch instructor application stats
        const applicationsQuery = query(
          collection(db, "instructorApplications"),
          where("status", "==", "pending")
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const pendingApplications = applicationsSnapshot.size;

        // Fetch jobs stats
        const jobsQuery = query(collection(db, "jobs"));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsPosted = jobsSnapshot.size;

        // Fetch certificates stats
        const certificatesQuery = query(collection(db, "certificates"));
        const certificatesSnapshot = await getDocs(certificatesQuery);
        const certificatesIssued = certificatesSnapshot.size;

        // Calculate completions (better to have a separate collection for this in production)
        let coursesCompleted = 0;
        enrollmentsSnapshot.docs.forEach((doc) => {
          const enrollmentData = doc.data();
          if (enrollmentData.status === "completed") coursesCompleted++;
        });

        // Calculate revenue (simplified for demo)
        let totalRevenue = 0;
        const paymentsQuery = query(collection(db, "payments"));
        const paymentsSnapshot = await getDocs(paymentsQuery);

        paymentsSnapshot.docs.forEach((doc) => {
          const paymentData = doc.data();
          totalRevenue += paymentData.amount || 0;
        });

        setStats({
          totalUsers,
          totalCourses,
          totalInstructors,
          totalStudents,
          activeEnrollments,
          pendingApplications,
          jobsPosted,
          totalRevenue,
          coursesCompleted,
          certificatesIssued,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 rounded-full border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl text-slate-800 dark:text-slate-200">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm md:text-base text-slate-600 dark:text-slate-400">
            Manage users, courses, and platform settings
          </p>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="pb-2 overflow-x-auto">
            <TabsList className="grid w-full min-w-[480px] grid-cols-4 lg:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="settings" className="hidden lg:block">
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-4 md:mt-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Total Users"
                  value={stats.totalUsers.toString()}
                  description="Registered platform users"
                  icon={
                    <Users className="w-6 h-6 text-blue-500 md:w-8 md:h-8" />
                  }
                />
                <StatsCard
                  title="Total Courses"
                  value={stats.totalCourses.toString()}
                  description="Published and draft courses"
                  icon={
                    <BookOpen className="w-6 h-6 text-green-500 md:w-8 md:h-8" />
                  }
                />
                <StatsCard
                  title="Active Instructors"
                  value={stats.totalInstructors.toString()}
                  description="Course creators"
                  icon={
                    <GraduationCap className="w-6 h-6 text-purple-500 md:w-8 md:h-8" />
                  }
                />
                <StatsCard
                  title="Total Revenue"
                  value={`$${stats.totalRevenue.toFixed(2)}`}
                  description="Platform earnings"
                  icon={
                    <Activity className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg md:text-xl">
                      Platform Activity
                    </CardTitle>
                    <CardDescription>Recent platform metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Award className="w-5 h-5 mr-2 text-blue-500" />
                          <span className="text-sm md:text-base">
                            Certificates Issued
                          </span>
                        </div>
                        <span className="font-semibold">
                          {stats.certificatesIssued}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                          <span className="text-sm md:text-base">
                            Courses Completed
                          </span>
                        </div>
                        <span className="font-semibold">
                          {stats.coursesCompleted}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                          <span className="text-sm md:text-base">
                            Active Enrollments
                          </span>
                        </div>
                        <span className="font-semibold">
                          {stats.activeEnrollments}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Building className="w-5 h-5 mr-2 text-amber-500" />
                          <span className="text-sm md:text-base">
                            Jobs Posted
                          </span>
                        </div>
                        <span className="font-semibold">
                          {stats.jobsPosted}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg md:text-xl">
                      Pending Tasks
                    </CardTitle>
                    <CardDescription>
                      Items requiring your attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-blue-500" />
                          <span>Instructor Applications</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-yellow-700 bg-yellow-50"
                          >
                            {stats.pendingApplications}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setActiveTab("applications")}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                      {/* Add more pending tasks as needed */}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage and update user roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserManagement />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">
                    Instructor Applications
                  </CardTitle>
                  <CardDescription>
                    Review and process instructor applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InstructorApplications />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">
                    Course Management
                  </CardTitle>
                  <CardDescription>
                    Review and manage platform courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Mobile View: Filter Button with Dialogue */}
                  <div className="flex flex-col mb-6 space-y-4 md:hidden">
                    <Input placeholder="Search courses..." className="w-full" />
                    <Dialog
                      open={mobileFilterOpen}
                      onOpenChange={setMobileFilterOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center justify-center w-full"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Filter Courses
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Filter Courses</DialogTitle>
                          <DialogDescription>
                            Select status to filter courses
                          </DialogDescription>
                        </DialogHeader>

                        <Select
                          defaultValue="all"
                          onValueChange={() => setMobileFilterOpen(false)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <DialogFooter>
                          <Button onClick={() => setMobileFilterOpen(false)}>
                            Apply
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Desktop view: Inline filters */}
                  <div className="justify-between hidden mb-6 md:flex">
                    <Input
                      placeholder="Search courses..."
                      className="max-w-sm"
                    />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Responsive table with horizontal scroll on small screens */}
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[640px]">
                      <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-4 py-3 md:px-6">
                            Course Title
                          </th>
                          <th scope="col" className="px-4 py-3 md:px-6">
                            Instructor
                          </th>
                          <th scope="col" className="px-4 py-3 md:px-6">
                            Status
                          </th>
                          <th scope="col" className="px-4 py-3 md:px-6">
                            Students
                          </th>
                          <th scope="col" className="px-4 py-3 md:px-6">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-4 py-3 font-medium md:px-6">
                            Blockchain Fundamentals
                          </td>
                          <td className="px-4 py-3 md:px-6">John Doe</td>
                          <td className="px-4 py-3 md:px-6">
                            <Badge className="text-green-700 bg-green-100">
                              Published
                            </Badge>
                          </td>
                          <td className="px-4 py-3 md:px-6">245</td>
                          <td className="flex px-4 py-3 space-x-2 md:px-6">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs md:text-sm"
                            >
                              <ExternalLink className="w-3 h-3 mr-1 md:w-4 md:h-4" />{" "}
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs md:text-sm"
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                        {/* Add more course rows here */}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">
                    Platform Settings
                  </CardTitle>
                  <CardDescription>
                    Configure global platform settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-base font-medium md:text-lg">
                        General Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="block mb-1 text-sm font-medium">
                              Platform Name
                            </label>
                            <Input defaultValue="BlockLearn" />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium">
                              Support Email
                            </label>
                            <Input
                              defaultValue="support@blocklearn.example"
                              type="email"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-base font-medium md:text-lg">
                        Fee Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="block mb-1 text-sm font-medium">
                              Platform Fee (%)
                            </label>
                            <Input
                              defaultValue="5"
                              type="number"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium">
                              Instructor Payout Schedule
                            </label>
                            <Select defaultValue="monthly">
                              <SelectTrigger>
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">
                                  Bi-weekly
                                </SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>Save Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// Helper component for stats cards
type StatsCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
};

function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold md:text-3xl">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="p-2 rounded-full md:p-3 bg-slate-100 dark:bg-slate-800">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
