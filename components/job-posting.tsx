import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JobType } from "@/types/job"
import { useRouter } from "next/router"
import { toast } from "@/components/ui/use-toast"
import { getIdToken, getAuth } from "firebase/auth"

const jobFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(100, "Description must be at least 100 characters"),
  priceRange: z.object({
    min: z.number().min(1, "Minimum price required"),
    max: z.number().min(1, "Maximum price required")
  }),
  type: z.enum([JobType.FIXED_PRICE, JobType.HOURLY]),
  duration: z.object({
    value: z.number().min(1, "Duration required"),
    unit: z.enum(["DAYS", "WEEKS", "MONTHS"])
  }),
  requiredSkills: z.array(z.string()).min(1, "At least one skill is required")
})

export function JobPostForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof jobFormSchema>>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priceRange: { min: 0, max: 0 },
      type: JobType.FIXED_PRICE,
      duration: { value: 1, unit: "WEEKS" },
      requiredSkills: []
    }
  })

  async function onSubmit(data: z.infer<typeof jobFormSchema>) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await getIdToken(user)}` 
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error("Failed to post job")

      router.push("/jobs/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Smart Contract Developer Needed" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Provide a detailed job description..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price Range */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="priceRange.min"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Minimum Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    placeholder="Min price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priceRange.max"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Maximum Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    placeholder="Max price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Job Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={JobType.FIXED_PRICE}>Fixed Price</SelectItem>
                  <SelectItem value={JobType.HOURLY}>Hourly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Duration */}
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="duration.value"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    placeholder="Value"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration.unit"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DAYS">Days</SelectItem>
                    <SelectItem value="WEEKS">Weeks</SelectItem>
                    <SelectItem value="MONTHS">Months</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Required Skills */}
        <FormField
          control={form.control}
          name="requiredSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Skills (comma separated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. React, Node.js, Solidity"
                  value={field.value.join(", ")}
                  onChange={e =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map(skill => skill.trim())
                        .filter(skill => skill)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Post Job</Button>
      </form>
    </Form>
  )
}
