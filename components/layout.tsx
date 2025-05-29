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
        <div className="flex items-center gap-2 mt-2 mb-8">
          <div className="p-1 rounded-md bg-emerald-500">
            <Graduation className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">SkillChain</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <NavItem href="/live-session" icon={<Home className="w-5 h-5" />} label="Dashboard" active={pathname === "/"} />
          <NavItem
            href="/live-session/upcoming"
            icon={<Calendar className="w-5 h-5" />}
            label="Upcoming Sessions"
            active={pathname === "/upcoming"}
          />
          <NavItem
            href="/live-session/previous"
            icon={<Clock className="w-5 h-5" />}
            label="Previous Sessions"
            active={pathname === "/previous"}
          />
          <NavItem
            href="/live-session/recordings"
            icon={<Video className="w-5 h-5" />}
            label="Recordings"
            active={pathname === "/recordings"}
          />
          
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="flex justify-end p-4">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-300 rounded-full">
            <User className="w-5 h-5 text-gray-800" />
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
