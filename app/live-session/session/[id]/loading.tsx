import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  Clock,
  PhoneOff,
  Mic,
  Video,
  ScreenShare,
  PenTool,
  Settings,
  MessageSquare,
  Users,
} from "lucide-react"

export default function LiveSessionLoading() {
  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              disabled
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <Skeleton className="h-6 w-48 mb-1" />
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Live Session
                </Badge>
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white" disabled>
              <PhoneOff className="h-4 w-4 mr-1" />
              End Session
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="relative flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
            <Skeleton className="w-full h-full" />
            <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video bg-slate-800 rounded-lg overflow-hidden shadow-lg border-2 border-slate-700">
              <Skeleton className="w-full h-full" />
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full p-3 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled
              >
                <Mic className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full p-3 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled
              >
                <Video className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full p-3 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled
              >
                <ScreenShare className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full p-3 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled
              >
                <PenTool className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full p-3 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled
              >
                <Settings className="h-6 w-6" />
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full p-3 bg-red-600 hover:bg-red-700 text-white"
                disabled
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start bg-slate-100 dark:bg-slate-900 p-1 rounded-none">
              <TabsTrigger
                value="chat"
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                disabled
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="participants"
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                disabled
              >
                <Users className="h-4 w-4 mr-2" />
                Participants
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <Skeleton className="h-16 w-3/4" />
                <div className="flex justify-end">
                  <Skeleton className="h-16 w-3/4" />
                </div>
                <Skeleton className="h-16 w-3/4" />
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <Skeleton className="h-[60px] w-full" />
                  <Skeleton className="h-[60px] w-10" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="participants" className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Instructor</h3>
                  <Skeleton className="h-20 w-full" />
                </div>
                <Skeleton className="h-1 w-full" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Student</h3>
                  <Skeleton className="h-20 w-full" />
                </div>
                <Skeleton className="h-1 w-full" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Session Controls</h3>
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
