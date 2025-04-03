"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useCourseProgress } from "@/context/CourseProgressContext";

interface LessonCompletionProps {
  lessonId: string;
  courseId: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}

export const LessonCompletion = ({
  lessonId,
  courseId,
  isCompleted = false,
  onComplete,
}: LessonCompletionProps) => {
  const { user } = useAuth();
  const { updateLessonProgress } = useCourseProgress();
  const [completed, setCompleted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);

  // Update internal state if the prop changes
  useEffect(() => {
    setCompleted(isCompleted);
  }, [isCompleted]);

  const handleMarkComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await updateLessonProgress(courseId, lessonId, true);
      setCompleted(true);
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <Card className="p-4 border-blue-100 dark:border-blue-900">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to track your progress and mark lessons as complete.
          </p>
        </div>
      </Card>
    );
  }
  
  if (completed) {
    return (
      <Card className="p-4 border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Lesson Completed</span>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 border-blue-100 dark:border-blue-900">
      <div className="flex flex-col items-center justify-center gap-3">
        <p className="text-center text-slate-600 dark:text-slate-400">
          Ready to continue? Mark this lesson as complete to track your progress.
        </p>
        <Button
          onClick={handleMarkComplete}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Complete
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}