import { BookOpen, Code, DollarSign, Users } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "Learn",
      description: "Access high-quality blockchain courses from industry experts",
    },
    {
      icon: <Code className="h-10 w-10 text-primary" />,
      title: "Practice",
      description: "Apply your knowledge with interactive coding exercises and projects",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Connect",
      description: "Join a community of blockchain enthusiasts and professionals",
    },
    {
      icon: <DollarSign className="h-10 w-10 text-primary" />,
      title: "Earn",
      description: "Create and sell your own courses or earn crypto rewards for learning",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              SkillChain makes blockchain education accessible, practical, and rewarding
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mt-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">{step.icon}</div>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

