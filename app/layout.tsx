import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { JobsProvider } from "@/context/JobsProvider";
import { HackathonProvider } from "@/context/HackathonContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { CourseProvider } from "@/context/CourseContext";
import { DashboardProvider } from "@/context/DashboardProvider";
import { CommunityProvider } from "@/context/CommunityProvider";
import { InstructorApplicationProvider } from "@/context/InstructorApllicationContext";
import { CourseProgressProvider } from "@/context/CourseProgressContext";
import { BootcampProvider } from "@/context/BootcampContext";
import type React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import Script from "next/script";
import { StreamClientProvider } from "@/context/StreamClientProvider";
import { PaymentProvider } from "@/context/PaymentProvider";
import { Suspense } from "react";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title:
    "SkillChain - Blockchain, Web3 & Artificial Intelligence Education Platform",
  description: "Learn blockchain technology through interactive courses",
  keywords: [
    "blockchain",
    "education",
    "courses",
    "crypto",
    "web3",
    "smart contracts",
    "decentralized applications",
    "dapps",
    "NFTs",
    "cryptocurrency",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add Paystack script for payment integration */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <StreamClientProvider>
              <JobsProvider>
                <InstructorApplicationProvider>
                  <HackathonProvider>
                    <ProjectProvider>
                      <CourseProvider>
                        <PaymentProvider>
                          <CourseProgressProvider>
                            <BootcampProvider>
                              <CommunityProvider>
                                <DashboardProvider>
                                  <div className="flex flex-col min-h-screen">
                                    <header className="sticky top-0 z-40 border-b bg-background">
                                      <div className="container flex items-center justify-between h-16 py-4">
                                        <MainNav />
                                        <div className="flex items-center gap-4">
                                          <UserNav />
                                          <ModeToggle />
                                        </div>
                                      </div>
                                    </header>
                                    <main className="flex-1">{children}</main>
                                  </div>
                                  <Toaster />
                                </DashboardProvider>
                              </CommunityProvider>
                            </BootcampProvider>
                          </CourseProgressProvider>
                        </PaymentProvider>
                      </CourseProvider>
                    </ProjectProvider>
                  </HackathonProvider>
                </InstructorApplicationProvider>
              </JobsProvider>
            </StreamClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
