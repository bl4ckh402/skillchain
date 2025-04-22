import type { Metadata } from "next"
import InstructorProfileClient from "./client"

export const metadata: Metadata = {
  title: "Instructor Profile | BlockLearn",
  description: "View instructor profile, courses, and book a session",
}

export default function InstructorProfilePage({ params }: { params: { instructorId: string } }) {
  return <InstructorProfileClient instructorId={params.instructorId} />
}
