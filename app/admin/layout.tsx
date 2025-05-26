"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/user-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  AreaChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  MenuIcon,
  Briefcase,
  FileText,
  MessageSquare,
} from "lucide-react";
import { UserRole } from "@/types/user";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        {/* <div
          className={`hidden border-r bg-slate-100/40 dark:bg-slate-900/40 lg:block transition-all ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center px-4 border-b h-14">
              <Link
                href="/admin"
                className={`flex items-center gap-2 font-semibold ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                {!collapsed && <span>Admin Panel</span>}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className="ml-auto"
                >
                  {collapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </Button>
              </Link>
            </div>
            <ScrollArea className="flex-1 py-4">
              <nav className="grid gap-1 px-2">
                {navigation.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 transition-all hover:text-slate-900 dark:text-slate-50 dark:hover:text-slate-50 ${
                      item.active
                        ? "bg-slate-200 dark:bg-slate-800"
                        : "hover:bg-slate-200 dark:hover:bg-slate-800"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                ))}
              </nav>
            </ScrollArea>
          </div>
        </div> */}

        {/* Mobile sidebar */}
        {/* <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute z-40 lg:hidden top-4 left-4"
            >
              <MenuIcon className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center px-4 border-b h-14">
                <Link href="/admin" className="font-semibold">
                  Admin Panel
                </Link>
              </div>
              <ScrollArea className="flex-1 py-4">
                <nav className="grid gap-1 px-2">
                  {navigation.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 transition-all hover:text-slate-900 dark:text-slate-50 dark:hover:text-slate-50 ${
                        item.active
                          ? "bg-slate-200 dark:bg-slate-800"
                          : "hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet> */}

        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-4 px-4 border-b h-14 bg-background lg:px-6">
            <div className="flex items-center justify-end w-full">
              <div className="flex items-center gap-2">
                <ModeToggle />
                <UserNav />
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
