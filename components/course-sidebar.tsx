"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CheckCircle2, ChevronDown, ChevronRight, Play, FileText, Code2, Award } from "lucide-react"

interface CourseSidebarProps {
  courseId: string
  currentLessonId: string
}

export default function CourseSidebar({ courseId, currentLessonId }: CourseSidebarProps) {
  // This would normally be fetched from an API
  const course = {
    id: courseId,
    title: "Blockchain Fundamentals",
    progress: 35,
    modules: [
      {
        id: "module-1",
        title: "Introduction to Blockchain",
        completed: true,
        lessons: [
          { id: "lesson-1-1", title: "What is Blockchain?", duration: "15:30", type: "video", completed: true },
          { id: "lesson-1-2", title: "History of Blockchain", duration: "12:45", type: "video", completed: true },
          {
            id: "lesson-1-3",
            title: "Blockchain vs. Traditional Databases",
            duration: "18:20",
            type: "video",
            completed: true,
          },
          { id: "lesson-1-4", title: "Module Quiz", duration: "10:00", type: "quiz", completed: true },
        ],
      },
      {
        id: "module-2",
        title: "Cryptography Basics",
        completed: false,
        lessons: [
          {
            id: "lesson-2-1",
            title: "Cryptographic Hash Functions",
            duration: "20:15",
            type: "video",
            completed: true,
          },
          { id: "lesson-2-2", title: "Public Key Cryptography", duration: "25:30", type: "video", completed: false },
          { id: "lesson-2-3", title: "Digital Signatures", duration: "18:45", type: "video", completed: false },
          { id: "lesson-2-4", title: "Hands-on Exercise", duration: "30:00", type: "exercise", completed: false },
          { id: "lesson-2-5", title: "Cryptography Quiz", duration: "15:00", type: "quiz", completed: false },
        ],
      },
      {
        id: "module-3",
        title: "Consensus Mechanisms",
        completed: false,
        lessons: [
          { id: "lesson-3-1", title: "Proof of Work", duration: "22:10", type: "video", completed: false },
          { id: "lesson-3-2", title: "Proof of Stake", duration: "24:30", type: "video", completed: false },
          { id: "lesson-3-3", title: "Other Consensus Algorithms", duration: "18:15", type: "video", completed: false },
          { id: "lesson-3-4", title: "Consensus Mechanisms Quiz", duration: "15:00", type: "quiz", completed: false },
          { id: "lesson-3-5", title: "Final Project", duration: "45:00", type: "project", completed: false },
        ],
      },
    ],
  }

  // Initialize open state for modules
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}

    // Find which module contains the current lesson and open it
    course.modules.forEach((module) => {
      const hasCurrentLesson = module.lessons.some((lesson) => lesson.id === currentLessonId)
      initialState[module.id] = hasCurrentLesson
    })

    return initialState
  })

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Course Content</h2>
          <div className="flex items-center gap-2">
            <Progress
              value={course.progress}
              className="h-2 flex-1 bg-blue-100 dark:bg-blue-900"
              indicatorClassName="bg-gradient-to-r from-blue-600 to-teal-600"
            />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{course.progress}%</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span>{course.modules.length} modules</span>
            <span> • </span>
            <span>{course.modules.reduce((acc, module) => acc + module.lessons.length, 0)} lessons</span>
          </div>
        </div>

        <div className="space-y-2">
          {course.modules.map((module) => (
            <Collapsible
              key={module.id}
              open={openModules[module.id]}
              onOpenChange={() => toggleModule(module.id)}
              className="border rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto rounded-none border-0 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-start gap-2 text-left">
                    <div className="mt-0.5">
                      {module.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">{module.title}</div>
                      <div className="text-sm text-muted-foreground">{module.lessons.length} lessons</div>
                    </div>
                  </div>
                  {openModules[module.id] ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="divide-y border-t">
                {module.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/course/${courseId}/lesson/${lesson.id}`}
                    className={`flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      currentLessonId === lesson.id ? "bg-blue-50 dark:bg-blue-950/30" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 w-6 text-center">
                      {lesson.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : lesson.type === "video" ? (
                        <Play className="h-4 w-4 text-blue-500" />
                      ) : lesson.type === "quiz" ? (
                        <FileText className="h-4 w-4 text-blue-500" />
                      ) : lesson.type === "exercise" ? (
                        <Code2 className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Award className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {lesson.title}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="capitalize">{lesson.type}</span>
                        <span>•</span>
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                    {currentLessonId === lesson.id && <Badge className="bg-blue-500 text-white">Current</Badge>}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

