// import React from "react";

// export const documentation = () => {
//   return <div>documentation Page</div>;
// };

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Book,
  Code2,
  FileCode2,
  GitBranch,
  Wallet,
  Layout,
  BookOpen,
  Shield,
} from "lucide-react";
import { marked } from "marked";

const documentationContent = [
  {
    title: "Platform Overview",
    icon: Layout,
    content: `
## Introduction
SkillChain is a decentralized learning platform that combines blockchain technology with education. Our platform allows users to:
- Learn blockchain development through structured courses
- Earn tokens for completing learning objectives
- Get certified with blockchain-verified credentials
- Contribute as an instructor or content creator

## Core Features
- Interactive learning paths
- Token-based incentives
- Blockchain certification
- Peer-to-peer knowledge sharing
    `,
  },
  {
    title: "Getting Started",
    icon: Book,
    content: `
## Account Setup
1. Create your account using email or social login
2. Complete your profile information
3. Set up two-factor authentication (recommended)
4. Connect your wallet for token interactions

## Wallet Integration
- Supported wallets: MetaMask, WalletConnect
- Network: Ethereum, Polygon
- Token standard: ERC-20 for learning rewards
    `,
  },
  {
    title: "Learning Paths",
    icon: GitBranch,
    content: `
## Blockchain Fundamentals
- Blockchain architecture basics
- Cryptography essentials
- Consensus mechanisms
- Network types and differences

## Smart Contract Development
- Solidity programming
- Testing and deployment
- Security best practices
- Common design patterns

## DeFi Development
- DeFi protocols overview
- Yield farming mechanisms
- Liquidity pool implementation
- Flash loan security
    `,
  },
  {
    title: "Navigating the Platform",
    icon: BookOpen,
    content: `
## Dashboard Overview
- **Dashboard**: Your main hub. See your enrolled courses, progress, and token balance.
- **Navigation Bar**: Access Courses, Certifications, Wallet, and Profile from the top menu.

## Enrolling in Courses
1. Go to the **Courses** section from the navigation bar.
2. Browse or search for a course.
3. Click **Enroll** to join a course and start learning.

## Tracking Progress
- Your progress is shown on the Dashboard and inside each course.
- Earn tokens and badges as you complete modules.

## Earning & Using Tokens
- Complete lessons and quizzes to earn tokens.
- View your token balance in the **Wallet** section.
- Use tokens to unlock advanced courses or certifications.

## Getting Certified
- After finishing a course, take the certification quiz.
- Pass the quiz to receive a blockchain-verified certificate.

## Profile & Settings
- Access your profile from the top-right menu.
- Update your info, connect your wallet, or manage security settings.

## Need Help?
- Click the **Help** button in the bottom-right corner or visit the Support section.
    `,
  },
];

export function DocumentationSection() {
  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Documentation
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Complete guide to using the SkillChain platform
          </p>
        </div>

        <div className="flex gap-4 p-4 overflow-x-auto rounded-lg bg-muted/50">
          {documentationContent.map((section, index) => (
            <button
              key={index}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() =>
                document
                  .getElementById(section.title)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <section.icon className="w-4 h-4" />
              {section.title}
            </button>
          ))}
        </div>

        <div className="space-y-12">
          {documentationContent.map((section, index) => (
            <Card
              key={index}
              id={section.title}
              className="border-blue-100 dark:border-blue-900 scroll-m-20"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <section.icon className="w-6 h-6 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      typeof marked.parse === "function"
                        ? (marked.parse as (src: string) => string)(
                            section.content
                          )
                        : marked(section.content),
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-sm text-center text-muted-foreground">
          <p>
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@skillchain.com"
              className="text-primary hover:underline"
            >
              support@skillchain.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
