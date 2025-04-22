"use client"

import { useEffect, useState } from "react"
import { useBootcamps } from "@/context/BootcampContext"
import { Bootcamp, BootcampStatus } from "@/types/bootcamp"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  Users,
  Star,
  Search,
  Loader2,
  GraduationCap,
  Target,
  CheckCircle2,
} from "lucide-react"

export default function BootcampsPage() {
  const { getBootcamps } = useBootcamps()
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<BootcampStatus | "all">("all")

  useEffect(() => {
    const loadBootcamps = async () => {
      try {
        await getBootcamps()
      } catch (error) {
        console.error("Error loading bootcamps:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBootcamps()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    try {
      await getBootcamps({ search: searchQuery })
    } catch (error) {
      console.error("Error searching bootcamps:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBootcamps = bootcamps.filter(
    (bootcamp) => filter === "all" || bootcamp.status === filter
  )

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="container px-4 py-16 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl">
              Intensive Bootcamps
            </h1>
            <p className="max-w-[700px] text-slate-100 md:text-xl dark:text-slate-100">
              Join our live, instructor-led bootcamps to accelerate your career in tech.
              Learn from industry experts and build real-world projects.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 md:px-6">
        <div className="grid gap-6 md:grid-cols-[250px_1fr]">
          {/* Filters */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Search</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Search bootcamps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Status</h2>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bootcamps</SelectItem>
                  <SelectItem value={BootcampStatus.UPCOMING}>Upcoming</SelectItem>
                  <SelectItem value={BootcampStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={BootcampStatus.COMPLETED}>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bootcamp List */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
                <span>Loading bootcamps...</span>
              </div>
            ) : filteredBootcamps.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBootcamps.map((bootcamp) => (
                  <Card key={bootcamp.id} className="flex flex-col overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={bootcamp.thumbnail || "/placeholder.png"}
                        alt={bootcamp.title}
                        className="object-cover w-full h-full"
                      />
                      <Badge
                        className="absolute top-2 right-2"
                        variant={
                          bootcamp.status === BootcampStatus.UPCOMING
                            ? "default"
                            : bootcamp.status === BootcampStatus.IN_PROGRESS
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {bootcamp.status}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle>{bootcamp.title}</CardTitle>
                      <CardDescription>{bootcamp.shortDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>
                            {bootcamp.schedule.days.join(", ")} at {bootcamp.schedule.time} {bootcamp.schedule.timezone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>{bootcamp.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>
                            {bootcamp.currentStudents}/{bootcamp.maxStudents} enrolled
                          </span>
                        </div>
                        {bootcamp.placementRate && (
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-green-500" />
                            <span>{bootcamp.placementRate}% placement rate</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="p-4">
                      <Button asChild className="w-full">
                        <Link href={`/bootcamps/${bootcamp.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bootcamps found</h3>
                <p className="text-muted-foreground">
                  No bootcamps match your current search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}