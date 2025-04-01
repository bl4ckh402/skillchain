import type React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { PaymentProvider } from "@/context/PaymentProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SkillChain - Blockchain Education Platform",
  description: "Learn blockchain technology through interactive courses",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <JobsProvider>
              <InstructorApplicationProvider>
                <HackathonProvider>
                  <ProjectProvider>
                    <CourseProvider>
                      <PaymentProvider>
                        <CourseProgressProvider>
                        <CommunityProvider>
                          <DashboardProvider>
                            <div className="flex min-h-screen flex-col">
                              <header className="sticky top-0 z-40 border-b bg-background">
                                <div className="container flex h-16 items-center justify-between py-4">
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
                        </CourseProgressProvider>
                      </PaymentProvider>
                    </CourseProvider>
                  </ProjectProvider>
                </HackathonProvider>
              </InstructorApplicationProvider>
            </JobsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

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