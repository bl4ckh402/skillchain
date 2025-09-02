"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types/job";
import AppliedJobsTab from "@/components/applied-jobs-tab";
import { JobList } from "@/components/job-listing";
import { toast } from "@/components/ui/use-toast";

type BidForm = {
  amount: number;
  proposalLetter: string;
  estimatedDuration: string;
};
export default function FreelancerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bidForm, setBidForm] = useState<BidForm>({
    amount: 0,
    proposalLetter: "",
    estimatedDuration: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch all available jobs
  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then(setJobs);
  }, []);

  // Open bid modal for a job
  const handleOpenBid = (job: Job) => {
    setSelectedJob(job);
    setShowBidModal(true);
  };
  const parseDuration = (input: string) => {
    // e.g. "2 weeks" => { value: 2, unit: "weeks" }
    const match = input.match(/^(\d+)\s*(\w+)$/);
    if (!match) return { value: 1, unit: "WEEKS" }; // fallback
    return { value: Number(match[1]), unit: match[2].toUpperCase() };
  };

  const handleBidSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedJob) return;
    setSubmitting(true);
    const token = await user.getIdToken();
    const duration = parseDuration(bidForm.estimatedDuration);

    const res = await fetch("/api/bids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        jobId: selectedJob.id,
        amount: bidForm.amount,
        proposalLetter: bidForm.proposalLetter,
        estimatedDuration: duration, // Now an object!
        createdAt: new Date().toISOString(),
      }),
      
    });

    setSubmitting(false);
    setShowBidModal(false);
    setBidForm({ amount: 0, proposalLetter: "", estimatedDuration: "" });
    setSelectedJob(null);

    if (res.ok) {
      toast({
        title: "Bid Placed",
        description: "Your bid was placed successfully.",
      });
      fetch("/api/jobs")
        .then((res) => res.json())
        .then(setJobs);
    } else if (res.status === 400) {
      const data = await res.json();
      toast({
        title: "Bid Not Placed",
        description: data.error || "You have already bid on this job.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to place bid. Please try again.",
        variant: "destructive",
      });
      
    }
  };

  return (
    <div className="container py-8 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Freelancer Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            Welcome to your Freelancer Dashboard! Here, you can browse and
            search for job opportunities that match your skills and expertise.
            Place bids on projects that interest you and track your applications
            all in one place.
          </p>
        </CardHeader>
        <CardContent>
          <h2 className="mb-4 text-lg font-semibold">Available Jobs</h2>
          <div className="space-y-6">
            {jobs.length === 0 && (
              <div className="text-muted-foreground">
                No jobs available at the moment.
              </div>
            )}
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{job.type}</Badge>
                    <Badge variant="outline">{job.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-sm text-muted-foreground">
                    {job.description}
                  </div>
                  <div className="mb-2 text-xs">
                    Skills: {job.requiredSkills?.join(", ")}
                  </div>
                  <div className="mb-2 text-xs">
                    Price: ${job.priceRange?.min} - ${job.priceRange?.max}
                  </div>
                  <Button size="sm" onClick={() => handleOpenBid(job)}>
                    Place Bid
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bid Modal */}
      <Dialog open={showBidModal} onOpenChange={setShowBidModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Bid for: {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <Input
              name="amount"
              type="number"
              placeholder="Bid Amount"
              value={bidForm.amount}
              onChange={(e) =>
                setBidForm({ ...bidForm, amount: Number(e.target.value) })
              }
              required
            />
            <div className="text-xs text-muted-foreground">
              Applied: {new Date().toLocaleString()}
            </div>
            <Input
              name="estimatedDuration"
              placeholder="Estimated Duration (e.g. 2 weeks)"
              value={bidForm.estimatedDuration}
              onChange={(e) =>
                setBidForm({ ...bidForm, estimatedDuration: e.target.value })
              }
              required
            />
            <Textarea
              name="proposalLetter"
              placeholder="Proposal Letter"
              value={bidForm.proposalLetter}
              onChange={(e) =>
                setBidForm({ ...bidForm, proposalLetter: e.target.value })
              }
              required
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Bid"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <AppliedJobsTab appliedJobs={[]} />
      <Footer />
    </div>
  );
}
