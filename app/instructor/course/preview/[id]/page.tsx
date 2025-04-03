"use client";

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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Footer } from "@/components/footer";
import {
  Clock,
  Play,
  FileText,
  MessageSquare,
  Award,
  ChevronRight,
  Code2,
  CheckCircle2,
  LockKeyhole,
  AlertTriangle,
  ArrowLeft,
  Edit,
} from "lucide-react";
import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Course } from "@/types/course";
import { useParams, useRouter } from "next/navigation";

export default function CoursePreviewPage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null); // Add proper type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!params.id) {
          throw new Error("Course ID is undefined");
        }
        const courseRef = doc(db, "courses", params.id);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          setCourse({ id: courseSnap.id, ...courseSnap.data() });
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
  }, [params.id]);

  const navigateToLesson = (lessonId: string) => {
    router.push(
      `/instructor/course/preview/${courseData.id}/lesson/${lessonId}`
    );
  };

  const getFirstAvailableLesson = () => {
    if (!courseData.modules || courseData.modules.length === 0) return null;
    const firstModule = courseData.modules[0];
    if (!firstModule.lessons || firstModule.lessons.length === 0) return null;
    return firstModule.lessons[0].id;
  };

  // Update the Enroll Now button to navigate to first lesson
  const handleStartCourse = () => {
    const firstLessonId = getFirstAvailableLesson();
    if (firstLessonId) {
      navigateToLesson(firstLessonId);
    }
  };

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

  const courseData = {
    ...course,
    instructor: course.instructor!,
    modules: course.modules || [],
    whatYouWillLearn: course.whatYouWillLearn || [],
    requirements: course.requirements || [],
    progress: course.progress || 0,
    nextLesson: course.nextLesson || null,
    relatedCourses: course.relatedCourses || [],
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/instructor/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back to dashboard</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Course Preview
                </h1>
                <p className="text-sm text-muted-foreground">
                  Preview how your course will appear to students
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/instructor/course/edit/${courseData.id}`}>
                <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Alert className="mx-auto max-w-6xl mt-4 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Preview Mode</AlertTitle>
        <AlertDescription>
          You are viewing your course in preview mode. This is how it will
          appear to students once published.
        </AlertDescription>
      </Alert>

      <div className="w-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                    {courseData.level}
                  </Badge>
                  {courseData.status === "draft" && (
                    <Badge
                      variant="outline"
                      className="border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Draft
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-800 dark:text-slate-100">
                  {courseData.title}
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  {courseData.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-teal-500" />
                  <span>{courseData.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-800">
                    <AvatarImage
                      src={courseData.instructor.avatar}
                      alt={courseData.instructor.name}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      {courseData.instructor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    Created by{" "}
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {courseData.instructor.name}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                >
                  Enroll Now - {courseData.price}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  Try Free Preview
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative aspect-video w-full max-w-[600px] overflow-hidden rounded-xl border shadow-xl">
                <img
                  src={
                    courseData.image || "/placeholder.svg?height=400&width=600"
                  }
                  alt={courseData.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Button
                    size="icon"
                    className="h-16 w-16 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  >
                    <Play className="h-8 w-8 fill-blue-600 text-blue-600" />
                    <span className="sr-only">Play preview</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="mb-4 w-full justify-start bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
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
              </TabsList>

              <TabsContent value="curriculum" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Course Content
                  </h2>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{courseData.modules.length} modules</span>
                    <span>•</span>
                    <span>
                      {courseData.modules.reduce(
                        (acc, module) => acc + module.lessons.length,
                        0
                      )}{" "}
                      lessons
                    </span>
                    <span>•</span>
                    <span>{courseData.duration} total length</span>
                  </div>
                  <div className="mt-6 space-y-4">
                    {courseData.modules.map((module, moduleIndex) => (
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
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {module.description}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {module.lessons.length} lessons
                          </div>
                        </div>
                        <Separator />
                        <div className="divide-y">
                          {module.lessons.map((lesson, lessonIndex) => (
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
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="sr-only">Completed</span>
                                  </Button>
                                ) : moduleIndex === 0 ||
                                  (moduleIndex === 1 && lessonIndex < 1) ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    <Play className="h-4 w-4" />
                                    <span className="sr-only">Play</span>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 dark:text-slate-600"
                                    disabled
                                  >
                                    <LockKeyhole className="h-4 w-4" />
                                    <span className="sr-only">Locked</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    What You'll Learn
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {courseData.whatYouWillLearn.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <ChevronRight className="h-5 w-5 text-teal-500 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Requirements
                  </h2>
                  <ul className="mt-4 space-y-2 list-disc pl-5 text-slate-700 dark:text-slate-300">
                    {courseData.requirements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Description
                  </h2>
                  <div className="mt-4 space-y-4 text-slate-700 dark:text-slate-300">
                    <p>
                      This comprehensive course on blockchain fundamentals is
                      designed for beginners who want to understand the
                      technology behind cryptocurrencies and decentralized
                      applications. You'll learn about the core concepts,
                      including distributed ledgers, consensus mechanisms, and
                      cryptography.
                    </p>
                    <p>
                      Through a combination of video lectures, quizzes, and
                      hands-on exercises, you'll gain a solid foundation in
                      blockchain technology. By the end of the course, you'll be
                      able to explain how blockchain works, identify potential
                      use cases, and even create a simple blockchain
                      implementation.
                    </p>
                    <p>
                      Whether you're a developer looking to expand your skills,
                      a business professional interested in blockchain
                      applications, or simply curious about this revolutionary
                      technology, this course will provide you with the
                      knowledge you need to get started in the blockchain space.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="instructor" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Avatar className="h-24 w-24 border-4 border-blue-100 dark:border-blue-900">
                    <AvatarImage
                      src={courseData.instructor.avatar}
                      alt={courseData.instructor.name}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-xl">
                      {courseData.instructor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {courseData.instructor.name}
                      </h2>
                      <p className="text-blue-600 dark:text-blue-400">
                        Blockchain Developer & Educator
                      </p>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      {courseData.instructor.bio}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      Alex specializes in blockchain architecture, smart
                      contract development, and decentralized application
                      design. He has taught over 10,000 students worldwide and
                      is passionate about making blockchain technology
                      accessible to everyone.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div>
            <Card className="sticky top-20 border-blue-200 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Information
                </CardTitle>
                <CardDescription>Enroll to get full access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                  {courseData.price}
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                  onClick={handleStartCourse}
                >
                  Enroll Now
                </Button>
                {/* <div className="text-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                  30-Day Money-Back Guarantee
                </div> */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {courseData.duration} of content
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      3 quizzes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-teal-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      5 coding exercises
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Certificate of completion
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Forum access
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  Gift This Course
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
