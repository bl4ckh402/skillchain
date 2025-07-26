"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, DollarSign } from "lucide-react";

interface Payment {
  id: string;
  courseTitle?: string;
  courseId?: string;
  amount?: number;
  platformFee?: number;
  creatorAmount?: number;
  createdAt?: string | null;
  reference?: string;
}

export function InstructorEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch instructor stats
        const statsRef = doc(db, "instructorStats", user.uid);
        const statsDoc = await getDoc(statsRef);

        if (statsDoc.exists()) {
          const data = statsDoc.data();
          setStats({
            totalRevenue: data.totalRevenue || 0,
            totalStudents: data.totalStudents || 0,
            totalEnrollments: data.totalEnrollments || 0,
            totalCourses: data.totalCourses || 0,
          });
        }

        // Fetch payment history for instructor
        const paymentsCollection = collection(db, "payments");
        const q = query(
          paymentsCollection,
          where("instructorId", "==", user.uid),
          where("status", "==", "completed"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        const paymentsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate().toISOString()
              : null,
            platformFee: data.platformFee || 0,
            creatorAmount: data.creatorAmount || data.amount - data.platformFee,
          };
        });

        setEarnings(paymentsData);
      } catch (error) {
        console.error("Error fetching instructor earnings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [user]);

  // Format date string
  const formatDate = (dateStr: string | number | Date | null | undefined) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading earnings data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue?.toLocaleString() || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings after platform fees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unique students across all courses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEnrollments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Course enrollment count
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>View your course sales and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No earnings data found. When students purchase your courses,
              earnings will appear here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Your Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell>
                      {payment.courseTitle || payment.courseId}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {payment.reference}
                      </span>
                    </TableCell>
                    <TableCell>
                      ${payment.amount?.toLocaleString() || "0.00"}
                    </TableCell>
                    <TableCell>
                      ${payment.platformFee?.toLocaleString() || "0.00"}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${payment.creatorAmount?.toLocaleString() || "0.00"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
