import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CoursePreviewLoading() {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-md" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>

      <Skeleton className="mx-auto max-w-6xl h-12 mt-4" />

      <div className="w-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Skeleton className="h-10 w-full sm:w-40" />
                <Skeleton className="h-10 w-full sm:w-40" />
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <Skeleton className="aspect-video w-full max-w-[600px] rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <Skeleton className="h-10 w-full max-w-md mb-6" />
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-48 mb-2" />
                  <Skeleton className="h-5 w-full max-w-md" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-40 mb-2" />
                <Skeleton className="h-5 w-full max-w-xs" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-5 w-48 mx-auto" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

