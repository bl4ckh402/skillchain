"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck, FileText, Download, Info, FileQuestion } from "lucide-react";
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
    let attachmentsValue = [];
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
      
      if (lesson.content.attachments && Array.isArray(lesson.content.attachments)) {
        attachmentsValue = lesson.content.attachments;
      }
    }

    // Fallback to direct properties if content object values are empty
    if (!videoUrlValue && lesson.videoUrl) {
      videoUrlValue = lesson.videoUrl;
    }
    
    if (attachmentsValue.length === 0 && lesson.attachments && Array.isArray(lesson.attachments)) {
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
    code({ node, inline, className, children, ...props }) {
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
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={() => handleCopyCode(code)}
          >
            {copiedCode === code ? (
              <CheckCheck className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
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
    h1: ({ children }) => (
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight mb-4 mt-8">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-3 mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-3 mt-6">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2 mt-4">
        {children}
      </h4>
    ),
    p: ({ children }) => <p className="leading-7 mb-4">{children}</p>,
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 ml-2 space-y-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 ml-2 space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-7">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }) => (
      <img src={src} alt={alt} className="rounded-lg my-4 max-w-full" />
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-slate-100 dark:bg-slate-800">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="border border-slate-200 dark:border-slate-700 px-4 py-2 text-left font-medium">
        {children}
      </th>
    ),
    tr: ({ children }) => <tr>{children}</tr>,
    td: ({ children }) => (
      <td className="border border-slate-200 dark:border-slate-700 px-4 py-2">
        {children}
      </td>
    ),
  };

  // Determine the content type
  const hasVideo = videoUrl && videoUrl.trim() !== "";
  const hasQuiz = lesson.content?.quiz && lesson.content.quiz.length > 0;
  const isQuizType = lesson.type === LessonType.QUIZ || hasQuiz;
  const isVideoType = hasVideo || lesson.type === LessonType.VIDEO;
  const isExerciseType = lesson.type === LessonType.EXERCISE || lesson.type === LessonType.PROJECT;
  
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
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
          <h3 className="font-medium mb-2 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            No Content Available
          </h3>
          <p>This lesson doesn't have any text content yet.</p>
        </div>
      );
    }
  };

  return (
    <Card className="border-blue-100 dark:border-blue-900 overflow-hidden">
      {isVideoType ? (
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="w-full justify-start p-0 rounded-none bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
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
            <div className="aspect-video w-full">
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
              <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
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
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
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
              <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
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
            <div className="bg-blue-100 dark:bg-blue-900 w-10 h-10 rounded-full flex items-center justify-center">
              <FileQuestion className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {lesson.title}
            </h2>
          </div>

          {/* Instructions/Intro for quiz */}
          <div className="prose dark:prose-invert max-w-none mb-6">
            {getMainContent()}
          </div>

          {hasQuiz && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">
                Quiz Preview
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  This quiz contains {lesson.content.quiz.length} questions. Complete it to progress in the course.
                </p>
                <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Take the quiz in the "Quiz" tab.
                </div>
              </div>
            </div>
          )}
        </div>
      ) : isExerciseType ? (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 dark:bg-emerald-900 w-10 h-10 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
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
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-3 text-slate-800 dark:text-slate-200">
                Exercise Resources
              </h3>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {attachment.name}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
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
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
            {lesson.title}
          </h2>

          {/* Text content */}
          <div className="prose dark:prose-invert max-w-none">
            {getMainContent()}
          </div>

          {/* Transcript section if available but no video */}
          {transcript && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-3 text-slate-800 dark:text-slate-200">
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
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-3 text-slate-800 dark:text-slate-200">
                Attachments
              </h3>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {attachment.name}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
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