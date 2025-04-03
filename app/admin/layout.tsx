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
  MessageSquare
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
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/admin",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      active: pathname === "/admin/users" || pathname.startsWith("/admin/users/"),
    },
    {
      title: "Courses",
      href: "/admin/courses",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname === "/admin/courses" || pathname.startsWith("/admin/courses/"),
    },
    {
      title: "Instructors",
      href: "/admin/instructors",
      icon: <GraduationCap className="h-5 w-5" />,
      active: pathname === "/admin/instructors" || pathname.startsWith("/admin/instructors/"),
    },
    {
      title: "Jobs",
      href: "/admin/jobs",
      icon: <Briefcase className="h-5 w-5" />,
      active: pathname === "/admin/jobs" || pathname.startsWith("/admin/jobs/"),
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: <FileText className="h-5 w-5" />,
      active: pathname === "/admin/reports",
    },
    {
      title: "Forums",
      href: "/admin/forums",
      icon: <MessageSquare className="h-5 w-5" />,
      active: pathname === "/admin/forums" || pathname.startsWith("/admin/forums/"),
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: <AreaChart className="h-5 w-5" />,
      active: pathname === "/admin/analytics",
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/admin/settings",
    },
  ];

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className={`hidden border-r bg-slate-100/40 dark:bg-slate-900/40 lg:block transition-all ${collapsed ? "w-16" : "w-64"}`}>
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b px-4">
              <Link href="/admin" className={`flex items-center gap-2 font-semibold ${collapsed ? "justify-center" : ""}`}>
                {!collapsed && <span>Admin Panel</span>}
                <Button variant="outline" size="icon" onClick={() => setCollapsed(!collapsed)} className="ml-auto">
                  {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
        </div>

        {/* Mobile sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden absolute top-4 left-4 z-40">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center border-b px-4">
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
        </Sheet>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <div className="w-full flex items-center justify-end">
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