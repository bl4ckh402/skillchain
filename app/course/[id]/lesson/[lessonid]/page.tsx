"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LessonContent from "@/components/lesson-content";
import { LessonCompletion } from "@/components/lesson-completion";
import LessonNotes from "@/components/lesson-notes";
import LessonDiscussion from "@/components/lesson-discussion";
import CourseSidebar from "@/components/course-sidebar";
import LessonClient from "./client";
import { Course, Module } from "@/types/course";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useCourseProgress } from "@/context/CourseProgressContext";
import { CourseAccessGuard } from "@/components/CourseAccessGuard";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { updateLessonProgress } = useCourseProgress();

  const courseId = params?.id as string;
  const lessonId = params?.lessonid as string;

  const [currentModule, setCurrentModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [prevLesson, setPrevLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [progress, setProgress] = useState(0);

  const fetchCourseData = async () => {
    try {
      if (!courseId || typeof courseId !== "string") {
        throw new Error("Invalid course ID");
      }

      // Create batch get for both course and enrollment (if user is logged in)
      const batch = [];
      const courseRef = doc(db, "courses", courseId);
      batch.push(getDoc(courseRef));

      if (user) {
        const enrollmentRef = doc(db, "enrollments", `${user.uid}_${courseId}`);
        batch.push(getDoc(enrollmentRef));
      }

      // Execute all reads in parallel
      const [courseSnap, enrollmentSnap] = await Promise.all(batch);

      if (!courseSnap.exists()) {
        setError("Course not found");
        return;
      }

      const courseData = {
        id: courseSnap.id,
        ...courseSnap.data(),
      };
      setCourse(courseData);

      // Process enrollment data if it exists
      if (enrollmentSnap?.exists()) {
        const enrollmentData = enrollmentSnap.data();
        setProgress(enrollmentData.progress?.progress || 0);
      }

      // Process lesson navigation
      processLessonNavigation(courseData);
    } catch (error) {
      console.error("Error fetching course:", error);
      setError(error.message || "Error loading course");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to process lesson navigation
  const processLessonNavigation = (courseData) => {
    let foundLesson = false;
    let currentModuleIndex = -1;
    let currentLessonIndex = -1;

    const modules = courseData.modules || [];

    // Find current lesson and module
    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
      const module = modules[moduleIndex];
      const lessons = module.lessons || [];

      for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
        const lesson = lessons[lessonIndex];

        if (lesson.id === lessonId) {
          foundLesson = true;
          currentModuleIndex = moduleIndex;
          currentLessonIndex = lessonIndex;
          setCurrentLesson(lesson);
          setCurrentModule(module);
          break;
        }
      }

      if (foundLesson) break;
    }

    if (!foundLesson) {
      setError("Lesson not found in course");
      return;
    }

    // Set navigation
    setupNavigation(modules, currentModuleIndex, currentLessonIndex);
  };

  // Helper function to set up navigation
  const setupNavigation = (modules, currentModuleIndex, currentLessonIndex) => {
    if (currentModuleIndex === -1 || currentLessonIndex === -1) return;

    const currentModule = modules[currentModuleIndex];

    // Previous lesson logic
    if (currentLessonIndex > 0) {
      setPrevLesson(currentModule.lessons[currentLessonIndex - 1]);
    } else if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1];
      setPrevLesson(prevModule.lessons[prevModule.lessons.length - 1]);
    }

    // Next lesson logic
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setNextLesson(currentModule.lessons[currentLessonIndex + 1]);
    } else if (currentModuleIndex < modules.length - 1) {
      const nextModule = modules[currentModuleIndex + 1];
      setNextLesson(nextModule.lessons[0]);
    }
  };

  useEffect(() => {
    fetchCourseData();

    if (user && currentLesson) {
      updateLessonProgress(courseId, lessonId, false).catch((err) => {
        console.error("Failed to update current lesson:", err);
      });
    }
  }, [courseId, lessonId, user]);

  const handleMarkComplete = async () => {
    try {
      await updateLessonProgress(courseId, lessonId, true);

      if (nextLesson) {
        router.push(`/course/${courseId}/lesson/${nextLesson.id}`);
      }
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading lesson...</span>
      </div>
    );
  }

  if (error || !course || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2 text-red-500">Error</h2>
          <p className="mb-4">{error || "Lesson not found"}</p>
          <Button asChild>
            <Link href={`/course/${courseId}`}>Back to Course</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CourseAccessGuard
      courseId={courseId}
      courseTitle={course.title}
      coursePrice={course.price || 0}
    >
      <div className="flex flex-col h-screen">
        <LessonClient />

        {/* Top navigation bar */}
        <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Link href={`/course/${courseId}`}>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Back to course</span>
                </Button>
              </Link>
              <Link href={`/course/${courseId}`} className="hidden md:block">
                <Button variant="ghost" className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to course</span>
                </Button>
              </Link>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {course.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{currentModule?.title}</span>
                  <span>•</span>
                  <span>{currentLesson.title}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <Progress
                  value={progress}
                  className="h-2 w-32 bg-blue-100 dark:bg-blue-900"
                  indicatorClassName="bg-gradient-to-r from-blue-600 to-teal-600"
                />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {Math.round(progress)}% complete
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                id="sidebar-toggle"
                aria-label="Toggle course sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Course sidebar - hidden on mobile, shown on larger screens */}
          <div className="hidden md:block w-80 border-r bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <CourseSidebar courseId={courseId} currentLessonId={lessonId} />
          </div>

          {/* Mobile sidebar - shown when toggled */}
          <div
            id="mobile-sidebar"
            className="fixed inset-0 z-50 bg-white dark:bg-slate-950 md:hidden hidden"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {course.title}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  id="close-sidebar"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CourseSidebar courseId={courseId} currentLessonId={lessonId} />
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            <div className="container max-w-4xl px-4 py-6 md:py-8">
              <div className="md:hidden mb-4">
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {currentLesson.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentModule?.title}
                </p>
              </div>

              <Tabs defaultValue="lesson" className="w-full">
                <TabsList className="mb-4 w-full justify-start bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                  <TabsTrigger
                    value="lesson"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                  >
                    Lesson
                  </TabsTrigger>
                  <TabsTrigger
                    value="notes"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                  >
                    Notes
                  </TabsTrigger>
                  <TabsTrigger
                    value="discussion"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                  >
                    Discussion
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="lesson" className="space-y-6">
                  <Suspense
                    fallback={
                      <div className="h-96 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                        <span>Loading lesson content...</span>
                      </div>
                    }
                  >
                    {/* THIS IS THE FIX: Pass the currentLesson to LessonContent */}
                    <LessonContent lesson={currentLesson} />
                  </Suspense>

                  <Separator className="my-8" />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {prevLesson ? (
                      <Link
                        href={`/course/${courseId}/lesson/${prevLesson.id}`}
                        className="w-full sm:w-auto"
                      >
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto justify-start gap-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Previous: {prevLesson.title}</span>
                        </Button>
                      </Link>
                    ) : (
                      <div></div>
                    )}

                    {nextLesson ? (
                      <Link
                        href={`/course/${courseId}/lesson/${nextLesson.id}`}
                        className="w-full sm:w-auto"
                      >
                        <Button className="w-full sm:w-auto justify-end gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                          <span>Next: {nextLesson.title}</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        href={`/course/${courseId}`}
                        className="w-full sm:w-auto"
                      >
                        <Button className="w-full sm:w-auto justify-end gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                          <span>Complete Course</span>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>

                  <LessonCompletion lessonId={lessonId} courseId={courseId} />
                </TabsContent>

                <TabsContent value="notes" className="space-y-6">
                  <LessonNotes lessonId={lessonId} courseId={courseId} />
                </TabsContent>

                <TabsContent value="discussion" className="space-y-6">
                  <LessonDiscussion lessonId={lessonId} courseId={courseId} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </CourseAccessGuard>
  );
}
