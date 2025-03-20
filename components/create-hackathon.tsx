"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthProvider"
import { useHackathons } from "@/context/HackathonContext"
import { toast } from "@/components/ui/use-toast"

interface PostHackathonModalProps {
  open: boolean
  onClose: () => void
}

export function PostHackathonModal({ open, onClose }: PostHackathonModalProps) {
  const { user } = useAuth()
  const { createHackathon } = useHackathons()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await createHackathon({
        title: formData.get("title") as string,
        organizer: formData.get("organizer") as string,
        logo: "",  // Should be handled by file upload
        website: formData.get("website") as string,
        startDate: new Date(formData.get("startDate") as string),
        endDate: new Date(formData.get("endDate") as string),
        location: formData.get("location") as string,
        participants: 0,
        prizePool: formData.get("prizePool") as string,
        status: "upcoming",
        tags: (formData.get("tags") as string).split(",").map(tag => tag.trim()),
        description: formData.get("description") as string,
        featured: false,
        sponsors: [],
        timeline: [
          {
            date: formData.get("startDate") as string,
            event: "Registration Opens",
            description: "Hackathon registration begins"
          },
          {
            date: formData.get("endDate") as string,
            event: "Submission Deadline",
            description: "Final project submissions due"
          }
        ],
        resources: [],
        prizes: [
          {
            title: "First Place",
            amount: formData.get("firstPrize") as string,
            description: "First place prize"
          }
        ],
        judges: []
      })

      toast({
        title: "Success",
        description: "Hackathon created successfully"
      })
      onClose()
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a New Hackathon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Hackathon Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizer">Organizer</Label>
              <Input id="organizer" name="organizer" required />
            </div>
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
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prizePool">Prize Pool</Label>
              <Input id="prizePool" name="prizePool" placeholder="e.g. $50,000" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input 
              id="tags" 
              name="tags" 
              placeholder="e.g. DeFi, NFTs, Gaming" 
              required 
            />
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

          <div className="space-y-2">
            <Label htmlFor="firstPrize">First Place Prize</Label>
            <Input id="firstPrize" name="firstPrize" required />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Hackathon"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}