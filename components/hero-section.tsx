import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="w-full py-8 md:py-12 lg:py-12 xl:py-12">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Master {""}
                <span className="text-transparent bg-gradient-to-r from-teal-500 to-blue-500 dark:from-green-400 dark:to-teal-400 bg-clip-text">
                  Web3{" "}
                </span>{" "}
                &amp;
                <span className="text-transparent bg-gradient-to-r from-teal-500 to-blue-500 dark:from-green-400 dark:to-teal-400 bg-clip-text">
                  {" "}
                  AI
                </span>
                <br />
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Learn Web3 development, cryptocurrency, and Artificial
                Intelligence from industry experts. Create, share, and monetize
                your knowledge.
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
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 dark:from-green-400 dark:to-teal-400 opacity-20 blur-3xl"></div>
              <div className="relative w-full h-full p-4 border shadow-xl rounded-xl bg-background">
                <div className="flex flex-col w-full h-full p-4 border rounded-lg border-border">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-xs">Smart Contract Development</div>
                  </div>
                  <div className="flex-1 p-2 overflow-hidden font-mono text-xs">
                    <div className="text-primary">
                      // Solidity Smart Contract
                    </div>
                    <div className="mt-2">
                      <span className="text-blue-500 dark:text-green-400">
                        contract
                      </span>{" "}
                      <span className="text-yellow-500">BlockLearnToken</span>{" "}
                      {"{"}
                    </div>
                    <div className="ml-4">
                      <span className="text-blue-500 dark:text-green-400">
                        mapping
                      </span>
                      (address {"=>"} uint256) balances;
                    </div>
                    <div className="mt-2 ml-4">
                      <span className="text-blue-500 dark:text-green-400">
                        function
                      </span>{" "}
                      <span className="text-yellow-500">transfer</span>(address
                      to, uint256 amount) public {"{"}
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
  );
}
