"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const termsContent = [
  {
    title: "Acceptance of Terms",
    content: `By accessing and using SkillChain, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our platform.`
  },
  {
    title: "User Registration",
    content: `Users must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials and wallet. Any activities that occur under your account are your responsibility.`
  },
  {
    title: "Course Content & Intellectual Property",
    content: `All course content, including but not limited to videos, texts, and assignments, is protected by intellectual property rights. Users may not copy, distribute, or modify content without explicit permission.`
  },
  {
    title: "Token Economy",
    content: `Tokens earned through our platform have no monetary value and are for educational purposes only. The distribution and use of tokens are subject to our platform's guidelines and may be modified at any time.`
  },
  {
    title: "Instructor Terms",
    content: `Instructors must ensure their content is original or properly licensed. They are responsible for maintaining course quality and responding to student inquiries. Revenue sharing is subject to our current instructor agreement.`
  },
  {
    title: "Code of Conduct",
    content: `Users must behave professionally and respectfully. Harassment, spam, or any form of malicious behavior will result in account suspension. We reserve the right to remove any content that violates our guidelines.`
  },
  {
    title: "Termination",
    content: `We reserve the right to terminate or suspend accounts that violate these terms, with or without notice. Upon termination, access to courses and earned tokens may be restricted.`
  },
  {
    title: "Disclaimers",
    content: `Our platform is provided "as is" without warranties. We are not responsible for the accuracy of course content or any financial decisions made based on learned material.`
  }
]

export function TermsSection() {
  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Terms of Service
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-muted-foreground">
            Please read these terms carefully before using SkillChain.
          </p>
        </div>

        <div className="grid gap-6">
          {termsContent.map((section, index) => (
            <Card key={index} className="border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-sm text-center text-muted-foreground">
          <p>
            For any questions about these terms, please contact{" "}
            <a href="mailto:legal@skillchain.com" className="text-primary hover:underline">
              legal@skillchain.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}