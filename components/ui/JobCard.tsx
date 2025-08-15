import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Job } from "@/types/job";
import { Clock, MapPin, Building } from "lucide-react";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card
        className={`transition-all hover:shadow-md ${
          job.featured
            ? "border-2 border-blue-300 dark:border-blue-700"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white dark:border-slate-800">
                <AvatarImage
                  src={job.logo || "/placeholder.svg"}
                  alt={job.company}
                />
                <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                  {job.company?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  {job.title}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Building className="w-4 h-4" />
                  {job.company}
                  <span className="text-slate-300">•</span>
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
              </div>
            </div>
            <div className="flex flex-col flex-1 gap-2">
              <div className="flex flex-wrap gap-1.5">
                {job.tags?.slice(0, 3).map((tag, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-xs font-normal text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900"
                  >
                    {tag}
                  </Badge>
                ))}
                {job.tags?.length > 3 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    +{job.tags.length - 3} more
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {job.salary}
                </span>
                <span className="text-slate-300">•</span>
                <span>{job.type}</span>
                <span className="text-slate-300">•</span>
                <Clock className="w-3 h-3 mr-1 text-blue-500" />
                <span>
                  {new Date(job.postedAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
