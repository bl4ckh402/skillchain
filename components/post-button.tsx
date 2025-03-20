"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PostJobModal } from "@/components/create-job-listing"
import { PostHackathonModal } from "@/components/create-hackathon"
import { Plus } from "lucide-react"

interface PostButtonProps {
  type: "job" | "hackathon"
}

export function PostButton({ type }: PostButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-blue-600 to-teal-600"
      >
        <Plus className="mr-2 h-4 w-4" />
        Post {type === "job" ? "a Job" : "a Hackathon"}
      </Button>

      {type === "job" ? (
        <PostJobModal 
          open={showModal} 
          onClose={() => setShowModal(false)} 
        />
      ) : (
        <PostHackathonModal 
          open={showModal} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  )
}