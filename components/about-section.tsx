import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AboutSection() {
  return (
    <section className="w-full py-8 md:py-10 lg:py-18">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              About SkillChain
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
              Empowering the next generation of blockchain developers through
              interactive learning
            </p>
          </div>
        </div>
        <div className="grid max-w-5xl gap-8 pt-12 mx-auto md:grid-cols-2 md:gap-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="text-gray-500 dark:text-gray-400">
              We're dedicated to making blockchain education accessible,
              practical, and rewarding. Our platform combines hands-on learning
              with earn-to-learn incentives, creating a unique educational
              experience.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Why Choose Us</h2>
            <ul className="grid gap-2 text-gray-500 dark:text-gray-400">
              <li>✓ Interactive learning with real-world projects</li>
              <li>✓ Learn to earn</li>
              <li>✓ Expert-led courses and mentorship</li>
              <li>✓ Community-driven learning environment</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Our Approach</h2>
            <p className="text-gray-500 dark:text-gray-400">
              We believe in learning by doing. Our platform combines theoretical
              knowledge with practical exercises, allowing students to build
              real blockchain applications while earning rewards for their
              progress.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Join Our Community</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Connect with fellow learners, instructors, and blockchain
              enthusiasts. Share knowledge, collaborate on projects, and grow
              together in our vibrant community.
            </p>
            <div className="flex gap-4">
              <Link href="/marketplace">
                <Button>Start Learning</Button>
              </Link>
              <Link href="/become-instructor">
                <Button variant="outline">Become an Instructor</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
