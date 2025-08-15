"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getIdToken } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { Footer } from "./footer";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { db } from "@/lib/firebase";
const bidSchema = z.object({
  amount: z.number().min(1, "Bid amount is required"),
  proposalLetter: z
    .string()
    .min(100, "Proposal must be at least 100 characters"),
  estimatedDuration: z.object({
    value: z.number().min(1, "Duration is required"),
    unit: z.enum(["DAYS", "WEEKS", "MONTHS"]),
  }),
});

export default function BidPage() {
  const params = useParams();
  const [job, setJob] = useState<any>(null);
  //Fetch job details and client info
  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/jobs/${params.id}`)
      .then((res) => res.json())
      .then(setJob);
  }, [params.id]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof bidSchema>>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: 1,
      proposalLetter: "",
      estimatedDuration: {
        value: 1,
        unit: "WEEKS",
      },
    },
  });

  async function onSubmit(data: z.infer<typeof bidSchema>) {
    setIsSubmitting(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const response = await fetch("/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getIdToken(user)}`,
        },
        body: JSON.stringify({
          jobId: params.id,
          ...data,
        }),
      });

      if (!response.ok) throw response;
      router.push(`/jobs/${params.id}`);
    } catch (error) {
      let description = "Failed to submit bid. Please try again.";
      if (error instanceof Response) {
        const errData = await error.json();
        description = errData.error || description;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Main content */}
      <main className="flex items-center justify-center flex-1 px-4 py-10">
        <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md dark:bg-slate-900">
          <h1 className="mb-6 text-2xl font-bold text-center text-slate-800 dark:text-slate-100">
            Submit Your Proposal
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Bid Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bid Amount (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Enter your bid amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Proposal Letter */}
              <FormField
                control={form.control}
                name="proposalLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal Letter</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write a compelling proposal..."
                        className="min-h-[200px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Duration */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <FormField
                  control={form.control}
                  name="estimatedDuration.value"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          placeholder="Value"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimatedDuration.unit"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-2 sm:w-auto"
                >
                  {isSubmitting ? "Submitting..." : "Submit Proposal"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
}
