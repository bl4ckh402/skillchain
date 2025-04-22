"use client"

import { CreateBootcampModal } from "@/components/create-bootcamp"

export default function CreateBootcampPage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Create a New Bootcamp</h1>
      <CreateBootcampModal open={true} onCloseAction={() => {}} />
    </div>
  )
}