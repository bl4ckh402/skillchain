import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

export default function BecomeInstructorLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-10 w-[300px] mx-auto" />
                <Skeleton className="h-5 w-[500px] mx-auto" />
              </div>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                  <p className="text-muted-foreground">Loading application form...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

