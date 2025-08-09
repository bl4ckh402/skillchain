import { BookOpen, Code, DollarSign, Users } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: <BookOpen className="w-10 h-10 text-primary" />,
      title: "Learn",
      description:
        "Access high-quality blockchain courses from industry experts",
    },
    {
      icon: <Code className="w-10 h-10 text-primary" />,
      title: "Practice",
      description:
        "Apply your knowledge with interactive coding exercises and projects",
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: "Connect",
      description:
        "Join a community of blockchain enthusiasts and professionals",
    },
    {
      icon: <DollarSign className="w-10 h-10 text-primary" />,
      title: "Earn",
      description:
        "Create and sell your own courses or earn crypto rewards for learning",
    },
  ];

  return (
    <section className="w-full py-8 md:py-12 lg:py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              How It Works
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              SkillChain makes blockchain education accessible, practical, and
              rewarding
            </p>
          </div>
        </div>
        <div className="grid max-w-5xl grid-cols-1 gap-8 mx-auto mt-12 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                {step.icon}
              </div>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
