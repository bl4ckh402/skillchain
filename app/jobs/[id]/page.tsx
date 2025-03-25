"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Footer } from "@/components/footer"
import { useJob } from "@/hooks/useJob"
import { use } from "react"
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building,
  Share2,
  Bookmark,
  ChevronLeft,
  Globe,
  Users,
  Award,
} from "lucide-react"
import { useAuth } from "@/context/AuthProvider"
import { useJobs } from "@/context/JobsProvider"
import { toast } from "@/components/ui/use-toast"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { job, loading, error } = useJob(params.id)
  const { user } = useAuth()
  const { applyForJob, saveJob } = useJobs()


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-4">{error || 'This job listing could not be found.'}</p>
        <Link href="/jobs">
          <Button>Browse Jobs</Button>
        </Link>
      </div>
    )
  }


  const handleApply = async () => {
    console.log("Applying for role")
    if (!user) {
      return
    }
    try {

      await applyForJob(job.id!)
      toast({
        title: "Application submitted",
        description: "Your application has been sent successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSave = async () => {
    if (!user) return
    try {
      await saveJob(job.id!)
      toast({
        title: "Job saved",
        description: "This job has been saved to your bookmarks.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6">
            <Link href="/jobs" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Jobs
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <Avatar className="h-16 w-16 border">
                      <AvatarImage src={job.logo} alt={job.company} />
                      <AvatarFallback>{job.company.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h1 className="text-2xl font-bold">{job.title}</h1>
                        <div className="flex items-center text-muted-foreground">
                          <Building className="mr-1 h-4 w-4" />
                          {job.company}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Briefcase className="mr-1 h-4 w-4" />
                          {job.type}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="mr-1 h-4 w-4" />
                          {job.salary}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          Posted {new Date(job.postedAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About {job.company}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: job.aboutCompany }}
                  />
                  <div className="flex flex-wrap gap-6 pt-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Website</p>
                        <a
                          href={job.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {job.website.replace("https://", "")}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Company Size</p>
                        <p className="text-sm text-muted-foreground">{job.employees} employees</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Founded</p>
                        <p className="text-sm text-muted-foreground">{job.founded}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Courses</CardTitle>
                  <CardDescription>Boost your chances by taking these relevant courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {job.relatedCourses?.map((course: any) => (
                      <Link href={`/course/${course.id}`} key={course.id} className="group">
                        <div className="overflow-hidden rounded-md border">
                          <div className="aspect-video w-full overflow-hidden">
                            <img
                              src={course.image || "/placeholder.svg"}
                              alt={course.title}
                              className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium line-clamp-2">{course.title}</h4>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Apply for this job</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-500 dark:from-green-400 dark:to-teal-400" onClick={(e)=>{handleApply()}}>
                    Apply Now
                  </Button>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Job Type</span>
                      <span className="text-sm font-medium">{job.type}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm font-medium">{job.location}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Salary Range</span>
                      <span className="text-sm font-medium">{job.salary}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Posted</span>
                      <span className="text-sm font-medium">
                        {new Date(job.postedAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Similar Jobs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="MetaBlock" />
                        <AvatarFallback>M</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-medium">Web3 Frontend Engineer</h4>
                        <p className="text-xs text-muted-foreground">MetaBlock • San Francisco, CA</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="SecureChain" />
                        <AvatarFallback>S</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-medium">Blockchain Security Analyst</h4>
                        <p className="text-xs text-muted-foreground">SecureChain • Remote</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="NFT Marketplace" />
                        <AvatarFallback>N</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-medium">Smart Contract Developer</h4>
                        <p className="text-xs text-muted-foreground">NFT Marketplace • New York, NY</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    View More Jobs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

