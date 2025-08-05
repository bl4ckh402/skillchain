import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import { FeaturedCourses } from "@/components/featured-courses";
import { HowItWorks } from "@/components/how-it-works";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="space-y-8 overflow-x-hidden md:space-y-12 lg:space-y-16">
      <div className="flex flex-col">
        <HeroSection />
        <FeaturedCourses />
        <HowItWorks />
        <Testimonials />
        <section className="w-full py-8 md:py-12 lg:py-16 bg-muted/40 dark:bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to Start Learning?
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of students and instructors in the blockchain
                  community
                </p>
                <ul className="flex flex-col gap-2 max-w-[600px] mx-auto text-left">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Access to beginner blockchain courses and tutorials
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Earn while learning through hands-on projects when you
                    become an instructor
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Get certified and showcase your blockchain skills
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/marketplace">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-blue-500 dark:from-green-400 dark:to-teal-400"
                  >
                    Explore Courses
                  </Button>
                </Link>
                <Link href="/become-instructor">
                  <Button size="lg" variant="outline">
                    Become an Instructor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
