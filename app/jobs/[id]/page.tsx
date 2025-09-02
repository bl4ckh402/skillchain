"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";
import { useJob } from "@/hooks/useJob";
import { cn } from "@/lib/utils";
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
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useJobs } from "@/context/JobsProvider";
import { toast } from "@/components/ui/use-toast";
import { WysiwygDisplayer } from "@/components/wysiwyg-displayer";
import { useParams } from "next/navigation";
import { SimilarJobs } from "@/components/similar-jobs";

// import { date } from "zod";

// Utility function to format date as "day shortMonth year"
function formatDate(dateInput: string | Date | undefined) {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function JobDetailPage() {
  const params = useParams();
  const { job, loading, error } = useJob(params.id as string);
  const { user } = useAuth();
  const { applyForJob, saveJob, checkIfUserApplied } = useJobs();
  const [applicationStatus, setApplicationStatus] = useState<
    "none" | "applied" | "applying"
  >("none");

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || !job?.id) return;
      try {
        const hasApplied = await checkIfUserApplied(job.id);
        setApplicationStatus(hasApplied ? "applied" : "none");
      } catch (error) {
        console.error("Error checking application status:", error);
      }
    };

    checkApplicationStatus();
  }, [user, job?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="mb-2 text-2xl font-bold">Job Not Found</h2>
        <p className="mb-4 text-muted-foreground">
          {error || "This job listing could not be found."}
        </p>
        <Link href="/jobs">
          <Button>Browse Jobs</Button>
        </Link>
      </div>
    );
  }

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply for this job.",
        variant: "destructive",
      });
      return;
    }

    try {
      setApplicationStatus("applying");
      await applyForJob(job.id!);
      setApplicationStatus("applied");
      toast({
        title: "Application submitted",
        description: "Your application has been sent successfully.",
      });
    } catch (error) {
      setApplicationStatus("none");
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save this job.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveJob(job.id!);
      toast({
        title: "Job saved",
        description: "This job has been saved to your bookmarks.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6">
            <Link
              href="/jobs"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Jobs
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <Avatar className="w-16 h-16 border">
                      <AvatarImage src={job.logo} alt={job.company} />
                      <AvatarFallback>
                        {typeof job.company === "string" &&
                        job.company.length > 0
                          ? job.company.charAt(0)
                          : "?"}
                      </AvatarFallback>
                      {/* <AvatarFallback>{job.company.charAt(0)}</AvatarFallback> */}
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h1 className="text-2xl font-bold">{job.title}</h1>
                        <div className="flex items-center text-muted-foreground">
                          <Building className="w-4 h-4 mr-1" />
                          {job.company}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {job.type}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {job.salary}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          Posted {formatDate(job.postedAt)}
                        </div>
                      </div>

                      {/* Changed to Array.isArray */}
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(job.tags) &&
                          job.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="font-normal"
                            >
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
                  {/* Use the WYSIWYG displayer component instead of directly using dangerouslySetInnerHTML */}
                  <WysiwygDisplayer content={job.description} />
                </CardContent>
              </Card>

              {/* Requirements and Responsibilities section */}
              <Card>
                <CardHeader>
                  <CardTitle>Requirements & Responsibilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-lg font-medium">Requirements</h3>
                    <ul className="pl-5 space-y-2 list-disc">
                      {Array.isArray(job.requirements) ? (
                        job.requirements.map((requirement, index) => (
                          <li
                            key={index}
                            className="text-sm text-slate-700 dark:text-slate-300"
                          >
                            {requirement}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-slate-700 dark:text-slate-300">
                          {job.requirements}
                        </li>
                      )}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-3 text-lg font-medium">
                      Responsibilities
                    </h3>
                    <ul className="pl-5 space-y-2 list-disc">
                      {Array.isArray(job.responsibilities) ? (
                        job.responsibilities.map((responsibility, index) => (
                          <li
                            key={index}
                            className="text-sm text-slate-700 dark:text-slate-300"
                          >
                            {responsibility}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-slate-700 dark:text-slate-300">
                          {job.responsibilities}
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About {job.company}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Use the WYSIWYG displayer for about company as well */}
                  <WysiwygDisplayer content={job.aboutCompany} />

                  <div className="flex flex-wrap gap-6 pt-4">
                    {typeof job.website === "string" && job.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Website</p>
                          <a
                            href={job.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {job.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      </div>
                    )}
                    {job.employees && (
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Company Size</p>
                          <p className="text-sm text-muted-foreground">
                            {job.employees} employees
                          </p>
                        </div>
                      </div>
                    )}
                    {job.founded && (
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Founded</p>
                          <p className="text-sm text-muted-foreground">
                            {job.founded}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* {job.relatedCourses && job.relatedCourses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Courses</CardTitle>
                    <CardDescription>
                      Boost your chances by taking these relevant courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {job.relatedCourses.map((course: any) => (
                        <Link
                          href={`/course/${course.id}`}
                          key={course.id}
                          className="group"
                        >
                          <div className="overflow-hidden border rounded-md">
                            <div className="w-full overflow-hidden aspect-video">
                              <img
                                src={course.image || "/placeholder.svg"}
                                alt={course.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                              />
                            </div>
                            <div className="p-3">
                              <h4 className="font-medium line-clamp-2">
                                {course.title}
                              </h4>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )} */}
            </div>

            <div className="space-y-6">
              <Card className="sticky z-20 top-20">
                <CardHeader>
                  {/* <CardTitle>Apply for this job</CardTitle> */}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* <Button
                    className={cn(
                      "w-full",
                      applicationStatus === "applied"
                        ? "bg-green-500 hover:bg-green-600 cursor-default"
                        : "bg-gradient-to-r from-teal-500 to-blue-500 dark:from-green-400 dark:to-teal-400"
                    )}
                    onClick={handleApply}
                    disabled={
                      applicationStatus === "applying" ||
                      applicationStatus === "applied"
                    }
                  >
                    {applicationStatus === "applying" ? (
                      <>
                        <span className="mr-2">
                          <span className="animate-spin">⭐</span>
                        </span>
                        Applying...
                      </>
                    ) : applicationStatus === "applied" ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Applied
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </Button> */}
                  {/* Added the "Place Bid" button */}

                  <Card>
                    <CardHeader>
                      <CardTitle>Job Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* ...existing job details... */}
                      <Button
                        className="mt-6 text-white bg-gradient-to-r from-blue-600 to-teal-600"
                        asChild
                      >
                        <Link href={`/jobs/${job.id}/bid`}>Place Bid</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast({
                          title: "Link copied",
                          description: "Job link copied to clipboard",
                        });
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSave}>
                      <Bookmark className="w-4 h-4 mr-2" />
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
                      <span className="text-sm text-muted-foreground">
                        Job Type
                      </span>
                      <span className="text-sm font-medium">{job.type}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Location
                      </span>
                      <span className="text-sm font-medium">
                        {job.location}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Salary Range
                      </span>
                      <span className="text-sm font-medium">{job.salary}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Posted
                      </span>
                      <span className="text-sm font-medium">
                        {formatDate(job.postedAt)}
                      </span>
                    </div>
                    {job.expiresAt && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Expires
                          </span>
                          <span className="text-sm font-medium">
                            {formatDate(job.expiresAt)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <SimilarJobs currentJob={job} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
