"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useCourses } from "@/context/CourseContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
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
import { useRouter } from "next/navigation";

interface InstructorStats {
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  publishedCourses: number;
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { enrollInCourse } = useCourses();
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, "courses", params.id);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = {
            id: courseSnap.id,
            ...courseSnap.data(),
            instructor: courseSnap.data().instructor || {
              name: "Unknown Instructor",
              bio: "No bio available",
              avatar: "/placeholder-avatar.png",
            },
            modules: courseSnap.data().modules || [],
            whatYouWillLearn: courseSnap.data().whatYouWillLearn || [],
            requirements: courseSnap.data().requirements || [],
            progress: courseSnap.data().progress || 0,
            nextLesson: courseSnap.data().nextLesson || {
              module: "",
              title: "",
              duration: "",
            },
            relatedCourses: courseSnap.data().relatedCourses || [],
          };

          setCourse(courseData);
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

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user || !course) return;

      try {
        const enrollmentRef = doc(
          db,
          "enrollments",
          `${user.uid}_${course.id}`
        );
        const enrollmentSnap = await getDoc(enrollmentRef);
        setIsEnrolled(enrollmentSnap.exists());
      } catch (error) {
        console.error("Error checking enrollment:", error);
      }
    };

    checkEnrollment();
  }, [user, course]);

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
  const totalLessons = course.modules.reduce(
    (acc: number, module: any) => acc + module.lessons.length,
    0
  );

  const totalDuration = course.modules.reduce(
    (acc: number, module: any) =>
      acc +
      module.lessons.reduce(
        (sum: number, lesson: any) => sum + (parseInt(lesson.duration) || 0),
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
      setIsEnrolled(true);

      // Redirect to first lesson if available
      if (course.modules[0]?.lessons[0]?.id) {
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

  return (
    <div className="flex flex-col">
      <div className="w-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                    {course.level}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{course.rating}</span>
                    <span className="text-muted-foreground">
                      ({course.reviews} reviews)
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
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-teal-500" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-800">
                    <AvatarImage
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      {course.instructor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    Created by{" "}
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {course.instructor.name}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                  onClick={
                    isEnrolled
                      ? () =>
                          router.push(
                            `/course/${course.id}/lesson/${course.nextLesson?.id}`
                          )
                      : handleEnrollment
                  }
                >
                  {isEnrolled ? "Continue Learning" : "Enroll Now - Free"}
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
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
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

      {/* Continue Learning Section */}
      {isEnrolled && (
        <div className="container px-4 py-6 md:px-6">
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-xl border border-blue-100 dark:border-blue-900 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Continue Learning
                </h2>
                <div className="flex items-center mt-1">
                  <Progress
                    value={course.progress}
                    className="h-2 w-48 bg-blue-100 dark:bg-blue-900"
                    indicatorClassName="bg-gradient-to-r from-blue-600 to-teal-600"
                  />
                  <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                    {course.progress}% complete
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:items-end">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Next Lesson:
                </div>
                <div className="font-medium text-blue-600 dark:text-blue-400">
                  {course.nextLesson.module}: {course.nextLesson.title}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-500">
                  {course.nextLesson.duration}
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Play className="mr-2 h-4 w-4" />
                Continue Learning
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{course.modules.length} modules</span>
                    <span>•</span>
                    <span>
                      {course.modules.reduce(
                        (acc, module) => acc + module.lessons.length,
                        0
                      )}{" "}
                      lessons
                    </span>
                    <span>•</span>
                    <span>{course.duration} total length</span>
                  </div>
                  <div className="mt-6 space-y-4">
                    {course.modules.map((module, moduleIndex) => (
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
                    {course.whatYouWillLearn.map((item, index) => (
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
                    {course.requirements.map((item, index) => (
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
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-xl">
                      {course.instructor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {course.instructor.name}
                      </h2>
                      <p className="text-blue-600 dark:text-blue-400">
                        Blockchain Developer & Educator
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span>4.8 Instructor Rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-teal-500" />
                        <span>1,245 Reviews</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>5,678 Students</span>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      {course.instructor.bio}
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

              <TabsContent value="reviews" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Student Reviews
                  </h2>
                  <div className="mt-4 flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-5xl font-bold text-slate-800 dark:text-slate-200">
                        {course.rating}
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(course.rating)
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Course Rating
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">5 stars</div>
                          <Progress
                            value={75}
                            className="h-2 w-full max-w-[300px] bg-slate-100 dark:bg-slate-800"
                            indicatorClassName="bg-amber-500"
                          />
                          <div className="text-sm text-muted-foreground">
                            75%
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">4 stars</div>
                          <Progress
                            value={18}
                            className="h-2 w-full max-w-[300px] bg-slate-100 dark:bg-slate-800"
                            indicatorClassName="bg-amber-500"
                          />
                          <div className="text-sm text-muted-foreground">
                            18%
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">3 stars</div>
                          <Progress
                            value={5}
                            className="h-2 w-full max-w-[300px] bg-slate-100 dark:bg-slate-800"
                            indicatorClassName="bg-amber-500"
                          />
                          <div className="text-sm text-muted-foreground">
                            5%
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">2 stars</div>
                          <Progress
                            value={1}
                            className="h-2 w-full max-w-[300px] bg-slate-100 dark:bg-slate-800"
                            indicatorClassName="bg-amber-500"
                          />
                          <div className="text-sm text-muted-foreground">
                            1%
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">1 star</div>
                          <Progress
                            value={1}
                            className="h-2 w-full max-w-[300px] bg-slate-100 dark:bg-slate-800"
                            indicatorClassName="bg-amber-500"
                          />
                          <div className="text-sm text-muted-foreground">
                            1%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border-2 border-blue-100 dark:border-blue-900">
                          <AvatarImage
                            src="/images/users/sarah-t.jpg"
                            alt="Sarah T."
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                            ST
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-800 dark:text-slate-200">
                              Sarah T.
                            </h4>
                            <div className="text-sm text-muted-foreground">
                              2 weeks ago
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < 5
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">
                            This course exceeded my expectations! The
                            explanations were clear and the hands-on exercises
                            really helped solidify my understanding of
                            blockchain concepts. Highly recommended for
                            beginners.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border-2 border-blue-100 dark:border-blue-900">
                          <AvatarImage
                            src="/images/users/michael-r.jpg"
                            alt="Michael R."
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                            MR
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-800 dark:text-slate-200">
                              Michael R.
                            </h4>
                            <div className="text-sm text-muted-foreground">
                              1 month ago
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < 4
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">
                            Great introduction to blockchain technology. The
                            instructor explains complex concepts in an
                            easy-to-understand way. I would have liked more
                            advanced content toward the end, but overall it's a
                            solid course.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border-2 border-blue-100 dark:border-blue-900">
                          <AvatarImage
                            src="/images/users/emily-j.jpg"
                            alt="Emily J."
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                            EJ
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-800 dark:text-slate-200">
                              Emily J.
                            </h4>
                            <div className="text-sm text-muted-foreground">
                              2 months ago
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < 5
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">
                            As someone with no technical background, I was
                            worried this course would be too difficult. However,
                            the instructor breaks everything down perfectly. I
                            now feel confident discussing blockchain concepts
                            and am excited to learn more!
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                    >
                      Load More Reviews
                    </Button>
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
                  {course.price}
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                  onClick={
                    isEnrolled
                      ? () =>
                          router.push(
                            `/course/${course.id}/lesson/${course.nextLesson?.id}`
                          )
                      : handleEnrollment
                  }
                >
                  {isEnrolled ? "Continue Learning" : "Enroll Now"}
                </Button>
                <div className="text-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                  30-Day Money-Back Guarantee
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {course.duration} of content
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

            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">
                Related Courses
              </h3>
              <div className="space-y-4">
                {course.relatedCourses.map((relatedCourse) => (
                  <Link
                    href={`/course/${relatedCourse.id}`}
                    key={relatedCourse.id}
                    className="group"
                  >
                    <Card className="overflow-hidden transition-all hover:shadow-md border-slate-200 dark:border-slate-800">
                      <div className="flex">
                        <div className="w-1/3">
                          <div className="aspect-video w-full h-full overflow-hidden">
                            <img
                              src={relatedCourse.image || "/placeholder.svg"}
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
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              <span className="text-xs ml-1 font-medium">
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
                          <div className="mt-1 font-medium text-sm text-blue-600 dark:text-blue-400">
                            {relatedCourse.price}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
