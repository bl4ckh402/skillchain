"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle, Download, Trophy, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { useCourseProgress } from "@/context/CourseProgressContext";
import confetti from "canvas-confetti";

export default function CourseCompletionPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const { user } = useAuth();
  const { getEnrollmentStatus, loading: progressLoading } = useCourseProgress();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  useEffect(() => {
    if (!courseId || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course data
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (!courseSnap.exists()) {
          setError("Course not found");
          return;
        }
        
        const courseData = {
          id: courseSnap.id,
          ...courseSnap.data()
        };
        
        setCourse(courseData);
        
        // Get enrollment status
        const status = await getEnrollmentStatus(courseId);
        setEnrollmentStatus(status);
        
        // If not completed, redirect to course page
        if (!status.completed) {
          window.location.href = `/course/${courseId}`;
          return;
        }
        
      } catch (err) {
        console.error("Error fetching completion data:", err);
        setError("Failed to load course completion data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, user]);

  // Trigger confetti effect when page loads and course is completed
  useEffect(() => {
    if (!loading && enrollmentStatus?.completed && !confettiTriggered) {
      setConfettiTriggered(true);
      
      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Since particles fall down, start from the top
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }
  }, [loading, enrollmentStatus, confettiTriggered]);

  if (loading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <p>Loading completion data...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-500">Error</h2>
          <p className="mb-6 text-muted-foreground">{error || "Failed to load course data"}</p>
          <Button asChild className="w-full">
            <Link href="/dashboard">Back to My Courses</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // User has completed the course
  return (
    <div className="container max-w-4xl px-4 py-8">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full">
          <Trophy className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Congratulations!</h1>
        <p className="text-xl text-muted-foreground">
          You've successfully completed the course
        </p>
        <h2 className="mt-2 text-2xl font-bold text-blue-600">{course.title}</h2>
      </div>
      
      <Card className="mb-8 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600/10 to-teal-600/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Course Progress</h3>
            <div className="flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
              <CheckCircle className="w-4 h-4 mr-1" />
              Completed
            </div>
          </div>
          
          <Progress value={100} className="h-2 mb-2" />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>100% Complete</span>
            <span>{enrollmentStatus.completedLessons?.length || course.totalLessons} / {course.totalLessons} lessons</span>
          </div>
        </div>
        
        <Separator />
        
        <div className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Your Achievement</h3>
          
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-1">
              <div className="mb-4 space-y-2 text-muted-foreground">
                {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground">Skills Acquired</h4>
                    <ul className="mt-2 space-y-1">
                      {course.whatYouWillLearn.slice(0, 3).map((skill, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="flex-shrink-0 w-4 h-4 mt-1 mr-2 text-green-600" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-foreground">Course Duration</h4>
                  <p>{course.duration}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground">Completion Date</h4>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {enrollmentStatus.certificateIssued && (
              <div className="flex flex-col flex-1">
                <div className="flex flex-col items-center justify-center flex-1 p-4 text-center border border-blue-100 rounded-lg dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="mb-2 font-semibold">Certificate of Completion</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Your certificate has been issued for this course.
                  </p>
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={`/dashboard?courseId=${courseId}`}>
                      <Download className="w-4 h-4" />
                      View Certificate
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">What's Next?</h3>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-5 transition-shadow hover:shadow-md">
            <h4 className="mb-2 text-lg font-medium">Share Your Achievement</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Let your network know about your accomplishment.
            </p>
            <Button variant="outline" className="w-full gap-2">
              <Share2 className="w-4 h-4" />
              Share on Social Media
            </Button>
          </Card>
          
          <Card className="p-5 transition-shadow hover:shadow-md">
            <h4 className="mb-2 text-lg font-medium">Explore More Courses</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Continue your learning journey with more courses.
            </p>
            <Button asChild className="w-full gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
              <Link href="/marketplace">
                Browse Courses
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </Card>
        </div>
        
        {course.relatedCourses && course.relatedCourses.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-4 text-xl font-semibold">Recommended Courses</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {course.relatedCourses.slice(0, 3).map((relatedCourse) => (
                <Card key={relatedCourse.id} className="overflow-hidden">
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                    {relatedCourse.image ? (
                      <img 
                        src={relatedCourse.image} 
                        alt={relatedCourse.title} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium line-clamp-1">{relatedCourse.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">By {relatedCourse.instructor}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-medium text-blue-600">${relatedCourse.price}</span>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/course/${relatedCourse.id}`}>
                          View Course
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-center mt-8">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Back to My Courses
            </Link>
          </Button>
        </div>
      </div>
      
      {course.congratulationsMessage && (
        <Card className="p-6 mt-10 border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900">
          <h3 className="mb-2 text-xl font-semibold">Message from the Instructor</h3>
          <p className="italic text-slate-700 dark:text-slate-300">"{course.congratulationsMessage}"</p>
        </Card>
      )}
    </div>
  );
}