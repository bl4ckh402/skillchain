"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthProvider"
import { useBootcamps } from "@/context/BootcampContext"
import { Bootcamp } from "@/types/bootcamp"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, Video, FileText, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function BootcampLessonPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { getBootcampById, trackProgress, getBootcampProgress } = useBootcamps()
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null)
  const [currentLesson, setCurrentLesson] = useState<any>(null)
  const [currentModule, setCurrentModule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [attending, setAttending] = useState(false)
  const [progress, setProgress] = useState({
    overall: 0,
    completedLessons: [] as string[],
    attendanceRecord: {} as Record<string, boolean>,
    moduleProgress: {} as Record<string, number>,
  })
  const [nextLesson, setNextLesson] = useState<any>(null)
  const [previousLesson, setPreviousLesson] = useState<any>(null)

  useEffect(() => {
    const loadBootcampAndProgress = async () => {
      if (!params.id || !params.lessonid || !user) {
        router.push("/bootcamps")
        return
      }

      try {
        // Load bootcamp data
        const bootcampData = await getBootcampById(params.id as string)
        if (!bootcampData) {
          toast({
            title: "Error",
            description: "Bootcamp not found",
            variant: "destructive",
          })
          router.push("/bootcamps")
          return
        }

        setBootcamp(bootcampData)

        // Find current lesson and module
        let foundLesson = null
        let foundModule = null
        let lessonIndex = -1
        let moduleIndex = -1

        bootcampData.curriculum.forEach((module, mIndex) => {
          const lIndex = module.lessons.findIndex((l) => l.id === params.lessonid)
          if (lIndex !== -1) {
            foundLesson = module.lessons[lIndex]
            foundModule = module
            lessonIndex = lIndex
            moduleIndex = mIndex
          }
        })

        if (!foundLesson || !foundModule) {
          toast({
            title: "Error",
            description: "Lesson not found",
            variant: "destructive",
          })
          router.push(`/bootcamps/${params.id}`)
          return
        }

        setCurrentLesson(foundLesson)
        setCurrentModule(foundModule)

        // Find next and previous lessons
        const allLessons = bootcampData.curriculum.flatMap((m) => m.lessons)
        const globalIndex = allLessons.findIndex((l) => l.id === params.lessonid)
        if (globalIndex > 0) {
          setPreviousLesson(allLessons[globalIndex - 1])
        }
        if (globalIndex < allLessons.length - 1) {
          setNextLesson(allLessons[globalIndex + 1])
        }

        // Load progress data
        const progressData = await getBootcampProgress(params.id as string)
        if (progressData) {
          setProgress({
            overall: progressData.progress,
            completedLessons: progressData.completedLessons,
            attendanceRecord: progressData.attendanceRecord,
            moduleProgress: progressData.moduleProgress,
          })

          // Check if already attended today
          const today = new Date().toISOString().split('T')[0]
          setAttending(!!progressData.attendanceRecord[today])
        }
      } catch (error) {
        console.error("Error loading bootcamp lesson:", error)
        toast({
          title: "Error",
          description: "Failed to load lesson content",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadBootcampAndProgress()
  }, [params.id, params.lessonid, user, router])

  const handleComplete = async () => {
    if (!bootcamp || !currentLesson || !user) return

    try {
      await trackProgress(bootcamp.id, currentLesson.id, true)
      setProgress((prev) => ({
        ...prev,
        completedLessons: [...prev.completedLessons, currentLesson.id],
      }))
      toast({
        title: "Progress Saved",
        description: "Lesson marked as completed",
      })

      // Navigate to next lesson if available
      if (nextLesson) {
        router.push(`/bootcamps/${bootcamp.id}/lesson/${nextLesson.id}`)
      }
    } catch (error) {
      console.error("Error marking lesson as complete:", error)
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive",
      })
    }
  }

  const handleAttendance = async () => {
    if (!bootcamp || !currentLesson || !user) return

    try {
      await trackProgress(bootcamp.id, currentLesson.id, true, true)
      setAttending(true)
      const today = new Date().toISOString().split('T')[0]
      setProgress((prev) => ({
        ...prev,
        attendanceRecord: { ...prev.attendanceRecord, [today]: true },
      }))
      toast({
        title: "Attendance Marked",
        description: "Your attendance has been recorded for this session.",
      })
    } catch (error) {
      console.error("Error marking attendance:", error)
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!bootcamp || !currentLesson || !currentModule) {
    return null
  }

  const isLessonCompleted = progress.completedLessons.includes(currentLesson.id)

  return (
    <div className="container px-4 py-8 md:px-6">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push(`/bootcamps/${bootcamp.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bootcamp
        </Button>

        <div className="flex gap-2">
          {previousLesson && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push(`/bootcamps/${bootcamp.id}/lesson/${previousLesson.id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
          )}
          {nextLesson && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push(`/bootcamps/${bootcamp.id}/lesson/${nextLesson.id}`)}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[3fr_1fr]">
        {/* Main Content */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{currentModule.title}</span>
              <span>•</span>
              <span>Lesson {currentLesson.order}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tighter">
              {currentLesson.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {currentLesson.description}
            </p>
          </div>

          {/* Live Session Card */}
          {currentLesson.type === "live" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-blue-500" />
                  Live Session
                </CardTitle>
                <CardDescription>
                  Join the live class and mark your attendance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>
                    {new Date(currentLesson.content.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{currentLesson.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Live with {bootcamp.instructor.name}</span>
                </div>

                <Separator />

                <div className="flex flex-col gap-4">
                  <Button 
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={() => window.open(currentLesson.content.meetingLink, '_blank')}
                  >
                    Join Live Session
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleAttendance}
                    disabled={attending}
                  >
                    {attending ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Attendance Marked
                      </>
                    ) : (
                      "Mark Attendance"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regular Content */}
          {currentLesson.type !== "live" && (
            <div className="space-y-8">
              {currentLesson.content.videoUrl && (
                <div className="aspect-video">
                  <iframe
                    src={currentLesson.content.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {currentLesson.content.description && (
                <div className="prose dark:prose-invert max-w-none">
                  {currentLesson.content.description}
                </div>
              )}

              {currentLesson.content.assignment && (
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      {currentLesson.content.assignment}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleComplete}
                disabled={isLessonCompleted}
              >
                {isLessonCompleted ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completed
                  </>
                ) : (
                  "Mark as Complete"
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress.overall} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(progress.overall)}% Complete
              </p>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Current Module Progress</h4>
                <Progress 
                  value={progress.moduleProgress[currentModule.id] || 0} 
                  className="h-2" 
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {Math.round(progress.moduleProgress[currentModule.id] || 0)}% of module complete
                </p>
              </div>
            </CardContent>
          </Card>

          {currentLesson.content.attachments?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLesson.content.attachments.map((attachment: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{attachment.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}