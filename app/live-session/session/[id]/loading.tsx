import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";

export default function LiveSessionLoading() {
  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header */}
      <header className="px-4 py-2 bg-white border-b dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              disabled
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <Skeleton className="w-48 h-6 mb-1" />
              <div className="flex items-center gap-2">
                <Badge className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">
                  Live Session
                </Badge>
                <Skeleton className="w-32 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-md dark:bg-blue-900">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <Skeleton className="w-20 h-4" />
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="text-white bg-red-600 hover:bg-red-700"
              disabled
            >
              <PhoneOff className="w-4 h-4 mr-1" />
              End Session
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Video Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="relative flex items-center justify-center flex-1 overflow-hidden bg-slate-900">
            <Skeleton className="w-full h-full" />
            <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video bg-slate-800 rounded-lg overflow-hidden shadow-lg border-2 border-slate-700">
              <Skeleton className="w-full h-full" />
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 bg-white border-t dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="p-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled
              >
                <Mic className="w-6 h-6" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="p-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled
              >
                <Video className="w-6 h-6" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="p-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled
              >
                <ScreenShare className="w-6 h-6" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="p-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled
              >
                <PenTool className="w-6 h-6" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="p-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                disabled
              >
                <Settings className="w-6 h-6" />
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="p-3 text-white bg-red-600 rounded-full hover:bg-red-700"
                disabled
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col bg-white border-l w-80 border-slate-200 dark:border-slate-800 dark:bg-slate-950">
          <Tabs defaultValue="chat" className="flex flex-col flex-1">
            <TabsList className="justify-start w-full p-1 rounded-none bg-slate-100 dark:bg-slate-900">
              <TabsTrigger
                value="chat"
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                disabled
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="participants"
                className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                disabled
              >
                <Users className="w-4 h-4 mr-2" />
                Participants
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex flex-col flex-1 p-0 m-0">
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <Skeleton className="w-3/4 h-16" />
                <div className="flex justify-end">
                  <Skeleton className="w-3/4 h-16" />
                </div>
                <Skeleton className="w-3/4 h-16" />
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <Skeleton className="h-[60px] w-full" />
                  <Skeleton className="h-[60px] w-10" />
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="participants"
              className="flex-1 p-4 overflow-y-auto"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">
                    Instructor
                  </h3>
                  <Skeleton className="w-full h-20" />
                </div>
                <Skeleton className="w-full h-1" />
                <div>
                  <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">
                    Student
                  </h3>
                  <Skeleton className="w-full h-20" />
                </div>
                <Skeleton className="w-full h-1" />
                <div>
                  <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">
                    Session Controls
                  </h3>
                  <div className="space-y-2">
                    <Skeleton className="w-full h-10" />
                    <Skeleton className="w-full h-10" />
                    <Skeleton className="w-full h-10" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
