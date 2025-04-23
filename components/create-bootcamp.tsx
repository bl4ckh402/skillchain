"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthProvider"
import { useBootcamps } from "@/context/BootcampContext"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CourseLevel, CourseStatus } from "@/types/course"
import { BootcampStatus } from "@/types/bootcamp"

interface CreateBootcampModalProps {
  open: boolean
  onCloseAction: () => void
}

export function CreateBootcampModal({ open, onCloseAction }: CreateBootcampModalProps) {
  const { user } = useAuth()
  const { createBootcamp } = useBootcamps()
  const [loading, setLoading] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [mentors, setMentors] = useState<string[]>([])
  const [newMentor, setNewMentor] = useState("")

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const timezones = [
    "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00", 
    "UTC-07:00", "UTC-06:00", "UTC-05:00", "UTC-04:00", "UTC-03:00",
    "UTC-02:00", "UTC-01:00", "UTC+00:00", "UTC+01:00", "UTC+02:00",
    "UTC+03:00", "UTC+04:00", "UTC+05:00", "UTC+06:00", "UTC+07:00",
    "UTC+08:00", "UTC+09:00", "UTC+10:00", "UTC+11:00", "UTC+12:00"
  ]

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const handleAddMentor = () => {
    if (newMentor && !mentors.includes(newMentor)) {
      setMentors([...mentors, newMentor])
      setNewMentor("")
    }
  }

  const handleRemoveMentor = (mentor: string) => {
    setMentors(mentors.filter(m => m !== mentor))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await createBootcamp({
        title: formData.get("title") as string,
        shortDescription: (formData.get("description") as string).slice(0, 120),
        description: formData.get("description") as string,
        duration: Math.ceil(
          (new Date(formData.get("endDate") as string).getTime() -
            new Date(formData.get("startDate") as string).getTime()) /
            (1000 * 60 * 60 * 24)
        ).toString(),
        maxStudents: parseInt(formData.get("maxParticipants") as string),
        currentStudents: 0,
        schedule: {
          days: selectedDays,
          time: formData.get("time") as string,
          timezone: formData.get("timezone") as string
        },
        price: formData.get("price") as string,
        status: BootcampStatus.DRAFT,
        instructor: {
          id: user.uid,
          name: user.displayName || "",
          avatar: user.photoURL || "",
          bio: ""
        },
        curriculum: [], // Initialize with empty curriculum
        modules: [],
        whatYouWillLearn: [],
        requirements: [],
        thumbnail: "",
        featured: false,
        visibility: "public",
        certificate: true,
        tags: []
      })

      toast({
        title: "Success",
        description: "Bootcamp created successfully"
      })
      onCloseAction()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a New Bootcamp</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Bootcamp Title</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Maximum Participants</Label>
              <Input 
                id="maxParticipants" 
                name="maxParticipants" 
                type="number" 
                min="1"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                name="price" 
                type="number"
                min="0"
                step="0.01"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Schedule Days</Label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(day => (
                <Badge
                  key={day}
                  variant={selectedDays.includes(day) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleDayToggle(day)}
                >
                  {day.slice(0, 3)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Class Time</Label>
              <Input 
                id="time" 
                name="time" 
                type="time"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select name="timezone" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blockchain">Blockchain</SelectItem>
                <SelectItem value="web3">Web3</SelectItem>
                <SelectItem value="defi">DeFi</SelectItem>
                <SelectItem value="nft">NFT</SelectItem>
                <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select name="level" required>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CourseLevel.BEGINNER}>Beginner</SelectItem>
                <SelectItem value={CourseLevel.INTERMEDIATE}>Intermediate</SelectItem>
                <SelectItem value={CourseLevel.ADVANCED}>Advanced</SelectItem>
                <SelectItem value={CourseLevel.ALL_LEVELS}>All Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mentors</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {mentors.map(mentor => (
                <Badge key={mentor} variant="secondary" className="flex items-center gap-1">
                  {mentor}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveMentor(mentor)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMentor}
                onChange={(e) => setNewMentor(e.target.value)}
                placeholder="Enter mentor name"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddMentor}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              rows={5} 
              required 
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading} onClick={()=>createBootcamp()}>
            {loading ? "Creating..." : "Create Bootcamp"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}