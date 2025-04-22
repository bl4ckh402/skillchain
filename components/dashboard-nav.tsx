"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, BookOpen, Wallet, Settings, Users, MessageSquare, Award, GraduationCap, Laptop } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/courses",
      label: "My Courses",
      icon: <BookOpen className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard/courses",
    },
    {
      href: "/dashboard/bootcamps",
      label: "My Bootcamps",
      icon: <Laptop className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard/bootcamps",
    },
    {
      href: "/dashboard",
      label: "Wallet",
      icon: <Wallet className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard",
      label: "Certificates",
      icon: <Award className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard",
      label: "Community",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard",
      label: "Profile",
      icon: <Users className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard",
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard",
    },
  ]

  return (
    <nav className="grid items-start gap-2">
      {routes.map((route) => (
        <Link key={route.href} href={route.href}>
          <Button
            variant={route.active ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              route.active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {route.icon}
            {route.label}
          </Button>
        </Link>
      ))}
    </nav>
  )
}

