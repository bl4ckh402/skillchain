// components/admin/DashboardContent.tsx
"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, getDocs, where, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthProvider';
import {
  Users,
  BookOpen,
  GraduationCap,
  Building,
  Calendar,
  Activity,
  Award,
  CheckCircle,
  XCircle,
  ExternalLink,
  User,
  Shield,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserManagement from './UserManagement';
import InstructorApplications from './InstructorApplications';

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
    certificatesIssued: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // Fetch user stats
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;
        
        let totalInstructors = 0;
        let totalStudents = 0;
        
        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data();
          if (userData.role === 'instructor') totalInstructors++;
          if (userData.role === 'student') totalStudents++;
        });
        
        // Fetch course stats
        const coursesQuery = query(collection(db, 'courses'));
        const coursesSnapshot = await getDocs(coursesQuery);
        const totalCourses = coursesSnapshot.size;
        
        // Fetch enrollment stats
        const enrollmentsQuery = query(collection(db, 'enrollments'));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const activeEnrollments = enrollmentsSnapshot.size;
        
        // Fetch instructor application stats
        const applicationsQuery = query(
          collection(db, 'instructorApplications'),
          where('status', '==', 'pending')
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const pendingApplications = applicationsSnapshot.size;
        
        // Fetch jobs stats
        const jobsQuery = query(collection(db, 'jobs'));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsPosted = jobsSnapshot.size;
        
        // Fetch certificates stats
        const certificatesQuery = query(collection(db, 'certificates'));
        const certificatesSnapshot = await getDocs(certificatesQuery);
        const certificatesIssued = certificatesSnapshot.size;
        
        // Calculate completions (better to have a separate collection for this in production)
        let coursesCompleted = 0;
        enrollmentsSnapshot.docs.forEach(doc => {
          const enrollmentData = doc.data();
          if (enrollmentData.status === 'completed') coursesCompleted++;
        });
        
        // Calculate revenue (simplified for demo)
        let totalRevenue = 0;
        const paymentsQuery = query(collection(db, 'payments'));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        paymentsSnapshot.docs.forEach(doc => {
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
          certificatesIssued
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
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Admin Dashboard</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Manage users, courses, and platform settings
          </p>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="settings" className="hidden lg:block">Settings</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                  title="Total Users" 
                  value={stats.totalUsers.toString()} 
                  description="Registered platform users" 
                  icon={<Users className="w-8 h-8 text-blue-500" />} 
                />
                <StatsCard 
                  title="Total Courses" 
                  value={stats.totalCourses.toString()} 
                  description="Published and draft courses" 
                  icon={<BookOpen className="w-8 h-8 text-green-500" />} 
                />
                <StatsCard 
                  title="Active Instructors" 
                  value={stats.totalInstructors.toString()} 
                  description="Course creators" 
                  icon={<GraduationCap className="w-8 h-8 text-purple-500" />} 
                />
                <StatsCard 
                  title="Total Revenue" 
                  value={`$${stats.totalRevenue.toFixed(2)}`} 
                  description="Platform earnings" 
                  icon={<Activity className="w-8 h-8 text-amber-500" />} 
                />
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Activity</CardTitle>
                    <CardDescription>Recent platform metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Award className="w-5 h-5 mr-2 text-blue-500" />
                          <span>Certificates Issued</span>
                        </div>
                        <span className="font-semibold">{stats.certificatesIssued}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                          <span>Courses Completed</span>
                        </div>
                        <span className="font-semibold">{stats.coursesCompleted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                          <span>Active Enrollments</span>
                        </div>
                        <span className="font-semibold">{stats.activeEnrollments}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Building className="w-5 h-5 mr-2 text-amber-500" />
                          <span>Jobs Posted</span>
                        </div>
                        <span className="font-semibold">{stats.jobsPosted}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Tasks</CardTitle>
                    <CardDescription>Items requiring your attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-blue-500" />
                          <span>Instructor Applications</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-yellow-700 bg-yellow-50">
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
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage and update user roles</CardDescription>
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
                  <CardTitle>Instructor Applications</CardTitle>
                  <CardDescription>Review and process instructor applications</CardDescription>
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
                  <CardTitle>Course Management</CardTitle>
                  <CardDescription>Review and manage platform courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-6">
                    <Input placeholder="Search courses..." className="max-w-sm" />
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
                  
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3">Course Title</th>
                          <th scope="col" className="px-6 py-3">Instructor</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                          <th scope="col" className="px-6 py-3">Students</th>
                          <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4 font-medium">Blockchain Fundamentals</td>
                          <td className="px-6 py-4">John Doe</td>
                          <td className="px-6 py-4">
                            <Badge className="text-green-700 bg-green-100">Published</Badge>
                          </td>
                          <td className="px-6 py-4">245</td>
                          <td className="flex px-6 py-4 space-x-2">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" /> View
                            </Button>
                            <Button variant="outline" size="sm">Edit</Button>
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
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>Configure global platform settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-lg font-medium">General Settings</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-sm font-medium">Platform Name</label>
                            <Input defaultValue="BlockLearn" />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium">Support Email</label>
                            <Input defaultValue="support@blocklearn.example" type="email" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="mb-2 text-lg font-medium">Fee Settings</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-sm font-medium">Platform Fee (%)</label>
                            <Input defaultValue="5" type="number" min="0" max="100" />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium">Instructor Payout Schedule</label>
                            <Select defaultValue="monthly">
                              <SelectTrigger>
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
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
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}