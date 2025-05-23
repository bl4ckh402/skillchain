"use client";
import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LessonContent from "@/components/lesson-content";
import {LessonCompletion} from "@/components/lesson-completion";
import LessonNotes from "@/components/lesson-notes";
import LessonDiscussion from "@/components/lesson-discussion";
import CourseSidebar from "@/components/course-sidebar";
import LessonClient from "./client";
import { Course, Module } from "@/types/course";
import { ChevronLeft, ChevronRight, Menu, X, CheckCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function LessonPreviewPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const lessonId = params?.lessonid as string;
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [prevLesson, setPrevLesson] = useState<any>(null);
  const [nextLesson, setNextLesson] = useState<any>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      console.log("Params:", params);
      try {
        if (!courseId || typeof courseId !== "string") {
          throw new Error("Invalid course ID");
        }
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = {
            id: courseSnap.id,
            ...courseSnap.data(),
          } as Course;
          console.log("Course data:", courseData);
          setCourse(courseData);

          let foundLesson = false;
          let currentModuleIndex = -1;
          let currentLessonIndex = -1;

          console.log("Looking for lesson:", lessonId);
          console.log("Course modules:", courseData.modules);

          courseData.modules.forEach((module: any, moduleIndex: number) => {
            module.lessons.forEach((lesson: any, lessonIndex: number) => {
              console.log("Checking lesson:", lesson);

              if (lesson.id === lessonId) {
                foundLesson = true;
                currentModuleIndex = moduleIndex;
                currentLessonIndex = lessonIndex;
                setCurrentLesson(lesson);
                setCurrentModule(module);
              }
            });
          });

          if (!foundLesson) {
            console.error("Lesson not found in course data");
            setError("Lesson not found in course");
            return;
          }

          if (currentModuleIndex !== -1 && currentLessonIndex !== -1) {
            const currentModule = courseData.modules[currentModuleIndex];

            if (currentLessonIndex > 0) {
              setPrevLesson(currentModule.lessons[currentLessonIndex - 1]);
            } else if (currentModuleIndex > 0) {
              const prevModule = courseData.modules[currentModuleIndex - 1];
              setPrevLesson(prevModule.lessons[prevModule.lessons.length - 1]);
            }

            if (currentLessonIndex < currentModule.lessons.length - 1) {
              setNextLesson(currentModule.lessons[currentLessonIndex + 1]);
            } else if (currentModuleIndex < courseData.modules.length - 1) {
              const nextModule = courseData.modules[currentModuleIndex + 1];
              setNextLesson(nextModule.lessons[0]);
            }
          }
        } else {
          setError("Course not found");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Error loading course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (error || !course || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error || "Lesson not found"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <LessonClient />

      {/* Top navigation bar */}
      <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link href={`/instructor/course/preview/${courseId}`}>
              <Button variant="ghost" size="icon" className="md:hidden">
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back to course</span>
              </Button>
            </Link>
            <Link
              href={`/instructor/course/preview/${courseId}`}
              className="hidden md:block"
            >
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
                <span>{course.currentModule?.title}</span>
                <span>•</span>
                <span>{currentLesson.title}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              {/* <Progress
                value={course.progress}
                className="h-2 w-32 bg-blue-100 dark:bg-blue-900"
                indicatorClassName="bg-gradient-to-r from-blue-600 to-teal-600"
              /> */}
              {/* <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {course.}% complete
              </span> */}
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
            <CourseSidebar
              courseId={courseId}
              currentLessonId={lessonId}
              isInstructor={true}
            />
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
                {course.currentModule?.title}
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
                      Loading lesson content...
                    </div>
                  }
                >
                  <LessonContent lesson={currentLesson} />
                </Suspense>

                <Separator className="my-8" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {prevLesson ? (
                    <Link
                      href={`/instructor/course/preview/${courseId}/lesson/${prevLesson.id}`}
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
                      href={`/instructor/course/preview/${courseId}/lesson/${nextLesson.id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button className="w-full sm:w-auto justify-end gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                        <span>Next: {nextLesson.title}</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      href={`/instructor/course/preview/${courseId}`}
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
                <LessonDiscussion lessonId={lessonId} courseId={courseId!} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
