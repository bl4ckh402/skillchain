"use client";
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
import { Post } from "@/types/community";
import { EmptyState } from "@/components/empty-state";

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
  } = useCommunity();

  const mappedDiscussions = posts
    .filter((post) => post.type === "discussion")
    .map((post) => ({
      ...post,
      replies: post.comments, // Map comments count to replies for UI
      authorAvatar: post.author.avatar,
      author: post.author.name,
      date: post.createdAt.toLocaleDateString(),
    }));

  const handleJoinEvent = async (eventId: string) => {
    try {
      await registerForEvent(eventId);
    } catch (error) {
      console.error("Failed to join attendinevent:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 py-12">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl">
              <Badge className="mb-2 px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white">
                Community
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-4 text-slate-800 dark:text-slate-100">
                SkillChain Community
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Connect with blockchain enthusiasts, ask questions, and share
                your knowledge
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search discussions..."
                    className="pl-9 bg-background border-purple-100 dark:border-purple-900 h-12"
                  />
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Discussion
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[250px_1fr_300px]">
            <div className="space-y-6">
              <Card className="border-purple-100 dark:border-purple-900">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 rounded-t-lg">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {categories.length > 0 ? (
                      <Link
                        href="/community"
                        className="flex items-center justify-between rounded-md p-2 text-slate-700 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/50 dark:hover:text-purple-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>All Discussions</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                        >
                          {mappedDiscussions.length}
                        </Badge>
                      </Link>
                    ) : (
                      <EmptyState
                        icon={
                          <MessageSquare className="h-10 w-10 text-purple-500" />
                        }
                        title="No Categories"
                        description="Categories will appear here once they are created."
                      />
                    )

                    }
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-100 dark:border-purple-900">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 rounded-t-lg">
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
                            <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                              {contributor.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
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
                        icon={<Users className="h-10 w-10 text-purple-500" />}
                        title="No Contributors Yet"
                        description="Be the first to contribute to our community!"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Discussions
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Discussion
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="latest" className="w-full">
                <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                  <TabsTrigger
                    value="latest"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-purple-600 rounded-md"
                  >
                    Latest
                  </TabsTrigger>
                  <TabsTrigger
                    value="trending"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-purple-600 rounded-md"
                  >
                    Trending
                  </TabsTrigger>
                  <TabsTrigger
                    value="unanswered"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-purple-600 rounded-md"
                  >
                    Unanswered
                  </TabsTrigger>
                  <TabsTrigger
                    value="my-discussions"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-purple-600 rounded-md"
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
                            className={`transition-all hover:shadow-md ${discussion.isPinned
                              ? "border-2 border-purple-300 dark:border-purple-700"
                              : "border-slate-200 dark:border-slate-800"
                              }`}
                          >
                            <CardContent className="p-6">
                              <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      {discussion.isPinned && (
                                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                          <Pin className="mr-1 h-3 w-3" />
                                          Pinned
                                        </Badge>
                                      )}
                                      {discussion.isHot && (
                                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                          <TrendingUp className="mr-1 h-3 w-3" />
                                          Hot
                                        </Badge>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className="border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400"
                                      >
                                        {discussion.category}
                                      </Badge>
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
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
                                          className="font-normal text-purple-700 bg-purple-100 hover:bg-purple-200 dark:text-purple-300 dark:bg-purple-900 dark:hover:bg-purple-800"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 text-sm">
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                      <MessageCircle className="h-4 w-4 text-purple-500" />
                                      <span>{discussion.replies} replies</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                      <Eye className="h-4 w-4 text-blue-500" />
                                      <span>{discussion.views} views</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                      <Heart className="h-4 w-4 text-red-500" />
                                      <span>{discussion.likes} likes</span>
                                    </div>
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={discussion.authorAvatar}
                                        alt={discussion.author}
                                      />
                                      <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                        {discussion.author.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                      <span className="font-medium text-slate-700 dark:text-slate-300">
                                        {discussion.author}
                                      </span>
                                      <span className="text-slate-500 dark:text-slate-400">
                                        {" "}
                                        • {discussion.date}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                    >
                                      <Bookmark className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
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
                        <MessageSquare className="h-10 w-10 text-purple-500" />
                      }
                      title="No Discussions Yet"
                      description="Be the first to start a discussion in our community!"
                    />
                  )}
                </TabsContent>

                <TabsContent value="trending" className="mt-0">
                  <div className="space-y-4">
                    {mappedDiscussions
                      .filter((d) => d.isHot)
                      .map((discussion) => (
                        <Link
                          href={`/community/discussion/${discussion.id}`}
                          key={discussion.id}
                        >
                          <Card
                            className={`transition-all hover:shadow-md ${discussion.isPinned
                              ? "border-2 border-purple-300 dark:border-purple-700"
                              : "border-slate-200 dark:border-slate-800"
                              }`}
                          >
                            <CardContent className="p-6">
                              <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      {discussion.isPinned && (
                                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                          <Pin className="mr-1 h-3 w-3" />
                                          Pinned
                                        </Badge>
                                      )}
                                      {discussion.isHot && (
                                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                          <TrendingUp className="mr-1 h-3 w-3" />
                                          Hot
                                        </Badge>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className="border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400"
                                      >
                                        {discussion.category}
                                      </Badge>
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
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
                                          className="font-normal text-purple-700 bg-purple-100 hover:bg-purple-200 dark:text-purple-300 dark:bg-purple-900 dark:hover:bg-purple-800"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 text-sm">
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                      <MessageCircle className="h-4 w-4 text-purple-500" />
                                      <span>{discussion.replies} replies</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                      <Eye className="h-4 w-4 text-blue-500" />
                                      <span>{discussion.views} views</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                      <Heart className="h-4 w-4 text-red-500" />
                                      <span>{discussion.likes} likes</span>
                                    </div>
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={discussion.authorAvatar}
                                        alt={discussion.author}
                                      />
                                      <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                        {discussion.author.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                      <span className="font-medium text-slate-700 dark:text-slate-300">
                                        {discussion.author}
                                      </span>
                                      <span className="text-slate-500 dark:text-slate-400">
                                        {" "}
                                        • {discussion.date}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                    >
                                      <Bookmark className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="unanswered" className="mt-0">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-6">
                      <MessageSquare className="h-10 w-10 text-purple-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
                      No unanswered discussions
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                      All discussions have been answered. Check back later or
                      start a new discussion.
                    </p>
                    <Button className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Discussion
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="my-discussions" className="mt-0">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-6">
                      <MessageCircle className="h-10 w-10 text-purple-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
                      No discussions yet
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                      You haven't started any discussions yet. Start a new
                      discussion to engage with the community.
                    </p>
                    <Button className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Discussion
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6 hidden lg:block">
              <Card className="border-purple-100 dark:border-purple-900">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 rounded-t-lg">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((attendinevent, index) => (
                        <div key={index} className="space-y-2">
                          <h3 className="font-medium text-slate-800 dark:text-slate-200">
                            {attendinevent.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span>
                              {attendinevent.date?.toString()},{" "}
                              {attendinevent.time?.toString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>{attendinevent.participants} participants</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                          >
                            Join CommunityEvent
                          </Button>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        icon={<Calendar className="h-10 w-10 text-purple-500" />}
                        title="No Upcoming Events"
                        description="Stay tuned for upcoming community events!"
                        // action={{
                        //   label: "Create Event",
                        //   onClick: () => {/* Add your logic here */ }
                        // }}
                      />
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                  >
                    View All Events
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-purple-100 dark:border-purple-900">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 rounded-t-lg">
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
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                  >
                    Read Full Guidelines
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
