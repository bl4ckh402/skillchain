import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Clock, Star } from "lucide-react"

export function FeaturedCourses() {
  const courses = [
    {
      id: 1,
      title: "Blockchain Fundamentals",
      description: "Learn the core concepts of blockchain technology and cryptocurrencies",
      level: "Beginner",
      students: 1245,
      rating: 4.8,
      duration: "12 hours",
      instructor: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "Smart Contract Development with Solidity",
      description: "Build decentralized applications on Ethereum",
      level: "Intermediate",
      students: 876,
      rating: 4.9,
      duration: "18 hours",
      instructor: {
        name: "Maria Garcia",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "DeFi Protocols and Applications",
      description: "Explore decentralized finance protocols and use cases",
      level: "Advanced",
      students: 543,
      rating: 4.7,
      duration: "15 hours",
      instructor: {
        name: "David Kim",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 dark:bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Courses</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover our most popular blockchain courses and start your learning journey today
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {courses.map((course) => (
            <Link href={`/course/${course.id}`} key={course.id} className="group">
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        course.level === "Beginner"
                          ? "default"
                          : course.level === "Intermediate"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {course.level}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                      <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{course.instructor.name}</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

