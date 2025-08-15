"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobType, JobStatus, Job } from "@/types/job";
import { Footer } from "@/components/footer";
type Bid = {
  id: string;
  freelancer: { name: string; avatar?: string; rating: number };
  amount: number;
  proposalLetter: string;
  estimatedDuration: { value: number; unit: string };
  status: string;
  createdAt: string;
};

export default function ClientJobsDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fetch jobs posted by this client
  useEffect(() => {
    if (!user) return;
    fetch(`/api/jobs?createdBy=${user.uid}`)
      .then((res) => res.json())
      .then(setJobs);
  }, [user]);

  // Fetch bids for a selected job
  const handleViewBids = async (job: Job) => {
    setSelectedJob(job);
    setLoadingBids(true);
    try {
      const res = await fetch(`/api/bids?jobId=${job.id}`);
      let data: Bid[] = await res.json();
      data = data.sort(
        (a: Bid, b: Bid) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setBids(data);
    } catch (error) {
      setBids([]);
    }
    setLoadingBids(false);
  };
  // prevent hydration issues
  const [posting, setPosting] = useState(false);

  // Job posting form submission
  const handlePostJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || posting) return;
    setPosting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const jobData = {
      title: formData.get("title"),
      description: formData.get("description"),
      type: formData.get("type"),
      priceRange: {
        min: Number(formData.get("priceMin")),
        max: Number(formData.get("priceMax")),
      },
      requiredSkills: (formData.get("skills") as string)
        .split(",")
        .map((s) => s.trim()),
      status: JobStatus.ACTIVE,
      createdBy: {
        id: user.uid,
        name: user.displayName || "Anonymous",
        avatar: user.photoURL || "",
      },
      createdAt: new Date().toISOString(),
    };
    //Get firebase token
    const token = await user.getIdToken();

    await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    });
    setShowPostModal(false);

    setPosting(false); // This is to prevent multiple submissions

    // Refresh jobs
    if (user) {
      fetch(`/api/jobs?createdBy=${user.uid}`)
        .then((res) => res.json())
        .then(setJobs);
    }
  };

  const handleBidAction = async (
    bidId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch(`/api/bids/${bidId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      // Refresh bids after action
      if (selectedJob) handleViewBids(selectedJob);
    } else {
      toast({
        title: "Error",
        description: "Failed to update bid status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Job Listings</h1>

          <Button onClick={() => setShowPostModal(true)}>Post New Job</Button>
        </div>

        {/* Job Post Modal */}
        <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post a New Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePostJob} className="space-y-4">
              <Input name="title" placeholder="Job Title" required />
              <Textarea
                name="description"
                placeholder="Job Description"
                required
              />
              <div className="flex gap-2">
                <Input
                  name="priceMin"
                  type="number"
                  placeholder="Min Price"
                  required
                />
                <Input
                  name="priceMax"
                  type="number"
                  placeholder="Max Price"
                  required
                />
              </div>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED_PRICE">Fixed Price</SelectItem>
                  {/* <SelectItem value="HOURLY">Hourly</SelectItem> */}
                </SelectContent>
              </Select>
              <Input
                name="skills"
                placeholder="Required Skills (comma separated)"
                required
              />
              <Button type="submit" className="w-full" disabled={posting}>
                {posting ? "Posting..." : "Post Job"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Jobs List */}
        <div className="mt-8 space-y-6">
          {jobs.length === 0 && (
            <div className="text-center text-muted-foreground">
              You haven't posted any jobs yet.
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
                <Button size="sm" onClick={() => handleViewBids(job)}>
                  View Bids/Applicants
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bids/Applicants Modal */}
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Applicants for: {selectedJob ? selectedJob.title : ""}
              </DialogTitle>
            </DialogHeader>
            {loadingBids ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-4">
                {bids.length === 0 && (
                  <div className="text-muted-foreground">No bids yet.</div>
                )}
                {bids.map((bid: Bid) => (
                  <Card key={bid.id}>
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={bid.freelancer.avatar || "/avatar.svg"}
                          alt={
                            typeof bid.freelancer.name === "string"
                              ? bid.freelancer.name
                              : ""
                          }
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium">
                          {bid.freelancer.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Rating: {bid.freelancer.rating}
                        </span>
                      </div>
                      <div className="text-sm">Bid: ${bid.amount}</div>
                      <div className="text-xs">
                        Duration: {bid.estimatedDuration.value}{" "}
                        {bid.estimatedDuration.unit}
                      </div>
                      <div className="text-xs">Status: {bid.status}</div>
                      <div className="text-xs text-muted-foreground">
                        Proposal:
                      </div>
                      <div className="text-sm">{bid.proposalLetter}</div>
                      {bid.status === "PENDING" && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleBidAction(bid.id, "ACCEPTED")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBidAction(bid.id, "REJECTED")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {bid.status === "ACCEPTED" && (
                        <span className="font-semibold text-green-600">
                          Contract Formed
                        </span>
                      )}
                      {bid.status === "REJECTED" && (
                        <span className="font-semibold text-red-600">
                          Rejected
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}
