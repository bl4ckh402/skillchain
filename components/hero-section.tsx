import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Master Blockchain Technology
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Learn blockchain development, cryptocurrency, and DeFi from industry experts. Create, share, and
                monetize your knowledge.
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
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] w-[300px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 dark:from-green-400 dark:to-teal-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="relative h-full w-full rounded-xl border bg-background p-4 shadow-xl">
                <div className="flex h-full w-full flex-col rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs">Smart Contract Development</div>
                  </div>
                  <div className="flex-1 p-2 text-xs font-mono overflow-hidden">
                    <div className="text-primary">// Solidity Smart Contract</div>
                    <div className="mt-2">
                      <span className="text-blue-500 dark:text-green-400">contract</span>{" "}
                      <span className="text-yellow-500">BlockLearnToken</span> {"{"}
                    </div>
                    <div className="ml-4">
                      <span className="text-blue-500 dark:text-green-400">mapping</span>(address {"=>"} uint256)
                      balances;
                    </div>
                    <div className="ml-4 mt-2">
                      <span className="text-blue-500 dark:text-green-400">function</span>{" "}
                      <span className="text-yellow-500">transfer</span>(address to, uint256 amount) public {"{"}
                    </div>
                    <div className="ml-8">balances[msg.sender] -= amount;</div>
                    <div className="ml-8">balances[to] += amount;</div>
                    <div className="ml-4">{"}"}</div>
                    <div>{"}"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

