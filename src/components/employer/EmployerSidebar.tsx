"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Building2,
    Users,
    UserCog,
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
import { cn } from "@/lib/utils";

const navigationItems = [
    {
        title: "Dashboard",
        href: "/employer/dashboard",
        icon: LayoutDashboard,
        requiresApproval: false,
    },
    {
        title: "Job Postings",
        href: "/employer/jobs",
        icon: Briefcase,
        requiresApproval: true,
    },
    {
        title: "Applications",
        href: "/employer/applications",
        icon: FileText,
        requiresApproval: true,
    },
    {
        title: "Candidates",
        href: "/employer/candidates",
        icon: Users,
        requiresApproval: true,
    },
    {
        title: "Invitations",
        href: "/employer/invitations",
        icon: Mail,
        requiresApproval: true,
    },
    {
        title: "Company Profile",
        href: "/employer/company",
        icon: Building2,
        requiresApproval: false,
    },
    {
        title: "Company Admins",
        href: "/employer/admins",
        icon: UserCog,
        requiresApproval: true,
    },
    {
        title: "Settings",
        href: "/employer/settings",
        icon: Settings,
        requiresApproval: true,
    },
];

export function EmployerSidebar() {
    const pathname = usePathname();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const [isApproved, setIsApproved] = useState<boolean>(true); // Default to true to avoid flash

    useEffect(() => {
        // Fetch company approval status on mount
        const fetchApprovalStatus = async () => {
            try {
                const response = await fetch("/api/employer/company");
                const data = await response.json();
                if (data.success && data.data) {
                    setIsApproved(data.data.approval_status === "approved");
                }
            } catch (error) {
                console.error("Error fetching company approval status:", error);
            }
        };

        fetchApprovalStatus();
    }, []);

    return (
        <Sidebar collapsible="icon" className="shadow-sm">
            {/* Header with Logo - height matches the header (h-16 = 64px) */}
            <SidebarHeader className="h-16 px-4 flex items-center">
                <Link href="/employer/dashboard" className="flex items-center gap-3">
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
                                                <Link href={item.href} className="gap-3">
                                                    <Icon className="h-6 w-6 shrink-0" />
                                                    {!isCollapsed && <span>{item.title}</span>}
                                                </Link>
                                            </SidebarMenuButton>
                                        </TooltipTrigger>
                                        {isCollapsed && (
                                            <TooltipContent side="right" className="font-medium">
                                                {item.title}
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

