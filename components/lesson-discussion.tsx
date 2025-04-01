"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, MessageSquare, Flag, Loader2 } from "lucide-react"
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp,
  onSnapshot
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthProvider"
import { useCourses } from "@/context/CourseContext"

interface LessonDiscussionProps {
  lessonId: string
  courseId: string
}

interface CommentUser {
  id: string
  name: string
  avatar: string
  role?: string
}

interface Reply {
  id: string
  user: CommentUser
  content: string
  timestamp: any
  likes: number
}

interface Comment {
  id: string
  user: CommentUser
  content: string
  timestamp: any
  likes: number
  replies: Reply[]
}

export default function LessonDiscussion({ lessonId, courseId }: LessonDiscussionProps) {
  const { user } = useAuth()
  const { getCourseById } = useCourses()
  const [comment, setComment] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [courseData, setCourseData] = useState<any>(null)

  // Fetch course data and comments
  useEffect(() => {
    const fetchCourseAndComments = async () => {
      try {
        setLoading(true)
        
        // Get course data to check for instructor
        const course = await getCourseById(courseId)
        setCourseData(course)
        
        // Set up real-time listener for comments
        const commentsRef = collection(db, 'lessonComments')
        const commentsQuery = query(
          commentsRef,
          where('lessonId', '==', lessonId),
          where('courseId', '==', courseId),
          orderBy('timestamp', 'desc')
        )
        
        const unsubscribe = onSnapshot(commentsQuery, async (snapshot) => {
          const commentsData: Comment[] = []
          
          for (const commentDoc of snapshot.docs) {
            const commentData = commentDoc.data()
            
            // Fetch replies for this comment
            const repliesRef = collection(db, 'commentReplies')
            const repliesQuery = query(
              repliesRef,
              where('commentId', '==', commentDoc.id),
              orderBy('timestamp', 'asc')
            )
            
            const repliesSnapshot = await getDocs(repliesQuery)
            const replies: Reply[] = repliesSnapshot.docs.map(replyDoc => {
              const replyData = replyDoc.data()
              return {
                id: replyDoc.id,
                user: {
                  id: replyData.userId,
                  name: replyData.userName,
                  avatar: replyData.userAvatar || '',
                  role: course && replyData.userId === course.instructor.id ? 'Instructor' : undefined
                },
                content: replyData.content,
                timestamp: replyData.timestamp ? 
                  new Date(replyData.timestamp.toDate()).toLocaleString() : 
                  'Just now',
                likes: replyData.likes || 0
              }
            })
            
            commentsData.push({
              id: commentDoc.id,
              user: {
                id: commentData.userId,
                name: commentData.userName,
                avatar: commentData.userAvatar || '',
                role: course && commentData.userId === course.instructor.id ? 'Instructor' : undefined
              },
              content: commentData.content,
              timestamp: commentData.timestamp ? 
                new Date(commentData.timestamp.toDate()).toLocaleString() : 
                'Just now',
              likes: commentData.likes || 0,
              replies
            })
          }
          
          setComments(commentsData)
          setLoading(false)
        })
        
        return () => unsubscribe()
      } catch (error) {
        console.error("Error fetching course data and comments:", error)
        setLoading(false)
      }
    }
    
    fetchCourseAndComments()
  }, [courseId, lessonId, getCourseById])

  const handleSubmitComment = async () => {
    if (!user || !comment.trim()) return
    
    try {
      setIsSubmitting(true)
      
      // Create the comment
      await addDoc(collection(db, 'lessonComments'), {
        courseId,
        lessonId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        userAvatar: user.photoURL || '',
        content: comment.trim(),
        timestamp: serverTimestamp(),
        likes: 0
      })
      
      // Clear the form
      setComment("")
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async () => {
    if (!user || !replyContent.trim() || !replyingTo) return
    
    try {
      setIsSubmitting(true)
      
      // Create the reply
      await addDoc(collection(db, 'commentReplies'), {
        commentId: replyingTo,
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        userAvatar: user.photoURL || '',
        content: replyContent.trim(),
        timestamp: serverTimestamp(),
        likes: 0
      })
      
      // Clear the form
      setReplyContent("")
      setReplyingTo(null)
    } catch (error) {
      console.error("Error submitting reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!user) return
    
    try {
      const commentRef = doc(db, 'lessonComments', commentId)
      const comment = comments.find(c => c.id === commentId)
      
      if (comment) {
        await updateDoc(commentRef, {
          likes: comment.likes + 1
        })
      }
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  const handleLikeReply = async (commentId: string, replyId: string) => {
    if (!user) return
    
    try {
      const replyRef = doc(db, 'commentReplies', replyId)
      const comment = comments.find(c => c.id === commentId)
      const reply = comment?.replies.find(r => r.id === replyId)
      
      if (reply) {
        await updateDoc(replyRef, {
          likes: reply.likes + 1
        })
      }
    } catch (error) {
      console.error("Error liking reply:", error)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Please log in to participate in discussions</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Discussion</h2>
        <div className="text-sm text-muted-foreground">{comments.length} comments</div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Your profile'} />
              <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                {user.displayName ? user.displayName.charAt(0) : 'U'}
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
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? "Posting..." : "Post Comment"}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Be the first to start a discussion!</p>
            </div>
          ) : (
            comments.map((comment) => (
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1 text-muted-foreground"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{comment.likes}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1 text-muted-foreground"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Reply</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                        <Flag className="h-4 w-4" />
                        <span>Report</span>
                      </Button>
                    </div>
                    
                    {replyingTo === comment.id && (
                      <div className="mt-4 flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Your profile'} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                            {user.displayName ? user.displayName.charAt(0) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder="Write your reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setReplyingTo(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSubmitReply}
                              disabled={isSubmitting || !replyContent.trim()}
                              className="gap-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <MessageSquare className="h-3 w-3" />
                              )}
                              <span>{isSubmitting ? "Posting..." : "Post Reply"}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1 text-muted-foreground"
                              onClick={() => handleLikeReply(comment.id, reply.id)}
                            >
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
            ))
          )}
        </div>
      )}
    </div>
  )
}