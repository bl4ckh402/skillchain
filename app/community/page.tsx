"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";
import {
  Search,
  MessageSquare,
  Users,
  Eye,
  Calendar,
  Filter,
  PlusCircle,
  TrendingUp,
  Bookmark,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Pin,
  Award,
} from "lucide-react";
import { useCommunity } from "@/context/CommunityProvider";
import { useAuth } from "@/context/AuthProvider";
import { Post } from "@/types/community";
import { EmptyState } from "@/components/empty-state";
import { NewDiscussionModal } from "@/components/new-discussion";
import { toast } from "@/components/ui/use-toast";

const mapDiscussionToPost = (discussion: any): Post => ({
  id: discussion.id,
  title: discussion.title,
  content: discussion.preview, // Full content would be loaded in detail view
  preview: discussion.preview,
  author: {
    id: discussion.authorId || "unknown",
    name: discussion.author,
    avatar: discussion.authorAvatar,
  },
  tags: discussion.tags,
  likes: discussion.likes,
  comments: discussion.replies,
  views: discussion.views,
  category: discussion.category,
  type: "discussion",
  status: "published",
  isPinned: discussion.isPinned,
  isHot: discussion.isHot,
  createdAt: new Date(discussion.date), // Convert relative date to actual date
  updatedAt: new Date(discussion.date),
});

export default function CommunityPage() {
  const {
    posts,
    categories,
    topContributors,
    upcomingEvents,
    registerForEvent,
    getPosts,
  } = useCommunity();
  const { user } = useAuth();
  const [isNewDiscussionModalOpen, setIsNewDiscussionModalOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch posts when the component mounts
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      await getPosts({ sortBy: "latest" });
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  };

  const mappedDiscussions = posts
    .filter((post) => post.type === "discussion")
    .map((post) => ({
      ...post,
      replies: post.comments, // Map comments count to replies for UI
      authorAvatar: post.author.avatar,
      author: post.author.name,
      date: post.createdAt
        ? typeof post.createdAt === "object" &&
          post.createdAt !== null &&
          "timestamp" in post.createdAt &&
          "nanoseconds" in post.createdAt &&
          typeof (post.createdAt as { timestamp: unknown }).timestamp === "number" &&
          typeof (post.createdAt as { nanoseconds: unknown }).nanoseconds === "number"
          ? new Date(
              (post.createdAt as { timestamp: number; nanoseconds: number }).timestamp * 1000 +
                (post.createdAt as { timestamp: number; nanoseconds: number }).nanoseconds / 1000000
            )
          : new Date(post.createdAt)
        : new Date(),
    }));

  const handleJoinEvent = async (eventId: string) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to join this event.",
          variant: "destructive",
        });
        return;
      }

      await registerForEvent(eventId);

      toast({
        title: "Success",
        description: "You have successfully registered for this event.",
      });
    } catch (error) {
      console.error("Failed to join event:", error);
      toast({
        title: "Error",
        description: "Failed to register for this event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    if (searchQuery.trim()) {
      getPosts({ search: searchQuery });
    }
  };

  const openNewDiscussionModal = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a discussion.",
        variant: "destructive",
      });
      return;
    }

    setIsNewDiscussionModalOpen(true);
  };

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl">
              <Badge className="px-3 py-1 mb-2 text-sm text-white bg-blue-900 hover:bg-slate-600">
                Community
              </Badge>
              <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-slate-800 dark:text-slate-100">
                SkillChain Community
              </h1>
              <p className="mb-6 text-lg text-muted-foreground">
                Connect with blockchain enthusiasts, ask questions, and share
                your knowledge
              </p>
              <form
                onSubmit={handleSearch}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Search className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search discussions..."
                    className="h-12 border-blue-100 pl-9 bg-background dark:border-slate-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  size="lg"
                  className="text-white bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-500"
                  onClick={openNewDiscussionModal}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Discussion
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[250px_1fr_300px]">
            <div className="space-y-6">
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/50 dark:to-blue-950/50">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {categories.length > 0 ? (
                      <>
                        <Link
                          href="/community"
                          className="flex items-center justify-between p-2 transition-colors rounded-md text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>All Discussions</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
                          >
                            {mappedDiscussions.length}
                          </Badge>
                        </Link>

                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center justify-between p-2 transition-colors rounded-md text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                          >
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              <span>{category.name}</span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
                            >
                              {category.count}
                            </Badge>
                          </div>
                        ))}
                      </>
                    ) : (
                      <EmptyState
                        icon={
                          <MessageSquare className="w-10 h-10 text-blue-500" />
                        }
                        title="No Categories"
                        description="Categories will appear here once they are created."
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/50 dark:to-blue-950/50">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {topContributors.length > 0 ? (
                      topContributors.map((contributor, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={contributor.avatar}
                              alt={contributor.name}
                            />
                            <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                              {contributor.name?.charAt(0)!}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-slate-800 dark:text-slate-200">
                              {contributor.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span>{contributor.posts} posts</span>
                              <span>•</span>
                              <span>{contributor.reputation} rep</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        icon={<Users className="w-10 h-10 text-blue-500" />}
                        title="No Contributors Yet"
                        description="Be the first to contribute to our community!"
                      />
                    )}
                  </div>
                </CardContent>
              </Card> */}
            </div>

            <div>
              <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Discussions
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button
                    size="sm"
                    className="text-white bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
                    onClick={openNewDiscussionModal}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    New Discussion
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="latest" className="w-full">
                <TabsList className="p-1 mb-4 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                  <TabsTrigger
                    value="latest"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                    onClick={() => getPosts({ sortBy: "latest" })}
                  >
                    Latest
                  </TabsTrigger>
                  <TabsTrigger
                    value="trending"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                    onClick={() => getPosts({ sortBy: "popular" })}
                  >
                    Trending
                  </TabsTrigger>
                  <TabsTrigger
                    value="unanswered"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                    onClick={() => getPosts({ sortBy: "unanswered" })}
                  >
                    Unanswered
                  </TabsTrigger>
                  <TabsTrigger
                    value="my-discussions"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                  >
                    My Discussions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="latest" className="mt-0">
                  {mappedDiscussions.length > 0 ? (
                    <div className="space-y-4">
                      {mappedDiscussions.map((discussion) => (
                        <Link
                          href={`/community/discussion/${discussion.id}`}
                          key={discussion.id}
                        >
                          <Card
                            className={`transition-all hover:shadow-md ${
                              discussion.isPinned
                                ? "border-2 border-blue-300 dark:border-blue-700"
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <CardContent className="p-6">
                              <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      {discussion.isPinned && (
                                        <Badge className="text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                          <Pin className="w-3 h-3 mr-1" />
                                          Pinned
                                        </Badge>
                                      )}
                                      {discussion.isHot && (
                                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                          <TrendingUp className="w-3 h-3 mr-1" />
                                          Hot
                                        </Badge>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className="text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400"
                                      >
                                        {discussion.category}
                                      </Badge>
                                    </div>
                                    <h3 className="text-xl font-bold transition-colors text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">
                                      {discussion.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                      {discussion.preview}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {discussion.tags.map((tag, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 text-sm">
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                      <MessageCircle className="w-4 h-4 text-blue-500" />
                                      <span>
                                        {discussion.replies.length} replies
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                      <Eye className="w-4 h-4 text-blue-500" />
                                      <span>{discussion.views} views</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                      <Heart className="w-4 h-4 text-red-500" />
                                      <span>{discussion.likes} likes</span>
                                    </div>
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage
                                        src={discussion.authorAvatar}
                                        alt={discussion.author}
                                      />
                                      <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                        {discussion.author.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                      <span className="font-medium text-slate-700 dark:text-slate-300">
                                        {discussion.author}
                                      </span>
                                      <span className="text-slate-500 dark:text-slate-400">
                                        {" "}
                                        • {discussion.date.toDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                    >
                                      <Share2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                    >
                                      <Bookmark className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={
                        <MessageSquare className="w-10 h-10 text-blue-500" />
                      }
                      title="No Discussions Yet"
                      description="Be the first to start a discussion in our community!"
                      action={{
                        label: "New Discussion",
                        onClick: openNewDiscussionModal,
                      }}
                    />
                  )}
                </TabsContent>

                <TabsContent value="trending" className="mt-0">
                  <div className="space-y-4">
                    {mappedDiscussions.filter((d) => d.isHot).length > 0 ? (
                      mappedDiscussions
                        .filter((d) => d.isHot)
                        .map((discussion) => (
                          <Link
                            href={`/community/discussion/${discussion.id}`}
                            key={discussion.id}
                          >
                            <Card
                              className={`transition-all hover:shadow-md ${
                                discussion.isPinned
                                  ? "border-2 border-blue-300 dark:border-blue-700"
                                  : "border-slate-200 dark:border-slate-800"
                              }`}
                            >
                              <CardContent className="p-6">
                                <div className="flex flex-col gap-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                        {discussion.isPinned && (
                                          <Badge className="text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                            <Pin className="w-3 h-3 mr-1" />
                                            Pinned
                                          </Badge>
                                        )}
                                        {discussion.isHot && (
                                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Hot
                                          </Badge>
                                        )}
                                        <Badge
                                          variant="outline"
                                          className="text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400"
                                        >
                                          {discussion.category}
                                        </Badge>
                                      </div>
                                      <h3 className="text-xl font-bold transition-colors text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">
                                        {discussion.title}
                                      </h3>
                                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                        {discussion.preview}
                                      </p>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {discussion.tags.map((tag, index) => (
                                          <Badge
                                            key={index}
                                            variant="secondary"
                                            className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-sm">
                                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <MessageCircle className="w-4 h-4 text-blue-500" />
                                        <span>
                                          {discussion.replies.length} replies
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <Eye className="w-4 h-4 text-blue-500" />
                                        <span>{discussion.views} views</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <Heart className="w-4 h-4 text-red-500" />
                                        <span>{discussion.likes} likes</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Separator />
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-8 h-8">
                                        <AvatarImage
                                          src={discussion.authorAvatar}
                                          alt={discussion.author}
                                        />
                                        <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                          {discussion.author.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                          {discussion.author}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400">
                                          {" "}
                                          •{" "}
                                          {discussion.date.toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                      >
                                        <Share2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                      >
                                        <Bookmark className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))
                    ) : (
                      <EmptyState
                        icon={
                          <TrendingUp className="w-10 h-10 text-blue-500" />
                        }
                        title="No Trending Discussions"
                        description="Check back later for trending discussions or start a new discussion that might become popular."
                        action={{
                          label: "New Discussion",
                          onClick: openNewDiscussionModal,
                        }}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="unanswered" className="mt-0">
                  {mappedDiscussions.filter((d) => d.replies.length === 0)
                    .length > 0 ? (
                    <div className="space-y-4">
                      {mappedDiscussions
                        .filter((d) => d.replies.length === 0)
                        .map((discussion) => (
                          <Link
                            href={`/community/discussion/${discussion.id}`}
                            key={discussion.id}
                          >
                            <Card className="transition-all hover:shadow-md border-slate-200 dark:border-slate-800">
                              <CardContent className="p-6">
                                {/* Discussion content */}
                                <div className="flex flex-col gap-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400"
                                        >
                                          {discussion.category}
                                        </Badge>
                                      </div>
                                      <h3 className="text-xl font-bold transition-colors text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">
                                        {discussion.title}
                                      </h3>
                                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                        {discussion.preview}
                                      </p>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {discussion.tags.map((tag, index) => (
                                          <Badge
                                            key={index}
                                            variant="secondary"
                                            className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-sm">
                                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <MessageCircle className="w-4 h-4 text-blue-500" />
                                        <span>0 replies</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <Eye className="w-4 h-4 text-blue-500" />
                                        <span>{discussion.views} views</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <Heart className="w-4 h-4 text-red-500" />
                                        <span>{discussion.likes} likes</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Separator />
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-8 h-8">
                                        <AvatarImage
                                          src={discussion.authorAvatar}
                                          alt={discussion.author}
                                        />
                                        <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                          {discussion.author.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                          {discussion.author}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400">
                                          {" "}
                                          • {discussion.date instanceof Date ? discussion.date.toLocaleDateString() : discussion.date}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                      >
                                        <Share2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                      >
                                        <Bookmark className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="p-6 bg-blue-100 rounded-full dark:bg-blue-900/30">
                        <MessageSquare className="w-10 h-10 text-blue-500" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
                        No unanswered discussions
                      </h3>
                      <p className="max-w-sm mt-2 text-sm text-muted-foreground">
                        All discussions have been answered. Check back later or
                        start a new discussion.
                      </p>
                      <Button
                        className="mt-4 text-white bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
                        onClick={openNewDiscussionModal}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        New Discussion
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="my-discussions" className="mt-0">
                  {user &&
                  mappedDiscussions.filter((d) => d.author === user.uid)
                    .length > 0 ? (
                    <div className="space-y-4">
                      {mappedDiscussions
                        .filter((d) => d.author === user.uid)
                        .map((discussion) => (
                          <Link
                            href={`/community/discussion/${discussion.id}`}
                            key={discussion.id}
                          >
                            <Card className="transition-all hover:shadow-md border-slate-200 dark:border-slate-800">
                              <CardContent className="p-6">
                                {/* Discussion content */}
                                <div className="flex flex-col gap-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400"
                                        >
                                          {discussion.category}
                                        </Badge>
                                      </div>
                                      <h3 className="text-xl font-bold transition-colors text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">
                                        {discussion.title}
                                      </h3>
                                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                        {discussion.preview}
                                      </p>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {discussion.tags.map((tag, index) => (
                                          <Badge
                                            key={index}
                                            variant="secondary"
                                            className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-sm">
                                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <MessageCircle className="w-4 h-4 text-blue-500" />
                                        <span>
                                          {discussion.replies.length} replies
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <Eye className="w-4 h-4 text-blue-500" />
                                        <span>{discussion.views} views</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <Heart className="w-4 h-4 text-red-500" />
                                        <span>{discussion.likes} likes</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Separator />
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">
                                          Posted on {discussion.date instanceof Date ? discussion.date.toLocaleDateString() : discussion.date}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                      >
                                        <Share2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="p-6 bg-blue-100 rounded-full dark:bg-blue-900/30">
                        <MessageCircle className="w-10 h-10 text-blue-500" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
                        No discussions yet
                      </h3>
                      <p className="max-w-sm mt-2 text-sm text-muted-foreground">
                        {user
                          ? "You haven't started any discussions yet. Start a new discussion to engage with the community."
                          : "Sign in to create discussions and see your posts here."}
                      </p>
                      <Button
                        className="mt-4 text-white bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
                        onClick={openNewDiscussionModal}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        New Discussion
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="hidden space-y-6 lg:block">
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/50 dark:to-blue-950/50">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event, index) => (
                        <div key={index} className="space-y-2">
                          <h3 className="font-medium text-slate-800 dark:text-slate-200">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>
                              {typeof event.date === "string"
                                ? event.date
                                : (event.date instanceof Date
                                    ? event.date.toLocaleDateString()
                                    : typeof event.date.toDate === "function"
                                      ? event.date.toDate().toLocaleDateString()
                                      : "")}
                              , {event.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span>{event.participants} participants</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                            onClick={() => handleJoinEvent(event.id)}
                          >
                            Join Event
                          </Button>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        icon={<Calendar className="w-10 h-10 text-blue-500" />}
                        title="No Upcoming Events"
                        description="Stay tuned for upcoming community events!"
                      />
                    )}
                  </div>
                </CardContent>
                {/* <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  >
                    View All Events
                  </Button>
                </CardFooter> */}
              </Card>

              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/50 dark:to-blue-950/50">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    Community Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <p>• Be respectful and considerate of others</p>
                    <p>• Stay on topic and avoid spam</p>
                    <p>• No promotion of scams or fraudulent projects</p>
                    <p>• Provide constructive feedback</p>
                    <p>• Respect intellectual property rights</p>
                  </div>
                </CardContent>
                {/* <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                  >
                    Read Full Guidelines
                  </Button>
                </CardFooter> */}
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* New Discussion Modal */}
      <NewDiscussionModal
        open={isNewDiscussionModalOpen}
        onClose={() => setIsNewDiscussionModalOpen(false)}
      />
    </div>
  );
}
