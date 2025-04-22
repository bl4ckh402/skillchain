"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Clock, Video, BookOpen, Users, GraduationCapIcon as Graduation, User } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[#1a1d2d]">
      {/* Sidebar */}
      <div className="w-[240px] bg-[#1a1d2d] border-r border-gray-800 p-4 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 mt-2">
          <div className="bg-emerald-500 rounded-md p-1">
            <Graduation className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xl font-bold">SkillChain</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <NavItem href="/live-session" icon={<Home className="h-5 w-5" />} label="Dashboard" active={pathname === "/"} />
          <NavItem
            href="/live-session/upcoming"
            icon={<Calendar className="h-5 w-5" />}
            label="Upcoming Sessions"
            active={pathname === "/upcoming"}
          />
          <NavItem
            href="/live-session/previous"
            icon={<Clock className="h-5 w-5" />}
            label="Previous Sessions"
            active={pathname === "/previous"}
          />
          <NavItem
            href="/live-session/recordings"
            icon={<Video className="h-5 w-5" />}
            label="Recordings"
            active={pathname === "/recordings"}
          />
          {/* <NavItem
            href="/courses"
            icon={<BookOpen className="h-5 w-5" />}
            label="My Courses"
            active={pathname === "/courses"}
          />
          <NavItem
            href="/students"
            icon={<Users className="h-5 w-5" />}
            label="Students"
            active={pathname === "/students"}
          /> */}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="p-4 flex justify-end">
          <div className="h-10 w-10 rounded-full bg-orange-300 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-800" />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:bg-emerald-600 transition-colors",
        active && "bg-emerald-600 text-white",
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
