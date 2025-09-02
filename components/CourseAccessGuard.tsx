"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { useCourseProgress } from "@/context/CourseProgressContext";

export function CourseAccessGuard({
  courseId,
  courseTitle,
  coursePrice,
  children,
}: {
  courseId: string;
  courseTitle: string;
  coursePrice: string | number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { checkAccessStatus, loading: progressLoading } = useCourseProgress();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [certificateIssued, setCertificateIssued] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;

      setLoading(true);

      try {
        // If user is not logged in, redirect to login
        if (!user) {
          router.push(`/login?redirect=/course/${courseId}`);
          return;
        }

        const { hasAccess: access, enrollmentStatus } = await checkAccessStatus(
          courseId
        );

        setHasAccess(access);

        if (enrollmentStatus) {
          setIsCompleted(enrollmentStatus.completed);
          setCertificateIssued(enrollmentStatus.certificateIssued);
        }
      } catch (error) {
        console.error("Error checking course access:", error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [courseId, user, authLoading, router]);

  if (loading || authLoading || progressLoading || hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  // If user has completed the course, show completion page instead of asking to purchase
  if (isCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Course Completed!</h2>
          <p className="mb-6 text-muted-foreground">
            Congratulations! You have successfully completed this course.
          </p>

          {certificateIssued && (
            <div className="p-3 mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <p className="font-medium text-blue-800 dark:text-blue-300">
                Your certificate has been issued
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href={`/course/${courseId}`}>View Course Details</Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Back to My Courses</Link>
            </Button>

            {certificateIssued && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">View My Certificates</Link>
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // If user doesn't have access, show purchase card
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Course Access Required</h2>
          <p className="mb-6 text-muted-foreground">
            To access "{courseTitle}", you need to enroll in this course first.
          </p>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              <Link href={`/course/${courseId}`}>
                {parseFloat(coursePrice as string) > 0
                  ? `Enroll for ${
                      typeof coursePrice === "number"
                        ? "$" + coursePrice
                        : coursePrice
                    }`
                  : "Enroll Now (Free)"}
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/marketplace">Browse Other Courses</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // User has access, show content
  return <>{children}</>;
}
