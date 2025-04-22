import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useVideo } from "@/context/StreamClientProvider"
import { useToast } from "@/components/ui/use-toast"
import { CallType } from "@stream-io/video-react-sdk"

interface ScheduleSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleSessionDialog({ open, onOpenChange }: ScheduleSessionDialogProps) {
  const [title, setTitle] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [isScheduling, setIsScheduling] = useState(false)
  
  const { createCall, fetchSessions } = useVideo()
  const { toast } = useToast()

  const handleScheduleSession = async () => {
    if (!title.trim() || !scheduledDate || !scheduledTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsScheduling(true)

    try {
      // Create scheduled date
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`)
      
      // Create the session with default call type
      await createCall(title, "default" as CallType, scheduledFor)

      // Reset form and close dialog
      setTitle("")
      setScheduledDate("")
      setScheduledTime("")
      onOpenChange(false)

      // Refresh sessions list
      await fetchSessions()

      toast({
        title: "Session scheduled",
        description: "Your session has been scheduled successfully.",
      })
    } catch (error) {
      console.error("Failed to schedule session:", error)
      toast({
        title: "Failed to schedule session",
        description: "There was an error scheduling your session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1D2D] text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Schedule New Session</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a title and time for your upcoming session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Input
              placeholder="Session Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#232538] border-gray-700 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="bg-[#232538] border-gray-700 text-white"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="bg-[#232538] border-gray-700 text-white"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-gray-300 border-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleScheduleSession}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isScheduling}
          >
            {isScheduling ? (
              <>
                <Calendar className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}