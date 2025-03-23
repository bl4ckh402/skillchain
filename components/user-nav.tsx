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
import { Menu, Code2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function UserNav() {
  const { user, userProfile, signOut } = useAuth()
  const router = useRouter()

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
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4 mt-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">SkillChain</span>
          </Link>
          <Link href="/marketplace" className="text-lg font-medium">
            Marketplace
          </Link>
          <Link href="/community" className="text-lg font-medium">
            Community
          </Link>
          {user ? (
            <>
              <Link href="/dashboard/courses" className="text-lg font-medium">
                My Courses
              </Link>
              {Array.isArray(userProfile?.createdCourses) && userProfile.createdCourses.length > 0 && (
                <Link href="/create" className="text-lg font-medium">
                  Create Course
                </Link>
              )}
              <Link href="/dashboard" className="text-lg font-medium">
                Dashboard
              </Link>
              <Button variant="outline" className="mt-4" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )

  if (!user) {
    return (
      <>
        <MobileNav />
        <div className="hidden md:flex items-center gap-4">
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
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
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
            <DropdownMenuItem asChild>
              <Link href="/dashboard/courses">My Courses</Link>
            </DropdownMenuItem>
            {Array.isArray(userProfile?.createdCourses) && userProfile.createdCourses.length > 0 && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/creator">Creator Dashboard</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/dashboard/wallet">Wallet</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
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