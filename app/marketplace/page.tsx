"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CourseTabs from "@/components/course-tabs";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Footer } from "@/components/footer";
import {
  Search,
  Star,
  Users,
  Clock,
  BookOpen,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Code2,
  Wallet,
  Globe,
} from "lucide-react";
import { JSX, useEffect, useState } from "react";
import { useCourses } from "@/context/CourseContext";
import { Course, CourseFilters, CourseLevel } from "@/types/course";
import { EmptyState } from "@/components/empty-state";

export default function MarketplacePage() {
  const { courses, loading, filters, setFilters, getFeaturedCourses, getPublishedCourses } =
    useCourses();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [activeFilters, setActiveFilters] = useState<CourseFilters>({
    level: [],
    duration: [],
    price: undefined,
    rating: undefined,
    search: "",
  });
  const [categories, setCategories] = useState<
    {
      name: string;
      icon: JSX.Element;
      count: number;
    }[]
  >([]);

  const fetchFeaturedCourses = async () => {
      const featured = await getFeaturedCourses();
      setFeaturedCourses(featured);
    };

    const fetchPublishedCourses = async () => {
      const publishedCourses = await getPublishedCourses();
      setAllCourses(courses);
    }

  useEffect(() => {
    if (!courses.length) return;

    // Get unique categories and their counts
    const categoryMap = courses.reduce((acc, course) => {
      course.tags.forEach((tag) => {
        if (!acc[tag]) {
          acc[tag] = 0;
        }
        acc[tag]++;
      });
      return acc;
    }, {} as Record<string, number>);

    // Map categories to their icons
    const categoriesWithIcons = Object.entries(categoryMap).map(
      ([name, count]) => {
        let icon;
        switch (name.toLowerCase()) {
          case "blockchain basics":
            icon = <BookOpen className="w-4 h-4 text-blue-500" />;
            break;
          case "smart contracts":
            icon = <Code2 className="w-4 h-4 text-purple-500" />;
            break;
          case "defi":
            icon = <TrendingUp className="w-4 h-4 text-green-500" />;
            break;
          case "nfts":
            icon = <Sparkles className="w-4 h-4 text-amber-500" />;
            break;
          case "web3":
            icon = <Globe className="w-4 h-4 text-teal-500" />;
            break;
          case "cryptocurrency":
            icon = <Wallet className="w-4 h-4 text-red-500" />;
            break;
          case "security":
            icon = <Award className="w-4 h-4 text-indigo-500" />;
            break;
          default:
            icon = <BookOpen className="w-4 h-4 text-slate-500" />;
        }

        return {
          name,
          icon,
          count,
        };
      }
    );

    setCategories(categoriesWithIcons);
  }, [courses]);

  useEffect(() => {
    if (!courses.length) return;

    let filtered = [...courses];

    // Apply search filter
    if (activeFilters.search) {
      const search = activeFilters.search.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(search) ||
          course.description.toLowerCase().includes(search) ||
          course.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Apply level filter
    if (activeFilters.level?.length) {
      filtered = filtered.filter((course) =>
        activeFilters.level!.includes(course.level)
      );
    }

    // Apply duration filter
    if (activeFilters.duration?.length) {
      filtered = filtered.filter((course) => {
        const duration = parseInt(course.duration.split(" ")[0]);
        return activeFilters.duration!.some((range) => {
          switch (range) {
            case "0-5":
              return duration <= 5;
            case "5-10":
              return duration > 5 && duration <= 10;
            case "10+":
              return duration > 10;
            default:
              return false;
          }
        });
      });
    }

    // Apply rating filter
    if (activeFilters.rating) {
      filtered = filtered.filter(
        (course) => course.rating! >= activeFilters.rating!
      );
    }

    // Apply price filter
    if (activeFilters.price?.length) {
      filtered = filtered.filter((course) => {
        const price = parseFloat(course.price.replace("$", ""));
        return activeFilters.price!.some((type: any) => {
          switch (type) {
            case "free":
              return price === 0;
            case "paid":
              return price > 0;
            default:
              return false;
          }
        });
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "price-low":
          return (
            parseFloat(a.price.replace("$", "")) -
            parseFloat(b.price.replace("$", ""))
          );
        case "price-high":
          return (
            parseFloat(b.price.replace("$", "")) -
            parseFloat(a.price.replace("$", ""))
          );
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default: // popular
          return (b.students || 0) - (a.students || 0);
      }
    });

    setAllCourses(filtered);
  }, [courses, activeFilters, sortBy]);

  useEffect(() => {
    fetchFeaturedCourses();
    fetchPublishedCourses();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters((prev) => ({
      ...prev,
      search: searchQuery,
    }));
  };

  const handleFilterChange = (
    filterType: keyof CourseFilters,
    value: string
  ) => {
    setActiveFilters((prev) => {
      const current = { ...prev };

      switch (filterType) {
        case "level":
          current.level = current.level || [];
          if (current.level.includes(value)) {
            current.level = current.level.filter((v) => v !== value);
          } else {
            current.level = [...current.level, value];
          }
          break;

        case "duration":
          current.duration = current.duration || [];
          if (current.duration.includes(value)) {
            current.duration = current.duration.filter((v) => v !== value);
          } else {
            current.duration = [...current.duration, value];
          }
          break;

        case "rating":
          current.rating = parseFloat(value);
          break;

        case "price":
          current.price = current.price || [];
          if (current.price.includes(value)) {
            current.price = current.price.filter((v) => v !== value);
          } else {
            current.price = [...current.price, value];
          }
          break;
      }

      return current;
    });
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    const sortedCourses = [...courses].sort((a, b) => {
      switch (value) {
        case "newest":
          return (
            (b.createdAt instanceof Date ? b.createdAt.getTime() : 0) - 
            (a.createdAt instanceof Date ? a.createdAt.getTime() : 0)
          );
        case "price-low":
          return (
            parseFloat(a.price.replace("$", "")) -
            parseFloat(b.price.replace("$", ""))
          );
        case "price-high":
          return (
            parseFloat(b.price.replace("$", "")) -
            parseFloat(a.price.replace("$", ""))
          );
        case "rating":
          return b.rating! - a.rating!;
        default: // popular
          return b.students! - a.students!;
      }
    });
    setFilters({
      ...filters,
      sort: value,
    });
  };

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="py-12 bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl">
              <Badge className="px-3 py-1 mb-2 text-sm text-white bg-blue-500 hover:bg-blue-600">
                Course Marketplace
              </Badge>
              <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-slate-800 dark:text-slate-100">
                Discover Blockchain Courses
              </h1>
              <p className="mb-6 text-lg text-muted-foreground">
                Explore our curated collection of high-quality blockchain and
                Web3 courses
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
                  <form onSubmit={handleSearch}>
                    <Input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for courses..."
                      className="h-12 border-blue-100 pl-9 bg-background dark:border-blue-900"
                    />
                  </form>
                </div>
                <Button
                  size="lg"
                  onClick={handleSearch}
                  className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
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
                  <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      {categories.length > 0 ? (
                        categories.map((category, index) => (
                          <Link
                            key={index}
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveFilters((prev) => ({
                                ...prev,
                                search: category.name,
                              }));
                            }}
                            className="flex items-center justify-between p-2 transition-colors rounded-md text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                          >
                            <div className="flex items-center gap-2">
                              {category.icon}
                              <span>{category.name}</span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
                            >
                              {category.count}
                            </Badge>
                          </Link>
                        ))
                      ) : (
                        <EmptyState
                          icon={
                            <BookOpen className="w-10 h-10 text-blue-500" />
                          }
                          title="No Categories"
                          description="Categories will appear once courses are added."
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 dark:border-blue-900">
                  <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                    <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">
                          Level
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="beginner"
                              checked={activeFilters.level?.includes(
                                CourseLevel.BEGINNER
                              )}
                              onChange={() =>
                                handleFilterChange(
                                  "level",
                                  CourseLevel.BEGINNER
                                )
                              }
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                            />
                            <label
                              htmlFor="beginner"
                              className="text-sm text-slate-700 dark:text-slate-300"
                            >
                              Beginner
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="intermediate"
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                            />
                            <label
                              htmlFor="intermediate"
                              className="text-sm text-slate-700 dark:text-slate-300"
                            >
                              Intermediate
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="advanced"
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                            />
                            <label
                              htmlFor="advanced"
                              className="text-sm text-slate-700 dark:text-slate-300"
                            >
                              Advanced
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">
                          Duration
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="short"
                              checked={activeFilters.duration?.includes("0-5")}
                              onChange={() =>
                                handleFilterChange("duration", "0-5")
                              }
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                            />
                            <label
                              htmlFor="short"
                              className="text-sm text-slate-700 dark:text-slate-300"
                            >
                              0-5 hours
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="medium"
                              checked={activeFilters.duration?.includes("5-10")}
                              onChange={() =>
                                handleFilterChange("duration", "5-10")
                              }
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                            />
                            <label
                              htmlFor="medium"
                              className="text-sm text-slate-700 dark:text-slate-300"
                            >
                              5-10 hours
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="long"
                              checked={activeFilters.duration?.includes("10+")}
                              onChange={() =>
                                handleFilterChange("duration", "10+")
                              }
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                            />
                            <label
                              htmlFor="long"
                              className="text-sm text-slate-700 dark:text-slate-300"
                            >
                              10+ hours
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">
                          Rating
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="rating-4.5"
                              checked={activeFilters.rating === 4.5}
                              onChange={() =>
                                handleFilterChange("rating", "4.5")
                              }
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                            />
                            <label
                              htmlFor="rating-4.5"
                              className="flex items-center text-sm text-slate-700 dark:text-slate-300"
                            >
                              4.5 & up
                              <div className="flex ml-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < 4.5
                                        ? "fill-amber-500 text-amber-500"
                                        : "text-slate-300 dark:text-slate-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="rating-4.0"
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                              checked={activeFilters.rating === 4.0}
                              onChange={() =>
                                handleFilterChange("rating", "4.0")
                              }
                            />
                            <label
                              htmlFor="rating-4.0"
                              className="flex items-center text-sm text-slate-700 dark:text-slate-300"
                            >
                              4.0 & up
                              <div className="flex ml-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < 4
                                        ? "fill-amber-500 text-amber-500"
                                        : "text-slate-300 dark:text-slate-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="rating-3.5"
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                              checked={activeFilters.rating === 3.5}
                              onChange={() =>
                                handleFilterChange("rating", "3.5")
                              }
                            />
                            <label
                              htmlFor="rating-3.5"
                              className="flex items-center text-sm text-slate-700 dark:text-slate-300"
                            >
                              3.5 & up
                              <div className="flex ml-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < 3.5
                                        ? "fill-amber-500 text-amber-500"
                                        : "text-slate-300 dark:text-slate-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">
                          Price
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="free"
                              checked={activeFilters.price?.includes("free")}
                              onChange={() =>
                                handleFilterChange("price", "free")
                              }
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                            />
                            <label
                              htmlFor="free"
                              className="text-sm text-slate-700 dark:text-slate-300"
                            >
                              Free
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="paid"
                              checked={activeFilters.price?.includes("paid")}
                              onChange={() =>
                                handleFilterChange("price", "paid")
                              }
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                            />
                            <label
                              htmlFor="paid"
                              className="text-sm text-slate-700 dark:text-slate-300"
                            >
                              Paid
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="subscription"
                              checked={activeFilters.price?.includes(
                                "subscription"
                              )}
                              onChange={() =>
                                handleFilterChange("price", "subscription")
                              }
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                            />
                            <label
                              htmlFor="subscription"
                              className="text-sm text-slate-700 dark:text-slate-300"
                            >
                              Subscription
                            </label>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                        Apply Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Featured Courses
                  </h2>
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={handleSort}>
                      <SelectTrigger className="w-[180px] border-blue-200 dark:border-blue-800">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price-low">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-high">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : featuredCourses.length === 0 ? (
                  <EmptyState
                    title="No Courses Available"
                    description="Be the first to create a course and share your blockchain knowledge with the community."
                    icon={
                      <BookOpen className="w-12 h-12 text-blue-500 dark:text-blue-300" />
                    }
                    // showCreateButton={true}
                  />
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {featuredCourses.map((course) => (
                      <Link
                        href={`/course/${course.id}`}
                        key={course.id}
                        className="group"
                      >
                        <Card
                          className={`overflow-hidden transition-all hover:shadow-lg ${
                            course.featured
                              ? "border-2 border-blue-300 dark:border-blue-700"
                              : "border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <div className="relative w-full overflow-hidden aspect-video">
                            <img
                              src={course.thumbnail!}
                              alt={course.title}
                              className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                            <div className="absolute flex gap-2 top-2 right-2">
                              {course.bestseller && (
                                <Badge className="text-white bg-amber-500 hover:bg-amber-600">
                                  Bestseller
                                </Badge>
                              )}
                              {course.new && (
                                <Badge className="text-white bg-green-500 hover:bg-green-600">
                                  New
                                </Badge>
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
                                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                  {course.rating}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  ({course.reviews})
                                </span>
                              </div>
                            </div>
                            <CardTitle className="text-xl transition-colors line-clamp-1 text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {course.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Avatar className="w-4 h-4">
                                <AvatarImage
                                  src={course.instructor.avatar}
                                  alt={course.instructor.name}
                                />
                                <AvatarFallback className="text-[8px] bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                  {course.instructor.name
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">
                                {course.instructor.name}
                              </span>
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
                                <Users className="w-4 h-4 text-blue-500" />
                                <span>{course.students} students</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-teal-500" />
                                <span>{course.duration}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex items-center justify-between">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {course.price === "0" ? "Free" : `$${course.price}`}
                            </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                              >
                                View Course
                              </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="mt-12">
                  <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      All Courses
                    </h2>
                  </div>

                  <CourseTabs
                    loading={loading}
                    allCourses={allCourses}
                    featuredCourses={featuredCourses}
                    defaultTab="all"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 mt-12 border border-blue-200 rounded-lg bg-gradient-to-br from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 dark:border-blue-800">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    Become an Instructor
                  </h2>
                  <p className="text-muted-foreground">
                    Share your blockchain knowledge and earn by creating courses
                    on SkillChain
                  </p>
                </div>
                <Button className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                  Start Teaching
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
