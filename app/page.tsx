import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { FeaturedCourses } from "@/components/featured-courses"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturedCourses />
      <HowItWorks />
      <Testimonials />
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 dark:bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Start Learning?</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of students and instructors in the blockchain community
              </p>
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
  )
}

