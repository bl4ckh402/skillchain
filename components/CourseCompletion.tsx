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
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Loading completion data...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full p-6 text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-500">Error</h2>
          <p className="text-muted-foreground mb-6">{error || "Failed to load course data"}</p>
          <Button asChild className="w-full">
            <Link href="/dashboard">Back to My Courses</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // User has completed the course
  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <Trophy className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Congratulations!</h1>
        <p className="text-xl text-muted-foreground">
          You've successfully completed the course
        </p>
        <h2 className="text-2xl font-bold mt-2 text-blue-600">{course.title}</h2>
      </div>
      
      <Card className="mb-8 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600/10 to-teal-600/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-xl">Course Progress</h3>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
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
          <h3 className="font-semibold text-xl mb-4">Your Achievement</h3>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="text-muted-foreground mb-4 space-y-2">
                {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground">Skills Acquired</h4>
                    <ul className="mt-2 space-y-1">
                      {course.whatYouWillLearn.slice(0, 3).map((skill, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
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
              <div className="flex-1 flex flex-col">
                <div className="border border-blue-100 dark:border-blue-900 rounded-lg p-4 text-center flex-1 flex flex-col justify-center items-center bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-semibold mb-2">Certificate of Completion</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your certificate has been issued for this course.
                  </p>
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={`/dashboard?courseId=${courseId}`}>
                      <Download className="h-4 w-4" />
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
        <h3 className="font-semibold text-xl">What's Next?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 hover:shadow-md transition-shadow">
            <h4 className="font-medium text-lg mb-2">Share Your Achievement</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Let your network know about your accomplishment.
            </p>
            <Button variant="outline" className="gap-2 w-full">
              <Share2 className="h-4 w-4" />
              Share on Social Media
            </Button>
          </Card>
          
          <Card className="p-5 hover:shadow-md transition-shadow">
            <h4 className="font-medium text-lg mb-2">Explore More Courses</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Continue your learning journey with more courses.
            </p>
            <Button asChild className="w-full gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
              <Link href="/courses">
                Browse Courses
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </Card>
        </div>
        
        {course.relatedCourses && course.relatedCourses.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-xl mb-4">Recommended Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {course.relatedCourses.slice(0, 3).map((relatedCourse) => (
                <Card key={relatedCourse.id} className="overflow-hidden">
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative">
                    {relatedCourse.image ? (
                      <img 
                        src={relatedCourse.image} 
                        alt={relatedCourse.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium line-clamp-1">{relatedCourse.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">By {relatedCourse.instructor}</p>
                    <div className="mt-3 flex justify-between items-center">
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
        <Card className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900">
          <h3 className="font-semibold text-xl mb-2">Message from the Instructor</h3>
          <p className="italic text-slate-700 dark:text-slate-300">"{course.congratulationsMessage}"</p>
        </Card>
      )}
    </div>
  );
}