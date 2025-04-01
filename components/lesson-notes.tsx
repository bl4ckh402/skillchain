"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Save, Loader2 } from "lucide-react"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthProvider"

interface LessonNotesProps {
  lessonId: string
  courseId: string
}

export default function LessonNotes({ lessonId, courseId }: LessonNotesProps) {
  const { user } = useAuth()
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const noteDocRef = doc(db, 'userNotes', `${user.uid}_${courseId}_${lessonId}`)
        const noteDocSnap = await getDoc(noteDocRef)
        
        if (noteDocSnap.exists()) {
          const noteData = noteDocSnap.data()
          setNotes(noteData.content || "")
          
          if (noteData.updatedAt) {
            const timestamp = noteData.updatedAt.toDate()
            setLastSaved(timestamp.toLocaleTimeString() + ", " + timestamp.toLocaleDateString())
          }
        }
      } catch (error) {
        console.error("Error fetching notes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [user, courseId, lessonId])

  const handleSaveNotes = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      const noteDocRef = doc(db, 'userNotes', `${user.uid}_${courseId}_${lessonId}`)
      
      await setDoc(noteDocRef, {
        userId: user.uid,
        courseId,
        lessonId,
        content: notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true })
      
      const now = new Date()
      setLastSaved(now.toLocaleTimeString() + ", " + now.toLocaleDateString())
    } catch (error) {
      console.error("Error saving notes:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save feature with debounce
  useEffect(() => {
    if (!user || notes === "") return
    
    const timerId = setTimeout(() => {
      handleSaveNotes()
    }, 3000) // Auto-save after 3 seconds of inactivity
    
    return () => {
      clearTimeout(timerId)
    }
  }, [notes])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Please log in to take notes</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Your Notes</h2>
        <div className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : lastSaved && `Last saved at ${lastSaved}`}
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <Textarea
                placeholder="Take notes on this lesson..."
                className="min-h-[300px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            )}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveNotes}
                disabled={isSaving || isLoading}
                className="gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
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