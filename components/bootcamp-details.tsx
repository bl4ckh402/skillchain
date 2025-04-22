"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthProvider"
import { useBootcamps } from "@/context/BootcampContext"
import { Bootcamp, BootcampStatus, BootcampModule } from "@/types/bootcamp"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  Users,
  GraduationCap,
  Laptop,
  Target,
  ChevronRight,
  Globe,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BootcampCurriculum } from "@/components/bootcamp-curriculum"
import { useToast } from "@/components/ui/use-toast"

interface BootcampDetailsProps {
  bootcamp: Bootcamp
}

interface BootcampCurriculumProps {
  modules: BootcampModule[]
}

export function BootcampOverviewSection({ bootcamp }: BootcampDetailsProps) {
  if (!bootcamp) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          What You'll Learn
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {bootcamp.whatYouWillLearn.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <ChevronRight className="h-5 w-5 text-teal-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Requirements
        </h2>
        <ul className="mt-4 space-y-2 list-disc pl-5 text-slate-700 dark:text-slate-300">
          {bootcamp.requirements.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Description
        </h2>
        <div className="mt-4 space-y-4 text-slate-700 dark:text-slate-300">
          {bootcamp.description}
        </div>
      </div>

      {bootcamp.projects && bootcamp.projects.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Projects
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {bootcamp.projects.map((project, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 bg-slate-50 dark:bg-slate-900"
              >
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                  {project.title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {bootcamp.tools && bootcamp.tools.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Tools & Technologies
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {bootcamp.tools.map((tool, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              >
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function BootcampScheduleSection({ bootcamp }: BootcampDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Schedule Details
        </h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Start Date
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {new Date(bootcamp.schedule.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Class Times
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {bootcamp.schedule.classTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Time Zone
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {bootcamp.schedule.timezone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Class Size
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {bootcamp.currentStudents} / {bootcamp.maxStudents} students
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Class Days
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {bootcamp.schedule.classDays.map((day, index) => (
            <Badge
              key={index}
              variant="outline"
              className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
            >
              {day}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

export function BootcampInstructorSection({ bootcamp }: BootcampDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-24 w-24 border-4 border-blue-100 dark:border-blue-900">
          <AvatarImage
            src={bootcamp.instructor.avatar || '/images/default-avatar.png'}
            alt={bootcamp.instructor.name}
          />
          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-xl">
            {bootcamp.instructor.name?.charAt(0) || 'I'}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {bootcamp.instructor.name}
            </h2>
            <p className="text-blue-600 dark:text-blue-400">Lead Instructor</p>
          </div>

          <div className="text-slate-700 dark:text-slate-300">
            {bootcamp.instructor.bio}
          </div>
        </div>
      </div>

      {bootcamp.teachingAssistants && bootcamp.teachingAssistants.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Teaching Assistants
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            {bootcamp.teachingAssistants.map((ta, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border bg-slate-50 dark:bg-slate-900"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={ta.avatar} alt={ta.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    {ta.name?.charAt(0) || 'TA'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    {ta.name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {ta.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function BootcampCurriculumSection({ bootcamp }: BootcampDetailsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
        Curriculum
      </h2>
      <BootcampCurriculum modules={bootcamp.curriculum} />
    </div>
  )
}

export default function BootcampDetails({ bootcamp }: BootcampDetailsProps) {
  const { user } = useAuth()
  const { enrollInBootcamp } = useBootcamps()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [enrolling, setEnrolling] = useState(false)

  const handleApply = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = `/login?redirect=/bootcamps/${bootcamp.id}`
      return
    }

    try {
      setEnrolling(true)
      await enrollInBootcamp(bootcamp.id!)
      // Redirect to bootcamp page
      window.location.href = `/bootcamps/${bootcamp.id}/dashboard`
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in bootcamp",
        variant: "destructive"
      })
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
      <div className="lg:col-span-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="curriculum"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600"
            >
              Curriculum
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="instructor"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600"
            >
              Instructors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <BootcampOverviewSection bootcamp={bootcamp} />
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <BootcampCurriculumSection bootcamp={bootcamp} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <BootcampScheduleSection bootcamp={bootcamp} />
          </TabsContent>

          <TabsContent value="instructor" className="space-y-6">
            <BootcampInstructorSection bootcamp={bootcamp} />
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <div className="sticky top-20 rounded-lg border bg-card">
          <div className="flex flex-col p-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {bootcamp.price === "0" ? "Free" : `$${bootcamp.price}`}
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-slate-700 dark:text-slate-300">
                  Starts {new Date(bootcamp.schedule.startDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-500" />
                <span className="text-slate-700 dark:text-slate-300">
                  {bootcamp.duration}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-purple-500" />
                <span className="text-slate-700 dark:text-slate-300">
                  Certificate upon completion
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-indigo-500" />
                <span className="text-slate-700 dark:text-slate-300">
                  Live online classes
                </span>
              </div>

              {bootcamp.placementRate && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {bootcamp.placementRate}% placement rate
                  </span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <Button
              size="lg"
              onClick={handleApply}
              disabled={bootcamp.status !== BootcampStatus.UPCOMING || enrolling}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              {enrolling ? "Enrolling..." : "Apply Now"}
            </Button>

            <p className="mt-4 text-sm text-center text-slate-500 dark:text-slate-400">
              {bootcamp.currentStudents} / {bootcamp.maxStudents} spots filled
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}