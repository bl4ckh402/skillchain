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
  Menu as MenuIcon,
  ChevronRight,
  X,
  Settings,
  BarChart3,
  UserCheck,
  Plus,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import UserManagement from "@/components/admin/UserManagement";

// CSS for slide-in animation with explicit colors
const dialogStyles = `
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    animation: fadeIn 300ms ease-in-out;
  }
  .dialog-content {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100%;
    background: #ffffff; /* Light mode background */
    border-right: 1px solid #e5e7eb; /* Light mode border */
    animation: slideIn 300ms ease-in-out forwards;
  }
  .dark .dialog-content {
    background: #1f2937; /* Dark mode background */
    border-right: 1px solid #374151; /* Dark mode border */
  }
  @media (min-width: 360px) {
    .dialog-content {
      width: 300px;
    }
  }
  @media (min-width: 640px) {
    .dialog-content {
      width: 350px;
    }
  }
  @media (min-width: 768px) {
    .dialog-content {
      width: 400px;
    }
  }
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  [data-state='closed'] .dialog-content {
    animation: slideOut 300ms ease-in-out forwards;
  }
  @keyframes slideOut {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
  }
  [data-state='closed'] .dialog-overlay {
    animation: fadeOut 300ms ease-in-out forwards;
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

// Enhanced navigation item structure for better organization and maintenance
interface NavigationItem {
  href: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  external?: boolean;
}


// Mock auth hook (replace with actual auth logic)
const useAuth = () => {
  const { isInstructor, isAdmin } = useAuthRoles();
  return { isInstructor, isAdmin };
};

// Interface for navigation items
interface NavigationItem {
  href: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  external?: boolean;
}

interface NavigationSection {
  title: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  items?: NavigationItem[];
}

// ListItem component
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title?: string;
    className?: string;
    active?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    badge?: string;
  }
>(
  (
    { className, title, children, active, href, icon: Icon, badge, ...props },
    ref
  ) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            href={href || "#"}
            className={cn(
              "group block select-none space-y-1 rounded-lg p-3 sm:p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:bg-accent focus:text-accent-foreground focus:shadow-md focus:ring-2 focus:ring-primary/20",
              active && "bg-accent/50 text-accent-foreground shadow-sm",
              className
            )}
            {...props}
          >
            <div className="flex items-center gap-2 text-xs font-medium leading-none sm:text-sm">
              {Icon && (
                <Icon className="flex-shrink-0 w-3 h-3 transition-colors sm:h-4 sm:w-4 text-muted-foreground group-hover:text-current" />
              )}
              <span className="truncate">{title}</span>
              {badge && (
                <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary flex-shrink-0">
                  {badge}
                </span>
              )}
            </div>
            {children && (
              <p className="text-xs leading-snug sm:text-sm line-clamp-2 text-muted-foreground group-hover:text-muted-foreground/80">
                {children}
              </p>
            )}
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }
);

ListItem.displayName = "ListItem";

// FeatureCard component
const FeatureCard: React.FC<{
  section: NavigationSection;
  isActive: boolean;
}> = ({ section, isActive }) => {
  const Icon = section.icon;

  return (
    <NavigationMenuLink asChild>
      <Link
        className={cn(
          "group flex flex-col justify-end w-full h-full p-4 sm:p-6 no-underline rounded-lg outline-none select-none bg-gradient-to-br from-muted/30 via-muted/50 to-muted transition-all duration-300 hover:shadow-lg hover:from-muted/40 hover:via-muted/60 hover:to-muted/80 focus:shadow-lg focus:ring-2 focus:ring-primary/20 min-h-[120px] sm:min-h-[140px]",
          isActive &&
            "ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 via-muted/50 to-muted"
        )}
        href={section.href || "#"}
      >
        {Icon && (
          <Icon className="flex-shrink-0 w-6 h-6 mb-2 transition-transform duration-200 sm:w-8 sm:h-8 sm:mb-3 text-primary group-hover:scale-110" />
        )}
        <div className="mt-1 mb-1 text-base font-semibold leading-tight transition-colors sm:mt-2 sm:mb-2 sm:text-lg group-hover:text-primary">
          {section.title}
        </div>
        <p className="text-xs leading-tight sm:text-sm text-muted-foreground group-hover:text-muted-foreground/90 line-clamp-2">
          {section.description}
        </p>
      </Link>
    </NavigationMenuLink>
  );
};

// Navigation configuration
const getNavigationConfig = (
  isInstructor: boolean,
  isAdmin: boolean
): NavigationSection[] => {
  const baseConfig: NavigationSection[] = [
    {
      title: "Resources",
      icon: BookOpen,
      description: "Browse courses, bootcamps, and learning paths",
      href: "/marketplace",
      items: [
        {
          href: "/marketplace",
          title: "Course Marketplace",
          description: "Browse peer-led skills & services ",
          icon: BookOpen,
        },
        {
          href: "/bootcamps",
          title: "Bootcamps",
          description: "Intensive training programs for specific skills",
          icon: GraduationCap,
        },
        {
          href: "/live-session",
          title: "Live Sessions",
          description: "Join interactive live learning sessions",
          icon: Users,
        },
      ],
    },
    {
      title: "Community",
      icon: MessageSquare,
      description: "Events, forums, and collaboration",
      href: "/community",
      items: [
        {
          href: "/community",
          title: "Discussion Forums",
          description: "Engage in technical discussions and get help",
          icon: MessageSquare,
        },
        {
          href: "/hackathons",
          title: "Hackathons",
          description: "Compete, build, and earn ",
          icon: Trophy,
        },
        {
          href: "/jobs",
          title: "Job Board",
          description: " Web3 and blockchain job listings",
          icon: Briefcase,
        },
      ],
    },
  ];

  if (isInstructor || isAdmin) {
    baseConfig.push({
      title: "Instructor",
      icon: UserCheck,
      description: "Manage your courses and teaching materials",
      href: "/instructor/dashboard",
      items: [
        {
          href: "/instructor/dashboard",
          title: "Dashboard",
          description: "View your teaching analytics and student progress",
          icon: BarChart3,
        },
        {
          href: "/create",
          title: "Create Course",
          description: "Build and publish new courses",
          icon: Plus,
        },
        {
          href: "/bootcamps/create",
          title: "Create Bootcamp",
          description: "Design intensive training programs",
          icon: GraduationCap,
        },
      ],
    });
  }

  if (isAdmin) {
    baseConfig.push({
      title: "Admin",
      icon: Settings,
      description: "System administration and management",
      href: "/admin",
      items: [
        {
          href: "/admin",
          title: "Admin Dashboard",
          description: "Access the main admin control panel",
          icon: BarChart3,
        },
        {
          href: "/admin/UserManagement",
          title: "User Management",
          description: "Manage users and permissions",
          icon: Users,
        },
        {
          href: "/admin/courses",
          title: "Course Management",
          description: "Oversee courses and content",
          icon: BookOpen,
        },
        {
          href: "/admin/reports",
          title: "Reports & Analytics",
          description: "View system analytics and reports",
          icon: BarChart3,
        },
      ],
    });
  }

  return baseConfig;
};

export function MainNav() {
  const pathname = usePathname();
  const { isInstructor, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const navigationConfig = React.useMemo(
    () => getNavigationConfig(isInstructor, isAdmin),
    [isInstructor, isAdmin]
  );

  const isActive = React.useCallback(
    (path: string) => {
      if (path === "/") return pathname === path;
      return pathname.startsWith(path);
    },
    [pathname]
  );

  const isSectionActive = React.useCallback(
    (section: NavigationSection) => {
      if (section.href && isActive(section.href)) return true;
      return section.items?.some((item) => isActive(item.href)) || false;
    },
    [isActive]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <style>{dialogStyles}</style>
      <div className="items-center hidden mr-6 xl:flex">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          <span className="font-bold">SkillChain</span>
        </Link>
      </div>
      <NavigationMenu className="hidden xl:flex" onKeyDown={handleKeyDown}>
        <NavigationMenuList className="gap-1">
          {navigationConfig.map((section) => {
            const sectionActive = isSectionActive(section);

            if (section.items && section.items.length > 0) {
              return (
                <NavigationMenuItem key={section.title}>
                  <NavigationMenuTrigger
                    className={cn(
                      "transition-all duration-200 hover:bg-accent/80 text-sm font-medium",
                      sectionActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    {section.icon && (
                      <section.icon className="flex-shrink-0 w-4 h-4 mr-2" />
                    )}
                    <span className="truncate">{section.title}</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 sm:p-6 w-[350px] sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px]">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="sm:col-span-1 lg:col-span-1">
                          <FeatureCard
                            section={section}
                            isActive={sectionActive}
                          />
                        </div>
                        <div className="sm:col-span-1 lg:col-span-2">
                          <ul className="grid gap-1 sm:gap-2">
                            {section.items.map((item) => (
                              <ListItem
                                key={item.href}
                                href={item.href}
                                title={item.title}
                                active={isActive(item.href)}
                                icon={item.icon}
                                badge={item.badge}
                              >
                                {item.description}
                              </ListItem>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            }

            return (
              <NavigationMenuItem key={section.title}>
                <Link href={section.href || "#"} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "transition-all duration-200 hover:bg-accent/80 text-sm font-medium",
                      sectionActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    {section.icon && (
                      <section.icon className="flex-shrink-0 w-4 h-4 mr-2" />
                    )}
                    <span className="truncate">{section.title}</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile navigation */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild className="xl:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle navigation menu"
            className="relative w-10 h-10 sm:h-12 sm:w-12"
          >
            <MenuIcon className="w-5 h-5 transition-all duration-300 ease-in-out sm:w-6 sm:h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="flex flex-col p-0 overflow-hidden dialog-content">
          <VisuallyHidden>
            <DialogTitle>SkillChain Navigation Menu</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b sm:px-6 sm:py-4 bg-gray-50 dark:bg-gray-900">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-sm font-bold transition-colors duration-300 sm:gap-3 sm:text-base lg:text-lg hover:text-primary"
            >
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="truncate">SkillChain</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close navigation"
              className="w-10 h-10 sm:h-12 sm:w-12"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5 transition-all duration-300 sm:w-6 sm:h-6" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white overscroll-contain dark:bg-gray-800">
            <div className="p-3 sm:p-4">
              <Accordion
                type="single"
                collapsible
                className="space-y-2"
                defaultValue={navigationConfig
                  .find((section) => isSectionActive(section))
                  ?.title.toLowerCase()}
              >
                {navigationConfig.map((section) => {
                  const sectionActive = isSectionActive(section);

                  if (section.items && section.items.length > 0) {
                    return (
                      <AccordionItem
                        key={section.title}
                        value={section.title.toLowerCase()}
                        className="overflow-hidden transition-all duration-300 border border-gray-200 rounded-lg dark:border-gray-700"
                      >
                        <AccordionTrigger
                          className={cn(
                            "px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 [&[data-state=open]]:bg-gray-100 dark:[&[data-state=open]]:bg-gray-700 [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5",
                            sectionActive &&
                              "bg-gray-100 dark:bg-gray-700 text-accent-foreground"
                          )}
                        >
                          <Link
                            href={section.href || "#"}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center min-w-0 gap-2 sm:gap-3"
                          >
                            {section.icon && (
                              <section.icon className="flex-shrink-0 w-5 h-5 text-gray-500 transition-colors duration-300 dark:text-gray-400" />
                            )}
                            <span className="text-left truncate">
                              {section.title}
                            </span>
                          </Link>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 space-y-1 bg-white sm:px-5 dark:bg-gray-800">
                          {section.items.map((item) => (
                            <MobileNavLink
                              key={item.href}
                              href={item.href}
                              active={isActive(item.href)}
                              icon={item.icon}
                              badge={item.badge}
                              onSelect={() => setIsOpen(false)}
                            >
                              {item.title}
                            </MobileNavLink>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }

                  return (
                    <div
                      key={section.title}
                      className="overflow-hidden border border-gray-200 rounded-lg dark:border-gray-700"
                    >
                      <Link
                        href={section.href || "#"}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 min-w-0 focus:ring-2 focus:ring-primary/20",
                          sectionActive &&
                            "bg-gray-100 dark:bg-gray-700 text-accent-foreground"
                        )}
                      >
                        {section.icon && (
                          <section.icon className="flex-shrink-0 w-5 h-5 text-gray-500 transition-colors duration-300 dark:text-gray-400" />
                        )}
                        <span className="truncate">{section.title}</span>
                      </Link>
                    </div>
                  );
                })}
              </Accordion>
            </div>
          </div>

          <div className="flex-shrink-0 p-3 border-t border-gray-200 sm:p-4 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
              © 2025 SkillChain. All rights reserved.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// MobileNavLink component
interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  onSelect?: () => void;
}

function MobileNavLink({
  href,
  children,
  active,
  icon: Icon,
  badge,
  onSelect,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={cn(
        "group flex items-center justify-between py-2.5 sm:py-3 px-3 text-sm rounded-md transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 min-w-0 focus:ring-2 focus:ring-primary/20",
        active
          ? "text-primary font-medium bg-gray-100 dark:bg-gray-700 border-primary/20"
          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      )}
    >
      <div className="flex items-center flex-1 min-w-0 gap-2">
        <ChevronRight
          className={cn(
            "w-4 h-4 transition-transform duration-300 flex-shrink-0 text-gray-500 dark:text-gray-400",
            active && "rotate-90 text-primary"
          )}
        />
        {Icon && (
          <Icon
            className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 flex-shrink-0",
              active
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            )}
          />
        )}
        <span className="truncate">{children}</span>
      </div>
      {badge && (
        <span className="flex-shrink-0 px-2 py-1 ml-2 text-xs font-medium rounded-full bg-primary/10 text-primary">
          {badge}
        </span>
      )}
    </Link>
  );
}
