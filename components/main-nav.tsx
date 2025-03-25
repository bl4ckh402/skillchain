"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/marketplace",
      label: "Marketplace",
      active: pathname === "/marketplace",
    },
    {
      href: "/jobs",
      label: "Jobs",
      active: pathname === "/jobs",
    },
    {
      href: "/hackathons",
      label: "Hackathons",
      active: pathname === "/hackathons",
    },
    // {
    //   href: "/dashboard",
    //   label: "My Courses",
    //   active: pathname === "/dashboard/courses",
    // },
    {
      href: "/community",
      label: "Community",
      active: pathname === "/community",
    },
    {
      href: "/create",
      label: "Create Course",
      active: pathname === "/create",
    },
  ]

  return (
    <div className="flex items-center gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Code2 className="h-6 w-6 text-primary" />
        <span className="font-bold inline-block">SkillChain</span>
      </Link>
      <nav className="hidden gap-6 md:flex">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

