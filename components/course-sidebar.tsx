"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  Code2,
  Award,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Course } from "@/types/course";

interface CourseSidebarProps {
  courseId: string;
  currentLessonId: string;
  isInstructor?: boolean;
}

export default function CourseSidebar({
  courseId,
  currentLessonId,
  isInstructor = false,
}: CourseSidebarProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = {
            id: courseSnap.id,
            ...courseSnap.data(),
          } as Course;

          setCourse(courseData);

          // Set initial open state for modules
          const initialState: Record<string, boolean> = {};
          courseData.modules?.forEach((module) => {
            const hasCurrentLesson = module.lessons.some(
              (lesson) => lesson.id === currentLessonId
            );
            initialState[module.id] = hasCurrentLesson;
          });
          setOpenModules(initialState);
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
  }, [courseId, currentLessonId]);

  const getLessonUrl = (lessonId: string) => {
    return isInstructor
      ? `/instructor/course/preview/${courseId}/lesson/${lessonId}`
      : `/course/${courseId}/lesson/${lessonId}`;
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4 animate-pulse">
          <div className="w-3/4 h-4 rounded bg-slate-200"></div>
          <div className="w-1/2 h-2 rounded bg-slate-200"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded bg-slate-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-4 text-red-500">
        {error || "Failed to load course content"}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Course Content
          </h2>
          <div className="flex items-center gap-2">
            <Progress
              value={course.progress || 0}
              className="flex-1 h-2 bg-blue-100 dark:bg-blue-900"
              indicatorClassName="bg-gradient-to-r from-blue-600 to-teal-600"
            />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {course.progress || 0}%
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span>{course.modules?.length || 0} modules</span>
            <span> • </span>
            <span>
              {course.modules?.reduce(
                (acc, module) => acc + (module.lessons?.length || 0),
                0
              ) || 0}{" "}
              lessons
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {course.modules?.map((module) => (
            <Collapsible
              key={module.id}
              open={openModules[module.id]}
              onOpenChange={() => toggleModule(module.id)}
              className="overflow-hidden border rounded-lg"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="justify-between w-full h-auto p-4 border-0 rounded-none bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-start gap-2 text-left">
                    <div className="mt-0.5">
                      {module.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 rounded-full border-slate-300 dark:border-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {module.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {module.lessons?.length || 0} lessons
                      </div>
                    </div>
                  </div>
                  {openModules[module.id] ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t divide-y">
                {module.lessons?.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={getLessonUrl(lesson.id)}
                    className={`flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      currentLessonId === lesson.id
                        ? "bg-blue-50 dark:bg-blue-950/30"
                        : ""
                    }`}
                  >
                    <div className="flex-shrink-0 w-6 text-center">
                      {lesson.completedAt ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : lesson.type === "video" ? (
                        <Play className="w-4 h-4 text-blue-500" />
                      ) : lesson.type === "quiz" ? (
                        <FileText className="w-4 h-4 text-blue-500" />
                      ) : lesson.type === "exercise" ? (
                        <Code2 className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Award className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-slate-800 dark:text-slate-200">
                        {lesson.title}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="capitalize">{lesson.type}</span>
                        <span>•</span>
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                    {currentLessonId === lesson.id && (
                      <Badge className="text-white bg-blue-500">Current</Badge>
                    )}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
