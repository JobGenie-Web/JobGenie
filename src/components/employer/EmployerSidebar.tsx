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
    CalendarDays,
    CreditCard,
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
import { usePendingInvitationCount } from "@/hooks/useInvitationCount";
import { usePendingPaymentCount } from "@/hooks/usePendingPaymentCount";

const navigationItems = [
    {
        title: "Dashboard",
        href: "/employer/dashboard",
        icon: LayoutDashboard,
        requiresApproval: false,
        visibilityKey: "dashboard",
    },
    {
        title: "Job Postings",
        href: "/employer/jobs",
        icon: Briefcase,
        requiresApproval: true,
        visibilityKey: "job-postings",
    },
    {
        title: "Applications",
        href: "/employer/applications",
        icon: FileText,
        requiresApproval: true,
        visibilityKey: "applications",
    },
    {
        title: "Candidates",
        href: "/employer/candidates",
        icon: Users,
        requiresApproval: true,
        visibilityKey: "candidates",
    },
    {
        title: "Invitations",
        href: "/employer/invitations",
        icon: Mail,
        requiresApproval: true,
        visibilityKey: "invitations",
    },
    {
        title: "Calendar",
        href: "/employer/calendar",
        icon: CalendarDays,
        requiresApproval: true,
        visibilityKey: "calendar",
    },
    {
        title: "Payments",
        href: "/employer/payments",
        icon: CreditCard,
        requiresApproval: true,
        visibilityKey: "payments",
    },
    {
        title: "Company Profile",
        href: "/employer/company",
        icon: Building2,
        requiresApproval: false,
        visibilityKey: "company-profile",
    },
    {
        title: "Company Admins",
        href: "/employer/admins",
        icon: UserCog,
        requiresApproval: true,
        visibilityKey: "company-admins",
    },
    {
        title: "Settings",
        href: "/employer/settings",
        icon: Settings,
        requiresApproval: true,
        visibilityKey: "settings",
    },
];

export function EmployerSidebar() {
    const pathname = usePathname();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const [isApproved, setIsApproved] = useState<boolean>(true); // Default to true to avoid flash
    const [visibility, setVisibility] = useState<Record<string, boolean>>({});

    // Use SWR hook for automatic revalidation and caching
    const { count: pendingCount } = usePendingInvitationCount();
    const { count: pendingPaymentCount } = usePendingPaymentCount();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companyResponse, visibilityResponse] = await Promise.all([
                    fetch("/api/employer/company"),
                    fetch("/api/employer/sidebar-visibility"),
                ]);
                const companyData = await companyResponse.json();
                if (companyData.success && companyData.data) {
                    setIsApproved(companyData.data.approval_status === "approved");
                }
                const visibilityData = await visibilityResponse.json();
                if (visibilityData.success) {
                    setVisibility(visibilityData.visibility);
                }
            } catch (error) {
                console.error("Error fetching sidebar data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <Sidebar collapsible="icon" className={cn("shadow-sm", "sidebar-portal")}>
            {/* Header with Logo - height matches the header (h-16 = 64px) */}
            <SidebarHeader className="h-16 px-4 flex items-center">
                <Link href="/employer/dashboard" className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden"
                         style={{ background: "var(--gradient-primary)" }}>
                        <Image
                            src="/logo.jpg"
                            alt="JobGenie"
                            width={36}
                            height={36}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className={cn(
                        "sidebar-brand-wordmark text-lg font-semibold tracking-tight",
                        "transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap",
                        isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[160px]"
                    )}>
                        JobGenie
                    </span>
                </Link>
            </SidebarHeader>

            {/* Navigation */}
            <SidebarContent className="p-2">
                <SidebarMenu>
                    <TooltipProvider delayDuration={0}>
                        {navigationItems.map((item) => {
                            // If MIS has hidden this item, skip it entirely
                            if (Object.keys(visibility).length > 0 && visibility[item.visibilityKey] === false) {
                                return null;
                            }

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
                                                    <span className={cn(
                                                        "text-muted-foreground transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap",
                                                        isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[200px]"
                                                    )}>{item.title}</span>
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
                                                    "transition-colors duration-150 hover:bg-sidebar-accent/8",
                                                    "group-data-[collapsible=icon]:!h-12 group-data-[collapsible=icon]:!w-12 group-data-[collapsible=icon]:!p-3",
                                                    isActive && "sidebar-item-active"
                                                )}
                                            >
                                                <Link href={item.href} className="gap-3 flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="h-6 w-6 shrink-0" />
                                                        <span className={cn(
                                                            "transition-[opacity,max-width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap",
                                                            isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[200px]"
                                                        )}>{item.title}</span>
                                                    </div>
                                                    {/* Badges for pending items */}
                                                    <span className={cn(
                                                        "transition-[opacity] duration-200",
                                                        isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                                                    )}>
                                                        {item.title === "Invitations" && pendingCount > 0 && (
                                                            <Badge className="ml-auto h-5 min-w-[20px] rounded-full bg-green-500 px-1.5 text-xs font-semibold">
                                                                {pendingCount}
                                                            </Badge>
                                                        )}
                                                        {item.title === "Payments" && pendingPaymentCount > 0 && (
                                                            <Badge className="ml-auto h-5 min-w-[20px] rounded-full bg-amber-500 px-1.5 text-xs font-semibold">
                                                                {pendingPaymentCount}
                                                            </Badge>
                                                        )}
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </TooltipTrigger>
                                        {isCollapsed && (
                                            <TooltipContent side="right" className="font-medium">
                                                {item.title}
                                                {item.title === "Invitations" && pendingCount > 0 && (
                                                    <Badge className="ml-2 h-5 min-w-[20px] rounded-full px-1.5 text-xs bg-green-500 font-semibold">
                                                        {pendingCount}
                                                    </Badge>
                                                )}
                                                {item.title === "Payments" && pendingPaymentCount > 0 && (
                                                    <Badge className="ml-2 h-5 min-w-[20px] rounded-full px-1.5 text-xs bg-amber-500 font-semibold">
                                                        {pendingPaymentCount}
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

