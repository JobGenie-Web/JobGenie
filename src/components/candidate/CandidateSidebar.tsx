"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    User,
    Settings,
    Mail,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navigationItems = [
    {
        title: "Dashboard",
        href: "/candidate/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Browse Jobs",
        href: "/candidate/jobs",
        icon: Briefcase,
    },
    {
        title: "Applications",
        href: "/candidate/applications",
        icon: FileText,
    },
    {
        title: "Invitations",
        href: "/candidate/invitations",
        icon: Mail,
    },
    {
        title: "My Profile",
        href: "/candidate/profile",
        icon: User,
    },
    {
        title: "My Resumes",
        href: "/candidate/resumes",
        icon: FileText,
    },
    {
        title: "Settings",
        href: "/candidate/settings",
        icon: Settings,
    },
];

export function CandidateSidebar() {
    const pathname = usePathname();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const [unopenedCount, setUnopenedCount] = useState<number>(0);

    useEffect(() => {
        // Fetch unopened invitations count
        const fetchUnopenedCount = async () => {
            try {
                const response = await fetch("/api/candidate/invitations/unopened-count");
                const data = await response.json();
                if (data.success) {
                    setUnopenedCount(data.count);
                }
            } catch (error) {
                console.error("Error fetching unopened count:", error);
            }
        };

        fetchUnopenedCount();

        // Refresh count every 30 seconds
        const interval = setInterval(fetchUnopenedCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Sidebar collapsible="icon" className="shadow-sm">
            {/* Header with Logo - height matches the header (h-16 = 64px) */}
            <SidebarHeader className="h-16 px-4 flex items-center">
                <Link href="/candidate/dashboard" className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden">
                        <Image
                            src="/logo.jpg"
                            alt="JobGenie"
                            width={36}
                            height={36}
                            className="object-contain"
                            priority
                        />
                    </div>
                    {!isCollapsed && (
                        <span className="text-lg font-semibold text-sidebar-foreground">
                            JobGenie
                        </span>
                    )}
                </Link>
            </SidebarHeader>

            {/* Navigation */}
            <SidebarContent className="p-2">
                <SidebarMenu>
                    <TooltipProvider delayDuration={0}>
                        {navigationItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                            const Icon = item.icon;

                            return (
                                <SidebarMenuItem key={item.href}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                size="lg"
                                                className={cn(
                                                    "transition-colors",
                                                    "group-data-[collapsible=icon]:!h-12 group-data-[collapsible=icon]:!w-12 group-data-[collapsible=icon]:!p-3",
                                                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground border-r-3 border-green-500"
                                                )}
                                            >
                                                <Link href={item.href} className="gap-3 flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="h-6 w-6 shrink-0" />
                                                        {!isCollapsed && <span>{item.title}</span>}
                                                    </div>
                                                    {/* Show badge for unopened invitations */}
                                                    {item.title === "Invitations" && unopenedCount > 0 && !isCollapsed && (
                                                        <Badge
                                                            // variant="destructive"
                                                            className="ml-auto h-5 min-w-[20px] rounded-full bg-green-500 px-1.5 text-xs font-semibold"
                                                        >
                                                            {unopenedCount}
                                                        </Badge>
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </TooltipTrigger>
                                        {isCollapsed && (
                                            <TooltipContent side="right" className="font-medium">
                                                {item.title}
                                                {item.title === "Invitations" && unopenedCount > 0 && (
                                                    <Badge
                                                        // variant="destructive"
                                                        className="ml-2 h-5 min-w-[20px] rounded-full px-1.5 text-xs bg-green-500 font-semibold"
                                                    >
                                                        {unopenedCount}
                                                    </Badge>
                                                )}
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </SidebarMenuItem>
                            );
                        })}
                    </TooltipProvider>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}

