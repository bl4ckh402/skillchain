"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Footer } from "@/components/footer"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
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
  LinkIcon,
  FileQuestion,
  BookOpen,
  PenTool,
  Paperclip,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CreateCoursePage() {
  const [activeTab, setActiveTab] = useState("basics")
  const [showContentEditor, setShowContentEditor] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [modules, setModules] = useState([
    {
      id: "module-1",
      title: "Introduction to Blockchain",
      description: "Learn the fundamentals of blockchain technology and its history",
      lessons: [
        {
          id: "lesson-1-1",
          title: "What is Blockchain?",
          type: "video",
          duration: "15:30",
          content: {
            videoUrl: "https://example.com/videos/blockchain-intro.mp4",
            description: "This lesson introduces the core concepts of blockchain technology.",
            transcript: "Hello and welcome to our course on blockchain fundamentals...",
            attachments: [
              { name: "Blockchain Basics.pdf", url: "#" },
              { name: "Lecture Slides.pptx", url: "#" },
            ],
            quiz: [
              {
                question: "Which of the following is NOT a characteristic of blockchain?",
                options: ["Decentralization", "Immutability", "Centralized control", "Transparency"],
                correctAnswer: 2,
              },
            ],
          },
        },
        {
          id: "lesson-1-2",
          title: "History of Blockchain",
          type: "video",
          duration: "12:45",
          content: {
            videoUrl: "https://example.com/videos/blockchain-history.mp4",
            description: "Learn about the origins and evolution of blockchain technology.",
            transcript: "The concept of blockchain was first introduced in 2008...",
            attachments: [{ name: "Blockchain Timeline.pdf", url: "#" }],
          },
        },
      ],
    },
    {
      id: "module-2",
      title: "Cryptography Basics",
      description: "Understand the cryptographic principles that power blockchain",
      lessons: [
        {
          id: "lesson-2-1",
          title: "Cryptographic Hash Functions",
          type: "video",
          duration: "20:15",
          content: {
            videoUrl: "https://example.com/videos/hash-functions.mp4",
            description: "Learn about cryptographic hash functions and their role in blockchain.",
            transcript: "Cryptographic hash functions are the backbone of blockchain security...",
            attachments: [],
          },
        },
        {
          id: "lesson-2-2",
          title: "Public Key Cryptography",
          type: "video",
          duration: "25:30",
          content: {
            videoUrl: "https://example.com/videos/public-key-crypto.mp4",
            description: "Understand how public and private keys work in blockchain systems.",
            transcript: "Public key cryptography, also known as asymmetric cryptography...",
            attachments: [],
          },
        },
        {
          id: "lesson-2-3",
          title: "Cryptography Quiz",
          type: "quiz",
          duration: "15:00",
          content: {
            description: "Test your knowledge of cryptographic principles.",
            quiz: [
              {
                question: "What is the primary purpose of a hash function in blockchain?",
                options: [
                  "To encrypt data",
                  "To create a fixed-size output from variable input",
                  "To decrypt private keys",
                  "To slow down transaction processing",
                ],
                correctAnswer: 1,
              },
              {
                question: "In public key cryptography, which key is used to encrypt data?",
                options: ["Private key", "Public key", "Master key", "Symmetric key"],
                correctAnswer: 1,
              },
            ],
          },
        },
      ],
    },
  ])

  const contentTypes = [
    { id: "video", label: "Video", icon: <Video className="h-4 w-4" /> },
    { id: "text", label: "Text/Article", icon: <FileText className="h-4 w-4" /> },
    { id: "quiz", label: "Quiz", icon: <FileQuestion className="h-4 w-4" /> },
    { id: "exercise", label: "Exercise", icon: <Code className="h-4 w-4" /> },
    { id: "project", label: "Project", icon: <Award className="h-4 w-4" /> },
  ]

  const handleAddModule = () => {
    const newModuleId = `module-${modules.length + 1}`
    setModules([
      ...modules,
      {
        id: newModuleId,
        title: `New Module`,
        description: "Add a description for this module",
        lessons: [],
      },
    ])
  }

  const handleAddLesson = (moduleId: string) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId)
    if (moduleIndex === -1) return

    const newLessonId = `lesson-${moduleIndex + 1}-${modules[moduleIndex].lessons.length + 1}`
    const updatedModules = [...modules]
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
    })
    setModules(updatedModules)
  }

  const handleRemoveModule = (moduleId: string) => {
    setModules(modules.filter((m) => m.id !== moduleId))
  }

  const handleRemoveLesson = (moduleId: string, lessonId: string) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId)
    if (moduleIndex === -1) return

    const updatedModules = [...modules]
    updatedModules[moduleIndex].lessons = updatedModules[moduleIndex].lessons.filter((l) => l.id !== lessonId)
    setModules(updatedModules)
  }

  const handleModuleTitleChange = (moduleId: string, newTitle: string) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId)
    if (moduleIndex === -1) return

    const updatedModules = [...modules]
    updatedModules[moduleIndex].title = newTitle
    setModules(updatedModules)
  }

  const handleModuleDescriptionChange = (moduleId: string, newDescription: string) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId)
    if (moduleIndex === -1) return

    const updatedModules = [...modules]
    updatedModules[moduleIndex].description = newDescription
    setModules(updatedModules)
  }

  const handleLessonTitleChange = (moduleId: string, lessonId: string, newTitle: string) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId)
    if (moduleIndex === -1) return

    const lessonIndex = modules[moduleIndex].lessons.findIndex((l) => l.id === lessonId)
    if (lessonIndex === -1) return

    const updatedModules = [...modules]
    updatedModules[moduleIndex].lessons[lessonIndex].title = newTitle
    setModules(updatedModules)
  }

  const handleLessonTypeChange = (moduleId: string, lessonId: string, newType: string) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId)
    if (moduleIndex === -1) return

    const lessonIndex = modules[moduleIndex].lessons.findIndex((l) => l.id === lessonId)
    if (lessonIndex === -1) return

    const updatedModules = [...modules]
    updatedModules[moduleIndex].lessons[lessonIndex].type = newType
    setModules(updatedModules)
  }

  const handleLessonDurationChange = (moduleId: string, lessonId: string, newDuration: string) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId)
    if (moduleIndex === -1) return

    const lessonIndex = modules[moduleIndex].lessons.findIndex((l) => l.id === lessonId)
    if (lessonIndex === -1) return

    const updatedModules = [...modules]
    updatedModules[moduleIndex].lessons[lessonIndex].duration = newDuration
    setModules(updatedModules)
  }

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result

    // If dropped outside the list
    if (!destination) {
      return
    }

    // If dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // Handle module reordering
    if (type === "MODULE") {
      const reorderedModules = [...modules]
      const [removed] = reorderedModules.splice(source.index, 1)
      reorderedModules.splice(destination.index, 0, removed)
      setModules(reorderedModules)
      return
    }

    // Handle lesson reordering
    const sourceModuleIndex = modules.findIndex((m) => m.id === source.droppableId)
    const destModuleIndex = modules.findIndex((m) => m.id === destination.droppableId)

    if (sourceModuleIndex === -1 || destModuleIndex === -1) return

    const newModules = [...modules]

    // If moving within the same module
    if (source.droppableId === destination.droppableId) {
      const modulesCopy = [...modules]
      const moduleIndex = modulesCopy.findIndex((m) => m.id === source.droppableId)
      const lessonsCopy = [...modulesCopy[moduleIndex].lessons]
      const [removed] = lessonsCopy.splice(source.index, 1)
      lessonsCopy.splice(destination.index, 0, removed)
      modulesCopy[moduleIndex].lessons = lessonsCopy
      setModules(modulesCopy)
    } else {
      // Moving between modules
      const sourceModuleLessons = [...newModules[sourceModuleIndex].lessons]
      const destModuleLessons = [...newModules[destModuleIndex].lessons]

      const [removed] = sourceModuleLessons.splice(source.index, 1)
      destModuleLessons.splice(destination.index, 0, removed)

      newModules[sourceModuleIndex].lessons = sourceModuleLessons
      newModules[destModuleIndex].lessons = destModuleLessons

      setModules(newModules)
    }
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "quiz":
        return <FileQuestion className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      case "text":
        return <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
      case "exercise":
        return <Code className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      case "project":
        return <Award className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    }
  }

  const openLessonEditor = (moduleId: string, lessonId: string) => {
    const moduleIndex = modules.findIndex((m) => m.id === moduleId)
    if (moduleIndex === -1) return

    const lessonIndex = modules[moduleIndex].lessons.findIndex((l) => l.id === lessonId)
    if (lessonIndex === -1) return

    setSelectedLesson({
      moduleId,
      lessonId,
      ...modules[moduleIndex].lessons[lessonIndex],
    })
    setShowContentEditor(true)
  }

  const saveLessonContent = (content: any) => {
    if (!selectedLesson) return

    const moduleIndex = modules.findIndex((m) => m.id === selectedLesson.moduleId)
    if (moduleIndex === -1) return

    const lessonIndex = modules[moduleIndex].lessons.findIndex((l) => l.id === selectedLesson.lessonId)
    if (lessonIndex === -1) return

    const updatedModules = [...modules]
    updatedModules[moduleIndex].lessons[lessonIndex].content = content
    setModules(updatedModules)
    setShowContentEditor(false)
    setSelectedLesson(null)
  }

  return (
    <div className="flex flex-col">
      <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-6">
        <div className="container">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Create New Course</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button
                variant="outline"
                className="border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-950 dark:hover:text-teal-300"
              >
                Preview
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full justify-start bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
            <TabsTrigger
              value="basics"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
            >
              Course Basics
            </TabsTrigger>
            <TabsTrigger
              value="curriculum"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
            >
              Curriculum
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
            >
              Pricing
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">Course Information</CardTitle>
                <CardDescription>Provide the basic information about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-800 dark:text-slate-200">
                    Course Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Blockchain Fundamentals"
                    className="border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-800 dark:text-slate-200">
                    Course Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn in your course"
                    className="min-h-[120px] border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-800 dark:text-slate-200">
                      Category
                    </Label>
                    <Select>
                      <SelectTrigger id="category" className="border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blockchain-basics">Blockchain Basics</SelectItem>
                        <SelectItem value="smart-contracts">Smart Contracts</SelectItem>
                        <SelectItem value="defi">DeFi</SelectItem>
                        <SelectItem value="nfts">NFTs</SelectItem>
                        <SelectItem value="web3">Web3</SelectItem>
                        <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level" className="text-slate-800 dark:text-slate-200">
                      Level
                    </Label>
                    <Select>
                      <SelectTrigger id="level" className="border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">Course Image</CardTitle>
                <CardDescription>Upload a high-quality image that represents your course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative aspect-video w-full max-w-[600px] overflow-hidden rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-800 p-2">
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
                      <Upload className="h-8 w-8 text-blue-500" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          Drag and drop your image here
                        </p>
                        <p className="text-xs text-muted-foreground">Recommended size: 1280x720 pixels (16:9 ratio)</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">What Students Will Learn</CardTitle>
                <CardDescription>List the key learning outcomes of your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="e.g., Understand the fundamental concepts of blockchain technology"
                      className="border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="e.g., Explain how cryptography is used in blockchain systems"
                      className="border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="e.g., Compare different consensus mechanisms"
                      className="border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  <Plus className="h-4 w-4" />
                  Add Learning Outcome
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">Requirements</CardTitle>
                <CardDescription>List any prerequisites or requirements for taking your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="e.g., Basic understanding of computer science concepts"
                      className="border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="e.g., Familiarity with at least one programming language"
                      className="border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                >
                  <Plus className="h-4 w-4" />
                  Add Requirement
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6">
            {showContentEditor && selectedLesson ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                      Editing: {selectedLesson.title}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedLesson.type.charAt(0).toUpperCase() + selectedLesson.type.slice(1)} •{" "}
                      {selectedLesson.duration}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowContentEditor(false)}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-950 dark:hover:text-slate-300"
                  >
                    Back to Curriculum
                  </Button>
                </div>

                <Card className="border-blue-100 dark:border-blue-900">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                    <CardTitle className="text-slate-800 dark:text-slate-200">Lesson Content</CardTitle>
                    <CardDescription>Add content for this lesson</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {selectedLesson.type === "video" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="video-url" className="text-slate-800 dark:text-slate-200">
                            Video URL
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="video-url"
                              placeholder="Enter video URL or upload a video file"
                              defaultValue={selectedLesson.content?.videoUrl || ""}
                              className="border-slate-200 dark:border-slate-700 flex-1"
                            />
                            <Button
                              variant="outline"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="video-description" className="text-slate-800 dark:text-slate-200">
                            Description
                          </Label>
                          <Textarea
                            id="video-description"
                            placeholder="Provide a description of this video lesson"
                            defaultValue={selectedLesson.content?.description || ""}
                            className="min-h-[100px] border-slate-200 dark:border-slate-700"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="video-transcript" className="text-slate-800 dark:text-slate-200">
                            Transcript (Optional)
                          </Label>
                          <Textarea
                            id="video-transcript"
                            placeholder="Add a transcript of the video content"
                            defaultValue={selectedLesson.content?.transcript || ""}
                            className="min-h-[200px] border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>
                    )}

                    {selectedLesson.type === "text" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="text-content" className="text-slate-800 dark:text-slate-200">
                            Article Content
                          </Label>
                          <div className="border border-slate-200 dark:border-slate-700 rounded-md p-2">
                            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <BookOpen className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <Image className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <LinkIcon className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <Code className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <PenTool className="h-4 w-4" />
                              </Button>
                            </div>
                            <Textarea
                              id="text-content"
                              placeholder="Write your article content here..."
                              defaultValue={selectedLesson.content?.textContent || ""}
                              className="min-h-[300px] border-none focus-visible:ring-0 p-0"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedLesson.type === "quiz" && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="quiz-description" className="text-slate-800 dark:text-slate-200">
                            Quiz Description
                          </Label>
                          <Textarea
                            id="quiz-description"
                            placeholder="Provide instructions for this quiz"
                            defaultValue={selectedLesson.content?.description || ""}
                            className="min-h-[100px] border-slate-200 dark:border-slate-700"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Questions</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Question
                            </Button>
                          </div>

                          {(selectedLesson.content?.quiz || []).map((question: any, qIndex: number) => (
                            <Card key={qIndex} className="border-slate-200 dark:border-slate-800">
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                                    <CardDescription>Multiple choice question</CardDescription>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`question-${qIndex}`} className="text-slate-800 dark:text-slate-200">
                                    Question
                                  </Label>
                                  <Input
                                    id={`question-${qIndex}`}
                                    defaultValue={question.question}
                                    className="border-slate-200 dark:border-slate-700"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-slate-800 dark:text-slate-200">Options</Label>
                                  <RadioGroup defaultValue={String(question.correctAnswer)}>
                                    {question.options.map((option: string, oIndex: number) => (
                                      <div key={oIndex} className="flex items-center gap-2">
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value={String(oIndex)} id={`option-${qIndex}-${oIndex}`} />
                                          <Label htmlFor={`option-${qIndex}-${oIndex}`} className="font-normal">
                                            Correct Answer
                                          </Label>
                                        </div>
                                        <Input
                                          defaultValue={option}
                                          className="border-slate-200 dark:border-slate-700"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Option
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Attachments</h3>
                      <div className="space-y-2">
                        {(selectedLesson.content?.attachments || []).map((attachment: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-md border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4 text-blue-500" />
                              <span className="text-slate-700 dark:text-slate-300">{attachment.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        >
                          <Paperclip className="mr-2 h-4 w-4" />
                          Add Attachment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowContentEditor(false)}
                      className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-950 dark:hover:text-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => saveLessonContent(selectedLesson.content)}
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                    >
                      Save Content
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                  <CardTitle className="text-slate-800 dark:text-slate-200">Course Curriculum</CardTitle>
                  <CardDescription>Organize your course content into modules and lessons</CardDescription>
                </CardHeader>
                <CardContent>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="modules" type="MODULE">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                          {modules.map((module, moduleIndex) => (
                            <Draggable key={module.id} draggableId={module.id} index={moduleIndex}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="rounded-lg border border-slate-200 dark:border-slate-800"
                                >
                                  <div className="flex items-center gap-2 p-4">
                                    <div {...provided.dragHandleProps} className="cursor-move">
                                      <GripVertical className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                      <Input
                                        value={module.title}
                                        onChange={(e) => handleModuleTitleChange(module.id, e.target.value)}
                                        className="h-8 flex-1 border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200"
                                      />
                                      <Input
                                        value={module.description}
                                        onChange={(e) => handleModuleDescriptionChange(module.id, e.target.value)}
                                        className="h-8 flex-1 border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400"
                                        placeholder="Module description"
                                      />
                                    </div>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleRemoveModule(module.id)}
                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Delete module</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <Separator />
                                  <Droppable droppableId={module.id} type="LESSON">
                                    {(provided) => (
                                      <div ref={provided.innerRef} {...provided.droppableProps} className="p-2">
                                        {module.lessons.map((lesson, lessonIndex) => (
                                          <Draggable key={lesson.id} draggableId={lesson.id} index={lessonIndex}>
                                            {(provided) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="mb-2 flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-background p-2"
                                              >
                                                <div {...provided.dragHandleProps} className="cursor-move">
                                                  <GripVertical className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                  <div className="flex items-center gap-2">
                                                    {getLessonIcon(lesson.type)}
                                                    <Input
                                                      value={lesson.title}
                                                      onChange={(e) =>
                                                        handleLessonTitleChange(module.id, lesson.id, e.target.value)
                                                      }
                                                      className="h-8 flex-1 border-slate-200 dark:border-slate-700"
                                                    />
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <Select
                                                      value={lesson.type}
                                                      onValueChange={(value) =>
                                                        handleLessonTypeChange(module.id, lesson.id, value)
                                                      }
                                                    >
                                                      <SelectTrigger className="h-8 w-[120px] border-slate-200 dark:border-slate-700">
                                                        <SelectValue />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        <SelectItem value="video">Video</SelectItem>
                                                        <SelectItem value="text">Text/Article</SelectItem>
                                                        <SelectItem value="quiz">Quiz</SelectItem>
                                                        <SelectItem value="exercise">Exercise</SelectItem>
                                                        <SelectItem value="project">Project</SelectItem>
                                                      </SelectContent>
                                                    </Select>
                                                    <Input
                                                      value={lesson.duration}
                                                      onChange={(e) =>
                                                        handleLessonDurationChange(module.id, lesson.id, e.target.value)
                                                      }
                                                      placeholder="Duration"
                                                      className="h-8 w-[100px] border-slate-200 dark:border-slate-700"
                                                    />
                                                  </div>
                                                </div>
                                                <div className="flex gap-1">
                                                  <TooltipProvider>
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <Button
                                                          variant="outline"
                                                          size="icon"
                                                          onClick={() => openLessonEditor(module.id, lesson.id)}
                                                          className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                                                        >
                                                          <PenTool className="h-4 w-4" />
                                                        </Button>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <p>Edit lesson content</p>
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  </TooltipProvider>
                                                  <TooltipProvider>
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <Button
                                                          variant="outline"
                                                          size="icon"
                                                          onClick={() => handleRemoveLesson(module.id, lesson.id)}
                                                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                                                        >
                                                          <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <p>Delete lesson</p>
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  </TooltipProvider>
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="mt-2 w-full justify-start text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                                          onClick={() => handleAddLesson(module.id)}
                                        >
                                          <Plus className="mr-2 h-4 w-4" />
                                          Add Lesson
                                        </Button>
                                      </div>
                                    )}
                                  </Droppable>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <Button
                    variant="outline"
                    className="mt-4 w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                    onClick={handleAddModule}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Module
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">Course Pricing</CardTitle>
                <CardDescription>Set the price for your course and payment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="pricing-type" className="text-slate-800 dark:text-slate-200">
                    Pricing Type
                  </Label>
                  <Select defaultValue="paid">
                    <SelectTrigger id="pricing-type" className="border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="subscription">Subscription Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-slate-800 dark:text-slate-200">
                    Price (USD)
                  </Label>
                  <div className="flex items-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-l-md border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue="49.99"
                      className="rounded-l-none border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch id="crypto-payments" />
                    <Label htmlFor="crypto-payments" className="text-slate-800 dark:text-slate-200">
                      Accept cryptocurrency payments
                    </Label>
                  </div>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="accept-eth"
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
                      />
                      <Label htmlFor="accept-eth" className="text-slate-700 dark:text-slate-300">
                        Ethereum (ETH)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="accept-usdc"
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
                      />
                      <Label htmlFor="accept-usdc" className="text-slate-700 dark:text-slate-300">
                        USD Coin (USDC)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="accept-btc"
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
                      />
                      <Label htmlFor="accept-btc" className="text-slate-700 dark:text-slate-300">
                        Bitcoin (BTC)
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">Revenue Sharing</CardTitle>
                <CardDescription>Configure how revenue is distributed for your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                  <div className="text-sm">
                    <p className="font-medium text-slate-800 dark:text-slate-200">Platform Fee</p>
                    <p className="text-muted-foreground">SkillChain takes a 2% fee from all course sales</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet-address" className="text-slate-800 dark:text-slate-200">
                    Your Wallet Address (for crypto payments)
                  </Label>
                  <Input id="wallet-address" placeholder="0x..." className="border-slate-200 dark:border-slate-700" />
                  <p className="text-xs text-muted-foreground">
                    This is where you'll receive cryptocurrency payments for your course
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch id="smart-contract" />
                    <Label htmlFor="smart-contract" className="text-slate-800 dark:text-slate-200">
                      Use smart contract for transparent revenue sharing
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    A smart contract will automatically distribute revenue according to the platform's fee structure
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">Course Settings</CardTitle>
                <CardDescription>Configure additional settings for your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-slate-800 dark:text-slate-200">
                    Language
                  </Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language" className="border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-800 dark:text-slate-200">Course Visibility</Label>
                  <RadioGroup defaultValue="public">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="visibility-public" />
                      <Label htmlFor="visibility-public" className="text-slate-700 dark:text-slate-300">
                        Public - Listed in marketplace
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unlisted" id="visibility-unlisted" />
                      <Label htmlFor="visibility-unlisted" className="text-slate-700 dark:text-slate-300">
                        Unlisted - Accessible via direct link
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="visibility-private" />
                      <Label htmlFor="visibility-private" className="text-slate-700 dark:text-slate-300">
                        Private - Only accessible to invited users
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-800 dark:text-slate-200">Certificate Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch id="enable-certificate" defaultChecked />
                      <Label htmlFor="enable-certificate" className="text-slate-700 dark:text-slate-300">
                        Enable course completion certificate
                      </Label>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <Switch id="nft-certificate" defaultChecked />
                      <Label htmlFor="nft-certificate" className="text-slate-700 dark:text-slate-300">
                        Issue certificate as an NFT
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-800 dark:text-slate-200">Community Features</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch id="enable-forum" defaultChecked />
                      <Label htmlFor="enable-forum" className="text-slate-700 dark:text-slate-300">
                        Enable course discussion forum
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="enable-reviews" defaultChecked />
                      <Label htmlFor="enable-reviews" className="text-slate-700 dark:text-slate-300">
                        Allow student reviews
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-200">Advanced Settings</CardTitle>
                <CardDescription>Configure advanced options for your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label className="text-slate-800 dark:text-slate-200">Storage Options</Label>
                  <RadioGroup defaultValue="centralized">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="centralized" id="storage-centralized" />
                      <Label htmlFor="storage-centralized" className="text-slate-700 dark:text-slate-300">
                        Centralized - Store content on SkillChain servers
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ipfs" id="storage-ipfs" />
                      <Label htmlFor="storage-ipfs" className="text-slate-700 dark:text-slate-300">
                        Decentralized - Store content on IPFS
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    Decentralized storage ensures your content remains available even if SkillChain servers go offline
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-domain" className="text-slate-800 dark:text-slate-200">
                    Custom Domain (Optional)
                  </Label>
                  <Input
                    id="custom-domain"
                    placeholder="course.yourdomain.com"
                    className="border-slate-200 dark:border-slate-700"
                  />
                  <p className="text-xs text-muted-foreground">Use your own domain for your course landing page</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}

