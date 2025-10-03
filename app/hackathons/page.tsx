"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Footer } from "@/components/footer";
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Search,
  Rocket,
  Clock,
  Award,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useHackathons } from "@/context/HackathonContext";
import { Project } from "@/types/project";
import { useProjects } from "@/context/ProjectContext";
import { EmptyState } from "@/components/empty-state";
import { PostHackathonModal } from "@/components/create-hackathon";
import { Hackathon } from "@/types/hackathon";
import type { UserProfile } from "@/types/user";

export default function HackathonsPage() {
  const {
    hackathons,
    loading,
    filters,
    setFilters,
    getHackathons,
    updateHackathon,
    deleteHackathon,
  } = useHackathons();
  const [searchQuery, setSearchQuery] = useState("");
  const [pastWinners, setPastWinners] = useState<Project[]>([]);
  const [loadingWinners, setLoadingWinners] = useState(false);
  const { user } = useAuth();
  const { getWinningProjects } = useProjects();

  useEffect(() => {
    loadHackathons();
    loadWinners();
  }, [filters]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const loadWinners = async () => {
    setLoadingWinners(true);
    try {
      const winningProjects = await getWinningProjects(3); // Get top 3 winners
      setPastWinners(winningProjects);
    } catch (error) {
      console.error("Failed to load winners:", error);
    } finally {
      setLoadingWinners(false);
    }
  };

  const loadHackathons = async () => {
    try {
      await getHackathons(filters);
    } catch (error) {
      console.error("Failed to load hackathons:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchQuery });
  };
  // const { user } = useAuth(); // (Already declared above, so this line is removed)

  function openEditModal(hackathon: Hackathon): void {
    throw new Error("Function not implemented.");
  }
  function formatDate(date: string | Date | undefined): string {
    if (!date) return "N/A";
    try {
      if (
        typeof date === "object" &&
        "toDate" in date &&
        typeof date.toDate === "function"
      ) {
        return date.toDate().toLocaleDateString();
      }
      const d = new Date(date);
      return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
    } catch {
      return "N/A";
    }
  }

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        {/* Hero section - Made responsive with improved mobile layout */}
        <div className="py-8 sm:py-12 bg-gradient-to-r from-green-500/10 to-green-500/10 dark:from-green-900/20 dark:to-green-900/20">
          <div className="container flex justify-end py-4">
            <Button onClick={() => setShowCreateModal(true)}>
              Create Hackathon
            </Button>
          </div>
          <div className="container px-4 md:px-6">
            {/* Reduced max-width for better mobile readability */}
            <div className="max-w-4xl mx-auto text-center">
              {/* Responsive badge with smaller text on mobile */}
              <Badge className="px-2 py-1 mb-2 text-xs text-white bg-green-500 sm:px-3 sm:py-1 sm:text-sm hover:bg-green-600">
                Web3 Competitions
              </Badge>
              {/* Responsive heading with improved mobile sizing */}
              <h1 className="mb-4 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl text-slate-800 dark:text-slate-100">
                Blockchain Hackathons
              </h1>
              {/* Responsive description with adjusted mobile text size */}
              <p className="px-4 mb-6 text-base sm:text-lg text-muted-foreground sm:px-0">
                Participate, build, innovate, and win prizes with the global
                blockchain community
              </p>
              {/* Improved mobile layout for search and button */}
              <div className="flex flex-col gap-3 mx-auto sm:flex-row sm:justify-center">
                <div className="relative flex-1 max-w-md mx-auto sm:mx-0">
                  <Search className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search hackathons..."
                    className="h-10 border-green-100 sm:h-12 pl-9 bg-background dark:border-green-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <PostHackathonModal
                  open={showCreateModal}
                  onCloseAction={() => setShowCreateModal(false)}
                />

                <Button
                  size="lg"
                  className="h-10 text-white bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 sm:h-12"
                  onClick={handleSearch}
                >
                  Find Hackathons
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content container with responsive padding */}
        <div className="container px-4 py-6 sm:py-8 sm:px-6">
          <div className="flex flex-col gap-6">
            <Tabs defaultValue="active" className="w-full">
              {/* Responsive tabs with scrollable layout on mobile */}
              <div className="overflow-x-auto">
                <TabsList className="w-full p-1 mb-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 sm:w-auto min-w-max">
                  <TabsTrigger
                    value="active"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-green-600 rounded-md text-sm px-3 sm:px-4"
                  >
                    Active
                  </TabsTrigger>
                  <TabsTrigger
                    value="upcoming"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-green-600 rounded-md text-sm px-3 sm:px-4"
                  >
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-green-600 rounded-md text-sm px-3 sm:px-4"
                  >
                    Completed
                  </TabsTrigger>
                  <TabsTrigger
                    value="my-hackathons"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-green-600 rounded-md text-sm px-2 sm:px-4"
                  >
                    {/* Shortened text for mobile */}
                    <span className="sm:hidden">My Events</span>
                    <span className="hidden sm:inline">My Hackathons</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="active" className="w-full mt-0">
                {hackathons.filter((h) => h.status === "active").length > 0 ? (
                  /* Fixed grid layout - single column on mobile, responsive breakpoints */
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {hackathons
                      .filter((h) => h.status === "active")
                      .map((hackathon) => (
                        <Link
                          href={`/hackathons/${hackathon.id}`}
                          key={hackathon.id}
                          className="group"
                        >
                          <Card
                            className={`overflow-hidden transition-all hover:shadow-lg ${
                              hackathon.featured
                                ? "border-2 border-green-300 dark:border-green-700"
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <div className="relative w-full overflow-hidden aspect-video">
                              <img
                                src={hackathon.image || "/placeholder.svg"}
                                alt={hackathon.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                              />
                              {hackathon.featured && (
                                <div className="absolute top-2 right-2">
                                  <Badge className="text-xs text-white bg-gradient-to-r from-amber-500 to-yellow-500">
                                    Featured
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {/* Responsive card header with adjusted padding */}
                            <CardHeader className="p-4 pb-2 sm:p-6">
                              <div className="flex items-center justify-between">
                                <Badge className="text-xs text-white bg-emerald-500 hover:bg-emerald-600">
                                  Active
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
                                  <span className="text-xs font-medium sm:text-sm text-amber-600 dark:text-amber-400">
                                    {hackathon.prizePool}
                                  </span>
                                </div>
                              </div>
                              {/* Responsive title with better mobile line clamping */}
                              <CardTitle className="text-lg sm:text-xl line-clamp-2 sm:line-clamp-1 text-slate-800 dark:text-slate-200">
                                {hackathon.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Avatar className="w-4 h-4">
                                  <AvatarImage
                                    src={hackathon.logo}
                                    alt={hackathon.organizer}
                                  />
                                  <AvatarFallback className="text-[8px] bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                                    {hackathon.organizer
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs truncate">
                                  {hackathon.organizer}
                                </span>
                              </CardDescription>
                            </CardHeader>
                            {/* Responsive card content with adjusted padding */}
                            <CardContent className="p-4 pt-0 pb-2 sm:p-6">
                              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {hackathon.description}
                              </p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Progress</span>
                                  <span className="font-medium">
                                    {hackathon.progress}%
                                  </span>
                                </div>
                                <Progress
                                  value={hackathon.progress}
                                  className="h-2 bg-slate-100 dark:bg-slate-800"
                                  indicatorClassName="bg-gradient-to-r from-green-500 to-green-500"
                                />
                              </div>
                              {/* Responsive tags with better mobile wrapping */}
                              <div className="flex flex-wrap gap-1 mt-3 sm:gap-2">
                                {hackathon.tags
                                  .slice(0, 3)
                                  .map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs font-normal text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900 dark:hover:bg-green-800"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                {/* Show remaining count on mobile if there are more tags */}
                                {hackathon.tags.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs font-normal text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900 dark:hover:bg-green-800"
                                  >
                                    +{hackathon.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                            {/* Responsive footer with stacked layout on mobile */}
                            <CardFooter className="flex flex-col items-start gap-2 p-4 pt-0 text-xs sm:flex-row sm:items-center sm:gap-0 sm:justify-between sm:text-sm text-slate-500 dark:text-slate-400 sm:p-6">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-green-500 sm:w-4 sm:h-4" />
                                <span className="text-xs">
                                  {formatDate(hackathon.startDate)} -{" "}
                                  {formatDate(hackathon.endDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-green-500 sm:w-4 sm:h-4" />
                                <span className="text-xs">
                                  {hackathon.participants} participants
                                </span>
                              </div>
                              {/* Only show for admins */}
                              {user?.role === "admin" &&
                                hackathon.status === "active" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      try {
                                        await updateHackathon(hackathon.id!, {
                                          status: "completed",
                                        });
                                        await getHackathons(filters); // refresh list
                                      } catch (e) {
                                        alert("Failed to mark as complete");
                                      }
                                    }}
                                  >
                                    Mark as Complete
                                  </Button>
                                )}
                              {user?.role === "admin" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditModal(hackathon)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={async () => {
                                      if (
                                        confirm(
                                          "Are you sure you want to delete this hackathon?"
                                        )
                                      ) {
                                        await deleteHackathon(hackathon.id!);
                                        await getHackathons(filters);
                                      }
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={
                      <Rocket className="w-8 h-8 text-green-500 sm:w-10 sm:h-10" />
                    }
                    title="No Active Hackathons"
                    description="There are no ongoing hackathons at the moment. Check out upcoming hackathons or browse past events."
                  />
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="mt-0">
                {hackathons.filter((h) => h.status === "upcoming").length >
                0 ? (
                  /* Fixed grid layout - single column on mobile, responsive breakpoints */
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {hackathons
                      .filter((h) => h.status === "upcoming")
                      .map((hackathon) => (
                        <Link
                          href={`/hackathons/${hackathon.id}`}
                          key={hackathon.id}
                          className="group"
                        >
                          <Card
                            className={`overflow-hidden transition-all hover:shadow-lg ${
                              hackathon.featured
                                ? "border-2 border-green-300 dark:border-green-700"
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <div className="relative w-full overflow-hidden aspect-video">
                              <img
                                src={hackathon.image || "/placeholder.svg"}
                                alt={hackathon.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                              />
                              {hackathon.featured && (
                                <div className="absolute top-2 right-2">
                                  <Badge className="text-xs text-white bg-gradient-to-r from-amber-500 to-yellow-500">
                                    Featured
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {/* Responsive card layout matching active tab */}
                            <CardHeader className="p-4 pb-2 sm:p-6">
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="outline"
                                  className="text-xs text-green-600 border-green-300 dark:text-green-400 dark:border-green-800"
                                >
                                  Upcoming
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
                                  <span className="text-xs font-medium sm:text-sm text-amber-600 dark:text-amber-400">
                                    {hackathon.prizePool}
                                  </span>
                                </div>
                              </div>
                              <CardTitle className="text-lg sm:text-xl line-clamp-2 sm:line-clamp-1 text-slate-800 dark:text-slate-200">
                                {hackathon.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Avatar className="w-4 h-4">
                                  <AvatarImage
                                    src={hackathon.logo}
                                    alt={hackathon.organizer}
                                  />
                                  <AvatarFallback className="text-[8px] bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                                    {hackathon.organizer
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs truncate">
                                  {hackathon.organizer}
                                </span>
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 pb-2 sm:p-6">
                              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {hackathon.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-3 sm:gap-2">
                                {hackathon.tags
                                  .slice(0, 3)
                                  .map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs font-normal text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900 dark:hover:bg-green-800"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                {hackathon.tags.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs font-normal text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900 dark:hover:bg-green-800"
                                  >
                                    +{hackathon.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start gap-2 p-4 pt-0 text-xs sm:flex-row sm:items-center sm:gap-0 sm:justify-between sm:text-sm text-slate-500 dark:text-slate-400 sm:p-6">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-green-500 sm:w-4 sm:h-4" />
                                <span className="text-xs">
                                  {formatDate(hackathon.startDate)} -{" "}
                                  {formatDate(hackathon.endDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-green-500 sm:w-4 sm:h-4" />
                                <span className="text-xs truncate">
                                  {hackathon.location}
                                </span>
                              </div>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={
                      <Clock className="w-8 h-8 text-green-500 sm:w-10 sm:h-10" />
                    }
                    title="No Upcoming Hackathons"
                    description="Stay tuned! New hackathons are being planned and will be announced soon."
                  />
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                {hackathons.filter((h) => h.status === "completed").length >
                0 ? (
                  /* Fixed grid layout - single column on mobile, responsive breakpoints */
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {hackathons
                      .filter((h) => h.status === "completed")
                      .map((hackathon) => (
                        <Link
                          href={`/hackathons/${hackathon.id}`}
                          key={hackathon.id}
                          className="group"
                        >
                          <Card
                            className={`overflow-hidden transition-all hover:shadow-lg ${
                              hackathon.featured
                                ? "border-2 border-green-300 dark:border-green-700"
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <div className="relative w-full overflow-hidden aspect-video">
                              <img
                                src={hackathon.image || "/placeholder.svg"}
                                alt={hackathon.title}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                              />
                              {hackathon.featured && (
                                <div className="absolute top-2 right-2">
                                  <Badge className="text-xs text-white bg-gradient-to-r from-amber-500 to-yellow-500">
                                    Featured
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {/* Fixed badge to show "Completed" instead of "Upcoming" */}
                            <CardHeader className="p-4 pb-2 sm:p-6">
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="outline"
                                  className="text-xs text-slate-600 border-slate-300 dark:text-slate-400 dark:border-slate-700"
                                >
                                  Completed
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
                                  <span className="text-xs font-medium sm:text-sm text-amber-600 dark:text-amber-400">
                                    {hackathon.prizePool}
                                  </span>
                                </div>
                              </div>
                              <CardTitle className="text-lg sm:text-xl line-clamp-2 sm:line-clamp-1 text-slate-800 dark:text-slate-200">
                                {hackathon.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Avatar className="w-4 h-4">
                                  <AvatarImage
                                    src={hackathon.logo}
                                    alt={hackathon.organizer}
                                  />
                                  <AvatarFallback className="text-[8px] bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                                    {hackathon.organizer
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs truncate">
                                  {hackathon.organizer}
                                </span>
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 pb-2 sm:p-6">
                              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {hackathon.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-3 sm:gap-2">
                                {hackathon.tags
                                  .slice(0, 3)
                                  .map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs font-normal text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900 dark:hover:bg-green-800"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                {hackathon.tags.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs font-normal text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900 dark:hover:bg-green-800"
                                  >
                                    +{hackathon.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start gap-2 p-4 pt-0 text-xs sm:flex-row sm:items-center sm:gap-0 sm:justify-between sm:text-sm text-slate-500 dark:text-slate-400 sm:p-6">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-green-500 sm:w-4 sm:h-4" />
                                <span className="text-xs">
                                  {formatDate(hackathon.startDate)} -{" "}
                                  {formatDate(hackathon.endDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-green-500 sm:w-4 sm:h-4" />
                                <span className="text-xs truncate">
                                  {hackathon.location}
                                </span>
                              </div>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={
                      <Award className="w-8 h-8 text-green-500 sm:w-10 sm:h-10" />
                    }
                    title="No Past Hackathons"
                    description="Check back later to see completed hackathons and their winning projects."
                  />
                )}
              </TabsContent>

              <TabsContent value="my-hackathons" className="mt-0">
                {/* Responsive empty state with adjusted padding */}
                <div className="flex flex-col items-center justify-center px-4 py-8 text-center sm:py-12">
                  <div className="p-4 bg-green-100 rounded-full sm:p-6 dark:bg-green-900/30">
                    <Trophy className="w-8 h-8 text-green-500 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">
                    No hackathons yet
                  </h3>
                  <p className="max-w-sm px-4 mt-2 text-sm text-muted-foreground sm:px-0">
                    You haven't registered for any hackathons yet. Browse active
                    and upcoming hackathons to get started.
                  </p>
                  <Button className="mt-4 text-white bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700">
                    Browse Hackathons
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Past Winners section with responsive layout */}
            <div className="mt-8 sm:mt-12">
              {/* Responsive section header */}
              <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
                <h2 className="text-xl font-bold sm:text-2xl text-slate-800 dark:text-slate-200">
                  Past Winners Showcase
                </h2>
                <Button
                  variant="outline"
                  className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950 dark:hover:text-green-300 sm:w-auto"
                >
                  View All Winners
                </Button>
              </div>
              {/* Responsive winners grid - single column on mobile */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastWinners.length > 0 ? (
                  pastWinners.map((winner) => (
                    <Card
                      key={winner.id}
                      className="overflow-hidden border-slate-200 dark:border-slate-800"
                    >
                      <div className="w-full overflow-hidden aspect-video">
                        {winner.images.length > 0 && (
                          <img
                            src={winner.images[0] || "/placeholder.svg"}
                            alt={winner.title}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      {/* Responsive card header with adjusted padding */}
                      <CardHeader className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-amber-100/80 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                          >
                            <Trophy className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                            Winner
                          </Badge>
                          <span className="ml-2 text-xs text-indigo-600 truncate dark:text-indigo-400">
                            {winner.hackathonTitle}
                          </span>
                        </div>
                        <CardTitle className="text-lg line-clamp-1 text-slate-800 dark:text-slate-200 sm:text-xl">
                          {winner.title}
                        </CardTitle>
                        <CardDescription>
                          by{" "}
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {winner.team}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      {/* Responsive card content with adjusted padding */}
                      <CardContent className="p-4 pt-0 sm:p-6">
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {winner.description}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 sm:p-6">
                        <Button
                          variant="outline"
                          className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950 dark:hover:text-green-300"
                        >
                          View Project
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon={
                      <Award className="w-8 h-8 text-green-500 sm:w-10 sm:h-10" />
                    }
                    title="No Winners Yet"
                    description="Past hackathon winners will be showcased here. Check back after ongoing hackathons are completed."
                    className="col-span-full"
                  />
                )}
              </div>
            </div>

            {/* Call-to-action section with responsive layout */}
            <div className="p-4 mt-8 border border-green-200 rounded-lg sm:p-6 sm:mt-12 bg-gradient-to-br from-green-500/10 to-green-500/10 dark:from-green-900/20 dark:to-green-900/20 dark:border-green-800">
              {/* Responsive CTA content - stacked on mobile, side-by-side on desktop */}
              <div className="flex flex-col items-center justify-between gap-4 text-center sm:items-start md:flex-row sm:text-left">
                <div>
                  <h2 className="text-lg font-bold sm:text-xl text-slate-800 dark:text-slate-200">
                    Organize a Hackathon
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Partner with SkillChain to host your own blockchain
                    hackathon or competition
                  </p>
                </div>
                <Button className="w-full text-white bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 sm:w-auto">
                  Become a Partner
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
