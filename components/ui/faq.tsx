"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const faqData = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I start learning blockchain development?",
        answer:
          "Start with our Blockchain Fundamentals course, which covers the basic concepts. Then progress to more advanced courses like Smart Contract Development and DeFi Protocols.",
      },
      {
        question: "What are the prerequisites?",
        answer:
          "Basic programming knowledge is recommended. For blockchain development, familiarity with JavaScript/TypeScript is helpful. Each course lists specific prerequisites.",
      },
      {
        question: "Can I learn at my own pace?",
        answer:
          "Yes, all courses are self-paced, allowing you to learn on your schedule with lifetime access to materials.",
      },
    ],
  },
  {
    category: "Course Information",
    questions: [
      {
        question: "How long do I have access to courses?",
        answer:
          "Once enrolled, you have lifetime access to the course materials and future updates.",
      },
      {
        question: "Are the certificates recognized?",
        answer:
          "Yes, our certificates are verified and recognized by industry partners in the Web3 space.",
      },
      {
        question: "Can I download course content for offline viewing?",
        answer:
          "Yes, most course materials can be downloaded for offline access through our mobile app.",
      },
    ],
  },
  {
    category: "Teaching & Contribution",
    questions: [
      {
        question: "How can I become an instructor?",
        answer:
          "Apply through our 'Become an Instructor' program. You'll need to demonstrate expertise in your field and create a sample course module.",
      },
      {
        question: "What's the instructor revenue share?",
        answer:
          "Instructors earn 70% of course revenue and additional bonuses based on student success rates and reviews.",
      },
      {
        question: "Can I collaborate with other instructors??",
        answer:
          "Yes, we encourage collaboration. You can propose co-created courses through our instructor portal.",
      },
    ],
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "What if I encounter technical issues?",
        answer:
          "Our support team is available 24/7. You can also get help from our community forums or direct message course instructors.",
      },
      {
        question: "What hardware do I need to start learning on SkillChain??",
        answer:
          "A standard computer with at least 4GB of RAM, a modern browser, and a stable internet connection are sufficient.",
      },
    ],
  },
];

export function FAQSection() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqData = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="container px-4 py-6 mx-auto sm:py-8 md:py-10 lg:py-12">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base md:text-lg">
            Find answers to common questions about SkillChain's platform and
            courses
          </p>
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md mx-auto mt-4"
          />
        </div>

        <div className="grid gap-4 sm:gap-6">
          {filteredFaqData.map((category, index) => (
            <Card key={index} className="border-blue-100 dark:border-blue-900">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/50 dark:to-teal-950/50">
                <CardTitle className="text-slate-800 dark:text-slate-200">
                  {category.category}
                </CardTitle>
                <CardDescription>
                  Common questions about {category.category.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, qIndex) => (
                    <AccordionItem
                      key={qIndex}
                      value={`item-${index}-${qIndex}`}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <AccordionTrigger className="py-3 text-sm text-left hover:no-underline hover:text-blue-600 dark:hover:text-blue-400 sm:text-base">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 text-sm text-muted-foreground sm:text-base">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
