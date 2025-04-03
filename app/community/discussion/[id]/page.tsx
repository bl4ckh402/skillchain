"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCommunity } from "@/context/CommunityProvider";
import { useAuth } from "@/context/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Post, Comment } from "@/types/community";
import {
  Heart,
  MessageSquare,
  Share2,
  Flag,
  ArrowLeft,
  ThumbsUp,
  Send,
  MoreHorizontal,
  Paperclip,
  Image as ImageIcon,
  Clock,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { TipTapEditor } from "@/components/tiptap-editor";

export default function DiscussionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getPostById, likePost, getComments, createComment, likeComment } = useCommunity();
  const { user } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch post details
        const postData = await getPostById(id as string);
        setPost(postData);

        // Fetch comments
        const commentsData = await getComments(id as string);
        setComments(commentsData);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch discussion details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, getPostById, getComments]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like this post",
        variant: "destructive",
      });
      return;
    }

    try {
      await likePost(id as string);
      // Update the post local state
      setPost((prev) => 
        prev ? { ...prev, likes: prev.likes + 1 } : null
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to like this post",
        variant: "destructive",
      });
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like this comment",
        variant: "destructive",
      });
      return;
    }

    try {
      await likeComment(commentId);
      // Update the comment state locally
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: comment.likes + 1 } 
            : comment
        )
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to like this comment",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newCommentContent.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingComment(true);
      
      const commentData = {
        postId: id as string,
        content: newCommentContent,
        author: {
          id: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || "",
        },
        likes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const commentId = await createComment(commentData);
      
      // Add the new comment to the state
      setComments(prevComments => [
        ...prevComments, 
        {
          ...commentData,
          id: commentId,
        } as Comment
      ]);
      
      // Clear the form
      setNewCommentContent("");
      if (commentFormRef.current) {
        commentFormRef.current.reset();
      }
      
      toast({
        title: "Success",
        description: "Your comment has been posted",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post your comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (date: Date | string) => {
    // Convert to Date object if it's a string
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Unknown date";
    }
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col w-full gap-4">
            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-32 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Discussion not found
          </h2>
          <p className="text-gray-500 mb-8">
            The discussion you are looking for might have been removed or does not exist.
          </p>
          <Button onClick={() => router.push("/community")}>
            Back to Community
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/community")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Community
      </Button>

      {/* Post Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {post.title}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Link copied",
                    description: "Discussion link copied to clipboard",
                  });
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast({
                    title: "Report submitted",
                    description: "Thank you for reporting this content",
                  });
                }}
              >
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center mb-4">
          <Badge
            variant="secondary"
            className="mr-2 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300"
          >
            {post.category}
          </Badge>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Eye className="h-4 w-4 mr-1" />
            {post.views} views
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-4">
            <Clock className="h-4 w-4 mr-1" />
            {formatDate(post.createdAt)}
          </div>
        </div>

        <div className="flex items-center mb-6">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>
              {post.author.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">
              {post.author.name}
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-slate-100 dark:bg-slate-800"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Post Content */}
      <div className="mb-8 prose dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Attachments</h3>
          <div className="flex flex-wrap gap-3">
            {post.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  attachment.type === "image"
                    ? "w-24 h-24 relative overflow-hidden"
                    : "max-w-xs"
                }`}
              >
                {attachment.type === "image" ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {attachment.type === "document" && (
                      <Paperclip className="h-5 w-5 mr-2 text-blue-500" />
                    )}
                    {attachment.type === "code" && (
                      <div className="h-5 w-5 mr-2 text-green-500">{"{ }"}</div>
                    )}
                    <span className="text-sm truncate">{attachment.name}</span>
                  </>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Interaction Buttons */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className="flex items-center mr-4 text-gray-700 dark:text-gray-300"
        >
          <Heart
            className={`h-5 w-5 mr-1 ${
              post.likes > 0 ? "fill-red-500 text-red-500" : ""
            }`}
          />
          <span>{post.likes}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center mr-4 text-gray-700 dark:text-gray-300"
          onClick={() => {
            const commentSection = document.getElementById("comments-section");
            if (commentSection) {
              commentSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <MessageSquare className="h-5 w-5 mr-1" />
          <span>{comments.length}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center text-gray-700 dark:text-gray-300"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast({
              title: "Link copied",
              description: "Discussion link copied to clipboard",
            });
          }}
        >
          <Share2 className="h-5 w-5 mr-1" />
          <span>Share</span>
        </Button>
      </div>

      <Separator className="my-8" />

      {/* Comments Section */}
      <div id="comments-section" className="mb-8">
        <h2 className="text-2xl font-bold mb-6">
          Comments ({comments.length})
        </h2>

        {/* Comment Form */}
        {user ? (
          <form
            ref={commentFormRef}
            onSubmit={handleSubmitComment}
            className="mb-8"
          >
            <div className="flex items-start mb-4">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                <AvatarFallback>
                  {user.displayName
                    ? user.displayName.substring(0, 2).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  className="w-full min-h-[100px] mb-2"
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  required
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={submittingComment || !newCommentContent.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    {submittingComment ? (
                      "Posting..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-8 text-center">
            <p className="mb-4">Please sign in to join the discussion</p>
            <Button
              onClick={() => router.push("/login")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              Sign In
            </Button>
          </div>
        )}

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white dark:bg-gray-850 rounded-lg p-5 shadow-sm"
              >
                <div className="flex items-start">
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarImage
                      src={comment.author.avatar}
                      alt={comment.author.name}
                    />
                    <AvatarFallback>
                      {comment.author.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">
                          {comment.author.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                        {comment.isEdited && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            (edited)
                          </span>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              toast({
                                title: "Report submitted",
                                description:
                                  "Thank you for reporting this comment",
                              });
                            }}
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-3">
                      {comment.content}
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCommentLike(comment.id as string)}
                        className="flex items-center text-gray-600 dark:text-gray-400"
                      >
                        <ThumbsUp
                          className={`h-4 w-4 mr-1 ${
                            comment.likes > 0
                              ? "fill-blue-500 text-blue-500"
                              : ""
                          }`}
                        />
                        <span>{comment.likes}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Be the first to comment on this discussion</p>
          </div>
        )}
      </div>
    </div>
  );
}