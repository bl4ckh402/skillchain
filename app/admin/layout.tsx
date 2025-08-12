"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/user-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  AreaChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  Briefcase,
  FileText,
  MessageSquare,
} from "lucide-react";
import { UserRole } from "@/types/user";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-collapse on smaller screens
      if (window.innerWidth < 1280) {
        setCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const navigation = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
      active: pathname === "/admin",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="w-5 h-5" />,
      active:
        pathname === "/admin/users" || pathname.startsWith("/admin/users/"),
    },
    {
      title: "Courses",
      href: "/admin/courses",
      icon: <BookOpen className="w-5 h-5" />,
      active:
        pathname === "/admin/courses" || pathname.startsWith("/admin/courses/"),
    },
    {
      title: "Instructors",
      href: "/admin/instructors",
      icon: <GraduationCap className="w-5 h-5" />,
      active:
        pathname === "/admin/instructors" ||
        pathname.startsWith("/admin/instructors/"),
    },
    {
      title: "Jobs",
      href: "/admin/jobs",
      icon: <Briefcase className="w-5 h-5" />,
      active: pathname === "/admin/jobs" || pathname.startsWith("/admin/jobs/"),
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: <FileText className="w-5 h-5" />,
      active: pathname === "/admin/reports",
    },
    {
      title: "Forums",
      href: "/admin/forums",
      icon: <MessageSquare className="w-5 h-5" />,
      active:
        pathname === "/admin/forums" || pathname.startsWith("/admin/forums/"),
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: <AreaChart className="w-5 h-5" />,
      active: pathname === "/admin/analytics",
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="w-5 h-5" />,
      active: pathname === "/admin/settings",
    },
  ];

  // Sidebar content component for reuse
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand section */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-4 border-b",
          collapsed && !mobile ? "justify-center px-2" : "px-6"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          {(!collapsed || mobile) && (
            <span className="text-lg font-semibold">Admin</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                item.active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
                collapsed && !mobile ? "justify-center px-2" : ""
              )}
            >
              {item.icon}
              {(!collapsed || mobile) && (
                <span className="truncate">{item.title}</span>
              )}
              {collapsed && !mobile && (
                <span className="sr-only">{item.title}</span>
              )}
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* Collapse toggle for desktop */}
      {!mobile && (
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full justify-start gap-2",
              collapsed ? "justify-center px-2" : ""
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        {/* <aside
          className={cn(
            "hidden lg:flex flex-col border-r bg-background transition-all duration-300",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <SidebarContent />
        </aside> */}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center gap-4 px-4 border-b h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {/* Mobile menu trigger */}
                {/* <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="w-5 h-5" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <SidebarContent mobile />
                  </SheetContent>
                </Sheet> */}

                {/* Page title for mobile */}
                <div className="lg:hidden">
                  <h1 className="text-lg font-semibold">
                    {navigation.find((item) => item.active)?.title || "Admin"}
                  </h1>
                </div>
              </div>

              {/* Header actions */}
              {/* <div className="flex items-center gap-2">
                <ModeToggle />
                <UserNav />
              </div> */}
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
