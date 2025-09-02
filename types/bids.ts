export enum JobType {
  FIXED_PRICE = "FIXED_PRICE",
  // HOURLY = "HOURLY",
}

export enum JobStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CLOSED = "CLOSED",
}

export interface Job {
  id: string;
  title: string;
  description: string;
  priceRange: {
    min: number;
    max: number;
  };
  type: JobType;
  duration: {
    value: number;
    unit: "DAYS" | "WEEKS" | "MONTHS";
  };
  requiredSkills: string[];
  status: JobStatus;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  bids: Bid[];
}

export interface Bid {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancer: {
    name: string;
    avatar?: string;
    rating: number;
  };
  amount: number;
  proposalLetter: string;
  estimatedDuration: {
    value: number;
    unit: "DAYS" | "WEEKS" | "MONTHS";
  };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}
