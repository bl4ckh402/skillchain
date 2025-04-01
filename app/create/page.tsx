"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCourses } from "@/context/CourseContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { CourseLevel, CourseStatus } from "@/types/course";
import {
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileText,
  Code,
  Award,
  Upload,
  Save,
  Image,
  FileQuestion,
  Info,
  ArrowLeft,
  CheckCircle2,
  Eye,
  PenTool,
  DollarSign,
  Code2,
} from "lucide-react";

export default function CreateCoursePage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const { createCourse, updateCourse, publishCourse } = useCourses();
  const { toast } = useToast();
  const router = useRouter();

  const [modules, setModules] = useState([
    {
      id: "module-1",
      title: "Getting Started",
      description: "Introduction to the course",
      lessons: [
        {
          id: "lesson-1-1",
          title: "Welcome to the course",
          type: "video",
          duration: "02:30",
          content: {
            videoUrl: "",
            description: "A brief introduction to the course",
            transcript: "",
            attachments: [],
          },
        },
      ],
    },
  ]);

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    level: CourseLevel.BEGINNER,
    category: "",
    subcategory: "",
    price: "49.99",
    discountPrice: "",
    language: "english",
    duration: "",
    visibility: "public",
    modules: modules,
    requirements: [],
    whatYouWillLearn: [],
    tags: [],
    featured: false,
    status: CourseStatus.DRAFT,
    certificate: true,
    welcomeMessage: "",
    congratulationsMessage: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    thumbnail: "",
    previewVideo: "",
  });

  const handleInputChange = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveDraft = async () => {
    setSaveStatus("saving");
    try {
      // Validate required fields
      if (!courseData.title || !courseData.description) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setSaveStatus("error");
        return;
      }

      const courseId = await createCourse({
        ...courseData,
        modules: modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({
            ...lesson,
            status: "locked",
            progress: 0,
            completedAt: null,
          })),
        })),
        status: CourseStatus.DRAFT,
        totalLessons: modules.reduce(
          (acc, module) => acc + module.lessons.length,
          0
        ),
        duration: modules.reduce(
          (acc, module) =>
            acc +
            module.lessons.reduce(
              (sum, lesson) => sum + parseInt(lesson.duration) || 0,
              0
            ),
          0
        ),
      });

      setSaveStatus("saved");
      toast({
        title: "Success",
        description: "Course draft saved successfully",
      });

      setTimeout(() => setSaveStatus(null), 3000);
      router.push(`/course/${courseId}`);
    } catch (error) {
      setSaveStatus("error");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    setSaveStatus("saving");
    try {
      if (!validateCourse()) {
        toast({
          title: "Incomplete course",
          description:
            "Please complete all required sections before publishing",
          variant: "destructive",
        });
        setSaveStatus("error");
        return;
      }

      const courseId = await createCourse({
        ...courseData,
        modules: modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({
            ...lesson,
            status: "unlocked",
            progress: 0,
            completedAt: null,
          })),
        })),
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
        totalLessons: modules.reduce(
          (acc, module) => acc + module.lessons.length,
          0
        ),
        duration: modules.reduce(
          (acc, module) =>
            acc +
            module.lessons.reduce(
              (sum, lesson) => sum + parseInt(lesson.duration) || 0,
              0
            ),
          0
        ),
      });

      setSaveStatus("saved");
      toast({
        title: "Success",
        description: "Course published successfully",
      });

      setTimeout(() => setSaveStatus(null), 3000);
      router.push(`/course/${courseId}`);
    } catch (error) {
      setSaveStatus("error");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const validateCourse = () => {
    if (!courseData.title || !courseData.description || !courseData.category) {
      return false;
    }

    if (!modules.length) return false;

    for (const module of modules) {
      if (!module.lessons.length) return false;

      for (const lesson of module.lessons) {
        if (!validateLesson(lesson)) return false;
      }
    }

    return true;
  };

  const validateLesson = (lesson) => {
    if (!lesson.title || !lesson.type) return false;

    switch (lesson.type) {
      case "video":
        return Boolean(lesson.content?.videoUrl);
      case "text":
        return Boolean(lesson.content?.textContent);
      case "quiz":
        return Boolean(lesson.content?.quiz?.length);
      default:
        return true;
    }
  };

  const handleAddModule = () => {
  // Find the highest module number
  const moduleNumbers = modules.map(m => {
    const match = m.id.match(/module-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  });
  
  const nextModuleNumber = moduleNumbers.length > 0 ? Math.max(...moduleNumbers) + 1 : 1;
  const newModuleId = `module-${nextModuleNumber}`;
  
  setModules([
    ...modules,
    {
      id: newModuleId,
      title: `New Module`,
      description: "Add a description for this module",
      lessons: [],
    },
  ]);
};

const handleAddLesson = (moduleId) => {
  const moduleIndex = modules.findIndex((m) => m.id === moduleId);
  if (moduleIndex === -1) return;
  
  // Extract module number from moduleId
  const moduleMatch = moduleId.match(/module-(\d+)/);
  if (!moduleMatch) return;
  const moduleNumber = moduleMatch[1];
  
  // Find the highest lesson number for this module
  const lessonNumbers = modules[moduleIndex].lessons.map(lesson => {
    const match = lesson.id.match(/lesson-\d+-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  });
  
  const nextLessonNumber = lessonNumbers.length > 0 ? Math.max(...lessonNumbers) + 1 : 1;
  const newLessonId = `lesson-${moduleNumber}-${nextLessonNumber}`;
  
  const updatedModules = [...modules];
  updatedModules[moduleIndex].lessons.push({
    id: newLessonId,
    title: "New Lesson",
    type: "video",
    duration: "00:00",
    content: {},
  });
  
  setModules(updatedModules);
};

  const handleDeleteModule = (moduleId) => {
    setModules(modules.filter((m) => m.id !== moduleId));
  };

  const handleDeleteLesson = (moduleId, lessonId) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons = updatedModules[
      moduleIndex
    ].lessons.filter((l) => l.id !== lessonId);
    setModules(updatedModules);
  };

  const handleModuleTitleChange = (moduleId, newTitle) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const updatedModules = [...modules];
    updatedModules[moduleIndex].title = newTitle;
    setModules(updatedModules);
  };

  const handleModuleDescriptionChange = (moduleId, newDescription) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const updatedModules = [...modules];
    updatedModules[moduleIndex].description = newDescription;
    setModules(updatedModules);
  };

  const handleLessonTitleChange = (moduleId, lessonId, newTitle) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const lessonIndex = modules[moduleIndex].lessons.findIndex(
      (l) => l.id === lessonId
    );
    if (lessonIndex === -1) return;

    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex].title = newTitle;
    setModules(updatedModules);
  };

  const handleLessonTypeChange = (moduleId, lessonId, newType) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const lessonIndex = modules[moduleIndex].lessons.findIndex(
      (l) => l.id === lessonId
    );
    if (lessonIndex === -1) return;

    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex].type = newType;
    setModules(updatedModules);
  };

  const handleLessonDurationChange = (moduleId, lessonId, newDuration) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const lessonIndex = modules[moduleIndex].lessons.findIndex(
      (l) => l.id === lessonId
    );
    if (lessonIndex === -1) return;

    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex].duration = newDuration;
    setModules(updatedModules);
  };

  const onDragEnd = (result) => {
    const { destination, source, type } = result;

    // If dropped outside the list
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle module reordering
    if (type === "MODULE") {
      const reorderedModules = [...modules];
      const [removed] = reorderedModules.splice(source.index, 1);
      reorderedModules.splice(destination.index, 0, removed);
      setModules(reorderedModules);
      return;
    }

    // Handle lesson reordering
    const sourceModuleIndex = modules.findIndex(
      (m) => m.id === source.droppableId
    );
    const destModuleIndex = modules.findIndex(
      (m) => m.id === destination.droppableId
    );

    if (sourceModuleIndex === -1 || destModuleIndex === -1) return;

    const newModules = [...modules];

    // If moving within the same module
    if (source.droppableId === destination.droppableId) {
      const modulesCopy = [...modules];
      const moduleIndex = modulesCopy.findIndex(
        (m) => m.id === source.droppableId
      );
      const lessonsCopy = [...modulesCopy[moduleIndex].lessons];
      const [removed] = lessonsCopy.splice(source.index, 1);
      lessonsCopy.splice(destination.index, 0, removed);
      modulesCopy[moduleIndex].lessons = lessonsCopy;
      setModules(modulesCopy);
    } else {
      // Moving between modules
      const sourceModuleLessons = [...newModules[sourceModuleIndex].lessons];
      const destModuleLessons = [...newModules[destModuleIndex].lessons];

      const [removed] = sourceModuleLessons.splice(source.index, 1);
      destModuleLessons.splice(destination.index, 0, removed);

      newModules[sourceModuleIndex].lessons = sourceModuleLessons;
      newModules[destModuleIndex].lessons = destModuleLessons;

      setModules(newModules);
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "quiz":
        return (
          <FileQuestion className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        );
      case "text":
        return (
          <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        );
      case "exercise":
        return <Code className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "project":
        return <Award className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const openLessonEditor = (moduleId, lessonId) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const lessonIndex = modules[moduleIndex].lessons.findIndex(
      (l) => l.id === lessonId
    );
    if (lessonIndex === -1) return;

    setSelectedLesson({
      moduleId,
      lessonId,
      ...modules[moduleIndex].lessons[lessonIndex],
    });
    setShowContentEditor(true);
  };

  const saveLessonContent = (content) => {
    if (!selectedLesson) return;

    const moduleIndex = modules.findIndex(
      (m) => m.id === selectedLesson.moduleId
    );
    if (moduleIndex === -1) return;

    const lessonIndex = modules[moduleIndex].lessons.findIndex(
      (l) => l.id === selectedLesson.lessonId
    );
    if (lessonIndex === -1) return;

    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex].content = content;
    setModules(updatedModules);
    setShowContentEditor(false);
    setSelectedLesson(null);
  };

  const handleAddRequirement = () => {
    setCourseData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const handleUpdateRequirement = (index, value) => {
    const updatedRequirements = [...courseData.requirements];
    updatedRequirements[index] = value;
    setCourseData((prev) => ({
      ...prev,
      requirements: updatedRequirements,
    }));
  };

  const handleRemoveRequirement = (index) => {
    setCourseData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleAddLearningOutcome = () => {
    setCourseData((prev) => ({
      ...prev,
      whatYouWillLearn: [...prev.whatYouWillLearn, ""],
    }));
  };

  const handleUpdateLearningOutcome = (index, value) => {
    const updatedOutcomes = [...courseData.whatYouWillLearn];
    updatedOutcomes[index] = value;
    setCourseData((prev) => ({
      ...prev,
      whatYouWillLearn: updatedOutcomes,
    }));
  };

  const handleRemoveLearningOutcome = (index) => {
    setCourseData((prev) => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = (tag) => {
    if (tag && !courseData.tags.includes(tag)) {
      setCourseData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleRemoveTag = (tag) => {
    setCourseData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  useEffect(() => {
    // Update the courseData.modules whenever modules state changes
    setCourseData((prev) => ({
      ...prev,
      modules: modules,
    }));
  }, [modules]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/instructor/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Back to dashboard</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Create New Course
                </h1>
                <p className="text-sm text-muted-foreground">Draft</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saveStatus === "saving" && (
                <span className="text-sm text-muted-foreground animate-pulse">
                  Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Saved
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <Trash2 className="h-4 w-4 mr-1" /> Error saving
                </span>
              )}
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button
                onClick={handlePublish}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 md:px-6 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full justify-start bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger
              value="curriculum"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
            >
              Curriculum
            </TabsTrigger>
            <TabsTrigger
              value="requirements"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
            >
              Requirements
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
            >
              Pricing
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
            >
              SEO
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Information
                </CardTitle>
                <CardDescription>
                  Basic information about your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Course Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter course title"
                        value={courseData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        className="border-blue-100 dark:border-blue-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="short-description">
                        Short Description
                      </Label>
                      <Input
                        id="short-description"
                        placeholder="Brief description (150 characters max)"
                        value={courseData.shortDescription}
                        onChange={(e) =>
                          handleInputChange("shortDescription", e.target.value)
                        }
                        className="border-blue-100 dark:border-blue-900"
                      />
                      <p className="text-xs text-muted-foreground">
                        This will appear in course cards and search results
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed course description"
                      value={courseData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="min-h-32 border-blue-100 dark:border-blue-900"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="level">Course Level</Label>
                      <Select
                        value={courseData.level}
                        onValueChange={(value) =>
                          handleInputChange("level", value)
                        }
                      >
                        <SelectTrigger className="border-blue-100 dark:border-blue-900">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="all-levels">All Levels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={courseData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger className="border-blue-100 dark:border-blue-900">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blockchain">Blockchain</SelectItem>
                          <SelectItem value="cryptocurrency">
                            Cryptocurrency
                          </SelectItem>
                          <SelectItem value="defi">DeFi</SelectItem>
                          <SelectItem value="nft">NFTs</SelectItem>
                          <SelectItem value="web3">Web3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select
                        value={courseData.subcategory}
                        onValueChange={(value) =>
                          handleInputChange("subcategory", value)
                        }
                      >
                        <SelectTrigger className="border-blue-100 dark:border-blue-900">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fundamentals">
                            Fundamentals
                          </SelectItem>
                          <SelectItem value="development">
                            Development
                          </SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="trading">Trading</SelectItem>
                          <SelectItem value="investing">Investing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={courseData.language}
                        onValueChange={(value) =>
                          handleInputChange("language", value)
                        }
                      >
                        <SelectTrigger className="border-blue-100 dark:border-blue-900">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                          <SelectItem value="chinese">Chinese</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Course Duration</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 12 hours"
                        value={courseData.duration}
                        onChange={(e) =>
                          handleInputChange("duration", e.target.value)
                        }
                        className="border-blue-100 dark:border-blue-900"
                      />
                      <p className="text-xs text-muted-foreground">
                        Total length of all video content
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Preview Video</Label>
                    <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                      {courseData.previewVideo ? (
                        <div className="space-y-4">
                          <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-900 flex items-center justify-center">
                            <Video className="h-12 w-12 text-blue-500" />
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {courseData.previewVideo.split("/").pop()}
                          </p>
                          <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm">
                              <Upload className="mr-2 h-4 w-4" />
                              Change
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                              onClick={() =>
                                handleInputChange("previewVideo", "")
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8">
                          <Video className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                            Upload Preview Video
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            A short preview video to showcase your course (2-5
                            minutes)
                          </p>
                          <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Video
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Learning Objectives
                </CardTitle>
                <CardDescription>
                  What students will learn from your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>What You Will Learn</Label>
                    <div className="space-y-2">
                      {courseData.whatYouWillLearn.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Learning objective ${index + 1}`}
                            value={item}
                            onChange={(e) =>
                              handleUpdateLearningOutcome(index, e.target.value)
                            }
                            className="flex-1 border-blue-100 dark:border-blue-900"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                            onClick={() => handleRemoveLearningOutcome(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">
                              Delete learning objective
                            </span>
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        onClick={handleAddLearningOutcome}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Learning Objective
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Tags
                </CardTitle>
                <CardDescription>
                  Help students find your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {courseData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1"
                        >
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Remove tag</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="new-tag"
                        placeholder="Add a tag (press Enter to add)"
                        className="flex-1 border-blue-100 dark:border-blue-900"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag(e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById("new-tag");
                          if (input && input.value) {
                            handleAddTag(input.value);
                            input.value = "";
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add up to 10 tags to help students find your course
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Messages
                </CardTitle>
                <CardDescription>
                  Customize welcome and congratulations messages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcome-message">Welcome Message</Label>
                    <Textarea
                      id="welcome-message"
                      placeholder="Message students will see when they first enroll"
                      value={courseData.welcomeMessage}
                      onChange={(e) =>
                        handleInputChange("welcomeMessage", e.target.value)
                      }
                      className="min-h-24 border-blue-100 dark:border-blue-900"
                    />
                    <p className="text-xs text-muted-foreground">
                      This message will be shown to students when they first
                      enroll in your course
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="congratulations-message">
                      Congratulations Message
                    </Label>
                    <Textarea
                      id="congratulations-message"
                      placeholder="Message students will see when they complete the course"
                      value={courseData.congratulationsMessage}
                      onChange={(e) =>
                        handleInputChange(
                          "congratulationsMessage",
                          e.target.value
                        )
                      }
                      className="min-h-24 border-blue-100 dark:border-blue-900"
                    />
                    <p className="text-xs text-muted-foreground">
                      This message will be shown to students when they complete
                      your course
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Media
                </CardTitle>
                <CardDescription>
                  Upload thumbnail and preview video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <Label>Course Thumbnail</Label>
                    <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                      {courseData.thumbnail ? (
                        <div className="space-y-4">
                          <div className="aspect-video w-full overflow-hidden rounded-lg">
                            <img
                              src={courseData.thumbnail}
                              alt="Course thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm">
                              <Upload className="mr-2 h-4 w-4" />
                              Change
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                              onClick={() => handleInputChange("thumbnail", "")}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8">
                          <Image className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                            Upload Thumbnail
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Recommended size: 1280x720px (16:9 ratio)
                          </p>
                          <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* <div className="space-y-4">
                    <Label>Preview Video</Label>
                    <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                      {course.previewVideo ? (
                        <div className="space-y-4">
                          <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-900 flex items-center justify-center">
                            <Video className="h-12 w-12 text-blue-500" />
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {course.previewVideo.split("/").pop()}
                          </p>
                          <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm">
                              <Upload className="mr-2 h-4 w-4" />
                              Change
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8">
                          <Video className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                            Upload Preview Video
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            A short preview video to showcase your course (2-5
                            minutes)
                          </p>
                          <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Video
                          </Button>
                        </div>
                      )}
                    </div>
                  </div> 
                </div>
              </CardContent>
            </Card> */}
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Curriculum
                </CardTitle>
                <CardDescription>
                  Organize your course content into modules and lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Curriculum Tips</AlertTitle>
                  <AlertDescription>
                    Organize your course into logical modules. Each module
                    should contain related lessons that build upon each other.
                    Keep videos between 5-15 minutes for optimal engagement.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  {courseData.modules.map((module, moduleIndex) => (
                    <div
                      key={module.id}
                      className="border border-blue-100 dark:border-blue-900 rounded-lg"
                    >
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-t-lg">
                        <div className="flex items-center gap-4">
                          <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Module title"
                                defaultValue={module.title}
                                className="text-lg font-medium border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900"
                              />
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                Module {moduleIndex + 1}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <Input
                                placeholder="Module description"
                                defaultValue={module.description}
                                className="text-sm border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900"
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 border-red-200 dark:border-red-800"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete module</span>
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-4 p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950"
                          >
                            <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Lesson title"
                                  defaultValue={lesson.title}
                                  className="border-blue-100 dark:border-blue-900"
                                />
                                <Select defaultValue={lesson.type}>
                                  <SelectTrigger className="w-[140px] border-blue-100 dark:border-blue-900">
                                    <SelectValue placeholder="Lesson type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="video">
                                      <div className="flex items-center">
                                        <Video className="mr-2 h-4 w-4" />
                                        <span>Video</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="quiz">
                                      <div className="flex items-center">
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>Quiz</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="exercise">
                                      <div className="flex items-center">
                                        <Code2 className="mr-2 h-4 w-4" />
                                        <span>Exercise</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="project">
                                      <div className="flex items-center">
                                        <Award className="mr-2 h-4 w-4" />
                                        <span>Project</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Input
                                  placeholder="Duration (e.g., 15:30)"
                                  defaultValue={lesson.duration}
                                  className="w-[140px] border-blue-100 dark:border-blue-900"
                                />
                                <Accordion
                                  type="single"
                                  collapsible
                                  className="w-full"
                                >
                                  <AccordionItem
                                    value="content"
                                    className="border-none"
                                  >
                                    <AccordionTrigger className="py-0 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:no-underline">
                                      Edit Content
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4">
                                      {lesson.type === "video" && (
                                        <div className="space-y-4">
                                          <div className="space-y-2">
                                            <Label>Video Upload</Label>
                                            <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                                              {lesson.content?.videoUrl ? (
                                                <div className="space-y-2">
                                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {lesson.content.videoUrl
                                                      .split("/")
                                                      .pop()}
                                                  </p>
                                                  <div className="flex justify-center gap-2">
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                    >
                                                      <Upload className="mr-2 h-4 w-4" />
                                                      Change
                                                    </Button>
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                                                    >
                                                      <Trash2 className="mr-2 h-4 w-4" />
                                                      Remove
                                                    </Button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="py-4">
                                                  <Video className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                                  <Button size="sm">
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload Video
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label
                                              htmlFor={`transcript-${lesson.id}`}
                                            >
                                              Video Transcript
                                            </Label>
                                            <Textarea
                                              id={`transcript-${lesson.id}`}
                                              placeholder="Enter video transcript"
                                              defaultValue={
                                                lesson.content?.transcript
                                              }
                                              className="min-h-24 border-blue-100 dark:border-blue-900"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                              <Label>
                                                Additional Resources
                                              </Label>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                              >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Resource
                                              </Button>
                                            </div>
                                            {lesson.content?.resources &&
                                            lesson.content.resources.length >
                                              0 ? (
                                              <div className="space-y-2">
                                                {lesson.content.resources.map(
                                                  (resource, index) => (
                                                    <div
                                                      key={index}
                                                      className="flex items-center gap-2"
                                                    >
                                                      <Input
                                                        placeholder="Resource name"
                                                        defaultValue={
                                                          resource.name
                                                        }
                                                        className="flex-1 border-blue-100 dark:border-blue-900"
                                                      />
                                                      <Input
                                                        placeholder="Resource URL"
                                                        defaultValue={
                                                          resource.url
                                                        }
                                                        className="flex-1 border-blue-100 dark:border-blue-900"
                                                      />
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                                                      >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">
                                                          Delete resource
                                                        </span>
                                                      </Button>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            ) : (
                                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                                No resources added yet
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {lesson.type === "quiz" && (
                                        <div className="space-y-4">
                                          <div className="flex items-center justify-between">
                                            <Label>Quiz Questions</Label>
                                            <Button variant="outline" size="sm">
                                              <Plus className="mr-2 h-4 w-4" />
                                              Add Question
                                            </Button>
                                          </div>
                                          {lesson.content?.questions &&
                                          lesson.content.questions.length >
                                            0 ? (
                                            <div className="space-y-4">
                                              {lesson.content.questions.map(
                                                (question, qIndex) => (
                                                  <div
                                                    key={qIndex}
                                                    className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3"
                                                  >
                                                    <div className="flex items-start justify-between">
                                                      <div className="flex-1">
                                                        <Label className="mb-2 block">
                                                          Question {qIndex + 1}
                                                        </Label>
                                                        <Input
                                                          placeholder="Enter question"
                                                          defaultValue={
                                                            question.question
                                                          }
                                                          className="border-blue-100 dark:border-blue-900"
                                                        />
                                                      </div>
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                                                      >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">
                                                          Delete question
                                                        </span>
                                                      </Button>
                                                    </div>
                                                    <div className="space-y-2">
                                                      <Label className="mb-1 block">
                                                        Answer Options
                                                      </Label>
                                                      {question.options.map(
                                                        (option, oIndex) => (
                                                          <div
                                                            key={oIndex}
                                                            className="flex items-center gap-2"
                                                          >
                                                            <div className="flex items-center h-5">
                                                              <input
                                                                type="radio"
                                                                checked={
                                                                  question.correctAnswer ===
                                                                  oIndex
                                                                }
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                                              />
                                                            </div>
                                                            <Input
                                                              placeholder={`Option ${
                                                                oIndex + 1
                                                              }`}
                                                              defaultValue={
                                                                option
                                                              }
                                                              className="flex-1 border-blue-100 dark:border-blue-900"
                                                            />
                                                            <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                                                            >
                                                              <Trash2 className="h-4 w-4" />
                                                              <span className="sr-only">
                                                                Delete option
                                                              </span>
                                                            </Button>
                                                          </div>
                                                        )
                                                      )}
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
                                                      >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Option
                                                      </Button>
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          ) : (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                              No questions added yet
                                            </p>
                                          )}
                                        </div>
                                      )}
                                      {lesson.type === "exercise" && (
                                        <div className="space-y-4">
                                          <div className="space-y-2">
                                            <Label
                                              htmlFor={`exercise-instructions-${lesson.id}`}
                                            >
                                              Exercise Instructions
                                            </Label>
                                            <Textarea
                                              id={`exercise-instructions-${lesson.id}`}
                                              placeholder="Enter detailed instructions for the exercise"
                                              className="min-h-32 border-blue-100 dark:border-blue-900"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label
                                              htmlFor={`exercise-solution-${lesson.id}`}
                                            >
                                              Solution Guide
                                            </Label>
                                            <Textarea
                                              id={`exercise-solution-${lesson.id}`}
                                              placeholder="Enter solution guide or hints"
                                              className="min-h-24 border-blue-100 dark:border-blue-900"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                              <Label>Attachments</Label>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                              >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Attachment
                                              </Button>
                                            </div>
                                            <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                                              <div className="py-4">
                                                <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                                  Upload exercise files or
                                                  starter code
                                                </p>
                                                <Button size="sm">
                                                  <Upload className="mr-2 h-4 w-4" />
                                                  Upload Files
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {lesson.type === "project" && (
                                        <div className="space-y-4">
                                          <div className="space-y-2">
                                            <Label
                                              htmlFor={`project-description-${lesson.id}`}
                                            >
                                              Project Description
                                            </Label>
                                            <Textarea
                                              id={`project-description-${lesson.id}`}
                                              placeholder="Enter detailed project description and requirements"
                                              className="min-h-32 border-blue-100 dark:border-blue-900"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label
                                              htmlFor={`project-rubric-${lesson.id}`}
                                            >
                                              Grading Rubric
                                            </Label>
                                            <Textarea
                                              id={`project-rubric-${lesson.id}`}
                                              placeholder="Enter grading criteria and expectations"
                                              className="min-h-24 border-blue-100 dark:border-blue-900"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                              <Label>Project Resources</Label>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                              >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Resource
                                              </Button>
                                            </div>
                                            <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                                              <div className="py-4">
                                                <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                                  Upload project resources or
                                                  templates
                                                </p>
                                                <Button size="sm">
                                                  <Upload className="mr-2 h-4 w-4" />
                                                  Upload Files
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 border-red-200 dark:border-red-800"
                              onClick={() =>
                                handleDeleteLesson(module.id, lesson.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete lesson</span>
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                          onClick={() => handleAddLesson(module.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Lesson
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                    onClick={handleAddModule}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Module
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Requirements
                </CardTitle>
                <CardDescription>
                  What students need to know before taking your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Prerequisites</Label>
                    <div className="space-y-2">
                      {courseData.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Requirement ${index + 1}`}
                            defaultValue={requirement}
                            className="flex-1 border-blue-100 dark:border-blue-900"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete requirement</span>
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Requirement
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Learning Objectives
                </CardTitle>
                <CardDescription>
                  What students will learn from your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>What You Will Learn</Label>
                    <div className="space-y-2">
                      {courseData.whatYouWillLearn.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Learning objective ${index + 1}`}
                            defaultValue={item}
                            className="flex-1 border-blue-100 dark:border-blue-900"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">
                              Delete learning objective
                            </span>
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Learning Objective
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Tags
                </CardTitle>
                <CardDescription>
                  Help students find your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Array.isArray(courseData.tags) &&
                        courseData.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1"
                          >
                            {tag}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="sr-only">Remove tag</span>
                            </Button>
                          </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag (press Enter to add)"
                        className="flex-1 border-blue-100 dark:border-blue-900"
                      />
                      <Button>Add</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add up to 10 tags to help students find your course
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Pricing
                </CardTitle>
                <CardDescription>Set the price for your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">Regular Price ($)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="price"
                          type="number"
                          placeholder="49.99"
                          defaultValue={courseData.price}
                          className="pl-9 border-blue-100 dark:border-blue-900"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount-price">Discount Price ($)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="discount-price"
                          type="number"
                          placeholder="39.99"
                          defaultValue={courseData.discountPrice || ""}
                          className="pl-9 border-blue-100 dark:border-blue-900"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty if not offering a discount
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="featured" className="text-base">
                        Featured Course
                      </Label>
                      <Switch id="featured" defaultChecked={courseData.featured} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Featured courses appear prominently on the marketplace
                      homepage and in search results. Note: Featured status is
                      subject to approval by the BlockLearn team.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  SEO Settings
                </CardTitle>
                <CardDescription>
                  Optimize your course for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo-title">SEO Title</Label>
                    <Input
                      id="seo-title"
                      placeholder="SEO-friendly title (60 characters max)"
                      defaultValue={courseData.seoTitle}
                      className="border-blue-100 dark:border-blue-900"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will appear in search engine results
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo-description">SEO Description</Label>
                    <Textarea
                      id="seo-description"
                      placeholder="SEO-friendly description (160 characters max)"
                      defaultValue={courseData.seoDescription}
                      className="min-h-24 border-blue-100 dark:border-blue-900"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will appear in search engine results
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo-keywords">SEO Keywords</Label>
                    <Input
                      id="seo-keywords"
                      placeholder="Comma-separated keywords"
                      defaultValue={courseData.seoKeywords}
                      className="border-blue-100 dark:border-blue-900"
                    />
                    <p className="text-xs text-muted-foreground">
                      These help search engines understand your course content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Settings
                </CardTitle>
                <CardDescription>
                  Configure additional course settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="comments-enabled" className="text-base">
                        Enable Comments
                      </Label>
                      <Switch id="comments-enabled" defaultChecked={true} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Allow students to leave comments and questions on your
                      course content
                    </p>
                  </div>

                  <Separator className="bg-blue-100 dark:bg-blue-900" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="certificate-enabled"
                        className="text-base"
                      >
                        Enable Course Certificate
                      </Label>
                      <Switch id="certificate-enabled" defaultChecked={true} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Issue a certificate to students who complete the course
                    </p>
                  </div>

                  <Separator className="bg-blue-100 dark:bg-blue-900" />

                  <div className="space-y-2">
                    <Label htmlFor="course-status">Course Status</Label>
                    <Select defaultValue={courseData.status}>
                      <SelectTrigger className="border-blue-100 dark:border-blue-900">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="review">
                          Submit for Review
                        </SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Draft: Only you can see the course
                      <br />
                      Review: Submit for approval by the BlockLearn team
                      <br />
                      Published: Available to all students
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-blue-100 dark:border-blue-900 px-6 py-4">
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 border-red-200 dark:border-red-800"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Course
                </Button>
                <Button
                  onClick={handlePublish}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
