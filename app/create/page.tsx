"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useCourses } from "@/context/CourseContext";
import { useAuth } from "@/context/AuthProvider";
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
  Image as ImageIcon,
  FileQuestion,
  Info,
  ArrowLeft,
  CheckCircle2,
  Eye,
  PenTool,
  DollarSign,
  Code2,
  Link as LinkIcon,
  AlertTriangle,
  Loader2,
  Paperclip,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { TipTapEditor } from "@/components/tiptap-editor";
import { LessonAttachmentsUploader } from "@/components/lessonuploader";

export default function CreateCoursePage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { createCourse, updateCourse, publishCourse, uploadCourseImage } =
    useCourses();
  const { toast } = useToast();
  const router = useRouter();
  const { user, userProfile } = useAuth();

  // Redirect if not instructor or admin
  useEffect(() => {
    if (
      user &&
      userProfile &&
      userProfile.role !== "instructor" &&
      userProfile.role !== "admin"
    ) {
      toast({
        title: "Access Denied",
        description: "You must be an instructor to create courses",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [user, userProfile, router, toast]);

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

  const [courseData, setCourseData] = useState<{
    title: string;
    description: string;
    shortDescription: string;
    level: CourseLevel;
    category: string;
    subcategory: string;
    price: string;
    discountPrice: string;
    language: string;
    duration: string;
    visibility: string;
    modules: typeof modules;
    requirements: string[];
    whatYouWillLearn: string[];
    tags: string[];
    featured: boolean;
    status: CourseStatus;
    certificate: boolean;
    welcomeMessage: string;
    congratulationsMessage: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    thumbnail: string;
    previewVideo: string;
  }>({
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

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadCourseImage(file);
      handleInputChange("thumbnail", url);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
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
        duration: calculateTotalDuration(),
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
        duration: calculateTotalDuration(),
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

  const calculateTotalDuration = () => {
    // Calculate total duration from all lessons
    let totalMinutes = 0;

    modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        const durationParts = lesson.duration.split(":");
        if (durationParts.length === 2) {
          // Format: MM:SS
          totalMinutes +=
            parseInt(durationParts[0]) + parseInt(durationParts[1]) / 60;
        } else {
          // Try to parse as minutes
          const mins = parseFloat(lesson.duration);
          if (!isNaN(mins)) totalMinutes += mins;
        }
      });
    });

    // Format total duration
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? minutes + "m" : ""}`;
    } else {
      return `${minutes}m`;
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
    const moduleNumbers = modules.map((m) => {
      const match = m.id.match(/module-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

    const nextModuleNumber =
      moduleNumbers.length > 0 ? Math.max(...moduleNumbers) + 1 : 1;
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
    const lessonNumbers = modules[moduleIndex].lessons.map((lesson) => {
      const match = lesson.id.match(/lesson-\d+-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

    const nextLessonNumber =
      lessonNumbers.length > 0 ? Math.max(...lessonNumbers) + 1 : 1;
    const newLessonId = `lesson-${moduleNumber}-${nextLessonNumber}`;

    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons.push({
      id: newLessonId,
      title: "New Lesson",
      type: "video",
      duration: "00:00",
      content: {
        videoUrl: "",
        description: "",
        transcript: "",
        attachments: [],
      },
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

  const handleLessonTitleChange = (
    moduleId: string,
    lessonId: string,
    newTitle: string
  ) => {
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

    // Initialize default content based on lesson type
    const currentContent =
      updatedModules[moduleIndex].lessons[lessonIndex].content || {};

    switch (newType) {
      case "video":
        updatedModules[moduleIndex].lessons[lessonIndex].content = {
          ...currentContent,
          videoUrl: currentContent.videoUrl || "",
          description: currentContent.description || "",
          transcript: currentContent.transcript || "",
        };
        break;
      case "text":
        updatedModules[moduleIndex].lessons[lessonIndex].content = {
          ...currentContent,
          textContent: currentContent.textContent || "",
        };
        break;
      case "quiz":
        updatedModules[moduleIndex].lessons[lessonIndex].content = {
          ...currentContent,
          quiz: currentContent.quiz || [
            {
              question: "Sample question",
              options: ["Option 1", "Option 2", "Option 3", "Option 4"],
              correctAnswer: 0,
            },
          ],
        };
        break;
      case "exercise":
        updatedModules[moduleIndex].lessons[lessonIndex].content = {
          ...currentContent,
          instructions: currentContent.instructions || "",
          solution: currentContent.solution || "",
        };
        break;
      case "project":
        updatedModules[moduleIndex].lessons[lessonIndex].content = {
          ...currentContent,
          description: currentContent.description || "",
          requirements: currentContent.requirements || "",
          rubric: currentContent.rubric || "",
        };
        break;
    }

    setModules(updatedModules);
  };

  const handleLessonDurationChange = (
    moduleId: string,
    lessonId: string,
    newDuration: string
  ) => {
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

  const handleVideoUrlChange = (moduleId: string, lessonId: string, videoUrl: string) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const lessonIndex = modules[moduleIndex].lessons.findIndex(
      (l) => l.id === lessonId
    );
    if (lessonIndex === -1) return;

    const updatedModules = [...modules];
    if (!updatedModules[moduleIndex].lessons[lessonIndex].content) {
      updatedModules[moduleIndex].lessons[lessonIndex].content = {};
    }
    updatedModules[moduleIndex].lessons[lessonIndex].content.videoUrl =
      videoUrl;
    setModules(updatedModules);
  };

  const handleTextContentChange = (moduleId, lessonId, textContent) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const lessonIndex = modules[moduleIndex].lessons.findIndex(
      (l) => l.id === lessonId
    );
    if (lessonIndex === -1) return;

    const updatedModules = [...modules];
    if (!updatedModules[moduleIndex].lessons[lessonIndex].content) {
      updatedModules[moduleIndex].lessons[lessonIndex].content = {};
    }
    updatedModules[moduleIndex].lessons[lessonIndex].content.textContent =
      textContent;
    setModules(updatedModules);
  };

  const handleDescriptionChange = (moduleId, lessonId, description) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const lessonIndex = modules[moduleIndex].lessons.findIndex(
      (l) => l.id === lessonId
    );
    if (lessonIndex === -1) return;

    const updatedModules = [...modules];
    if (!updatedModules[moduleIndex].lessons[lessonIndex].content) {
      updatedModules[moduleIndex].lessons[lessonIndex].content = {};
    }
    updatedModules[moduleIndex].lessons[lessonIndex].content.description =
      description;
    setModules(updatedModules);
  };

  const handleTranscriptChange = (moduleId, lessonId, transcript) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const lessonIndex = modules[moduleIndex].lessons.findIndex(
      (l) => l.id === lessonId
    );
    if (lessonIndex === -1) return;

    const updatedModules = [...modules];
    if (!updatedModules[moduleIndex].lessons[lessonIndex].content) {
      updatedModules[moduleIndex].lessons[lessonIndex].content = {};
    }
    updatedModules[moduleIndex].lessons[lessonIndex].content.transcript =
      transcript;
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
        return <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "quiz":
        return (
          <FileQuestion className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        );
      case "text":
        return (
          <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        );
      case "exercise":
        return <Code className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "project":
        return <Award className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
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

  const handleAttachmentsChange = (
    moduleId: string,
    lessonId: string,
    attachments: Attachment[]
  ) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return;

    const lessonIndex = modules[moduleIndex].lessons.findIndex(
      (l) => l.id === lessonId
    );
    if (lessonIndex === -1) return;

    const updatedModules = [...modules];

    // Initialize content object if it doesn't exist
    if (!updatedModules[moduleIndex].lessons[lessonIndex].content) {
      updatedModules[moduleIndex].lessons[lessonIndex].content = {};
    }

    // Update attachments
    updatedModules[moduleIndex].lessons[lessonIndex].content.attachments =
      attachments;
    setModules(updatedModules);
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

  // Validate video URL format
  const isValidVideoUrl = (url) => {
    // Check if URL is empty
    if (!url) return true;

    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      return false;
    }

    // Check for common video hosting domains
    const supportedDomains = [
      "youtube.com",
      "youtu.be",
      "vimeo.com",
      "wistia.com",
      "dailymotion.com",
      "twitch.tv",
      "facebook.com",
      "drive.google.com",
      "dropbox.com",
    ];

    return supportedDomains.some((domain) => url.includes(domain));
  };

  useEffect(() => {
    // Update the courseData.modules whenever modules state changes
    setCourseData((prev) => ({
      ...prev,
      modules: modules,
    }));
  }, [modules]);

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
          <h3 className="text-lg font-medium">Loading...</h3>
          <p className="mt-2 text-muted-foreground">
            Please wait while we check your credentials
          </p>
        </div>
      </div>
    );
  }

  if (userProfile.role !== "instructor" && userProfile.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h2 className="mb-2 text-2xl font-bold">Access Denied</h2>
          <p className="mb-4 text-muted-foreground">
            You need to be an instructor to create courses. Please apply to
            become an instructor first.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          >
            <Link href="/instructor/apply">Apply to Become an Instructor</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-white border-b dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <div className="container px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/instructor/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
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
                <span className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Saved
                </span>
              )}
              {saveStatus === "error" && (
                <span className="flex items-center text-sm text-red-600 dark:text-red-400">
                  <Trash2 className="w-4 h-4 mr-1" /> Error saving
                </span>
              )}
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handlePublish}
                className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container flex-1 px-4 py-6 md:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="justify-start w-full p-1 mb-6 rounded-lg bg-slate-100 dark:bg-slate-800/50">
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
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Information
                </CardTitle>
                <CardDescription>
                  Basic information about your course
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
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
                      className="border-blue-100 min-h-32 dark:border-blue-900"
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
                        Total length of all video content (auto-calculated from
                        lessons)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Course Thumbnail</Label>
                    <div className="p-4 text-center border-2 border-blue-200 border-dashed rounded-lg dark:border-blue-800">
                      {courseData.thumbnail ? (
                        <div className="space-y-4">
                          <div className="w-full overflow-hidden rounded-lg aspect-video">
                            <img
                              src={courseData.thumbnail}
                              alt="Course thumbnail"
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isUploading}
                              onClick={() =>
                                document
                                  .getElementById("thumbnail-upload")
                                  .click()
                              }
                            >
                              {isUploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 mr-2" />
                              )}
                              Change
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                              onClick={() => handleInputChange("thumbnail", "")}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8">
                          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                          <h3 className="mb-2 text-lg font-medium text-slate-800 dark:text-slate-200">
                            Upload Thumbnail
                          </h3>
                          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                            Recommended size: 1280x720px (16:9 ratio)
                          </p>
                          <Button
                            disabled={isUploading}
                            onClick={() =>
                              document
                                .getElementById("thumbnail-upload")
                                .click()
                            }
                          >
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4 mr-2" />
                            )}
                            Upload Image
                          </Button>
                          <input
                            id="thumbnail-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailUpload}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Preview Video</Label>
                    <div className="p-4 text-center border-2 border-blue-200 border-dashed rounded-lg dark:border-blue-800">
                      {courseData.previewVideo ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center w-full overflow-hidden rounded-lg aspect-video bg-slate-900">
                            {courseData.previewVideo.includes("youtube.com") ||
                            courseData.previewVideo.includes("youtu.be") ? (
                              <iframe
                                src={courseData.previewVideo.replace(
                                  "watch?v=",
                                  "embed/"
                                )}
                                title="Preview video"
                                className="w-full h-full"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <Video className="w-12 h-12 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {courseData.previewVideo}
                          </p>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const url = window.prompt(
                                  "Enter video URL:",
                                  courseData.previewVideo
                                );
                                if (url) {
                                  if (isValidVideoUrl(url)) {
                                    handleInputChange("previewVideo", url);
                                  } else {
                                    toast({
                                      title: "Invalid Video URL",
                                      description:
                                        "Please enter a valid URL from YouTube, Vimeo, or other supported platforms.",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                            >
                              <LinkIcon className="w-4 h-4 mr-2" />
                              Change URL
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                              onClick={() =>
                                handleInputChange("previewVideo", "")
                              }
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8">
                          <Video className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                          <h3 className="mb-2 text-lg font-medium text-slate-800 dark:text-slate-200">
                            Add Preview Video
                          </h3>
                          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                            A short preview video to showcase your course (2-5
                            minutes)
                          </p>
                          <div className="flex flex-col justify-center gap-3 sm:flex-row">
                            <Button
                              onClick={() => {
                                const url = window.prompt("Enter video URL:");
                                if (url) {
                                  if (isValidVideoUrl(url)) {
                                    handleInputChange("previewVideo", url);
                                  } else {
                                    toast({
                                      title: "Invalid Video URL",
                                      description:
                                        "Please enter a valid URL from YouTube, Vimeo, or other supported platforms.",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                            >
                              <LinkIcon className="w-4 h-4 mr-2" />
                              Add Video URL
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Learning Objectives
                </CardTitle>
                <CardDescription>
                  What students will learn from your course
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
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
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">
                              Delete learning objective
                            </span>
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        onClick={handleAddLearningOutcome}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Learning Objective
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Tags
                </CardTitle>
                <CardDescription>
                  Help students find your course
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {courseData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="flex items-center gap-1 text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-4 h-4 p-0 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <Trash2 className="w-3 h-3" />
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
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Messages
                </CardTitle>
                <CardDescription>
                  Customize welcome and congratulations messages
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
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
                      className="border-blue-100 min-h-24 dark:border-blue-900"
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
                      className="border-blue-100 min-h-24 dark:border-blue-900"
                    />
                    <p className="text-xs text-muted-foreground">
                      This message will be shown to students when they complete
                      your course
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Curriculum
                </CardTitle>
                <CardDescription>
                  Organize your course content into modules and lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Card className="mb-6 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                  <Info className="w-4 h-4" />
                  <CardTitle>Curriculum Tips</CardTitle>
                  <CardDescription>
                    Organize your course into logical modules. Each module
                    should contain related lessons that build upon each other.
                    Keep videos between 5-15 minutes for optimal engagement.
                  </CardDescription>
                </Card>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="modules" type="MODULE">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-6"
                      >
                        {modules.map((module, moduleIndex) => (
                          <Draggable
                            key={module.id}
                            draggableId={module.id}
                            index={moduleIndex}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border border-blue-100 rounded-lg dark:border-blue-900"
                              >
                                <div className="p-4 rounded-t-lg bg-blue-50 dark:bg-blue-950/30">
                                  <div className="flex items-center gap-4">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-move"
                                    >
                                      <GripVertical className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <Input
                                          placeholder="Module title"
                                          value={module.title}
                                          onChange={(e) =>
                                            handleModuleTitleChange(
                                              module.id,
                                              e.target.value
                                            )
                                          }
                                          className="text-lg font-medium bg-white border-blue-200 dark:border-blue-800 dark:bg-slate-900"
                                        />
                                        <Badge className="text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                          Module {moduleIndex + 1}
                                        </Badge>
                                      </div>
                                      <div className="mt-2">
                                        <Input
                                          placeholder="Module description"
                                          value={module.description}
                                          onChange={(e) =>
                                            handleModuleDescriptionChange(
                                              module.id,
                                              e.target.value
                                            )
                                          }
                                          className="text-sm bg-white border-blue-200 dark:border-blue-800 dark:bg-slate-900"
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="text-red-600 border-red-200 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 dark:border-red-800"
                                      onClick={() =>
                                        handleDeleteModule(module.id)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span className="sr-only">
                                        Delete module
                                      </span>
                                    </Button>
                                  </div>
                                </div>

                                <div className="p-4 space-y-4">
                                  <Droppable
                                    droppableId={module.id}
                                    type="LESSON"
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="space-y-4"
                                      >
                                        {module.lessons.map(
                                          (lesson, lessonIndex) => (
                                            <Draggable
                                              key={lesson.id}
                                              draggableId={lesson.id}
                                              index={lessonIndex}
                                            >
                                              {(provided) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  className="flex items-center gap-4 p-3 bg-white border rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950"
                                                >
                                                  <div
                                                    {...provided.dragHandleProps}
                                                    className="cursor-move"
                                                  >
                                                    <GripVertical className="w-5 h-5 text-slate-400" />
                                                  </div>
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                      <Input
                                                        placeholder="Lesson title"
                                                        value={lesson.title}
                                                        onChange={(e) =>
                                                          handleLessonTitleChange(
                                                            module.id,
                                                            lesson.id,
                                                            e.target.value
                                                          )
                                                        }
                                                        className="border-blue-100 dark:border-blue-900"
                                                      />
                                                      <Select
                                                        value={lesson.type}
                                                        onValueChange={(
                                                          value
                                                        ) =>
                                                          handleLessonTypeChange(
                                                            module.id,
                                                            lesson.id,
                                                            value
                                                          )
                                                        }
                                                      >
                                                        <SelectTrigger className="w-[140px] border-blue-100 dark:border-blue-900">
                                                          <SelectValue placeholder="Lesson type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="video">
                                                            <div className="flex items-center">
                                                              <Video className="w-4 h-4 mr-2" />
                                                              <span>Video</span>
                                                            </div>
                                                          </SelectItem>
                                                          <SelectItem value="quiz">
                                                            <div className="flex items-center">
                                                              <FileQuestion className="w-4 h-4 mr-2" />
                                                              <span>Quiz</span>
                                                            </div>
                                                          </SelectItem>
                                                          <SelectItem value="text">
                                                            <div className="flex items-center">
                                                              <FileText className="w-4 h-4 mr-2" />
                                                              <span>Text</span>
                                                            </div>
                                                          </SelectItem>
                                                          <SelectItem value="exercise">
                                                            <div className="flex items-center">
                                                              <Code2 className="w-4 h-4 mr-2" />
                                                              <span>
                                                                Exercise
                                                              </span>
                                                            </div>
                                                          </SelectItem>
                                                          <SelectItem value="project">
                                                            <div className="flex items-center">
                                                              <Award className="w-4 h-4 mr-2" />
                                                              <span>
                                                                Project
                                                              </span>
                                                            </div>
                                                          </SelectItem>
                                                        </SelectContent>
                                                      </Select>

                                                      {lesson.content
                                                        ?.attachments &&
                                                        lesson.content
                                                          .attachments.length >
                                                          0 && (
                                                          <Badge
                                                            variant="outline"
                                                            className="px-2"
                                                          >
                                                            <Paperclip className="w-3 h-3 mr-1" />
                                                            {
                                                              lesson.content
                                                                .attachments
                                                                .length
                                                            }
                                                          </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                      <Input
                                                        placeholder="Duration (e.g., 15:30)"
                                                        value={lesson.duration}
                                                        onChange={(e) =>
                                                          handleLessonDurationChange(
                                                            module.id,
                                                            lesson.id,
                                                            e.target.value
                                                          )
                                                        }
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
                                                            {lesson.type ===
                                                              "video" && (
                                                              <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                  <Label
                                                                    htmlFor={`video-url-${lesson.id}`}
                                                                  >
                                                                    Video URL
                                                                  </Label>
                                                                  <div className="flex gap-2">
                                                                    <Input
                                                                      id={`video-url-${lesson.id}`}
                                                                      placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                                                                      value={
                                                                        lesson
                                                                          .content
                                                                          ?.videoUrl ||
                                                                        ""
                                                                      }
                                                                      onChange={(
                                                                        e
                                                                      ) =>
                                                                        handleVideoUrlChange(
                                                                          module.id,
                                                                          lesson.id,
                                                                          e
                                                                            .target
                                                                            .value
                                                                        )
                                                                      }
                                                                      className="flex-1 border-blue-100 dark:border-blue-900"
                                                                    />
                                                                  </div>
                                                                  {lesson
                                                                    .content
                                                                    ?.videoUrl &&
                                                                    !isValidVideoUrl(
                                                                      lesson
                                                                        .content
                                                                        .videoUrl
                                                                    ) && (
                                                                      <p className="text-xs text-red-500">
                                                                        Please
                                                                        enter a
                                                                        valid
                                                                        video
                                                                        URL from
                                                                        YouTube,
                                                                        Vimeo,
                                                                        or other
                                                                        supported
                                                                        platforms.
                                                                      </p>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                  <Label
                                                                    htmlFor={`description-${lesson.id}`}
                                                                  >
                                                                    Description
                                                                  </Label>
                                                                  <Textarea
                                                                    id={`description-${lesson.id}`}
                                                                    placeholder="Enter video description"
                                                                    value={
                                                                      lesson
                                                                        .content
                                                                        ?.description ||
                                                                      ""
                                                                    }
                                                                    onChange={(
                                                                      e
                                                                    ) =>
                                                                      handleDescriptionChange(
                                                                        module.id,
                                                                        lesson.id,
                                                                        e.target
                                                                          .value
                                                                      )
                                                                    }
                                                                    className="border-blue-100 min-h-24 dark:border-blue-900"
                                                                  />
                                                                </div>

                                                                <div className="space-y-2">
                                                                  <Label
                                                                    htmlFor={`transcript-${lesson.id}`}
                                                                  >
                                                                    Video
                                                                    Transcript
                                                                  </Label>
                                                                  <Textarea
                                                                    id={`transcript-${lesson.id}`}
                                                                    placeholder="Enter video transcript"
                                                                    value={
                                                                      lesson
                                                                        .content
                                                                        ?.transcript ||
                                                                      ""
                                                                    }
                                                                    onChange={(
                                                                      e
                                                                    ) =>
                                                                      handleTranscriptChange(
                                                                        module.id,
                                                                        lesson.id,
                                                                        e.target
                                                                          .value
                                                                      )
                                                                    }
                                                                    className="border-blue-100 min-h-24 dark:border-blue-900"
                                                                  />
                                                                </div>

                                                                <div className="space-y-2">
                                                                  <Label>
                                                                    Attachments
                                                                  </Label>
                                                                  <LessonAttachmentsUploader
                                                                    moduleId={
                                                                      module.id
                                                                    }
                                                                    lessonId={
                                                                      lesson.id
                                                                    }
                                                                    existingAttachments={
                                                                      lesson
                                                                        .content
                                                                        ?.attachments ||
                                                                      []
                                                                    }
                                                                    onAttachmentsChange={
                                                                      handleAttachmentsChange
                                                                    }
                                                                  />
                                                                </div>
                                                              </div>
                                                            )}

                                                            {lesson.type ===
                                                              "text" && (
                                                              <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                  <Label
                                                                    htmlFor={`text-content-${lesson.id}`}
                                                                  >
                                                                    Lesson
                                                                    Content
                                                                  </Label>
                                                                  <div className="min-h-[300px] border border-blue-100 dark:border-blue-900 rounded-md overflow-hidden">
                                                                    <TipTapEditor
                                                                      value={
                                                                        lesson
                                                                          .content
                                                                          ?.textContent ||
                                                                        ""
                                                                      }
                                                                      onChange={(
                                                                        value
                                                                      ) =>
                                                                        handleTextContentChange(
                                                                          module.id,
                                                                          lesson.id,
                                                                          value
                                                                        )
                                                                      }
                                                                      placeholder="Enter rich text content for the lesson..."
                                                                    />
                                                                  </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                  <Label>
                                                                    Attachments
                                                                  </Label>
                                                                  <LessonAttachmentsUploader
                                                                    moduleId={
                                                                      module.id
                                                                    }
                                                                    lessonId={
                                                                      lesson.id
                                                                    }
                                                                    existingAttachments={
                                                                      lesson
                                                                        .content
                                                                        ?.attachments ||
                                                                      []
                                                                    }
                                                                    onAttachmentsChange={
                                                                      handleAttachmentsChange
                                                                    }
                                                                  />
                                                                </div>
                                                              </div>
                                                            )}

                                                            {lesson.type ===
                                                              "quiz" && (
                                                              <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                  <Label>
                                                                    Quiz
                                                                    Questions
                                                                  </Label>
                                                                  <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                  >
                                                                    <Plus className="w-4 h-4 mr-2" />
                                                                    Add Question
                                                                  </Button>
                                                                </div>
                                                                {lesson.content
                                                                  ?.quiz
                                                                  ?.length >
                                                                0 ? (
                                                                  <div className="space-y-4">
                                                                    {lesson.content.quiz.map(
                                                                      (
                                                                        question,
                                                                        qIndex
                                                                      ) => (
                                                                        <div
                                                                          key={
                                                                            qIndex
                                                                          }
                                                                          className="p-4 space-y-3 border rounded-lg border-slate-200 dark:border-slate-800"
                                                                        >
                                                                          <div className="flex items-start justify-between">
                                                                            <div className="flex-1">
                                                                              <Label className="block mb-2">
                                                                                Question{" "}
                                                                                {qIndex +
                                                                                  1}
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
                                                                              <Trash2 className="w-4 h-4" />
                                                                              <span className="sr-only">
                                                                                Delete
                                                                                question
                                                                              </span>
                                                                            </Button>
                                                                          </div>
                                                                          <div className="space-y-2">
                                                                            <Label className="block mb-1">
                                                                              Answer
                                                                              Options
                                                                            </Label>
                                                                            {question.options.map(
                                                                              (
                                                                                option,
                                                                                oIndex
                                                                              ) => (
                                                                                <div
                                                                                  key={
                                                                                    oIndex
                                                                                  }
                                                                                  className="flex items-center gap-2"
                                                                                >
                                                                                  <div className="flex items-center h-5">
                                                                                    <input
                                                                                      type="radio"
                                                                                      checked={
                                                                                        question.correctAnswer ===
                                                                                        oIndex
                                                                                      }
                                                                                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                                                                                    />
                                                                                  </div>
                                                                                  <Input
                                                                                    placeholder={`Option ${
                                                                                      oIndex +
                                                                                      1
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
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                    <span className="sr-only">
                                                                                      Delete
                                                                                      option
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
                                                                              <Plus className="w-4 h-4 mr-2" />
                                                                              Add
                                                                              Option
                                                                            </Button>
                                                                          </div>
                                                                        </div>
                                                                      )
                                                                    )}

                                                                    <div className="space-y-2">
                                                                      <Label>
                                                                        Attachments
                                                                      </Label>
                                                                      <LessonAttachmentsUploader
                                                                        moduleId={
                                                                          module.id
                                                                        }
                                                                        lessonId={
                                                                          lesson.id
                                                                        }
                                                                        existingAttachments={
                                                                          lesson
                                                                            .content
                                                                            ?.attachments ||
                                                                          []
                                                                        }
                                                                        onAttachmentsChange={
                                                                          handleAttachmentsChange
                                                                        }
                                                                      />
                                                                    </div>
                                                                  </div>
                                                                ) : (
                                                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                                                    No questions
                                                                    added yet
                                                                  </p>
                                                                )}
                                                              </div>
                                                            )}

                                                            {lesson.type ===
                                                              "exercise" && (
                                                              <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                  <Label
                                                                    htmlFor={`exercise-instructions-${lesson.id}`}
                                                                  >
                                                                    Exercise
                                                                    Instructions
                                                                  </Label>
                                                                  <Textarea
                                                                    id={`exercise-instructions-${lesson.id}`}
                                                                    placeholder="Enter detailed instructions for the exercise"
                                                                    className="border-blue-100 min-h-32 dark:border-blue-900"
                                                                    value={
                                                                      lesson
                                                                        .content
                                                                        ?.instructions ||
                                                                      ""
                                                                    }
                                                                  />
                                                                </div>
                                                                <div className="space-y-2">
                                                                  <Label
                                                                    htmlFor={`exercise-solution-${lesson.id}`}
                                                                  >
                                                                    Solution
                                                                    Guide
                                                                  </Label>
                                                                  <Textarea
                                                                    id={`exercise-solution-${lesson.id}`}
                                                                    placeholder="Enter solution guide or hints"
                                                                    className="border-blue-100 min-h-24 dark:border-blue-900"
                                                                    value={
                                                                      lesson
                                                                        .content
                                                                        ?.solution ||
                                                                      ""
                                                                    }
                                                                  />
                                                                </div>

                                                                <div className="space-y-2">
                                                                  <Label>
                                                                    Attachments
                                                                  </Label>
                                                                  <LessonAttachmentsUploader
                                                                    moduleId={
                                                                      module.id
                                                                    }
                                                                    lessonId={
                                                                      lesson.id
                                                                    }
                                                                    existingAttachments={
                                                                      lesson
                                                                        .content
                                                                        ?.attachments ||
                                                                      []
                                                                    }
                                                                    onAttachmentsChange={
                                                                      handleAttachmentsChange
                                                                    }
                                                                  />
                                                                </div>
                                                              </div>
                                                            )}

                                                            {lesson.type ===
                                                              "project" && (
                                                              <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                  <Label
                                                                    htmlFor={`project-description-${lesson.id}`}
                                                                  >
                                                                    Project
                                                                    Description
                                                                  </Label>
                                                                  <Textarea
                                                                    id={`project-description-${lesson.id}`}
                                                                    placeholder="Enter detailed project description and requirements"
                                                                    className="border-blue-100 min-h-32 dark:border-blue-900"
                                                                    value={
                                                                      lesson
                                                                        .content
                                                                        ?.description ||
                                                                      ""
                                                                    }
                                                                  />
                                                                </div>
                                                                <div className="space-y-2">
                                                                  <Label
                                                                    htmlFor={`project-rubric-${lesson.id}`}
                                                                  >
                                                                    Grading
                                                                    Rubric
                                                                  </Label>
                                                                  <Textarea
                                                                    id={`project-rubric-${lesson.id}`}
                                                                    placeholder="Enter grading criteria and expectations"
                                                                    className="border-blue-100 min-h-24 dark:border-blue-900"
                                                                    value={
                                                                      lesson
                                                                        .content
                                                                        ?.rubric ||
                                                                      ""
                                                                    }
                                                                  />
                                                                </div>

                                                                <div className="space-y-2">
                                                                  <Label>
                                                                    Attachments
                                                                  </Label>
                                                                  <LessonAttachmentsUploader
                                                                    moduleId={
                                                                      module.id
                                                                    }
                                                                    lessonId={
                                                                      lesson.id
                                                                    }
                                                                    existingAttachments={
                                                                      lesson
                                                                        .content
                                                                        ?.attachments ||
                                                                      []
                                                                    }
                                                                    onAttachmentsChange={
                                                                      handleAttachmentsChange
                                                                    }
                                                                  />
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
                                                    className="text-red-600 border-red-200 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 dark:border-red-800"
                                                    onClick={() =>
                                                      handleDeleteLesson(
                                                        module.id,
                                                        lesson.id
                                                      )
                                                    }
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="sr-only">
                                                      Delete lesson
                                                    </span>
                                                  </Button>
                                                </div>
                                              )}
                                            </Draggable>
                                          )
                                        )}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                  <Button
                                    variant="outline"
                                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                    onClick={() => handleAddLesson(module.id)}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Lesson
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                    onClick={handleAddModule}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </Button>
                </DragDropContext>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Requirements
                </CardTitle>
                <CardDescription>
                  What students need to know before taking your course
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Prerequisites</Label>
                    <div className="space-y-2">
                      {courseData.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Requirement ${index + 1}`}
                            value={requirement}
                            onChange={(e) =>
                              handleUpdateRequirement(index, e.target.value)
                            }
                            className="flex-1 border-blue-100 dark:border-blue-900"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                            onClick={() => handleRemoveRequirement(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete requirement</span>
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        onClick={handleAddRequirement}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Requirement
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Learning Objectives
                </CardTitle>
                <CardDescription>
                  What students will learn from your course
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
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
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">
                              Delete learning objective
                            </span>
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        onClick={handleAddLearningOutcome}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Learning Objective
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Tags
                </CardTitle>
                <CardDescription>
                  Help students find your course
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {courseData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className="flex items-center gap-1 text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-4 h-4 p-0 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span className="sr-only">Remove tag</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="tags-input"
                        placeholder="Add a tag (press Enter to add)"
                        className="flex-1 border-blue-100 dark:border-blue-900"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const input = e.target;
                            if (input.value) {
                              handleAddTag(input.value);
                              input.value = "";
                            }
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById("tags-input");
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
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Pricing
                </CardTitle>
                <CardDescription>Set the price for your course</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">Regular Price (&#8358;)</Label>
                      <div className="relative">
                        <DollarSign className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
                        <Input
                          id="price"
                          type="text"
                          placeholder="49.99"
                          value={courseData.price}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          className="border-blue-100 pl-9 dark:border-blue-900"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount-price">
                        Discount Price (&#8358;)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
                        <Input
                          id="discount-price"
                          type="text"
                          placeholder="39.99"
                          value={courseData.discountPrice}
                          onChange={(e) =>
                            handleInputChange("discountPrice", e.target.value)
                          }
                          className="border-blue-100 pl-9 dark:border-blue-900"
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
                      <Switch
                        id="featured"
                        checked={courseData.featured}
                        onCheckedChange={(checked) =>
                          handleInputChange("featured", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Featured courses appear prominently on the marketplace
                      homepage and in search results. Note: Featured status is
                      subject to approval by the platform team.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  SEO Settings
                </CardTitle>
                <CardDescription>
                  Optimize your course for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo-title">SEO Title</Label>
                    <Input
                      id="seo-title"
                      placeholder="SEO-friendly title (60 characters max)"
                      value={courseData.seoTitle}
                      onChange={(e) =>
                        handleInputChange("seoTitle", e.target.value)
                      }
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
                      value={courseData.seoDescription}
                      onChange={(e) =>
                        handleInputChange("seoDescription", e.target.value)
                      }
                      className="border-blue-100 min-h-24 dark:border-blue-900"
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
                      value={courseData.seoKeywords}
                      onChange={(e) =>
                        handleInputChange("seoKeywords", e.target.value)
                      }
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
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  Course Settings
                </CardTitle>
                <CardDescription>
                  Configure additional course settings
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
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
              <CardFooter className="flex justify-between px-6 py-4 border-t border-blue-100 dark:border-blue-900">
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 dark:border-red-800"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Course
                </Button>
                <Button
                  onClick={handlePublish}
                  className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  <Save className="w-4 h-4 mr-2" />
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
