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
        requiresApproval: false,
    },
    {
        title: "Browse Jobs",
        href: "/candidate/jobs",
        icon: Briefcase,
        requiresApproval: true,
    },
    {
        title: "Applications",
        href: "/candidate/applications",
        icon: FileText,
        requiresApproval: true,
    },
    {
        title: "Invitations",
        href: "/candidate/invitations",
        icon: Mail,
        requiresApproval: true,
    },
    {
        title: "My Profile",
        href: "/candidate/profile",
        icon: User,
        requiresApproval: false,
    },
    {
        title: "My Resumes",
        href: "/candidate/resumes",
        icon: FileText,
        requiresApproval: false,
    },
    {
        title: "Settings",
        href: "/candidate/settings",
        icon: Settings,
        requiresApproval: true,
    },
];

export function CandidateSidebar() {
    const pathname = usePathname();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const [unopenedCount, setUnopenedCount] = useState<number>(0);
    const [isApproved, setIsApproved] = useState<boolean>(true); // Default to true to avoid flash

    useEffect(() => {
        // Fetch unopened invitations count and approval status on mount
        const fetchSidebarData = async () => {
            try {
                // Fetch unopened count
                const invitationsResponse = await fetch("/api/candidate/invitations/unopened-count");
                const invitationsData = await invitationsResponse.json();
                if (invitationsData.success) {
                    setUnopenedCount(invitationsData.count);
                }

                // Fetch approval status
                const profileResponse = await fetch("/api/candidate/profile");
                const profileData = await profileResponse.json();
                if (profileData.success && profileData.data) {
                    setIsApproved(profileData.data.approval_status === "approved");
                }
            } catch (error) {
                console.error("Error fetching sidebar data:", error);
            }
        };

        fetchSidebarData();
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
                            const isRestricted = item.requiresApproval && !isApproved;

                            // For restricted items, show disabled state
                            if (isRestricted) {
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-md cursor-not-allowed opacity-50",
                                                        "group-data-[collapsible=icon]:!h-12 group-data-[collapsible=icon]:!w-12 group-data-[collapsible=icon]:!p-3"
                                                    )}
                                                >
                                                    <Icon className="h-6 w-6 shrink-0 text-muted-foreground" />
                                                    {!isCollapsed && (
                                                        <span className="text-muted-foreground">{item.title}</span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="font-medium">
                                                <div className="flex flex-col gap-1">
                                                    <span>{item.title}</span>
                                                    <span className="text-xs text-amber-500">
                                                        Awaiting MIS approval
                                                    </span>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </SidebarMenuItem>
                                );
                            }

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

