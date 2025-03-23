import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

export function Testimonials() {
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
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">What Our Students Say</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from our community of learners and instructors
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-primary opacity-50 mb-2" />
                <p className="text-muted-foreground">{testimonial.quote}</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

