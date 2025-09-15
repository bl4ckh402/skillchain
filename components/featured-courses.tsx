"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Clock, Star } from "lucide-react";
import { useCourses } from "@/context/CourseContext";
import { Course, CourseLevel, CourseStatus } from "@/types/course";

export function FeaturedCourses() {
  const { getFeaturedCourses } = useCourses();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeaturedCourses() {
      try {
        setLoading(true);
        setError(null);
        const featuredCourses = await getFeaturedCourses();
        setCourses(featuredCourses);
      } catch (err) {
        setError("Failed to load featured courses");
      } finally {
        setLoading(false);
      }
    }
    loadFeaturedCourses();
  }, [getFeaturedCourses]);

  // Helper function to get appropriate badge variant based on course level
  const getBadgeVariant = (level: string) => {
    switch (level) {
      case CourseLevel.BEGINNER:
        return "default";
      case CourseLevel.INTERMEDIATE:
        return "secondary";
      case CourseLevel.ADVANCED:
        return "outline";
      default:
        return "default";
    }
  };

  // Calculate course duration from modules and lessons
  const calculateDuration = (course: Course) => {
    // If the course already has a duration string, use it
    if (course.duration) return course.duration;

    // Otherwise, try to calculate from modules and lessons
    try {
      let totalMinutes = 0;
      course.modules?.forEach((module) => {
        module.lessons?.forEach((lesson) => {
          // Parse duration strings like "10 min" or "1:30"
          const durationString = lesson.duration || "";
          if (durationString.includes("min")) {
            const minutes = parseInt(durationString.split(" ")[0]);
            if (!isNaN(minutes)) totalMinutes += minutes;
          } else if (durationString.includes(":")) {
            const [hours, minutes] = durationString
              .split(":")
              .map((num) => parseInt(num));
            if (!isNaN(hours) && !isNaN(minutes)) {
              totalMinutes += hours * 60 + minutes;
            }
          }
        });
      });

      // Format the total duration
      if (totalMinutes < 60) {
        return `${totalMinutes} min`;
      } else {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
      }
    } catch (err) {
      // If calculation fails, provide a fallback
      return course.duration || "N/A";
    }
  };

  if (loading) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 dark:bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Featured Courses
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Loading featured courses...
              </p>
            </div>
          </div>
          <div className="grid max-w-5xl grid-cols-1 gap-6 mx-auto mt-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((placeholder) => (
              <Card
                key={placeholder}
                className="overflow-hidden opacity-60 animate-pulse"
              >
                <div className="w-full overflow-hidden aspect-video bg-muted"></div>
                <CardHeader>
                  <div className="w-1/3 h-4 mb-2 rounded bg-muted"></div>
                  <div className="w-full h-6 rounded bg-muted"></div>
                  <div className="w-full h-4 rounded bg-muted"></div>
                </CardHeader>
                <CardContent>
                  <div className="w-2/3 h-4 rounded bg-muted"></div>
                </CardContent>
                <CardFooter>
                  <div className="w-1/2 h-6 rounded bg-muted"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 dark:bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Featured Courses
              </h2>
              <p className="max-w-[700px] text-red-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {error}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 dark:bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Featured Courses
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                No featured courses available at the moment. Check back later!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-8 md:py-12 lg:py-16 bg-muted/40 dark:bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Featured Courses
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover our most popular Web3 & Artificial Intelligence courses
              and start your learning journey today
            </p>
          </div>
        </div>
        <div className="grid max-w-5xl grid-cols-1 gap-6 mx-auto mt-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              href={`/course/${course.id}`}
              key={course.id}
              className="group"
            >
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                <div className="w-full overflow-hidden aspect-video">
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    loading="lazy"
                    alt={course.title}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={getBadgeVariant(course.level)}>
                      {course.level}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">
                        {course.rating?.toFixed(1) || "New"}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students || 0} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{calculateDuration(course)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={course.instructor?.avatar}
                        alt={course.instructor?.name}
                      />
                      <AvatarFallback>
                        {course.instructor?.name.charAt(0) || "I"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {course.instructor?.name || "Instructor"}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center h-10 px-6 py-2 text-sm font-medium transition-colors rounded-md whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
}
