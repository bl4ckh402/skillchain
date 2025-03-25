"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

interface LessonContentProps {
  lesson: {
    id: string
    title: string
    type: string
    duration: string
    completed?: boolean
    current?: boolean
  }
}

export default function LessonContent({ lesson }: LessonContentProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false)

  // Mock quiz data
  const quizData = {
    question: "Which of the following is NOT a characteristic of blockchain technology?",
    options: [
      { id: "a", text: "Decentralization" },
      { id: "b", text: "Immutability" },
      { id: "c", text: "Centralized control", correct: true },
      { id: "d", text: "Transparency" },
    ],
  }

  // Mock exercise data
  const exerciseData = {
    title: "Create a Simple Hash Function",
    description:
      "In this exercise, you will implement a basic hash function in JavaScript that takes a string input and produces a fixed-size hash output.",
    instructions: [
      "Create a function that takes a string as input",
      "Convert each character to its ASCII code",
      "Combine the codes using a simple algorithm",
      "Return a fixed-length hash string",
    ],
    codeTemplate: `function simpleHash(input) {
  // Your code here
  
  return hash;
}

// Test your function
console.log(simpleHash("blockchain"));
console.log(simpleHash("Blockchain"));
console.log(simpleHash("BlockChain"));`,
  }

  // Mock project data
  const projectData = {
    title: "Build a Simple Blockchain",
    description:
      "Apply what you've learned to create a basic blockchain implementation with blocks, hashing, and a simple proof-of-work mechanism.",
    objectives: [
      "Create a Block class with appropriate properties",
      "Implement a Blockchain class to manage blocks",
      "Add methods for adding blocks and validating the chain",
      "Implement a simple proof-of-work mechanism",
    ],
    deliverables: [
      "Complete code implementation",
      "Documentation explaining your design choices",
      "Test cases demonstrating functionality",
    ],
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number.parseInt(e.target.value))
  }

  const handleAnswerSubmit = () => {
    if (selectedAnswer) {
      const correctOption = quizData.options.find((option) => option.correct)
      const isCorrect = correctOption && selectedAnswer === correctOption.id
      setIsAnswerCorrect(isCorrect)
      setIsAnswerSubmitted(true)
    }
  }

  // Render different content based on lesson type
  const renderLessonContent = () => {
    switch (lesson.type) {
      case "video":
        return (
          <div className="space-y-4">
            <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=720&width=1280"
                  alt="Video thumbnail"
                  className="w-full h-full object-cover opacity-50"
                />
                {!isPlaying && (
                  <Button
                    size="icon"
                    className="absolute h-16 w-16 rounded-full bg-white/90 hover:bg-white shadow-lg"
                    onClick={handlePlayPause}
                  >
                    <Play className="h-8 w-8 fill-blue-600 text-blue-600" />
                    <span className="sr-only">Play video</span>
                  </Button>
                )}
              </div>

              {/* Video controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex flex-col gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleProgressChange}
                    className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={handleMuteToggle}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <span className="text-xs text-white">
                        {Math.floor(
                          (progress / 100) * Number.parseInt(lesson.duration.split(":")[0]) * 60 +
                            Number.parseInt(lesson.duration.split(":")[1]),
                        )}
                        s / {lesson.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h2>Public Key Cryptography</h2>
              <p>
                Public key cryptography is a cryptographic system that uses pairs of keys: public keys (which may be
                known to others) and private keys (which are known only to the owner). The generation of such key pairs
                depends on cryptographic algorithms which are based on mathematical problems termed one-way functions.
              </p>
              <p>
                In this lesson, we'll explore how public key cryptography works, its applications in blockchain
                technology, and how it enables secure transactions without requiring trust between parties.
              </p>
              <h3>Key Concepts</h3>
              <ul>
                <li>Asymmetric encryption vs. symmetric encryption</li>
                <li>Public and private key pairs</li>
                <li>Digital signatures and verification</li>
                <li>Applications in blockchain and cryptocurrencies</li>
              </ul>
            </div>
          </div>
        )
      case "quiz":
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{quizData.question}</h2>
                  <RadioGroup value={selectedAnswer || ""} onValueChange={setSelectedAnswer}>
                    {quizData.options.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-2 p-3 rounded-lg border ${
                          isAnswerSubmitted && option.correct
                            ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                            : isAnswerSubmitted && selectedAnswer === option.id && !option.correct
                              ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                              : "border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <RadioGroupItem value={option.id} id={option.id} disabled={isAnswerSubmitted} />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                          {option.text}
                        </Label>
                        {isAnswerSubmitted && option.correct && (
                          <span className="text-green-600 dark:text-green-400 text-sm font-medium">Correct</span>
                        )}
                        {isAnswerSubmitted && selectedAnswer === option.id && !option.correct && (
                          <span className="text-red-600 dark:text-red-400 text-sm font-medium">Incorrect</span>
                        )}
                      </div>
                    ))}
                  </RadioGroup>

                  {isAnswerSubmitted ? (
                    <div
                      className={`p-4 rounded-lg ${
                        isAnswerCorrect
                          ? "bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300"
                          : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300"
                      }`}
                    >
                      {isAnswerCorrect
                        ? "Correct! Blockchain technology is decentralized by nature, which means it operates without a central authority."
                        : "Incorrect. Blockchain technology is decentralized by nature, which means it operates without a central authority. Centralized control is not a characteristic of blockchain."}
                    </div>
                  ) : (
                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={!selectedAnswer}
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                    >
                      Submit Answer
                    </Button>
                  )}

                  {isAnswerSubmitted && (
                    <Button variant="outline" className="w-full mt-2">
                      Continue to Next Question
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case "exercise":
        return (
          <div className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2>{exerciseData.title}</h2>
              <p>{exerciseData.description}</p>
              <h3>Instructions:</h3>
              <ol>
                {exerciseData.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="code" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="code">Code Editor</TabsTrigger>
                    <TabsTrigger value="preview">Output</TabsTrigger>
                  </TabsList>
                  <TabsContent value="code">
                    <div className="relative">
                      <Textarea
                        className="min-h-[300px] font-mono text-sm bg-slate-950 text-slate-50 p-4"
                        defaultValue={exerciseData.codeTemplate}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="min-h-[300px] bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm">
                      <p className="text-green-400">// Output will appear here when you run your code</p>
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline">Reset</Button>
                  <Button>Run Code</Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                    Submit Solution
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case "project":
        return (
          <div className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2>{projectData.title}</h2>
              <p>{projectData.description}</p>

              <h3>Project Objectives:</h3>
              <ul>
                {projectData.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>

              <h3>Deliverables:</h3>
              <ul>
                {projectData.deliverables.map((deliverable, index) => (
                  <li key={index}>{deliverable}</li>
                ))}
              </ul>

              <h3>Submission Guidelines:</h3>
              <p>
                Upload your project files using the form below. Include all source code files, documentation, and any
                additional resources required to run your implementation.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-files">Project Files</Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="project-files"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            ZIP, RAR, or individual files (MAX. 10MB)
                          </p>
                        </div>
                        <input id="project-files" type="file" className="hidden" multiple />
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="project-notes">Project Notes</Label>
                    <Textarea
                      id="project-notes"
                      placeholder="Add any notes or comments about your implementation..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                    Submit Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Content not available</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{lesson.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="capitalize">{lesson.type}</span>
          <span>•</span>
          <span>{lesson.duration}</span>
        </div>
      </div>

      {renderLessonContent()}
    </div>
  )
}

