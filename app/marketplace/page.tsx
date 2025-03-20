import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Footer } from "@/components/footer"
import { Search, Star, Users, Clock, BookOpen, Sparkles, TrendingUp, Award, Zap } from "lucide-react"

export default function MarketplacePage() {
  const featuredCourses = [
    {
      id: 1,
      title: "Blockchain Fundamentals",
      instructor: "Alex Johnson",
      instructorAvatar: "/images/instructors/alex-johnson.jpg",
      level: "Beginner",
      rating: 4.8,
      reviews: 128,
      students: 1245,
      duration: "12 hours",
      price: "$49.99",
      image: "/images/courses/blockchain-fundamentals-hero.jpg",
      tags: ["Blockchain", "Cryptocurrency", "Web3"],
      featured: true,
      bestseller: true,
    },
    {
      id: 2,
      title: "Smart Contract Development with Solidity",
      instructor: "Maria Garcia",
      instructorAvatar: "/images/instructors/maria-garcia.jpg",
      level: "Intermediate",
      rating: 4.9,
      reviews: 95,
      students: 876,
      duration: "15 hours",
      price: "$79.99",
      image: "/images/courses/smart-contract-development.jpg",
      tags: ["Solidity", "Ethereum", "Smart Contracts"],
      featured: true,
    },
    {
      id: 3,
      title: "DeFi Protocols and Applications",
      instructor: "David Kim",
      instructorAvatar: "/images/instructors/david-kim.jpg",
      level: "Advanced",
      rating: 4.7,
      reviews: 82,
      students: 543,
      duration: "18 hours",
      price: "$89.99",
      image: "/images/courses/defi-protocols.jpg",
      tags: ["DeFi", "Yield Farming", "Liquidity"],
      featured: true,
      new: true,
    },
  ]

  const allCourses = [
    ...featuredCourses,
    {
      id: 4,
      title: "NFT Creation and Marketing",
      instructor: "Sarah Chen",
      instructorAvatar: "/images/instructors/sarah-chen.jpg",
      level: "Intermediate",
      rating: 4.6,
      reviews: 74,
      students: 612,
      duration: "10 hours",
      price: "$69.99",
      image: "/images/courses/nft-creation.jpg",
      tags: ["NFTs", "Digital Art", "Marketing"],
      bestseller: true,
    },
    {
      id: 5,
      title: "Web3 Frontend Development",
      instructor: "James Wilson",
      instructorAvatar: "/images/instructors/james-wilson.jpg",
      level: "Intermediate",
      rating: 4.8,
      reviews: 56,
      students: 423,
      duration: "14 hours",
      price: "$74.99",
      image: "/images/courses/web3-frontend.jpg",
      tags: ["React", "Web3.js", "dApps"],
      new: true,
    },
    {
      id: 6,
      title: "Blockchain Security Fundamentals",
      instructor: "Elena Rodriguez",
      instructorAvatar: "/images/instructors/elena-rodriguez.jpg",
      level: "Advanced",
      rating: 4.9,
      reviews: 48,
      students: 321,
      duration: "16 hours",
      price: "$84.99",
      image: "/images/courses/blockchain-security.jpg",
      tags: ["Security", "Auditing", "Vulnerabilities"],
    },
    {
      id: 7,
      title: "Cryptocurrency Trading Strategies",
      instructor: "Michael Lee",
      instructorAvatar: "/images/instructors/michael-lee.jpg",
      level: "Beginner",
      rating: 4.5,
      reviews: 112,
      students: 987,
      duration: "8 hours",
      price: "$59.99",
      image: "/images/courses/crypto-trading.jpg",
      tags: ["Trading", "Analysis", "Investment"],
      bestseller: true,
    },
    {
      id: 8,
      title: "Building on Polkadot Ecosystem",
      instructor: "Sophia Martinez",
      instructorAvatar: "/images/instructors/sophia-martinez.jpg",
      level: "Intermediate",
      rating: 4.7,
      reviews: 38,
      students: 245,
      duration: "12 hours",
      price: "$79.99",
      image: "/images/courses/polkadot-ecosystem.jpg",
      tags: ["Polkadot", "Substrate", "Parachains"],
      new: true,
    },
    {
      id: 9,
      title: "Zero-Knowledge Proofs Explained",
      instructor: "Daniel Brown",
      instructorAvatar: "/images/instructors/daniel-brown.jpg",
      level: "Advanced",
      rating: 4.8,
      reviews: 42,
      students: 198,
      duration: "10 hours",
      price: "$89.99",
      image: "/images/courses/zk-proofs.jpg",
      tags: ["ZK Proofs", "Cryptography", "Privacy"],
    },
  ]

  const categories = [
    { name: "Blockchain Basics", count: 24, icon: <BookOpen className="h-4 w-4" /> },
    { name: "Smart Contracts", count: 18, icon: <Zap className="h-4 w-4" /> },
    { name: "DeFi", count: 15, icon: <TrendingUp className="h-4 w-4" /> },
    { name: "NFTs", count: 12, icon: <Sparkles className="h-4 w-4" /> },
    { name: "Web3", count: 20, icon: <Award className="h-4 w-4" /> },
  ]

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-12">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl">
              <Badge className="mb-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white">
                Course Marketplace
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-4 text-slate-800 dark:text-slate-100">
                Discover Blockchain Courses
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Explore our curated collection of high-quality blockchain and Web3 courses
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for courses..."
                    className="pl-9 bg-background border-blue-100 dark:border-blue-900 h-12"
                  />
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                >
                  Find Courses
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr]">
              <div className="space-y-6">
                <Card className="border-blue-100 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      {categories.map((category, index) => (
                        <Link
                          key={index}
                          href={`/marketplace/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                          className="flex items-center justify-between rounded-md p-2 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {category.icon}
                            <span>{category.name}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          >
                            {category.count}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Level</h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="beginner"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="beginner" className="text-sm text-slate-700 dark:text-slate-300">
                              Beginner
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="intermediate"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="intermediate" className="text-sm text-slate-700 dark:text-slate-300">
                              Intermediate
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="advanced"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="advanced" className="text-sm text-slate-700 dark:text-slate-300">
                              Advanced
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Duration</h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="short"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="short" className="text-sm text-slate-700 dark:text-slate-300">
                              0-5 hours
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="medium"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="medium" className="text-sm text-slate-700 dark:text-slate-300">
                              5-10 hours
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="long"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="long" className="text-sm text-slate-700 dark:text-slate-300">
                              10+ hours
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Rating</h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="rating-4.5"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label
                              htmlFor="rating-4.5"
                              className="text-sm text-slate-700 dark:text-slate-300 flex items-center"
                            >
                              4.5 & up
                              <div className="flex ml-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < 4.5 ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-600"}`}
                                  />
                                ))}
                              </div>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="rating-4.0"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label
                              htmlFor="rating-4.0"
                              className="text-sm text-slate-700 dark:text-slate-300 flex items-center"
                            >
                              4.0 & up
                              <div className="flex ml-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < 4 ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-600"}`}
                                  />
                                ))}
                              </div>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="rating-3.5"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label
                              htmlFor="rating-3.5"
                              className="text-sm text-slate-700 dark:text-slate-300 flex items-center"
                            >
                              3.5 & up
                              <div className="flex ml-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < 3.5 ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-600"}`}
                                  />
                                ))}
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Price</h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="free"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="free" className="text-sm text-slate-700 dark:text-slate-300">
                              Free
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="paid"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="paid" className="text-sm text-slate-700 dark:text-slate-300">
                              Paid
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="subscription"
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600"
                            />
                            <label htmlFor="subscription" className="text-sm text-slate-700 dark:text-slate-300">
                              Subscription
                            </label>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                        Apply Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Featured Courses</h2>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="popular">
                      <SelectTrigger className="w-[180px] border-blue-200 dark:border-blue-800">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {featuredCourses.map((course) => (
                    <Link href={`/course/${course.id}`} key={course.id} className="group">
                      <Card
                        className={`overflow-hidden transition-all hover:shadow-lg ${course.featured ? "border-2 border-blue-300 dark:border-blue-700" : "border-slate-200 dark:border-slate-800"}`}
                      >
                        <div className="aspect-video w-full overflow-hidden relative">
                          <img
                            src={course.image || "/placeholder.svg"}
                            alt={course.title}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            {course.bestseller && (
                              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Bestseller</Badge>
                            )}
                            {course.new && <Badge className="bg-green-500 hover:bg-green-600 text-white">New</Badge>}
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge
                              className={`${
                                course.level === "Beginner"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : course.level === "Intermediate"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                    : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              }`}
                            >
                              {course.level}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                {course.rating}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">({course.reviews})</span>
                            </div>
                          </div>
                          <CardTitle className="line-clamp-1 text-xl text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                              <AvatarFallback className="text-[8px] bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                {course.instructor.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{course.instructor}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {course.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span>{course.students} students</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-teal-500" />
                              <span>{course.duration}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{course.price}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                          >
                            View Course
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="mt-12">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">All Courses</h2>
                  </div>

                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                      >
                        All
                      </TabsTrigger>
                      <TabsTrigger
                        value="blockchain"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                      >
                        Blockchain
                      </TabsTrigger>
                      <TabsTrigger
                        value="defi"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                      >
                        DeFi
                      </TabsTrigger>
                      <TabsTrigger
                        value="nft"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                      >
                        NFTs
                      </TabsTrigger>
                      <TabsTrigger
                        value="web3"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                      >
                        Web3
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {allCourses.slice(3).map((course) => (
                          <Link href={`/course/${course.id}`} key={course.id} className="group">
                            <Card
                              className={`overflow-hidden transition-all hover:shadow-lg ${course.featured ? "border-2 border-blue-300 dark:border-blue-700" : "border-slate-200 dark:border-slate-800"}`}
                            >
                              <div className="aspect-video w-full overflow-hidden relative">
                                <img
                                  src={course.image || "/placeholder.svg"}
                                  alt={course.title}
                                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                  {course.bestseller && (
                                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Bestseller</Badge>
                                  )}
                                  {course.new && (
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white">New</Badge>
                                  )}
                                </div>
                              </div>
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <Badge
                                    className={`${
                                      course.level === "Beginner"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                        : course.level === "Intermediate"
                                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                          : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                    }`}
                                  >
                                    {course.level}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                      {course.rating}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      ({course.reviews})
                                    </span>
                                  </div>
                                </div>
                                <CardTitle className="line-clamp-1 text-xl text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {course.title}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                                    <AvatarFallback className="text-[8px] bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                      {course.instructor.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs">{course.instructor}</span>
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {course.tags.map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <span>{course.students} students</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-teal-500" />
                                    <span>{course.duration}</span>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="flex items-center justify-between">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{course.price}</div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                >
                                  View Course
                                </Button>
                              </CardFooter>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="blockchain" className="mt-0">
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {allCourses
                          .filter((course) => course.tags.includes("Blockchain"))
                          .map((course) => (
                            <Link href={`/course/${course.id}`} key={course.id} className="group">
                              <Card
                                className={`overflow-hidden transition-all hover:shadow-lg ${course.featured ? "border-2 border-blue-300 dark:border-blue-700" : "border-slate-200 dark:border-slate-800"}`}
                              >
                                <div className="aspect-video w-full overflow-hidden relative">
                                  <img
                                    src={course.image || "/placeholder.svg"}
                                    alt={course.title}
                                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                  />
                                  <div className="absolute top-2 right-2 flex gap-2">
                                    {course.bestseller && (
                                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Bestseller</Badge>
                                    )}
                                    {course.new && (
                                      <Badge className="bg-green-500 hover:bg-green-600 text-white">New</Badge>
                                    )}
                                  </div>
                                </div>
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <Badge
                                      className={`${
                                        course.level === "Beginner"
                                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                          : course.level === "Intermediate"
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                            : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                      }`}
                                    >
                                      {course.level}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                        {course.rating}
                                      </span>
                                      <span className="text-xs text-slate-500 dark:text-slate-400">
                                        ({course.reviews})
                                      </span>
                                    </div>
                                  </div>
                                  <CardTitle className="line-clamp-1 text-xl text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {course.title}
                                  </CardTitle>
                                  <CardDescription className="flex items-center gap-1">
                                    <Avatar className="h-4 w-4">
                                      <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                                      <AvatarFallback className="text-[8px] bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                        {course.instructor.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs">{course.instructor}</span>
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {course.tags.map((tag, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="font-normal text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4 text-blue-500" />
                                      <span>{course.students} students</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4 text-teal-500" />
                                      <span>{course.duration}</span>
                                    </div>
                                  </div>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between">
                                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {course.price}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                  >
                                    View Course
                                  </Button>
                                </CardFooter>
                              </Card>
                            </Link>
                          ))}
                      </div>
                    </TabsContent>

                    {/* Other tab contents would follow the same pattern */}
                  </Tabs>
                </div>
              </div>
            </div>

            <div className="mt-12 rounded-lg border bg-gradient-to-br from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 p-6 border-blue-200 dark:border-blue-800">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Become an Instructor</h2>
                  <p className="text-muted-foreground">
                    Share your blockchain knowledge and earn by creating courses on BlockLearn
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                  Start Teaching
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

