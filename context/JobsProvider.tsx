"use client";

import { createContext, useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  limit,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Job, JobFilters } from "@/types/job";

interface JobsContextType {
  jobs: Job[];
  loading: boolean;
  filters: JobFilters;
  setFilters: (filters: JobFilters) => void;
  getJobById: (id: string) => Promise<Job | null>;
  createJob: (job: Omit<Job, "id" | "postedAt">) => Promise<string>;
  updateJob: (id: string, job: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJobs: (filters?: JobFilters) => Promise<Job[]>;
  getFeaturedJobs: () => Promise<Job[]>;
  getJobsByUser: (userId: string) => Promise<Job[]>;
  applyForJob: (jobId: string) => Promise<void>;
  saveJob: (jobId: string) => Promise<void>;
  checkIfUserApplied: (jobId: string) => Promise<boolean>;
  getSimilarJobs: (job: Job, count?: number) => Promise<Job[]>;
}

const JobsContext = createContext<JobsContextType | null>(null);

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFiltersState] = useState<JobFilters>({
    type: [],
    location: [],
    tags: [],
    salaryRange: undefined,
    experience: [],
  });

  const setFilters = (newFilters: JobFilters) => {
    setFiltersState(newFilters);
  };

  const createJob = async (job: Omit<Job, "id" | "postedAt">) => {
    try {
      const docRef = await addDoc(collection(db, "jobs"), {
        ...job,
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Error creating job: ${error.message}`);
    }
  };

  const updateJob = async (id: string, job: Partial<Job>) => {
    try {
      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, job);
    } catch (error: any) {
      throw new Error(`Error updating job: ${error.message}`);
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, "jobs", id));
    } catch (error: any) {
      throw new Error(`Error deleting job: ${error.message}`);
    }
  };

  const getJobs = async (filters?: JobFilters) => {
    setLoading(true);
    try {
      let jobsQuery = query(collection(db, "jobs"));

      if (filters) {
        if (filters.type?.length) {
          jobsQuery = query(jobsQuery, where("type", "in", filters.type));
        }
        if (filters.location?.length) {
          jobsQuery = query(
            jobsQuery,
            where("location", "in", filters.location)
          );
        }
        if (filters.tags?.length) {
          jobsQuery = query(
            jobsQuery,
            where("tags", "array-contains-any", filters.tags)
          );
        }
      }

      const snapshot = await getDocs(jobsQuery);
      const jobsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[];

      setJobs(jobsList);
      return jobsList;
    } catch (error: any) {
      throw new Error(`Error fetching jobs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkIfUserApplied = async (jobId: string): Promise<boolean> => {
    try {
      if (!auth.currentUser) return false;

      const jobRef = doc(db, "jobs", jobId);
      const jobSnap = await getDoc(jobRef);

      if (!jobSnap.exists()) return false;

      const jobData = jobSnap.data();
      return jobData.applications?.includes(auth.currentUser.uid) || false;
    } catch (error) {
      console.error("Error checking application status:", error);
      return false;
    }
  };

  const getFeaturedJobs = async () => {
    try {
      const featuredQuery = query(
        collection(db, "jobs"),
        where("featured", "==", true)
      );
      const snapshot = await getDocs(featuredQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[];
    } catch (error: any) {
      throw new Error(`Error fetching featured jobs: ${error.message}`);
    }
  };

  const getJobsByUser = async (userId: string) => {
    try {
      const userJobsQuery = query(
        collection(db, "jobs"),
        where("postedBy", "==", userId)
      );
      const snapshot = await getDocs(userJobsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[];
    } catch (error: any) {
      throw new Error(`Error fetching user jobs: ${error.message}`);
    }
  };

  const getJobById = async (id: string) => {
    try {
      const jobRef = doc(db, "jobs", id);
      const docSnap = await getDoc(jobRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Job;
      } else {
        return null;
      }
    } catch (error: any) {
      throw new Error(`Error fetching job: ${error.message}`);
    }
  };

  const applyForJob = async (jobId: string) => {
    if (!auth.currentUser) throw new Error("Must be logged in");
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
      applications: arrayUnion(auth.currentUser.uid),
    });
  };

  /**
   * Get similar jobs based on tags and job type
   * @param job The current job to find similar jobs for
   * @param count Number of similar jobs to return, defaults to 3
   * @returns Array of similar jobs
   */
  const getSimilarJobs = async (
    job: Job,
    count: number = 3
  ): Promise<Job[]> => {
    try {
      if (!job.id) return [];

      // Get jobs with similar tags or job type
      // First try to find jobs with matching tags
      let similarQuery = query(
        collection(db, "jobs"),
        where("tags", "array-contains-any", job.tags),
        where("id", "!=", job.id),
        limit(count * 2)
      );

      let snapshot = await getDocs(similarQuery);
      let similarJobs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Job[];

      if (similarJobs.length < count) {
        const typeQuery = query(
          collection(db, "jobs"),
          where("type", "==", job.type),
          where("id", "!=", job.id),
          limit(count * 2)
        );

        const typeSnapshot = await getDocs(typeQuery);
        const typeJobs = typeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Job[];

        const existingIds = new Set(similarJobs.map((j) => j.id));
        typeJobs.forEach((job) => {
          if (!existingIds.has(job.id!)) {
            similarJobs.push(job);
          }
        });
      }

      const scoredJobs = similarJobs.map((similarJob) => {
        let score = 0;

        // Score based on matching tags
        const matchingTags = similarJob.tags.filter((tag) =>
          job.tags.includes(tag)
        );
        score += matchingTags.length * 10;

        // Score based on same job type
        if (similarJob.type === job.type) score += 5;

        // Score based on same location
        if (similarJob.location === job.location) score += 3;

        return { job: similarJob, score };
      });

      // Sort by score and take the top 'count'
      const sortedJobs = scoredJobs
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .map((scored) => scored.job);

      return sortedJobs;
    } catch (error: any) {
      console.error("Error fetching similar jobs:", error);
      return [];
    }
  };

  const saveJob = async (jobId: string) => {
    if (!auth.currentUser) throw new Error("Must be logged in");
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      savedJobs: arrayUnion(jobId),
    });
  };

  const value = {
    jobs,
    loading,
    filters,
    getJobById,
    setFilters,
    createJob,
    updateJob,
    deleteJob,
    getJobs,
    getFeaturedJobs,
    getJobsByUser,
    applyForJob,
    saveJob,
    checkIfUserApplied,
    getSimilarJobs,
  };

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobsProvider");
  }
  return context;
};
