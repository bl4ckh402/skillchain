"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const privacyContent = [
  {
    title: "Data Collection",
    content:
      "We collect information that you provide directly to us, including when you create an account, enroll in courses, or communicate with us. This may include: name, email, wallet address, learning progress, and course interactions.",
  },
  {
    title: "How We Use Your Data",
    content:
      "We use collected information to: provide and improve our services, process transactions, send notifications about courses and platform updates, and verify completion of learning objectives for certification purposes.",
  },
  {
    title: "Blockchain Data",
    content:
      "Course completion certificates are recorded on our platform. Consider this when participating in our platform.",
  },
  {
    title: "Data Security",
    content:
      "We implement appropriate security measures to protect your personal information. However, no internet transmission is 100% secure. We use encryption and secure connections for all transactions.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, correct, or delete your personal data. Note that blockchain transactions cannot be altered or deleted due to the technology's nature.",
  },
];

export function PrivacySection() {
  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-muted-foreground">
            Your privacy is important to us. This policy outlines how we handle
            your data on SkillChain.
          </p>
        </div>

        <div className="grid gap-6">
          {privacyContent.map((section, index) => (
            <Card key={index} className="border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-sm text-center text-muted-foreground">
          <p>
            For any privacy-related questions, please contact us at{" "}
            <a
              href="mailto:privacy@skillchain.com"
              className="text-primary hover:underline"
            >
              privacy@skillchain.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
