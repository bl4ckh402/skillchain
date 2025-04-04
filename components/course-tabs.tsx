"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users, Clock, Star } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Course } from "@/types/course";

/**
 * CourseTabs component for displaying courses across different categories
 */
const CourseTabs = ({
  loading,
  allCourses,
  featuredCourses,
  defaultTab = "all",
  filterCoursesByTag,
}) => {
  // Define tab configurations with their tags for filtering
  const tabs = [
    { value: "all", label: "All", filter: null },
    { value: "blockchain", label: "Blockchain", filter: "blockchain" },
    { value: "defi", label: "DeFi", filter: "defi" },
    { value: "nft", label: "NFTs", filter: "nft" },
    { value: "web3", label: "Web3", filter: "web3" },
  ];

  // Function to filter courses by tag if needed
  const getFilteredCourses = (courses, tagFilter) => {
    if (!tagFilter) return courses;
    
    return courses.filter((course) =>
      course.tags.some((tag) => tag.toLowerCase().includes(tagFilter))
    );
  };

  // Component to render a single course card
  const CourseCard = ({ course }) => (
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
        <div className="aspect-video w-full overflow-hidden relative">
          <img
            src={course.thumbnail!}
            alt={course.title}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {course.bestseller && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                Bestseller
              </Badge>
            )}
            {course.new && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white">
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
            {typeof course.price === 'number' 
              ? (course.price === 0 ? "Free" : `$${course.price}`) 
              : `$${course.price}`}
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
  );

  // Render loading spinner
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  // Render empty state when no courses
  const CourseEmptyState = () => (
    <EmptyState
      title="No Courses Available"
      description="Be the first to create a course and share your blockchain knowledge with the community."
      icon={
        <BookOpen className="h-12 w-12 text-blue-500 dark:text-blue-300" />
      }
    />
  );

  // Render course grid
  const CourseGrid = ({ courses }) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {loading ? (
            <LoadingSpinner />
          ) : !allCourses.length ? (
            <CourseEmptyState />
          ) : (
            <CourseGrid 
              courses={getFilteredCourses(allCourses, tab.filter)} 
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CourseTabs;