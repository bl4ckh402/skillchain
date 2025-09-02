"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/footer";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthProvider";
import { JobType } from "@/types/job";
import { JobPayment } from "@/components/job-payment";

// Form validation schema
const jobFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  company: z.string().min(2, "Company name is required"),
  location: z.string().min(2, "Location is required"),
  type: z.enum([
    JobType.FULL_TIME,
    JobType.PART_TIME,
    JobType.CONTRACT,
    JobType.FREELANCE,
  ]),
  salaryMin: z.string().regex(/^\d+$/, "Must be a valid number"),
  salaryMax: z.string().regex(/^\d+$/, "Must be a valid number"),
  description: z
    .string()
    .min(100, "Description must be at least 100 characters"),
  requirements: z
    .string()
    .min(50, "Requirements must be at least 50 characters"),
  benefits: z.string().min(50, "Benefits must be at least 50 characters"),
  companyDescription: z
    .string()
    .min(50, "Company description must be at least 50 characters"),
  website: z.string().url("Must be a valid URL"),
  logo: z.string().optional(),
});

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  
  const form = useForm<z.infer<typeof jobFormSchema>>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      type: JobType.FULL_TIME,
      salaryMin: "",
      salaryMax: "",
      description: "",
      requirements: "",
      benefits: "",
      companyDescription: "",
      website: "https://",
      logo: "",
    },
  });

  const skills = [
    "Solidity",
    "Web3.js",
    "React",
    "Rust",
    "Smart Contracts",
    "DeFi",
    "NFTs",
    "Blockchain",
    "TypeScript",
    "Node.js",
    "Python",
    "Go",
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const onSubmit = async (data: z.infer<typeof jobFormSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post a job",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (selectedSkills.length === 0) {
      toast({
        title: "Skills required",
        description: "Please select at least one required skill",
        variant: "destructive",
      });
      return;
    }
// Check for payment before proceeding
if (!paymentCompleted) {
      setShowPayment(true);
      return;
    }
    
    try {
      setIsSubmitting(true);

      //Get the user's ID token
      const token = await user.getIdToken();

      //Format job data
      const jobData = {
        title: data.title,
        company: data.company,
        location: data.location,
        type: data.type,
        salary: `$${data.salaryMin}K - $${data.salaryMax}K`,
        description: data.description,
        requirements: data.requirements.split("\n").filter((req) => req.trim()), // Convert text to array
        benefits: data.benefits,
        companyDescription: data.companyDescription,
        website: data.website,
        logo: user.photoURL || "",
        tags: selectedSkills,
        postedAt: new Date().toISOString(),
        featured: false,
      };

      // Make API request
      const response = await fetch("/api/job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error("Failed to post job");
      }
      const result = await response.json();
      toast({
        title: "Success",
        description: "Your job has been posted successfully",
      });

      // Redirect to jobs page
      router.push("/jobs");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Post a Job
              </h1>
              <p className="mt-2 text-muted-foreground">
                Find the perfect candidate for your blockchain or tech position
              </p>
            </div>

{ showPayment ? (
               <JobPayment 
                onPaymentComplete={() => {
                  setPaymentCompleted(true);
                  setShowPayment(false);
                  // Automatically submit the form after payment
                  form.handleSubmit(onSubmit)();
                }} 
              />
            ) : (
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Senior Blockchain Developer"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your company name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Remote, New York, London"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(JobType).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="salaryMin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Salary (Ksh/month)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g. 80,000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="salaryMax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Salary (Ksh/month)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g. 120,000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormLabel>Required Skills</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant={
                              selectedSkills.includes(skill)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the role, responsibilities, and ideal candidate..."
                              className="h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requirements</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter requirements, one per line..."
                              className="h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-muted-foreground">
                            Enter each requirement on a new line
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="benefits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Benefits</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the benefits and perks..."
                              className="h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Company</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell candidates about your company..."
                              className="h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Website</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://your-company.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                      >
                        {isSubmitting ? "Posting..." : "Post Job"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
