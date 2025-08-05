"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";
import { useEffect, useRef } from "react";
export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const testimonials = [
    {
      quote:
        "SkillChain helped me transition from traditional web development to blockchain. The interactive coding exercises were incredibly helpful.",
      name: "Sarah Chen",
      title: "Frontend Developer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      quote:
        "The DeFi course was comprehensive and up-to-date. I was able to apply what I learned immediately in my startup.",
      name: "Michael Rodriguez",
      title: "Startup Founder",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      quote:
        "As someone with no technical background, the blockchain fundamentals course was perfect. Clear explanations and great community support.",
      name: "Emily Johnson",
      title: "Investment Analyst",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollInterval: NodeJS.Timeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          const isAtEnd =
            scrollContainer.scrollLeft + scrollContainer.clientWidth >=
            scrollContainer.scrollWidth;
          if (isAtEnd) {
            scrollContainer.scrollLeft = 0;
          } else {
            scrollContainer.scrollLeft += 1;
          }
        }
      }, 30);
    };

    startAutoScroll();
    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
    };
  }, []);

  return (
    <section className="w-full py-8 md:py-12 lg:py-16 bg-gradient-to-b from-background to-transparent">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              What Our Students Say
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from our community of learners and instructors
            </p>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="grid max-w-5xl grid-cols-1 gap-6 mx-auto mt-8 md:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="transition-all duration-200 border-2 shadow-lg border-border/50 hover:shadow-xl bg-card hover:bg-accent/5 backdrop-blur-sm"
            >
              <CardContent className="relative pt-6">
                <Quote className="absolute w-8 h-8 mb-2 text-primary -top-2 -left-2" />
                <div className="pl-4 border-l-2 border-primary">
                  <p className="italic text-card-foreground">
                    {testimonial.quote}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.name}
                    />
                    <AvatarFallback>
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
