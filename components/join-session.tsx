"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useVideo } from "@/context/StreamClientProvider"
import { useAuth } from "@/context/AuthProvider"

export default function JoinSessionPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { joinCall } = useVideo()
  
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")
  
  // Get session ID from params
  const sessionId = params?.id as string
  
  // Pre-fill display name from user if available
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName)
    }
  }, [user])
  
  const handleJoinSession = async () => {
    if (!displayName.trim()) {
      setError("Please enter your name to join the session")
      return
    }
    
    try {
      setJoining(true)
      
      // Join the call
      const call = await joinCall(sessionId)
      
      if (call) {
        // Redirect to session page
        router.push(`/session/${sessionId}`)
      } else {
        setError("Unable to join the session. It may have ended or is invalid.")
      }
    } catch (err) {
      console.error("Failed to join session:", err)
      setError("There was an error joining the session. Please try again.")
    } finally {
      setJoining(false)
    }
  }
  
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#1A1D2D] flex items-center justify-center px-4">
        <div className="bg-[#232538] p-6 rounded-lg max-w-md w-full text-center">
          <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
          <p className="text-gray-300 mb-6">This invitation link is invalid or has expired.</p>
          <Button 
            onClick={() => router.push('/dashboard')} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#1A1D2D] flex items-center justify-center px-4">
      <div className="bg-[#232538] p-8 rounded-lg max-w-md w-full">
        <div className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Join Education Session</h1>
          <p className="text-gray-300">You're about to join a live educational session.</p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-gray-300 text-sm mb-2" htmlFor="displayName">
            Your Name
          </label>
          <Input
            id="displayName"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-[#1A1D2D] border-gray-700 text-white"
          />
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleJoinSession}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
            disabled={joining}
          >
            {joining ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Joining...
              </>
            ) : (
              "Join Session"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="w-full text-gray-300 border-gray-700"
          >
            Cancel
          </Button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            By joining, you agree to the session host's rules and guidelines.
          </p>
        </div>
      </div>
    </div>
  )
}