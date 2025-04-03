"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock8,
  MapPin,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Briefcase,
  Building,
  CheckCircle2
} from "lucide-react";
import { Job, JobApplication } from "@/types/job";

// Interface for job applications with job details
export interface ApplicationWithJob extends JobApplication {
  id: string;
  job: Job;
  instructorStatus?: 'pending' | 'under_review' | 'interview' | 'accepted' | 'rejected';
  feedback?: string;
  interviewDate?: Date;
  interviewLink?: string;
  isInstructorApplication?: boolean;
}

// Props interface
interface AppliedJobsTabProps {
  appliedJobs: ApplicationWithJob[];
}

const AppliedJobsTab = ({ appliedJobs }: AppliedJobsTabProps) => {
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});

  const toggleJobExpand = (jobId: string) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  // Helper function to format dates safely
  const formatDate = (timestamp: Date | string | any): string => {
    if (!timestamp) return 'Unknown date';
    
    try {
      if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Helper function for status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "applied":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Applied</Badge>;
      case "reviewed":
      case "under_review":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">Under Review</Badge>;
      case "interview":
        return (
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Interview</Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-400">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to check if application is an instructor application
  const isInstructorApplication = (application: ApplicationWithJob): boolean => {
    return application.isInstructorApplication === true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Applied Jobs</h2>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium text-blue-600 dark:text-blue-400">{appliedJobs.length}</span>{" "}
          applications
        </div>
      </div>

      {appliedJobs.length > 0 ? (
        <div className="space-y-4">
          {appliedJobs.map((application) => (
            <Card
              key={application.id || `${application.jobId}-${application.userId}`}
              className="overflow-hidden transition-all hover:shadow-md border-slate-200 dark:border-slate-800"
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                        {application.job.title}
                      </CardTitle>
                      {getStatusBadge(application.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4 text-slate-400" />
                      <span>{application.job.company}</span>
                      {application.job.location && (
                        <>
                          <span className="text-slate-300">•</span>
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{application.job.location}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                      <Clock8 className="h-4 w-4 mr-1 text-slate-400" />
                      Applied on {formatDate(application.appliedAt)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => toggleJobExpand(application.id || `${application.jobId}-${application.userId}`)}
                    >
                      {expandedJobs[application.id || `${application.jobId}-${application.userId}`] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedJobs[application.id || `${application.jobId}-${application.userId}`] && (
                <>
                  <Separator />
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Job Description</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {application.job.description}
                        </p>
                      </div>

                      {application.job.requirements && application.job.requirements.length > 0 && (
                        <div>
                          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Requirements</h4>
                          <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            {application.job.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {isInstructorApplication(application) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                            Instructor Application
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Status:
                              </span>
                              {getStatusBadge(application.instructorStatus || application.status)}
                            </div>

                            {application.feedback && (
                              <div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Feedback:
                                </span>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {application.feedback}
                                </p>
                              </div>
                            )}

                            {application.interviewDate && (
                              <div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Interview:
                                </span>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  Scheduled for {formatDate(application.interviewDate)}
                                  {application.interviewLink && (
                                    <Button variant="link" size="sm" className="ml-2 p-0 h-auto" asChild>
                                      <a
                                        href={application.interviewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Join Link
                                      </a>
                                    </Button>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex justify-between w-full">
                      <Button
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        asChild
                      >
                        <Link href={`/jobs/${application.job.id}`}>View Job Details</Link>
                      </Button>
                      {application.status === "interview" && application.interviewLink && (
                        <Button
                          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                          asChild
                        >
                          <a href={application.interviewLink} target="_blank" rel="noopener noreferrer">
                            Join Interview
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-6">
            <Briefcase className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
            No job applications yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Browse available jobs and submit applications to see them here.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppliedJobsTab;