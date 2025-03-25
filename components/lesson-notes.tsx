"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Save } from "lucide-react"

interface LessonNotesProps {
  lessonId: string
  courseId: string
}

export default function LessonNotes({ lessonId, courseId }: LessonNotesProps) {
  // In a real app, this would be fetched from an API
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const handleSaveNotes = () => {
    // In a real app, this would call an API to save the notes
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date().toLocaleTimeString())
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Your Notes</h2>
        <div className="text-sm text-muted-foreground">{lastSaved && `Last saved at ${lastSaved}`}</div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Take notes on this lesson..."
              className="min-h-[300px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : "Save Notes"}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>
          Notes are private and only visible to you. They are automatically saved as you type and can be accessed from
          any device.
        </p>
      </div>
    </div>
  )
}

