"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useBootcamps } from "@/context/BootcampContext"
import { Bootcamp, BootcampStatus, BootcampModule, BootcampInstructor } from "@/types/bootcamp"
import BootcampDetails from "@/components/bootcamp-details"
import { Loader2 } from "lucide-react"

export default function BootcampPage() {
  const params = useParams()
  const { getBootcampById } = useBootcamps()
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBootcamp = async () => {
      if (!params.id) {
        setError("Bootcamp ID not found")
        setLoading(false)
        return
      }

      try {
        const rawBootcampData = await getBootcampById(params.id as string)
        if (!rawBootcampData) {
          setError("Bootcamp not found")
        } else {
          // Convert raw bootcamp data to match the Bootcamp interface
          const processedBootcamp: Bootcamp = {
            // Base Course fields
            id: rawBootcampData.id || params.id as string,
            title: rawBootcampData.title || "",
            shortDescription: rawBootcampData.shortDescription || "",
            description: rawBootcampData.description || "",
            price: rawBootcampData.price?.toString() || "0",
            duration: rawBootcampData.duration || "0 weeks",
            status: (rawBootcampData.status as unknown as BootcampStatus) || BootcampStatus.DRAFT,
            instructor: {
              id: rawBootcampData.instructor?.id || "",
              name: rawBootcampData.instructor?.name || "",
              bio: rawBootcampData.instructor?.bio || "",
            },
            maxStudents: rawBootcampData.maxParticipants || 0,
            currentStudents: rawBootcampData.currentParticipants || 0,
            schedule: {
              timezone: rawBootcampData.schedule?.timezone || "UTC",
              days: rawBootcampData.schedule?.days || [],
              time: rawBootcampData.schedule?.time || "",
            },
            // Additional properties
            modules: rawBootcampData.modules || [],
            curriculum: rawBootcampData.modules || [], // Map modules to curriculum
            startDate: new Date(rawBootcampData.startDate || new Date()),
            endDate: new Date(rawBootcampData.endDate || new Date()),
            maxParticipants: rawBootcampData.maxParticipants || 0,
            currentParticipants: rawBootcampData.currentParticipants || 0,
            liveSessions: (rawBootcampData.liveSessions || []).map(session => ({
              id: session.id || "",
              title: session.title || "",
              date: new Date(session.date || new Date()),
              duration: session.duration || "",
              description: session.description || ""
            })),
            mentors: rawBootcampData.mentors?.map(mentor => ({
              id: mentor.id || "",
              name: mentor.name || "",
              bio: mentor.bio || "",
              avatar: mentor.avatar || ""
            })) || [],
            projectDeadlines: (rawBootcampData.projectDeadlines || []).map(deadline => ({
              moduleId: deadline.moduleId || "",
              deadline: new Date(deadline.deadline || new Date())
            })),
            // Required properties
            whatYouWillLearn: rawBootcampData.whatYouWillLearn || [],
            requirements: rawBootcampData.requirements || [],
            tags: rawBootcampData.tags || [],
            createdAt: rawBootcampData.createdAt || new Date().toISOString(),
            updatedAt: rawBootcampData.updatedAt || new Date().toISOString()
          }
          setBootcamp(processedBootcamp)
        }
      } catch (error) {
        console.error("Error fetching bootcamp:", error)
        setError("Error loading bootcamp")
      } finally {
        setLoading(false)
      }
    }

    fetchBootcamp()
  }, [params.id, getBootcampById])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !bootcamp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
        <p className="text-slate-600 dark:text-slate-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="container px-4 py-16 md:px-6">
          <div className="flex flex-col items-start space-y-4 text-white">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {bootcamp.title}
              </h1>
              <p className="text-xl text-slate-100">{bootcamp.shortDescription}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span>{bootcamp.duration}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span>{bootcamp.schedule.days.join(", ")}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span>{bootcamp.currentStudents} students enrolled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 md:px-6">
        <BootcampDetails bootcamp={bootcamp} />
      </div>
    </div>
  )
}