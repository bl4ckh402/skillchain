import { Metadata } from "next"
import InstructorBookingClient from "./client"

export const metadata: Metadata = {
  title: "Book a Session | BlockLearn",
  description: "Book a one-on-one session with a blockchain instructor",
}

export default function InstructorBookingPage({ 
  params 
}: { 
  params: { instructorId: string } 
}) {
  return <InstructorBookingClient instructorId={params.instructorId} />
}