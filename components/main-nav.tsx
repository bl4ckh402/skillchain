"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthRoles } from "@/lib/auth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Code2,
  Users,
  Briefcase,
  Trophy,
  MessageSquare,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MainNav() {
  const pathname = usePathname();
  const { isInstructor, isAdmin } = useAuthRoles();
  const [isOpen, setIsOpen] = React.useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {/* Resources Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              isActive("/marketplace") ||
                isActive("/bootcamps") ||
                isActive("/live-session")
                ? "bg-accent text-accent-foreground"
                : ""
            )}
          >
            Resources
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 w-[400px] md:w-[500px] lg:w-[600px] md:grid-cols-2">
              <li className="row-span-3 md:col-span-1">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex flex-col justify-end w-full h-full p-6 no-underline rounded-md outline-none select-none bg-gradient-to-b from-muted/50 to-muted focus:shadow-md"
                    href="/marketplace"
                  >
                    <BookOpen className="w-6 h-6 mb-2" />
                    <div className="mt-4 mb-2 text-lg font-medium">
                      Learning Resources
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Browse courses, bootcamps, and learning paths
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem
                href="/bootcamps"
                title="Bootcamps"
                active={isActive("/bootcamps")}
              >
                Intensive training programs for specific skills
              </ListItem>
              <ListItem
                href="/live-session"
                title="Live Sessions"
                active={isActive("/live-session")}
              >
                Join interactive live learning sessions
              </ListItem>
              <ListItem
                href="/marketplace"
                title="Course Marketplace"
                active={isActive("/marketplace")}
              >
                Browse all available courses and resources
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Community Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              isActive("/community") ||
                isActive("/hackathons") ||
                isActive("/jobs")
                ? "bg-accent text-accent-foreground"
                : ""
            )}
          >
            Community
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p- md:w-[400px] lg:w-[500px] md:grid-cols-2">
              <li className="row-span-3 md:col-span-1">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex flex-col justify-end w-full h-full p-6 no-underline rounded-md outline-none select-none bg-gradient-to-b from-muted/50 to-muted focus:shadow-md"
                    href="/community"
                  >
                    <MessageSquare className="w-6 h-6 mb-2" />
                    <div className="mt-4 mb-2 text-lg font-medium">
                      Community Hub
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Connect with other learners and share knowledge
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem
                href="/hackathons"
                title="Hackathons"
                active={isActive("/hackathons")}
              >
                Participate in coding challenges and hackathons
              </ListItem>
              <ListItem
                href="/community"
                title="Discussion Forums"
                active={isActive("/community")}
              >
                Engage in technical discussions and get help
              </ListItem>
              <ListItem
                href="/jobs"
                title="Job Board"
                active={isActive("/jobs")}
              >
                Find job opportunities and career resources
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Regular Menu Items */}
        <NavigationMenuItem>
          <Link href="/jobs" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                isActive("/jobs") && "bg-accent text-accent-foreground"
              )}
            >
              Jobs
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/hackathons" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                isActive("/hackathons") && "bg-accent text-accent-foreground"
              )}
            >
              Hackathons
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {/* Instructor-only items */}
        {(isInstructor || isAdmin) && (
          <>
            <NavigationMenuItem>
              <Link href="/instructor/dashboard" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/instructor") &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  Instructor Dashboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/create" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/create") && "bg-accent text-accent-foreground"
                  )}
                >
                  Create Course
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/bootcamps/create" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/bootcamps/create") &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  Create Bootcamp
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </>
        )}

        {/* Admin-only items */}
        {isAdmin && (
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                isActive("/admin") && "bg-accent text-accent-foreground"
              )}
            >
              Admin
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 w-[400px] md:w-[500px] lg:w-[600px] grid-cols-2">
                <ListItem
                  href="/admin"
                  title="Admin Dashboard"
                  active={isActive("/admin")}
                >
                  Access the main admin control panel
                </ListItem>
                <ListItem
                  href="/admin/users"
                  title="User Management"
                  active={isActive("/admin/users")}
                >
                  Manage users and permissions
                </ListItem>
                <ListItem
                  href="/admin/courses"
                  title="Course Management"
                  active={isActive("/admin/courses")}
                >
                  Oversee courses and content
                </ListItem>
                <ListItem
                  href="/admin/reports"
                  title="Reports & Analytics"
                  active={isActive("/admin/reports")}
                >
                  View system analytics and reports
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

// Updated ListItem component with active state support
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { active?: boolean }
>(({ className, title, children, active, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href || "#"}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            active && "bg-accent/50 text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-sm leading-snug line-clamp-2 text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
