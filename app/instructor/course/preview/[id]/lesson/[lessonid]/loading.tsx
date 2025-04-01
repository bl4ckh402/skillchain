import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Menu } from "lucide-react"

export default function LessonLoading() {
  return (
    <div className="flex flex-col h-screen">
      {/* Top navigation bar */}
      <header className="border-b bg-white dark:bg-slate-950 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back to course</span>
            </Button>
            <Button variant="ghost" className="gap-2 hidden md:flex">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to course</span>
            </Button>
            <div className="hidden md:block">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <Skeleton className="h-2 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Button variant="outline" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Course sidebar - hidden on mobile, shown on larger screens */}
        <div className="hidden md:block w-80 border-r bg-slate-50 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            
            <div className="space-y-2">
              {[1, 2, 3].map((module) => (
                <div key={module} className="border rounded-lg overflow-hidden">
                  <Skeleton className="h-14 w-full" />
                  {module === 2 && (
                    <div className="divide-y border-t">
                      {[1, 2, 3, 4].map((lesson) => (
                        <Skeleton key={lesson} className="h-14 w-full" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <div className="container max-w-4xl px-4 py-6 md:py-8">
            <div className="md:hidden mb-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-1" />
            </div>

            <Tabs defaultValue="lesson" className="w-full">
              <TabsList className="mb-4 w-full justify-start bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                <TabsTrigger value="lesson" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
                  Lesson
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="discussion" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
                  Discussion
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lesson" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  
                  <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Skeleton className="h-16 w-16 rounded-full" />
                    </div>
                  </div>
                  
                </div>
                  
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-40" />
                  </div>
                  
                  {/* <Skeleton className="h-24 w-full rounded-lg" />
                </div> */}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

