"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Calendar, Mail, ArrowRight } from "lucide-react";
import { Footer } from "@/components/footer";
import confetti from "canvas-confetti";

export default function ApplicationSuccessPage() {
  // Trigger confetti effect when page loads
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Since particles fall down, start from the top
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              Application Submitted Successfully!
            </CardTitle>
            <CardDescription className="text-base">
              Your application to become an instructor has been received
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                What happens next?
              </h3>
              <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 dark:bg-blue-800 rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium">
                    1
                  </span>
                  <p>
                    Our team will review your application (usually within 5-7
                    business days)
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 dark:bg-blue-800 rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium">
                    2
                  </span>
                  <p>
                    You'll receive an email notification about the status of
                    your application
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 dark:bg-blue-800 rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium">
                    3
                  </span>
                  <p>
                    If approved, you'll gain access to the instructor dashboard
                    and course creation tools
                  </p>
                </li>
              </ol>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4 flex flex-col">
                <h3 className="font-medium mb-2">Track Application Status</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check your application status at any time in your dashboard
                </p>
                <Button asChild variant="outline" className="mt-auto">
                  <Link href="/dashboard/applications">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Application Status
                  </Link>
                </Button>
              </div>

              <div className="border rounded-lg p-4 flex flex-col">
                <h3 className="font-medium mb-2">Have Questions?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact our instructor support team if you have any questions
                </p>
                <Button asChild variant="outline" className="mt-auto">
                  <Link href="mailto:instructor-support@blocklearn.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between flex-col sm:flex-row gap-4">
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              <Link href="/courses">
                Explore Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
