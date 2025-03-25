"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Footer } from "@/components/footer"
import { Calendar, MapPin, Trophy, Users, Search, Rocket, Clock, Award } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useHackathons } from "@/context/HackathonContext"
import { Project } from "@/types/project"
import { useProjects } from "@/context/ProjectContext"
import { EmptyState } from "@/components/empty-state"

export default function HackathonsPage() {
  const { hackathons, loading, filters, setFilters, getHackathons } = useHackathons()
  const [searchQuery, setSearchQuery] = useState("")
  const [pastWinners, setPastWinners] = useState<Project[]>([])
  const [loadingWinners, setLoadingWinners] = useState(false)
  const { getWinningProjects } = useProjects()

  useEffect(() => {
    loadHackathons()
    loadWinners()
  }, [filters])


  const loadWinners = async () => {
    setLoadingWinners(true)
    try {
      const winningProjects = await getWinningProjects(3) // Get top 3 winners
      setPastWinners(winningProjects)
    } catch (error) {
      console.error('Failed to load winners:', error)
    } finally {
      setLoadingWinners(false)
    }
  }

  const loadHackathons = async () => {
    try {
      await getHackathons(filters)
    } catch (error) {
      console.error('Failed to load hackathons:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, search: searchQuery })
  }

  // const pastWinners = [
  //   {
  //     id: 1,
  //     project: "DeFi Aggregator Protocol",
  //     team: "BlockWizards",
  //     hackathon: "DeFi Summer Hackathon",
  //     description:
  //       "A protocol that aggregates liquidity from multiple DeFi platforms to provide the best rates for users.",
  //     image: "/images/projects/defi-aggregator.jpg",
  //   },
  //   {
  //     id: 2,
  //     project: "Decentralized Identity Solution",
  //     team: "ChainID",
  //     hackathon: "Web3 Identity Hackathon",
  //     description:
  //       "A privacy-focused identity solution that gives users control over their personal data using zero-knowledge proofs.",
  //     image: "/images/projects/decentralized-identity.jpg",
  //   },
  //   {
  //     id: 3,
  //     project: "Cross-Chain NFT Bridge",
  //     team: "BridgeBuilders",
  //     hackathon: "NFT Innovation Challenge",
  //     description:
  //       "A bridge that allows NFTs to be transferred between different blockchain networks while preserving their provenance.",
  //     image: "/images/projects/nft-bridge.jpg",
  //   },
  // ]

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 py-12">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <Badge className="mb-2 px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white">
                Web3 Competitions
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-4 text-slate-800 dark:text-slate-100">
                Blockchain Hackathons
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Participate, build, innovate, and win prizes with the global blockchain community
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mx-auto justify-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search hackathons..."
                    className="pl-9 bg-background border-purple-100 dark:border-purple-900 h-12"
                  />
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Find Hackathons
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex flex-col gap-6">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-purple-600 rounded-md"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-purple-600 rounded-md"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-purple-600 rounded-md"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="my-hackathons"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-purple-600 rounded-md"
                >
                  My Hackathons
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-0 w-full">
                {hackathons
                  .filter((h) => h.status === "active").length > 0 ? (
                  hackathons.map((hackathon) => (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <Link href={`/hackathons/${hackathon.id}`} key={hackathon.id} className="group">
                        <Card
                          className={`overflow-hidden transition-all hover:shadow-lg ${hackathon.featured ? "border-2 border-purple-300 dark:border-purple-700" : "border-slate-200 dark:border-slate-800"}`}
                        >
                          <div className="aspect-video w-full overflow-hidden relative">
                            <img
                              src={hackathon.image || "/placeholder.svg"}
                              alt={hackathon.title}
                              className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                            {hackathon.featured && (
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                                  Featured
                                </Badge>
                              </div>
                            )}
                          </div>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Active</Badge>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4 text-amber-500 fill-amber-500" />
                                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                  {hackathon.prizePool}
                                </span>
                              </div>
                            </div>
                            <CardTitle className="line-clamp-1 text-xl text-slate-800 dark:text-slate-200">
                              {hackathon.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={hackathon.logo} alt={hackathon.organizer} />
                                <AvatarFallback className="text-[8px] bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                  {hackathon.organizer.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{hackathon.organizer}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                              {hackathon.description}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-medium">{hackathon.progress}%</span>
                              </div>
                              <Progress
                                value={hackathon.progress}
                                className="h-2 bg-slate-100 dark:bg-slate-800"
                                indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                              />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {hackathon.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="font-normal text-purple-700 bg-purple-100 hover:bg-purple-200 dark:text-purple-300 dark:bg-purple-900 dark:hover:bg-purple-800"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span>
                                {hackathon.startDate.toLocaleDateString()} - {hackathon.endDate.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span>{hackathon.participants} participants</span>
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={<Rocket className="h-10 w-10 text-purple-500" />}
                    title="No Active Hackathons"
                    description="There are no ongoing hackathons at the moment. Check out upcoming hackathons or browse past events."

                  />
                )
                }
              </TabsContent>

              <TabsContent value="upcoming" className="mt-0">
                {hackathons
                  .filter((h) => h.status === "upcoming").length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {hackathons.map((hackathon) => (
                      <Link href={`/hackathons/${hackathon.id}`} key={hackathon.id} className="group">
                        <Card
                          className={`overflow-hidden transition-all hover:shadow-lg ${hackathon.featured ? "border-2 border-purple-300 dark:border-purple-700" : "border-slate-200 dark:border-slate-800"}`}
                        >
                          <div className="aspect-video w-full overflow-hidden relative">
                            <img
                              src={hackathon.image || "/placeholder.svg"}
                              alt={hackathon.title}
                              className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                            {hackathon.featured && (
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                                  Featured
                                </Badge>
                              </div>
                            )}
                          </div>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className="text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-800"
                              >
                                Upcoming
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4 text-amber-500 fill-amber-500" />
                                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                  {hackathon.prizePool}
                                </span>
                              </div>
                            </div>
                            <CardTitle className="line-clamp-1 text-xl text-slate-800 dark:text-slate-200">
                              {hackathon.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={hackathon.logo} alt={hackathon.organizer} />
                                <AvatarFallback className="text-[8px] bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                  {hackathon.organizer.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{hackathon.organizer}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                              {hackathon.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {hackathon.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="font-normal text-purple-700 bg-purple-100 hover:bg-purple-200 dark:text-purple-300 dark:bg-purple-900 dark:hover:bg-purple-800"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span>
                                {hackathon.startDate.toLocaleDateString()} - {hackathon.endDate.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span>{hackathon.location}</span>
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Clock className="h-10 w-10 text-purple-500" />}
                    title="No Upcoming Hackathons"
                    description="Stay tuned! New hackathons are being planned and will be announced soon."
                  />
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                {hackathons
                  .filter((h) => h.status === "completed").length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {hackathons.map((hackathon) => (
                      <Link href={`/hackathons/${hackathon.id}`} key={hackathon.id} className="group">
                        <Card
                          className={`overflow-hidden transition-all hover:shadow-lg ${hackathon.featured ? "border-2 border-purple-300 dark:border-purple-700" : "border-slate-200 dark:border-slate-800"}`}
                        >
                          <div className="aspect-video w-full overflow-hidden relative">
                            <img
                              src={hackathon.image || "/placeholder.svg"}
                              alt={hackathon.title}
                              className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                            {hackathon.featured && (
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                                  Featured
                                </Badge>
                              </div>
                            )}
                          </div>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className="text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-800"
                              >
                                Upcoming
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4 text-amber-500 fill-amber-500" />
                                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                  {hackathon.prizePool}
                                </span>
                              </div>
                            </div>
                            <CardTitle className="line-clamp-1 text-xl text-slate-800 dark:text-slate-200">
                              {hackathon.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={hackathon.logo} alt={hackathon.organizer} />
                                <AvatarFallback className="text-[8px] bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                  {hackathon.organizer.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{hackathon.organizer}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                              {hackathon.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {hackathon.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="font-normal text-purple-700 bg-purple-100 hover:bg-purple-200 dark:text-purple-300 dark:bg-purple-900 dark:hover:bg-purple-800"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span>
                                {hackathon.startDate.toLocaleDateString()} - {hackathon.endDate.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span>{hackathon.location}</span>
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Award className="h-10 w-10 text-purple-500" />}
                    title="No Past Hackathons"
                    description="Check back later to see completed hackathons and their winning projects."
                  />
                )}
              </TabsContent>

              <TabsContent value="my-hackathons" className="mt-0">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-6">
                    <Trophy className="h-10 w-10 text-purple-500" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">No hackathons yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    You haven't registered for any hackathons yet. Browse active and upcoming hackathons to get started.
                  </p>
                  <Button className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    Browse Hackathons
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Past Winners Showcase</h2>
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                >
                  View All Winners
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {pastWinners.length > 0 ? (
                  pastWinners.map((winner) => (
                    <Card key={winner.id} className="border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div className="aspect-video w-full overflow-hidden">
                        {winner.images.length > 0 && (
                          <img
                            src={winner.images[0] || "/placeholder.svg"}
                            alt={winner.title}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className="bg-amber-100/80 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                          >
                            <Trophy className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" />
                            Winner
                          </Badge>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400">{winner.hackathonTitle}</span>
                        </div>
                        <CardTitle className="line-clamp-1 text-slate-800 dark:text-slate-200">
                          {winner.title}
                        </CardTitle>
                        <CardDescription>
                          by <span className="text-purple-600 dark:text-purple-400 font-medium">{winner.team}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{winner.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950 dark:hover:text-purple-300"
                        >
                          View Project
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon={<Award className="h-10 w-10 text-purple-500" />}
                    title="No Winners Yet"
                    description="Past hackathon winners will be showcased here. Check back after ongoing hackathons are completed."
                    className="col-span-3"
                  />
                )}
              </div>
            </div>

            <div className="mt-12 rounded-lg border bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 p-6 border-purple-200 dark:border-purple-800">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Organize a Hackathon</h2>
                  <p className="text-muted-foreground">
                    Partner with SkillChain to host your own blockchain hackathon or competition
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Become a Partner
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

