import type { Metadata } from "next";
import InstructorsClient from "./client";

export const metadata: Metadata = {
  title: "Browse Instructors | BlockLearn",
  description: "Find and connect with blockchain experts and instructors",
};

export default function InstructorsPage() {
  return <InstructorsClient />;
}
