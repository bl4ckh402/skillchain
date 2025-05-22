"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useBootcamps } from "@/context/BootcampContext"
import { useAuth } from "@/context/AuthProvider"
import { Bootcamp, ApplicationStatus } from "@/types/bootcamp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const applicationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  education: z.string().min(10, "Please provide your educational background"),
  workExperience: z.string().min(10, "Please provide your work experience"),
  motivation: z.string().min(50, "Please tell us why you want to join this bootcamp (minimum 50 characters)"),
  portfolio: z.string().url("Please enter a valid URL").optional(),
  github: z.string().url("Please enter a valid URL").optional(),
  linkedin: z.string().url("Please enter a valid URL").optional(),
})

type ApplicationForm = z.infer<typeof applicationSchema>

export default function BootcampApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { getBootcampById, submitApplication } = useBootcamps()
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      education: "",
      workExperience: "",
      motivation: "",
      portfolio: "",
      github: "",
      linkedin: "",
    },
  })

  useEffect(() => {
    const loadBootcamp = async () => {
      if (!params.id) return

      try {
        const bootcampData = await getBootcampById(params.id as string)
        if (!bootcampData) {
          toast({
            title: "Error",
            description: "Bootcamp not found",
            variant: "destructive",
          })
          router.push("/bootcamps")
          return
        }
        setBootcamp(bootcampData)
      } catch (error) {
        console.error("Error loading bootcamp:", error)
        toast({
          title: "Error",
          description: "Failed to load bootcamp details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadBootcamp()
  }, [params.id, getBootcampById, router])

  const onSubmit = async (data: ApplicationForm) => {
    if (!bootcamp || !user) return

    setSubmitting(true)
    try {
      await submitApplication(bootcamp.id, {
        userId: user.uid,
        ...data,
      })

      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully. We'll review it and get back to you soon.",
      })

      router.push(`/bootcamps/${bootcamp.id}`)
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!bootcamp) {
    return null
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="mb-2 text-3xl font-bold tracking-tighter">
            Apply for {bootcamp.title}
          </h1>
          <p className="text-muted-foreground">
            Please fill out this application form to join the bootcamp. We'll review your application
            and get back to you within 2-3 business days.
          </p>
        </div>

        <div className="max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Educational Background</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell us about your educational background, including relevant courses and certifications"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell us about your work experience, including any relevant projects or accomplishments"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivation</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Why do you want to join this bootcamp? What are your goals?"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="portfolio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}