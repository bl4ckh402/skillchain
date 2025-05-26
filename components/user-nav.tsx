"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthProvider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Code2, Settings, LogOut } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuthRoles } from "@/lib/auth"

export function UserNav() {
  const { user, userProfile, signOut } = useAuth()
  const router = useRouter()
    const { isInstructor, isAdmin } = useAuthRoles()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
      toast({
        title: "Success",
        description: "You have been signed out successfully"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  // Mobile navigation
  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4 mt-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Code2 className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold">SkillChain</span>
          </Link>
          <Link href="/marketplace" className="text-lg font-medium">
            Marketplace
          </Link>
          <Link href="/jobs" className="text-lg font-medium">
            Jobs
          </Link>
          <Link href="/hackathons" className="text-lg font-medium">
            Hackathons
          </Link>
          <Link href="/community" className="text-lg font-medium">
            Community
          </Link>
          {user && (<Link href="/create" className="text-lg font-medium">
            Dashboard
          </Link>)}

          {isInstructor || isAdmin && (
                <Link href="/create" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700">
                  Create Course
                </Link>
              )}

          {/* Instructor-only navigation */}
              {isInstructor && (
                <Link href="/instructor/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700">
                  Instructor Dashboard
                </Link>
              )}
              
              {/* Admin-only navigation */}
              {isAdmin && (
                <Link href="/admin" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700">
                  Admin Panel
                </Link>
              )}
        </nav>
      </SheetContent>
    </Sheet>
  )

  if (!user) {
    return (
      <>
        <MobileNav />
        <div className="items-center hidden gap-4 md:flex">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <MobileNav />
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="hidden md:flex">
          <Button variant="ghost" className="relative w-8 h-8 rounded-full">
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={userProfile?.photoURL || "/placeholder.svg?height=32&width=32"} 
                alt={userProfile?.firstName || "User"} 
              />
              <AvatarFallback>
                {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userProfile?.firstName} {userProfile?.lastName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {userProfile?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>

            {Array.isArray(userProfile?.createdCourses) && userProfile.createdCourses.length > 0 && (
              <DropdownMenuItem asChild>
                <Link href="/instructor/dashboard">Creator Dashboard</Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>

          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}