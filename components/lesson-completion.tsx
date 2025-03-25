"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ThumbsUp, ThumbsDown } from "lucide-react"

interface LessonCompletionProps {
  lessonId: string
  courseId: string
}

export default function LessonCompletion({ lessonId, courseId }: LessonCompletionProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  const handleMarkAsComplete = () => {
    // In a real app, this would call an API to mark the lesson as complete
    setIsCompleted(true)
    setShowFeedbackForm(true)
  }

  const handleFeedback = (type: "helpful" | "not-helpful") => {
    // In a real app, this would send feedback to an API
    setFeedback(type)
  }

  if (isCompleted) {
    return (
      <Card className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-800 dark:text-green-300">Lesson completed!</span>
            </div>

            {showFeedbackForm && !feedback ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Was this lesson helpful?</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950 dark:hover:text-green-300"
                  onClick={() => handleFeedback("helpful")}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Yes</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                  onClick={() => handleFeedback("not-helpful")}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>No</span>
                </Button>
              </div>
            ) : feedback ? (
              <span className="text-sm text-slate-600 dark:text-slate-400">Thanks for your feedback!</span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Mark this lesson as complete when you're finished to track your progress.
          </div>
          <Button
            onClick={handleMarkAsComplete}
            className="gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Mark as Complete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

