import { useEffect, useState } from "react";
import { Job } from "@/types/job";
import { JobCard } from "@/components/ui/JobCard";
import { JobFilters } from "@/components/ui/JobFilters";

type Filters = {
  skills: string[];
  priceRange: { min: number; max: number };
  type: string | null;
};

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<Filters>({
    skills: [],
    priceRange: { min: 0, max: 10000 },
    type: null,
  });

  useEffect(() => {
    const fetchJobs = async () => {
      const queryParams = new URLSearchParams();

      // Skills filter
      if (filters.skills.length) {
        queryParams.set("skills", filters.skills.join(","));
      }

      // Price range filter
      if (filters.priceRange.min > 0) {
        queryParams.set("priceMin", String(filters.priceRange.min));
      }
      if (filters.priceRange.max > 0) {
        queryParams.set("priceMax", String(filters.priceRange.max));
      }

      // Job type filter
      if (filters.type) {
        queryParams.set("type", filters.type);
      }

      const response = await fetch(`/api/jobs?${queryParams.toString()}`);
      const data = await response.json();
      setJobs(data);
    };

    fetchJobs();
  }, [filters]);
  

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr]">
      <JobFilters filters={filters} setFilters={setFilters} />
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
