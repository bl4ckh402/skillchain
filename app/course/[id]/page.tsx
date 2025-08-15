"use client";
import { useAuth } from "@/context/AuthProvider";
import { useCourses } from "@/context/CourseContext";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";
import {
  Clock,
  Users,
  Star,
  Play,
  FileText,
  MessageSquare,
  Award,
  ChevronRight,
  Code2,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

import { PurchaseButton } from "@/components/PurchaseButton";
import { usePersonalCourseProgress } from "@/hooks/course-hooks";
import {
  CourseOverviewSection,
  CourseReviewsSection,
  CourseInstructorSection,
} from "@/components/course-details";
import { CourseAccessGuard } from "@/components/CourseAccessGuard";
import { useCourseData } from "@/hooks/useCourseData";
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  Key,
} from "react";

export default function CoursePage() {
  const { user } = useAuth();
  const params = useParams();
  const { enrollInCourse } = useCourses();
  const router = useRouter();
  const courseId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";
  const { course, loading, error } = useCourseData(courseId);
  const {
    progress,
    completedLessons,
    nextLesson,
    currentLesson,
    moduleProgress,
  } = usePersonalCourseProgress(courseId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading course...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error || "Course not found"}</p>
      </div>
    );
  }

  // Calculate total duration and lessons
  const totalLessons = (course.modules || []).reduce(
    (acc: any, module: { lessons: string | any[] }) =>
      acc + (module.lessons?.length || 0),
    0
  );

  const totalDuration = (course.modules || []).reduce(
    (acc: any, module: { lessons: any }) =>
      acc +
      (module.lessons || []).reduce(
        (sum: number, lesson: { duration: string }) =>
          sum + (parseInt(lesson.duration) || 0),
        0
      ),
    0
  );

  const handleEnrollment = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await enrollInCourse(course.id);

      // Redirect to first lesson if available
      if (course.modules?.[0]?.lessons?.[0]?.id) {
        router.push(
          `/course/${course.id}/lesson/${course.modules[0].lessons[0].id}`
        );
      } else {
        router.push(`/course/${course.id}`);
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  // Ensure relatedCourses exists with a default empty array
  const relatedCourses = course.relatedCourses || [];

  return (
    <div className="flex flex-col">
      <div className="w-full py-8 bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="text-white bg-blue-500 hover:bg-blue-600">
                    {course.level || "All Levels"}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{course.rating || 0}</span>
                    <span className="text-muted-foreground">
                      ({course.reviews || 0} reviews)
                    </span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-800 dark:text-slate-100">
                  {course.title}
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  {course.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{course.students || 0} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-teal-500" />
                  <span>{course.duration || "Self-paced"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border-2 border-white dark:border-slate-800">
                    <AvatarImage
                      src={
                        course.instructor?.avatar || "/placeholder-avatar.png"
                      }
                      alt={course.instructor?.name || "Instructor"}
                    />
                    <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                      {course.instructor?.name?.charAt(0) || "I"}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    Created by{" "}
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {course.instructor?.name || "Instructor"}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <PurchaseButton
                  size="lg"
                  courseId={courseId}
                  price={course.price || 0}
                  nextLessonId={
                    currentLesson || course.modules?.[0]?.lessons?.[0]?.id
                  }
                  className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                />
              </div>
            </div>
            <CourseAccessGuard
              courseId={params.id}
              courseTitle={course.title}
              coursePrice={course.price || 0}
            >
              <div className="flex items-center justify-center lg:justify-end">
                <div className="relative aspect-video w-full max-w-[600px] overflow-hidden rounded-xl border shadow-xl">
                  <img
                    src={course.thumbnail!}
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Button
                      size="icon"
                      className="w-16 h-16 rounded-full shadow-lg bg-white/90 hover:bg-white"
                    >
                      <Play className="w-8 h-8 text-blue-600 fill-blue-600" />
                      <span className="sr-only">Play preview</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CourseAccessGuard>
          </div>
        </div>
      </div>

      {/* Continue Learning Section - Only show if progress exists */}
      {progress > 0 && (
        <div className="container px-4 py-6 md:px-6">
          <div className="p-6 border border-blue-100 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-xl dark:border-blue-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Continue Learning
                </h2>
                <div className="flex items-center mt-1">
                  <Progress
                    value={progress}
                    className="w-48 h-2 bg-blue-100 dark:bg-blue-900"
                    indicatorClassName="bg-gradient-to-r from-blue-600 to-teal-600"
                  />
                  <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                    {progress}% complete
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 w-52">
                <PurchaseButton
                  size="sm"
                  courseId={params.id}
                  price={course.price || 0}
                  nextLessonId={currentLesson || nextLesson}
                  className="w-full text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="justify-start w-full p-1 mb-4 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                <TabsTrigger
                  value="curriculum"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                >
                  Curriculum
                </TabsTrigger>
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="instructor"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                >
                  Instructor
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Course Content
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <span>{(course.modules || []).length} modules</span>
                    <span>•</span>
                    <span>{totalLessons} lessons</span>
                    <span>•</span>
                    <span>{course.duration || "Self-paced"} total length</span>
                  </div>
                  <div className="mt-6 space-y-4">
                    {(course.modules || []).map(
                      (
                        module: {
                          completed: any;
                          title:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | ReactPortal
                                | ReactElement<
                                    unknown,
                                    string | JSXElementConstructor<any>
                                  >
                                | Iterable<ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                          description:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | ReactPortal
                                | ReactElement<
                                    unknown,
                                    string | JSXElementConstructor<any>
                                  >
                                | Iterable<ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                          lessons: any;
                        },
                        moduleIndex: Key | null | undefined
                      ) => (
                        <div
                          key={moduleIndex}
                          className={`rounded-lg border ${
                            module.completed
                              ? "border-green-200 dark:border-green-900"
                              : "border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between p-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-slate-800 dark:text-slate-200">
                                  {module.title}
                                </h3>
                                {module.completed && (
                                  <Badge className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {module.description}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {(module.lessons || []).length} lessons
                            </div>
                          </div>
                          <Separator />
                          <div className="divide-y">
                            {(module.lessons || []).map(
                              (
                                lesson: {
                                  completed: any;
                                  type: string;
                                  title:
                                    | string
                                    | number
                                    | bigint
                                    | boolean
                                    | ReactElement<
                                        unknown,
                                        string | JSXElementConstructor<any>
                                      >
                                    | Iterable<ReactNode>
                                    | ReactPortal
                                    | Promise<
                                        | string
                                        | number
                                        | bigint
                                        | boolean
                                        | ReactPortal
                                        | ReactElement<
                                            unknown,
                                            string | JSXElementConstructor<any>
                                          >
                                        | Iterable<ReactNode>
                                        | null
                                        | undefined
                                      >
                                    | null
                                    | undefined;
                                  duration:
                                    | string
                                    | number
                                    | bigint
                                    | boolean
                                    | ReactElement<
                                        unknown,
                                        string | JSXElementConstructor<any>
                                      >
                                    | Iterable<ReactNode>
                                    | ReactPortal
                                    | Promise<
                                        | string
                                        | number
                                        | bigint
                                        | boolean
                                        | ReactPortal
                                        | ReactElement<
                                            unknown,
                                            string | JSXElementConstructor<any>
                                          >
                                        | Iterable<ReactNode>
                                        | null
                                        | undefined
                                      >
                                    | null
                                    | undefined;
                                },
                                lessonIndex: Key | null | undefined
                              ) => (
                                <div
                                  key={lessonIndex}
                                  className={`flex items-center justify-between p-4 ${
                                    lesson.completed
                                      ? "bg-green-50/50 dark:bg-green-950/20"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {lesson.type === "video" && (
                                      <Play
                                        className={`h-4 w-4 ${
                                          lesson.completed
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-blue-600 dark:text-blue-400"
                                        }`}
                                      />
                                    )}
                                    {lesson.type === "quiz" && (
                                      <FileText
                                        className={`h-4 w-4 ${
                                          lesson.completed
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-blue-600 dark:text-blue-400"
                                        }`}
                                      />
                                    )}
                                    {lesson.type === "exercise" && (
                                      <Code2
                                        className={`h-4 w-4 ${
                                          lesson.completed
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-blue-600 dark:text-blue-400"
                                        }`}
                                      />
                                    )}
                                    {lesson.type === "project" && (
                                      <Award
                                        className={`h-4 w-4 ${
                                          lesson.completed
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-blue-600 dark:text-blue-400"
                                        }`}
                                      />
                                    )}
                                    <div>
                                      <span
                                        className={
                                          lesson.completed
                                            ? "text-green-700 dark:text-green-300"
                                            : "text-slate-700 dark:text-slate-300"
                                        }
                                      >
                                        {lesson.title}
                                      </span>
                                      {lesson.completed && (
                                        <div className="text-xs text-green-600 dark:text-green-400">
                                          Completed
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-sm text-muted-foreground">
                                      {lesson.duration}
                                    </div>
                                    {lesson.completed ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="sr-only">
                                          Completed
                                        </span>
                                      </Button>
                                    ) : moduleIndex === 0 ||
                                      (moduleIndex === 1 && typeof lessonIndex === "number" && lessonIndex < 1) ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                      >
                                        <Play className="w-4 h-4" />
                                        <span className="sr-only">Play</span>
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-400 dark:text-slate-600"
                                        disabled
                                      >
                                        <LockKeyhole className="w-4 h-4" />
                                        <span className="sr-only">Locked</span>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                <CourseOverviewSection course={course} />
              </TabsContent>

              {/* Instructor Tab */}
              <TabsContent value="instructor" className="space-y-6">
                <CourseInstructorSection course={course} />
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <CourseReviewsSection
                  courseId={params.id}
                  initialRating={course.rating || 0}
                  initialReviews={course.reviews || 0}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div>
            <Card className="sticky border-blue-200 top-20 dark:border-blue-900">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Information
                </CardTitle>
                <CardDescription>Enroll to get full access</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                  ${(course.price || 0).toLocaleString()}
                </div>
                <PurchaseButton
                  size="lg"
                  courseId={params.id}
                  price={course.price || 0}
                  nextLessonId={
                    currentLesson || course.modules?.[0]?.lessons?.[0]?.id
                  }
                  className="w-full text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {course.duration || "Self-paced"} of content
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {totalLessons} lessons
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-teal-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Practical exercises
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Certificate of completion
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Forum access
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Only show related courses if they exist */}
            {relatedCourses.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-200">
                  Related Courses
                </h3>
                <div className="space-y-4">
                  {relatedCourses.map(
                    (relatedCourse: {
                      id: Key | null | undefined;
                      image: any;
                      title:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactPortal
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      instructor:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactPortal
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      rating:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactPortal
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      students:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactPortal
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      price:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactPortal
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                    }) => (
                      <Link
                        href={`/course/${relatedCourse.id}`}
                        key={relatedCourse.id}
                        className="group"
                      >
                        <Card className="overflow-hidden transition-all hover:shadow-md border-slate-200 dark:border-slate-800">
                          <div className="flex">
                            <div className="w-1/3">
                              <div className="w-full h-full overflow-hidden aspect-video">
                                <img
                                  src={
                                    relatedCourse.image || "/placeholder.svg"
                                  }
                                  alt={relatedCourse.title}
                                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                />
                              </div>
                            </div>
                            <div className="w-2/3 p-3">
                              <h4 className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {relatedCourse.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {relatedCourse.instructor}
                              </p>
                              <div className="flex items-center mt-1">
                                <div className="flex items-center">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span className="ml-1 text-xs font-medium">
                                    {relatedCourse.rating}
                                  </span>
                                </div>
                                <span className="mx-2 text-xs text-slate-400">
                                  •
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {relatedCourse.students} students
                                </span>
                              </div>
                              <div className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                                {relatedCourse.price}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
