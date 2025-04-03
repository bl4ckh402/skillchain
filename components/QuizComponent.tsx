"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  solution?: string;
}

interface QuizComponentProps {
  quiz: QuizQuestion[];
  lessonId: string;
  courseId: string;
  onComplete: () => void;
}

export default function QuizComponent({
  quiz,
  lessonId,
  courseId,
  onComplete,
}: QuizComponentProps) {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quizProgress, setQuizProgress] = useState<{
    completed: boolean;
    answers: number[];
    score: number;
  } | null>(null);

  useEffect(() => {
    // Initialize selected answers array with -1 (nothing selected) for each question
    setSelectedAnswers(new Array(quiz.length).fill(-1));
    
    // If user is logged in, fetch their previous quiz attempts
    if (user) {
      fetchQuizProgress();
    }
  }, [quiz, user]);

  const fetchQuizProgress = async () => {
    try {
      const quizProgressRef = doc(
        db,
        `users/${user.uid}/quizProgress`,
        `${courseId}_${lessonId}`
      );
      const progressSnapshot = await getDoc(quizProgressRef);
      
      if (progressSnapshot.exists()) {
        const data = progressSnapshot.data();
        setQuizProgress(data);
        
        // If the quiz was previously completed, show the results
        if (data.completed) {
          setSelectedAnswers(data.answers);
          setScore(data.score);
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error("Error fetching quiz progress:", error);
    }
  };

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted || showResults) return;
    
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    // Check if all questions have been answered
    const unansweredQuestions = selectedAnswers.filter(ans => ans === -1);
    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions before submitting. You have ${unansweredQuestions.length} unanswered questions.`);
      return;
    }
    
    setSubmitted(true);
    setSaving(true);
    
    // Calculate score
    let correctAnswers = 0;
    for (let i = 0; i < quiz.length; i++) {
      if (selectedAnswers[i] === quiz[i].correctAnswer) {
        correctAnswers++;
      }
    }
    
    const finalScore = Math.round((correctAnswers / quiz.length) * 100);
    setScore(finalScore);
    
    try {
      // Save quiz results to Firestore
      const quizProgressRef = doc(
        db,
        `users/${user.uid}/quizProgress`,
        `${courseId}_${lessonId}`
      );
      
      await setDoc(quizProgressRef, {
        courseId,
        lessonId,
        answers: selectedAnswers,
        score: finalScore,
        completed: true,
        timestamp: new Date(),
      });
      
      // If score is passing (e.g., >= 70%), mark the lesson as complete
      if (finalScore >= 70) {
        await onComplete();
      }
      
      // Show results
      setShowResults(true);
    } catch (error) {
      console.error("Error saving quiz progress:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers(new Array(quiz.length).fill(-1));
    setSubmitted(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);
  };

  const isPassing = score >= 70;

  // If the quiz was previously completed and passed
  if (quizProgress?.completed && quizProgress.score >= 70) {
    return (
      <Card className="border p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Quiz Completed</h2>
          <p className="text-slate-600 mt-2">
            You've successfully completed this quiz with a score of {quizProgress.score}%.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => setShowResults(true)}
            variant="outline" 
            className="w-full"
          >
            Review Your Answers
          </Button>
          
          <Button 
            onClick={handleRetake}
            variant="outline" 
            className="w-full"
          >
            Retake Quiz
          </Button>
        </div>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="border p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`flex items-center justify-center h-16 w-16 rounded-full ${
            isPassing ? 'bg-green-100' : 'bg-amber-100'
          } mb-4`}>
            {isPassing ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-amber-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold">Quiz Results</h2>
          <p className="text-slate-600 mt-2">
            You scored {score}% ({Math.round(score * quiz.length / 100)} of {quiz.length} correct)
          </p>
          
          {!isPassing && (
            <p className="mt-2 text-amber-600 font-medium">
              You need at least 70% to pass and continue.
            </p>
          )}
        </div>

        <div className="space-y-6 my-6">
          {quiz.map((question, qIndex) => {
            const isCorrect = selectedAnswers[qIndex] === question.correctAnswer;
            
            return (
              <div key={qIndex} className="border rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <div className={`flex-shrink-0 mt-1 ${
                    isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium">
                    {qIndex + 1}. {question.question}
                  </h3>
                </div>
                
                <div className="ml-7 space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className={`p-3 rounded-md ${
                        selectedAnswers[qIndex] === oIndex
                          ? isCorrect
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                          : question.correctAnswer === oIndex
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center">
                          {String.fromCharCode(97 + oIndex)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </div>
                  ))}
                  
                  {!isCorrect && question.solution && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-md">
                      <p className="font-medium text-blue-800 mb-1">Explanation:</p>
                      <div className="text-blue-700 text-sm">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {question.solution}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleRetake}
            variant="outline" 
            className="flex-1"
          >
            Retake Quiz
          </Button>
          
          {isPassing && (
            <Button 
              onClick={onComplete}
              className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
            >
              Continue to Next Lesson
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Current question view (Quiz taking mode)
  const currentQuestion = quiz[currentQuestionIndex];
  
  return (
    <Card className="border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Question {currentQuestionIndex + 1} of {quiz.length}</h2>
        <div className="text-sm text-slate-500">
          {selectedAnswers.filter(ans => ans !== -1).length} of {quiz.length} answered
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionSelect(currentQuestionIndex, index)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedAnswers[currentQuestionIndex] === index
                  ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700'
                  } flex items-center justify-center text-sm font-medium`}>
                  {String.fromCharCode(97 + index)}
                </div>
                <span>{option}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={currentQuestionIndex === quiz.length - 1}
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={saving || selectedAnswers.includes(-1)}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white w-full sm:w-auto"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Quiz'
          )}
        </Button>
      </div>
      
      <div className="mt-6">
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-teal-600 h-2 rounded-full"
            style={{ width: `${(selectedAnswers.filter(ans => ans !== -1).length / quiz.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Progress</span>
          <span>{Math.round((selectedAnswers.filter(ans => ans !== -1).length / quiz.length) * 100)}%</span>
        </div>
      </div>
    </Card>
  );
}