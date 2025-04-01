"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthProvider"
import { useJobs } from "@/context/JobsProvider"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JobStatus, JobType } from "@/types/job"
import { TipTapEditor } from "@/components/tiptap-editor" // Import the TipTap editor
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WysiwygDisplayer } from "@/components/wysiwyg-displayer"

interface PostJobModalProps {
  open: boolean
  onClose: () => void
}

export function PostJobModal({ open, onClose }: PostJobModalProps) {
  const { user } = useAuth()
  const { createJob } = useJobs()
  const [loading, setLoading] = useState(false)
  const [jobDescription, setJobDescription] = useState('') // State for the WYSIWYG editor
  const [aboutCompany, setAboutCompany] = useState('') // State for the company description

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await createJob({
        title: formData.get("title") as string,
        company: formData.get("company") as string,
        location: formData.get("location") as string,
        type: formData.get("type") as string as JobType,
        salary: formData.get("salary") as string,
        // Use the HTML content from the WYSIWYG editor instead of the form data
        description: jobDescription,
        requirements: (formData.get("requirements") as string).split("\n"),
        responsibilities: (formData.get("responsibilities") as string).split("\n"),
        tags: (formData.get("tags") as string).split(",").map(tag => tag.trim()),
        // Use the HTML content for the about company section
        aboutCompany: aboutCompany,
        website: formData.get("website") as string,
        postedBy: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || ''
        },
        postedAt: new Date(),
        expiresAt: new Date(formData.get("expiresAt") as string),
        featured: false,
        status: JobStatus.ACTIVE
      })

      toast({
        title: "Success",
        description: "Job posted successfully"
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" name="company" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input id="salary" name="salary" placeholder="e.g. $80K - $100K" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Company Website</Label>
              <Input id="website" name="website" type="url" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input 
              id="tags" 
              name="tags" 
              placeholder="e.g. Solidity, Smart Contracts, DeFi" 
              required 
            />
          </div>

          {/* WYSIWYG Editor for Job Description with Preview */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <Card className="border border-slate-200 dark:border-slate-800">
                  <CardContent className="p-0">
                    <TipTapEditor 
                      value={jobDescription} 
                      onChange={setJobDescription} 
                      placeholder="Write a detailed job description..." 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="preview">
                <Card className="border border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4">
                    {jobDescription ? (
                      <WysiwygDisplayer content={jobDescription} />
                    ) : (
                      <p className="text-muted-foreground italic">Your description preview will appear here...</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            {/* Hidden input to make form validation work */}
            <input 
              type="hidden" 
              name="description" 
              value={jobDescription} 
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (one per line)</Label>
            <Textarea 
              id="requirements" 
              name="requirements" 
              rows={5} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
            <Textarea 
              id="responsibilities" 
              name="responsibilities" 
              rows={5} 
              required 
            />
          </div>

          {/* WYSIWYG Editor for About Company with Preview */}
          <div className="space-y-2">
            <Label htmlFor="aboutCompany">About Company</Label>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <Card className="border border-slate-200 dark:border-slate-800">
                  <CardContent className="p-0">
                    <TipTapEditor 
                      value={aboutCompany} 
                      onChange={setAboutCompany} 
                      placeholder="Write about your company..." 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="preview">
                <Card className="border border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4">
                    {aboutCompany ? (
                      <WysiwygDisplayer content={aboutCompany} />
                    ) : (
                      <p className="text-muted-foreground italic">Your company description preview will appear here...</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            {/* Hidden input to make form validation work */}
            <input 
              type="hidden" 
              name="aboutCompany" 
              value={aboutCompany} 
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires At</Label>
            <Input 
              id="expiresAt" 
              name="expiresAt" 
              type="date" 
              required 
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white" 
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Job"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}