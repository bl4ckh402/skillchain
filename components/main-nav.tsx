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
  ChevronDown,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// Enhanced navigation item structure for better organization and maintenance
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
// ListItem component with proper typing
// Centralized navigation configuration for easier maintenance

// CHANGED: Enhanced navigation item structure for better organization and maintenance
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

// CHANGED: Centralized navigation configuration for easier maintenance
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
          description: "Browse all available courses and resources",
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
      description: "Connect with other learners and share knowledge",
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
          description: "Participate in coding challenges and hackathons",
          icon: Trophy,
        },
        {
          href: "/jobs",
          title: "Job Board",
          description: "Find job opportunities and career resources",
          icon: Briefcase,
        },
      ],
    },
  ];

  // CHANGED: Dynamic navigation based on user roles
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
          href: "/admin/users",
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

// CHANGED: Enhanced ListItem component with better accessibility and responsive design
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
              // CHANGED: Enhanced responsive padding and spacing for all screen sizes
              "group block select-none space-y-1 rounded-lg p-3 sm:p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:bg-accent focus:text-accent-foreground focus:shadow-sm",
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

// CHANGED: Enhanced feature card component with responsive design
const FeatureCard: React.FC<{
  section: NavigationSection;
  isActive: boolean;
}> = ({ section, isActive }) => {
  const Icon = section.icon;

  return (
    <NavigationMenuLink asChild>
      <Link
        className={cn(
          // CHANGED: Responsive padding and sizing for different screen sizes
          "group flex flex-col justify-end w-full h-full p-4 sm:p-6 no-underline rounded-lg outline-none select-none bg-gradient-to-br from-muted/30 via-muted/50 to-muted transition-all duration-300 hover:shadow-lg hover:from-muted/40 hover:via-muted/60 hover:to-muted/80 focus:shadow-lg min-h-[120px] sm:min-h-[140px]",
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

export function MainNav() {
  const pathname = usePathname();
  const { isInstructor, isAdmin } = useAuthRoles();
  const [isOpen, setIsOpen] = React.useState(false);

  // CHANGED: Memoized navigation config to prevent unnecessary recalculations
  const navigationConfig = React.useMemo(
    () => getNavigationConfig(isInstructor, isAdmin),
    [isInstructor, isAdmin]
  );

  // CHANGED: Enhanced active state detection with more precise matching
  const isActive = React.useCallback(
    (path: string) => {
      if (path === "/") return pathname === path;
      return pathname.startsWith(path);
    },
    [pathname]
  );

  //  Check if any item in a section is active
  const isSectionActive = React.useCallback(
    (section: NavigationSection) => {
      if (section.href && isActive(section.href)) return true;
      return section.items?.some((item) => isActive(item.href)) || false;
    },
    [isActive]
  );

  // CHANGED: Enhanced keyboard navigation and accessibility
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  React.useEffect(() => {
    // CHANGED: Close mobile menu on route change for better UX
    setIsOpen(false);
  }, [pathname]);

  // CHANGED: Handle body scroll lock when mobile menu is open
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
      {/* CHANGED: Desktop Navigation - Hidden on tablet and mobile */}
      <NavigationMenu className="hidden xl:flex" onKeyDown={handleKeyDown}>
        <NavigationMenuList className="gap-1">
          {navigationConfig.map((section) => {
            const sectionActive = isSectionActive(section);

            if (section.items && section.items.length > 0) {
              return (
                <NavigationMenuItem key={section.title}>
                  <NavigationMenuTrigger
                    className={cn(
                      "transition-all duration-200 hover:bg-accent/80 text-sm",
                      sectionActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    {section.icon && (
                      <section.icon className="flex-shrink-0 w-4 h-4 mr-2" />
                    )}
                    <span className="truncate">{section.title}</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    {/* CHANGED: Fully responsive grid layout for dropdown content */}
                    <div className="grid gap-3 p-4 sm:p-6 w-[350px] sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px]">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {/* CHANGED: Feature card responsive layout */}
                        <div className="sm:col-span-1 lg:col-span-1">
                          <FeatureCard
                            section={section}
                            isActive={sectionActive}
                          />
                        </div>

                        {/* CHANGED: Navigation items responsive grid */}
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

            // CHANGED: Simple navigation items for sections without dropdowns
            return (
              <NavigationMenuItem key={section.title}>
                <Link href={section.href || "#"} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "transition-all duration-200 hover:bg-accent/80 text-sm",
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

      {/* CHANGED: Tablet Navigation - Simple horizontal menu for medium screens */}
      <div className="hidden lg:flex xl:hidden">
        <nav className="flex items-center space-x-1">
          {navigationConfig.slice(0, 4).map((section) => {
            const sectionActive = isSectionActive(section);
            return (
              <Link
                key={section.title}
                href={section.href || "#"}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                  sectionActive && "bg-accent text-accent-foreground"
                )}
              >
                {section.icon && (
                  <section.icon className="flex-shrink-0 w-4 h-4" />
                )}
                <span className="truncate">{section.title}</span>
              </Link>
            );
          })}

          {/* CHANGED: Overflow menu for additional items on tablet */}
          {navigationConfig.length > 4 && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-3">
                  <ChevronDown className="w-4 h-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <div className="p-4 border-b">
                  <h3 className="text-sm font-semibold">More Options</h3>
                </div>
                <div className="p-4 space-y-2">
                  {navigationConfig.slice(4).map((section) => (
                    <Link
                      key={section.title}
                      href={section.href || "#"}
                      className="flex items-center gap-3 p-2 text-sm transition-colors rounded-md hover:bg-accent"
                    >
                      {section.icon && (
                        <section.icon className="w-4 h-4 text-muted-foreground" />
                      )}
                      {section.title}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </nav>
      </div>

      {/* CHANGED: Mobile Navigation - Enhanced for all mobile screen sizes */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {/* <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle navigation menu"
            className="relative h-9 w-9 sm:h-10 sm:w-10"
          >
            <MenuIcon
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200",
                isOpen && "rotate-90 opacity-0"
              )}
            />
            <X
              className={cn(
                "absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200",
                !isOpen && "rotate-90 opacity-0"
              )}
            />
          </Button>
        </SheetTrigger> */}

        <SheetContent
          side="left"
          className="w-[280px] xs:w-[300px] sm:w-[350px] md:w-[400px] p-0 flex flex-col overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* CHANGED: Enhanced responsive header */}
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b sm:px-6 sm:py-4 bg-muted/20">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-sm font-bold transition-colors sm:gap-3 sm:text-base lg:text-lg hover:text-primary"
            >
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="truncate">SkillChain</span>
            </Link>
          </div>

          {/* CHANGED: Scrollable content area with enhanced mobile spacing */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
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
                        className="overflow-hidden border rounded-lg"
                      >
                        <AccordionTrigger
                          className={cn(
                            "px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium hover:bg-accent/50 transition-colors [&[data-state=open]]:bg-accent/30 [&>svg]:h-3 [&>svg]:w-3 sm:[&>svg]:h-4 sm:[&>svg]:w-4",
                            sectionActive &&
                              "bg-accent/20 text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center min-w-0 gap-2 sm:gap-3">
                            {section.icon && (
                              <section.icon className="flex-shrink-0 w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-left truncate">
                              {section.title}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3 space-y-1 sm:px-4">
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

                  // CHANGED: Direct links for sections without items - Enhanced mobile styling
                  return (
                    <div
                      key={section.title}
                      className="overflow-hidden border rounded-lg"
                    >
                      <Link
                        href={section.href || "#"}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium hover:bg-accent/50 transition-colors min-w-0",
                          sectionActive && "bg-accent/20 text-accent-foreground"
                        )}
                      >
                        {section.icon && (
                          <section.icon className="flex-shrink-0 w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="truncate">{section.title}</span>
                      </Link>
                    </div>
                  );
                })}
              </Accordion>
            </div>
          </div>

          {/* CHANGED: Optional footer for mobile navigation */}
          <div className="flex-shrink-0 p-3 border-t sm:p-4 bg-muted/10">
            <div className="text-xs text-center text-muted-foreground">
              © 2024 SkillChain. All rights reserved.
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// CHANGED: Enhanced mobile navigation link component with full responsive design
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
        "group flex items-center justify-between py-2 sm:py-2.5 px-2 text-sm rounded-md transition-all duration-200 hover:bg-accent/30 min-w-0",
        active
          ? "text-primary font-medium bg-primary/5 border-primary/20"
          : "text-foreground/80 hover:text-foreground"
      )}
    >
      <div className="flex items-center flex-1 min-w-0 gap-2">
        <ChevronRight
          className={cn(
            "w-3 h-3 transition-transform duration-200 flex-shrink-0",
            active && "rotate-90 text-primary"
          )}
        />
        {Icon && (
          <Icon
            className={cn(
              "w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-200 flex-shrink-0",
              active
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground"
            )}
          />
        )}
        <span className="truncate">{children}</span>
      </div>
      {badge && (
        <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary flex-shrink-0">
          {badge}
        </span>
      )}
    </Link>
  );
}
