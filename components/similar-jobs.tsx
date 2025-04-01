"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useJobs } from "@/context/JobsProvider"
import { Job } from "@/types/job"
import { Loader2 } from "lucide-react"

interface SimilarJobsProps {
  currentJob: Job
}

export function SimilarJobs({ currentJob }: SimilarJobsProps) {
  const { getSimilarJobs } = useJobs()
  const [similarJobs, setSimilarJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      setLoading(true)
      try {
        const jobs = await getSimilarJobs(currentJob, 3)
        setSimilarJobs(jobs)
      } catch (error) {
        console.error("Error fetching similar jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    if (currentJob?.id) {
      fetchSimilarJobs()
    }
  }, [currentJob, getSimilarJobs])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar Jobs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : similarJobs.length > 0 ? (
          <div className="space-y-4">
            {similarJobs.map((job) => (
              <Link href={`/jobs/${job.id}`} key={job.id} className="block">
                <div className="flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-md transition-colors">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={job.logo || "/placeholder.svg?height=40&width=40"} alt={job.company} />
                    <AvatarFallback>{job.company.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-medium line-clamp-1">{job.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {job.company} • {job.location}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No similar jobs found</p>
          </div>
        )}
        
        <Link href="/jobs">
          <Button variant="outline" className="w-full">
            View More Jobs
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}