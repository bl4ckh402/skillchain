import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Course } from "@/types/course";
import Link from "next/link";
import { Clock, Users } from "lucide-react";

export interface EnrolledBootcampsProps {
  bootcamps: Course[];
}

export function EnrolledBootcamps({ bootcamps }: EnrolledBootcampsProps) {
  const enrolledBootcamps = bootcamps.filter(bootcamp => 
    bootcamp.type === 'bootcamp' && bootcamp.enrolled
  );

  if (enrolledBootcamps.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">
          You haven&apos;t enrolled in any bootcamps yet.
        </p>
        <Link 
          href="/bootcamps" 
          className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
        >
          Browse available bootcamps
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {enrolledBootcamps.map((bootcamp) => (
        <Card key={bootcamp.id} className="overflow-hidden">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">
                {bootcamp.title}
              </CardTitle>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {bootcamp.duration}
              </span>
            </div>
            <CardDescription className="line-clamp-2">
              {bootcamp.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{bootcamp.students} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{bootcamp.completionRate}% complete</span>
                </div>
              </div>
              <Progress value={bootcamp.completionRate} className="h-2" />
              <Link 
                href={`/bootcamps/${bootcamp.id}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Continue Learning
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}