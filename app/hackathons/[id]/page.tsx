import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Footer } from "@/components/footer"
import { Calendar, MapPin, Trophy, Users, Clock, ChevronLeft, Globe, FileText, MessageSquare } from "lucide-react"

export default function HackathonDetailPage({ params }: { params: { id: string } }) {
  // This would normally be fetched from an API
  const hackathon = {
    id: params.id,
    title: "DeFi Innovation Challenge",
    organizer: "Ethereum Foundation",
    logo: "/placeholder.svg?height=80&width=80",
    website: "https://ethereum.org",
    startDate: "Aug 15, 2023",
    endDate: "Sep 15, 2023",
    location: "Online",
    participants: 1245,
    prizePool: "$50,000",
    status: "active",
    tags: ["DeFi", "Ethereum", "Smart Contracts", "Finance", "Web3"],
    description: `
      <p>The DeFi Innovation Challenge is a month-long virtual hackathon focused on building the next generation of decentralized finance applications on Ethereum. We're looking for innovative solutions that address real-world financial problems and expand the capabilities of the DeFi ecosystem.</p>
      
      <p>This hackathon is organized by the Ethereum Foundation in collaboration with leading DeFi protocols to foster innovation and bring new ideas to the space.</p>
    `,
    image: "/placeholder.svg?height=400&width=800",
    progress: 65,
    timeline: [
      {
        date: "August 15, 2023",
        attendinevent: "Hackathon Kickoff",
        description: "Opening ceremony and project ideation workshops",
      },
      {
        date: "August 20, 2023",
        attendinevent: "Team Registration Deadline",
        description: "Last day to register your team and project idea",
      },
      {
        date: "September 10, 2023",
        attendinevent: "Project Submission Deadline",
        description: "All projects must be submitted by 11:59 PM UTC",
      },
      {
        date: "September 12-14, 2023",
        attendinevent: "Judging Period",
        description: "Projects will be evaluated by our panel of judges",
      },
      {
        date: "September 15, 2023",
        attendinevent: "Winners Announcement",
        description: "Closing ceremony and announcement of winners",
      },
    ],
    prizes: [
      {
        title: "First Place",
        amount: "$20,000",
        description: "Plus mentorship from Ethereum Foundation developers",
      },
      {
        title: "Second Place",
        amount: "$10,000",
        description: "Plus featured promotion on Ethereum blog",
      },
      {
        title: "Third Place",
        amount: "$5,000",
        description: "Plus featured promotion on Ethereum social media",
      },
      {
        title: "Best UX Design",
        amount: "$5,000",
        description: "For the project with the most user-friendly interface",
      },
      {
        title: "Most Innovative Use Case",
        amount: "$5,000",
        description: "For the most creative and innovative application of DeFi",
      },
      {
        title: "Community Choice",
        amount: "$5,000",
        description: "Voted by the community during the public voting period",
      },
    ],
    judges: [
      {
        name: "Vitalik Buterin",
        title: "Ethereum Co-founder",
        avatar: "/placeholder.svg?height=60&width=60",
      },
      {
        name: "Hayden Adams",
        title: "Uniswap Founder",
        avatar: "/placeholder.svg?height=60&width=60",
      },
      {
        name: "Stani Kulechov",
        title: "Aave Founder",
        avatar: "/placeholder.svg?height=60&width=60",
      },
      {
        name: "Camila Russo",
        title: "The Defiant Founder",
        avatar: "/placeholder.svg?height=60&width=60",
      },
    ],
    sponsors: [
      {
        name: "Uniswap",
        logo: "/placeholder.svg?height=60&width=60",
      },
      {
        name: "Aave",
        logo: "/placeholder.svg?height=60&width=60",
      },
      {
        name: "Compound",
        logo: "/placeholder.svg?height=60&width=60",
      },
      {
        name: "Chainlink",
        logo: "/placeholder.svg?height=60&width=60",
      },
      {
        name: "MakerDAO",
        logo: "/placeholder.svg?height=60&width=60",
      },
    ],
    resources: [
      {
        title: "Getting Started with Ethereum Development",
        type: "Documentation",
        url: "#",
      },
      {
        title: "DeFi Development Best Practices",
        type: "Guide",
        url: "#",
      },
      {
        title: "Smart Contract Security Checklist",
        type: "Checklist",
        url: "#",
      },
      {
        title: "Introduction to DeFi Protocols",
        type: "Video",
        url: "#",
      },
    ],
    relatedCourses: [
      {
        id: 1,
        title: "DeFi Protocol Development",
        image: "/placeholder.svg?height=100&width=150",
      },
      {
        id: 2,
        title: "Smart Contract Security",
        image: "/placeholder.svg?height=100&width=150",
      },
      {
        id: 3,
        title: "Ethereum Development Masterclass",
        image: "/placeholder.svg?height=100&width=150",
      },
    ],
  }

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="relative h-[300px] md:h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 dark:from-green-400/10 dark:to-teal-400/10"></div>
          <img
            src={hackathon.image || "/placeholder.svg"}
            alt={hackathon.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          <div className="container absolute bottom-0 left-0 right-0 px-4 py-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    hackathon.status === "active"
                      ? "bg-green-500 hover:bg-green-600"
                      : hackathon.status === "upcoming"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-500 hover:bg-gray-600"
                  }
                >
                  {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-white">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {hackathon.startDate} - {hackathon.endDate}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-white">
                  <MapPin className="h-4 w-4" />
                  <span>{hackathon.location}</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">{hackathon.title}</h1>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border">
                  <AvatarImage src={hackathon.logo} alt={hackathon.organizer} />
                  <AvatarFallback>{hackathon.organizer.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-white">Organized by {hackathon.organizer}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="mb-6">
            <Link href="/hackathons" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Hackathons
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About the Hackathon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: hackathon.description }}
                  />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {hackathon.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4 w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="prizes">Prizes</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Judges</CardTitle>
                      <CardDescription>Meet our panel of expert judges</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                        {hackathon.judges.map((judge, index) => (
                          <div key={index} className="flex flex-col items-center text-center">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={judge.avatar} alt={judge.name} />
                              <AvatarFallback>{judge.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h4 className="mt-2 font-medium">{judge.name}</h4>
                            <p className="text-sm text-muted-foreground">{judge.title}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sponsors</CardTitle>
                      <CardDescription>Our hackathon is made possible by these amazing sponsors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center justify-center gap-8">
                        {hackathon.sponsors.map((sponsor, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={sponsor.logo} alt={sponsor.name} />
                              <AvatarFallback>{sponsor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="mt-2 text-sm">{sponsor.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* <Card>
                    <CardHeader>
                      <CardTitle>Recommended Courses</CardTitle>
                      <CardDescription>Prepare for the hackathon with these relevant courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {hackathon.relatedCourses.map((course) => (
                          <Link href={`/course/${course.id}`} key={course.id} className="group">
                            <div className="overflow-hidden rounded-md border">
                              <div className="aspect-video w-full overflow-hidden">
                                <img
                                  src={course.image || "/placeholder.svg"}
                                  alt={course.title}
                                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                />
                              </div>
                              <div className="p-3">
                                <h4 className="font-medium line-clamp-2">{course.title}</h4>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card> */}
                </TabsContent>

                <TabsContent value="prizes" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Prize Pool: {hackathon.prizePool}</CardTitle>
                      <CardDescription>Prizes will be awarded to the top projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {hackathon.prizes.map((prize, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-300" : index === 2 ? "bg-amber-600" : "bg-primary/20"}`}
                            >
                              <Trophy className={`h-5 w-5 ${index < 3 ? "text-white" : "text-primary"}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{prize.title}</h4>
                                <span className="font-bold">{prize.amount}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{prize.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hackathon Timeline</CardTitle>
                      <CardDescription>Key dates and events for the hackathon</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative space-y-0">
                        {hackathon.timeline.map((item, index) => (
                          <div key={index} className="relative pb-8">
                            {index !== hackathon.timeline.length - 1 && (
                              <div className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-muted"></div>
                            )}
                            <div className="relative flex items-start">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                <Clock className="h-4 w-4 text-primary-foreground" />
                              </div>
                              <div className="ml-4">
                                <h4 className="font-medium">{item.attendinevent}</h4>
                                <p className="text-sm text-muted-foreground">{item.date}</p>
                                <p className="mt-1 text-sm">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hackathon Resources</CardTitle>
                      <CardDescription>Helpful resources for participants</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {hackathon.resources.map((resource, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                              {resource.type === "Documentation" && <FileText className="h-5 w-5 text-primary" />}
                              {resource.type === "Guide" && <FileText className="h-5 w-5 text-primary" />}
                              {resource.type === "Checklist" && <FileText className="h-5 w-5 text-primary" />}
                              {resource.type === "Video" && <FileText className="h-5 w-5 text-primary" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{resource.title}</h4>
                                <Badge variant="outline">{resource.type}</Badge>
                              </div>
                              <a href={resource.url} className="mt-1 text-sm text-primary hover:underline">
                                View Resource
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Hackathon Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <div>
                        <Badge
                          className={
                            hackathon.status === "active"
                              ? "bg-green-500 hover:bg-green-600"
                              : hackathon.status === "upcoming"
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-gray-500 hover:bg-gray-600"
                          }
                        >
                          {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Timeline</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {hackathon.startDate} - {hackathon.endDate}
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{hackathon.location}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Prize Pool</span>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{hackathon.prizePool}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Participants</span>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{hackathon.participants} registered</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Website</span>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={hackathon.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {hackathon.website.replace("https://", "")}
                        </a>
                      </div>
                    </div>
                  </div>

                  {hackathon.status === "active" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{hackathon.progress}%</span>
                      </div>
                      <Progress value={hackathon.progress} className="h-2" />
                    </div>
                  )}

                  <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-500 dark:from-green-400 dark:to-teal-400">
                    {hackathon.status === "active"
                      ? "Join Hackathon"
                      : hackathon.status === "upcoming"
                        ? "Register Interest"
                        : "View Results"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm">
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm">
                      Facebook
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Have questions about the hackathon? Join our Discord server or contact the organizers.
                  </p>
                  <div className="flex justify-between">
                    <Button variant="outline">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Join Discord
                    </Button>
                    <Button variant="outline">Contact Us</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

