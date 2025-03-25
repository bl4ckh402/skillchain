"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, Flag } from "lucide-react"

interface LessonDiscussionProps {
  lessonId: string
  courseId: string
}

export default function LessonDiscussion({ lessonId, courseId }: LessonDiscussionProps) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock discussion data
  const discussionData = [
    {
      id: "comment-1",
      user: {
        name: "Alex Johnson",
        avatar: "/images/instructors/alex-johnson.jpg",
        role: "Instructor",
      },
      content:
        "Welcome to the discussion for this lesson! Feel free to ask any questions about public key cryptography, and I'll do my best to answer them.",
      timestamp: "2 days ago",
      likes: 12,
      replies: [],
    },
    {
      id: "comment-2",
      user: {
        name: "Sarah T.",
        avatar: "/images/users/sarah-t.jpg",
      },
      content:
        "I'm having trouble understanding the difference between symmetric and asymmetric encryption. Could someone explain this in simpler terms?",
      timestamp: "1 day ago",
      likes: 3,
      replies: [
        {
          id: "reply-1",
          user: {
            name: "Michael R.",
            avatar: "/images/users/michael-r.jpg",
          },
          content:
            "Symmetric encryption uses the same key for both encryption and decryption, while asymmetric encryption uses a pair of keys (public and private). Symmetric is faster but less secure for key exchange, while asymmetric is slower but solves the key exchange problem.",
          timestamp: "1 day ago",
          likes: 8,
        },
        {
          id: "reply-2",
          user: {
            name: "Alex Johnson",
            avatar: "/images/instructors/alex-johnson.jpg",
            role: "Instructor",
          },
          content:
            "Great explanation, Michael! To add to that, think of symmetric encryption like a traditional lock and key - the same key locks and unlocks. Asymmetric encryption is more like a mailbox - anyone can put mail in (encrypt with public key), but only the owner with the private key can take mail out (decrypt).",
          timestamp: "23 hours ago",
          likes: 15,
        },
      ],
    },
  ]

  const handleSubmitComment = () => {
    if (!comment.trim()) return

    // In a real app, this would call an API to submit the comment
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setComment("")
      // Would normally update the comments list here
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Discussion</h2>
        <div className="text-sm text-muted-foreground">{discussionData.length} comments</div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/images/users/current-user.jpg" alt="Your profile" />
              <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                YO
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder="Ask a question or share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !comment.trim()}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{isSubmitting ? "Posting..." : "Post Comment"}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {discussionData.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  {comment.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{comment.user.name}</span>
                  {comment.user.role === "Instructor" && <Badge className="bg-blue-500 text-white">Instructor</Badge>}
                  <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                </div>
                <p className="mt-2 text-slate-700 dark:text-slate-300">{comment.content}</p>
                <div className="mt-2 flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{comment.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>Reply</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                    <Flag className="h-4 w-4" />
                    <span>Report</span>
                  </Button>
                </div>
              </div>
            </div>

            {comment.replies.length > 0 && (
              <div className="ml-14 space-y-4 border-l-2 border-slate-200 dark:border-slate-800 pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        {reply.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{reply.user.name}</span>
                        {reply.user.role === "Instructor" && (
                          <Badge className="bg-blue-500 text-white">Instructor</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">{reply.timestamp}</span>
                      </div>
                      <p className="mt-2 text-slate-700 dark:text-slate-300">{reply.content}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{reply.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                          <Flag className="h-4 w-4" />
                          <span>Report</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

