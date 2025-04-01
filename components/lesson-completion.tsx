"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useCourseProgress } from "@/context/CourseProgressContext";
import { useRouter } from "next/navigation";

interface LessonCompletionProps {
  lessonId: string;
  courseId: string;
}

export function LessonCompletion({
  lessonId,
  courseId,
}: LessonCompletionProps) {
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [moduleProgress, setModuleProgress] = useState(0);
  const [moduleName, setModuleName] = useState("");
  const [nextLesson, setNextLesson] = useState<string | null>(null);

  const { getCachedProgress, updateLessonProgress } = useCourseProgress();
  const { user } = useAuth();
  const router = useRouter();

  // Load initial completion status and progress data
  useEffect(() => {
    const loadCompletionStatus = async () => {
      if (!user) return;

      try {
        const progress = getCachedProgress(courseId, user?.uid);

        if (progress) {
          setCourseProgress(progress.progress);

          // Check if this lesson is already completed
          const isLessonCompleted =
            progress.completedLessons.includes(lessonId);
          setIsCompleted(isLessonCompleted);

          // Set next lesson if available
          setNextLesson(progress.nextLesson || null);

          // Find which module this lesson belongs to
          if (progress.moduleProgress) {
            for (const [moduleId, modulePercent] of Object.entries(
              progress.moduleProgress
            )) {
              // This would be better if we actually stored the module ID with the lesson
              // For now, this is just a placeholder
              setModuleProgress(modulePercent);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error loading completion status:", error);
      }
    };

    loadCompletionStatus();
  }, [user, courseId, lessonId, getCachedProgress]);

  const handleMarkAsComplete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await updateLessonProgress(courseId, lessonId, true);
      setIsCompleted(true);

      // Refresh progress data
      const progress = getCachedProgress(courseId, user?.uid);
      if (progress) {
        setCourseProgress(progress.progress);
        setNextLesson(progress.nextLesson || null);
      }
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsIncomplete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await updateLessonProgress(courseId, lessonId, false);
      setIsCompleted(false);

      // Refresh progress data
      const progress = getCachedProgress(courseId, user?.uid);
      if (progress) {
        setCourseProgress(progress.progress);
      }
    } catch (error) {
      console.error("Error marking lesson as incomplete:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (nextLesson) {
      router.push(`/course/${courseId}/lesson/${nextLesson}`);
    } else {
      router.push(`/course/${courseId}`);
    }
  };

  return (
    <Card className="border-blue-100 dark:border-blue-900">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                {isCompleted ? "Lesson Completed" : "Mark Lesson as Complete"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isCompleted
                  ? "Great job! You've completed this lesson."
                  : "Mark this lesson as complete when you're done to track your progress."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Progress
                value={courseProgress}
                className="h-2 w-32 md:w-24 bg-blue-100 dark:bg-blue-900"
                indicatorClassName="bg-gradient-to-r from-blue-600 to-teal-600"
              />
              <span className="text-sm font-medium whitespace-nowrap">
                {Math.round(courseProgress)}% Course Complete
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {isCompleted ? (
              <>
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                  disabled
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Completed</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleMarkAsIncomplete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Mark as Incomplete"
                  )}
                </Button>

                {nextLesson && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                    onClick={handleContinue}
                  >
                    Continue to Next Lesson
                  </Button>
                )}
              </>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                onClick={handleMarkAsComplete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Mark as Complete
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
