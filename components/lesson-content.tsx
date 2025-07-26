"use client";

import { useState, useEffect, SetStateAction } from "react";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Copy,
  CheckCheck,
  FileText,
  Download,
  Info,
  FileQuestion,
} from "lucide-react";
import { LessonType } from "@/types/course";

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    content?: {
      videoUrl?: string;
      textContent?: string;
      description?: string;
      transcript?: string;
      instructions?: string;
      quiz?: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        solution?: string;
      }>;
      attachments?: Array<{
        name: string;
        url: string;
        type?: string;
        size?: number;
      }>;
    };
    videoUrl?: string;
    attachments?: { name: string; url: string }[];
    type?: string;
    duration?: string;
    status?: string;
  };
}

export default function LessonContent({ lesson }: LessonContentProps) {
  const { theme } = useTheme();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [contentText, setContentText] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");

  // Extract content based on structure
  useEffect(() => {
    // Initialize defaults
    let textContent = "";
    let videoUrlValue = "";
    let attachmentsValue: string | SetStateAction<any[]> = [];
    let transcriptValue = "";
    let descriptionValue = "";
    let instructionsValue = "";

    // Check for content in the lesson.content object first
    if (lesson.content) {
      if (lesson.content.textContent) {
        textContent = lesson.content.textContent;
      }

      if (lesson.content.videoUrl) {
        videoUrlValue = lesson.content.videoUrl;
      }

      if (lesson.content.description) {
        descriptionValue = lesson.content.description;
        // Use description as content if textContent is empty
        if (!textContent) {
          textContent = lesson.content.description;
        }
      }

      if (lesson.content.transcript) {
        transcriptValue = lesson.content.transcript;
      }

      if (lesson.content.instructions) {
        instructionsValue = lesson.content.instructions;
      }

      if (
        lesson.content.attachments &&
        Array.isArray(lesson.content.attachments)
      ) {
        attachmentsValue = lesson.content.attachments;
      }
    }

    // Fallback to direct properties if content object values are empty
    if (!videoUrlValue && lesson.videoUrl) {
      videoUrlValue = lesson.videoUrl;
    }

    if (
      attachmentsValue.length === 0 &&
      lesson.attachments &&
      Array.isArray(lesson.attachments)
    ) {
      attachmentsValue = lesson.attachments;
    }

    // Set the state with the gathered values
    setContentText(textContent);
    setVideoUrl(videoUrlValue);
    setAttachments(attachmentsValue);
    setTranscript(transcriptValue);
    setDescription(descriptionValue);
    setInstructions(instructionsValue);
  }, [lesson]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const components = {
    code({
      node,
      inline,
      className,
      children,
      ...props
    }: {
      node?: any;
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
      [key: string]: any;
    }) {
      const match = /language-(\w+)/.exec(className || "");
      const code = String(children).replace(/\n$/, "");

      return !inline && match ? (
        <div className="relative">
          <SyntaxHighlighter
            style={darcula}
            language={match[1]}
            PreTag="div"
            className="rounded-md"
            {...props}
          >
            {code}
          </SyntaxHighlighter>
          <Button
            variant="ghost"
            size="sm"
            className="absolute w-8 h-8 p-0 top-2 right-2"
            onClick={() => handleCopyCode(code)}
          >
            {copiedCode === code ? (
              <CheckCheck className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      ) : (
        <code
          className={`p-1 rounded-md bg-slate-100 dark:bg-slate-800 ${className}`}
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <h1
        className="mt-8 mb-4 text-4xl font-extrabold tracking-tight scroll-m-20"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <h2
        className="mt-8 mb-3 text-3xl font-semibold tracking-tight scroll-m-20"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <h3
        className="mt-6 mb-3 text-2xl font-semibold tracking-tight scroll-m-20"
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <h4
        className="mt-4 mb-2 text-xl font-semibold tracking-tight scroll-m-20"
        {...props}
      >
        {children}
      </h4>
    ),
    p: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <p className="mb-4 leading-7" {...props}>
        {children}
      </p>
    ),
    ul: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <ul className="mb-4 ml-2 space-y-2 list-disc list-inside" {...props}>
        {children}
      </ul>
    ),
    ol: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <ol className="mb-4 ml-2 space-y-2 list-decimal list-inside" {...props}>
        {children}
      </ol>
    ),
    li: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <li className="leading-7" {...props}>
        {children}
      </li>
    ),
    blockquote: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <blockquote
        className="pl-4 my-4 italic border-l-4 border-blue-500"
        {...props}
      >
        {children}
      </blockquote>
    ),
    a: ({
      href,
      children,
      ...props
    }: {
      href?: string;
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
        {...props}
      >
        {children}
      </a>
    ),
    img: ({
      src,
      alt,
      ...props
    }: {
      src?: string;
      alt?: string;
      [key: string]: any;
    }) => (
      <img
        src={src}
        alt={alt}
        className="max-w-full my-4 rounded-lg"
        {...props}
      />
    ),
    table: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <div className="mb-4 overflow-x-auto">
        <table
          className="w-full border border-collapse border-slate-200 dark:border-slate-700"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <thead className="bg-slate-100 dark:bg-slate-800" {...props}>
        {children}
      </thead>
    ),
    th: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <th
        className="px-4 py-2 font-medium text-left border border-slate-200 dark:border-slate-700"
        {...props}
      >
        {children}
      </th>
    ),
    tr: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => <tr {...props}>{children}</tr>,
    td: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <td
        className="px-4 py-2 border border-slate-200 dark:border-slate-700"
        {...props}
      >
        {children}
      </td>
    ),
  };

  // Determine the content type
  const hasVideo = videoUrl && videoUrl.trim() !== "";
  const hasQuiz = lesson.content?.quiz && lesson.content.quiz.length > 0;
  const isQuizType = lesson.type === LessonType.QUIZ || hasQuiz;
  const isVideoType = hasVideo || lesson.type === LessonType.VIDEO;
  const isExerciseType =
    lesson.type === LessonType.EXERCISE || lesson.type === LessonType.PROJECT;

  // Helper to determine content to render for non-video lessons
  const getMainContent = () => {
    if (contentText) {
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={components}
        >
          {contentText}
        </ReactMarkdown>
      );
    } else if (description) {
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={components}
        >
          {description}
        </ReactMarkdown>
      );
    } else if (isQuizType && instructions) {
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={components}
        >
          {instructions}
        </ReactMarkdown>
      );
    } else {
      return (
        <div className="p-4 border rounded-md bg-amber-50 border-amber-200 text-amber-800">
          <h3 className="flex items-center mb-2 font-medium">
            <FileText className="w-5 h-5 mr-2" />
            No Content Available
          </h3>
          <p>This lesson doesn't have any text content yet.</p>
        </div>
      );
    }
  };

  return (
    <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
      {isVideoType ? (
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="justify-start w-full p-0 border-b rounded-none bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 pt-4 pb-3 px-6"
            >
              Video
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 pt-4 pb-3 px-6"
            >
              Notes
            </TabsTrigger>
            {transcript && (
              <TabsTrigger
                value="transcript"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 pt-4 pb-3 px-6"
              >
                Transcript
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="video" className="m-0">
            <div className="w-full aspect-video">
              {videoUrl?.includes("youtube.com") ||
              videoUrl?.includes("youtu.be") ? (
                <iframe
                  src={videoUrl.replace("watch?v=", "embed/")}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : videoUrl?.includes("vimeo.com") ? (
                <iframe
                  src={videoUrl.replace("vimeo.com", "player.vimeo.com/video")}
                  title={lesson.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full"
                  poster="/images/video-placeholder.jpg"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            <div className="p-6">
              <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
                {lesson.title}
              </h2>

              {description && (
                <div className="prose dark:prose-invert max-w-none">
                  {typeof description === "string" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={components}
                    >
                      {description}
                    </ReactMarkdown>
                  ) : (
                    <p>{JSON.stringify(description)}</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="p-6 m-0">
            <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
              {lesson.title}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {contentText ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={components}
                >
                  {contentText}
                </ReactMarkdown>
              ) : (
                <p className="text-slate-600 dark:text-slate-400">
                  There are no additional notes for this lesson.
                </p>
              )}
            </div>
          </TabsContent>

          {transcript && (
            <TabsContent value="transcript" className="p-6 m-0">
              <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
                Video Transcript
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                {typeof transcript === "string" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={components}
                  >
                    {transcript}
                  </ReactMarkdown>
                ) : (
                  <p>{JSON.stringify(transcript)}</p>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      ) : isQuizType ? (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900">
              <FileQuestion className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {lesson.title}
            </h2>
          </div>

          {/* Instructions/Intro for quiz */}
          <div className="mb-6 prose dark:prose-invert max-w-none">
            {getMainContent()}
          </div>

          {hasQuiz && (
            <div className="pt-6 mt-6 border-t">
              <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-200">
                Quiz Preview
              </h3>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                <p className="mb-2 text-slate-600 dark:text-slate-400">
                  This quiz contains {lesson.content?.quiz?.length || 0}{" "}
                  questions. Complete it to progress in the course.
                </p>
                <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                  <Info className="w-4 h-4" />
                  Take the quiz in the "Quiz" tab.
                </div>
              </div>
            </div>
          )}
        </div>
      ) : isExerciseType ? (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {lesson.title}
            </h2>
          </div>

          {/* Exercise content */}
          <div className="prose dark:prose-invert max-w-none">
            {getMainContent()}
          </div>

          {/* Attachments section */}
          {attachments && attachments.length > 0 && (
            <div className="pt-6 mt-8 border-t">
              <h3 className="mb-3 text-lg font-medium text-slate-800 dark:text-slate-200">
                Exercise Resources
              </h3>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 transition-colors border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900">
                      <span className="text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-slate-800 dark:text-slate-200">
                        {attachment.name}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
            {lesson.title}
          </h2>

          {/* Text content */}
          <div className="prose dark:prose-invert max-w-none">
            {getMainContent()}
          </div>

          {/* Transcript section if available but no video */}
          {transcript && (
            <div className="pt-6 mt-8 border-t">
              <h3 className="mb-3 text-lg font-medium text-slate-800 dark:text-slate-200">
                Transcript
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={components}
                >
                  {transcript}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Attachments section */}
          {attachments && attachments.length > 0 && (
            <div className="pt-6 mt-8 border-t">
              <h3 className="mb-3 text-lg font-medium text-slate-800 dark:text-slate-200">
                Attachments
              </h3>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 transition-colors border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900">
                      <span className="text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-slate-800 dark:text-slate-200">
                        {attachment.name}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
