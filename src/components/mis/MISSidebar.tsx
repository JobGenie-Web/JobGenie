"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    UserSquare,
    Building2,
    Briefcase,
    Settings,
    BarChart3,
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
        href: "/mis/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "MIS User Management",
        href: "/mis/users",
        icon: Users,
    },
    {
        title: "Candidates",
        href: "/mis/candidates",
        icon: UserSquare,
    },
    {
        title: "Employers",
        href: "/mis/employers",
        icon: Building2,
    },
    {
        title: "Jobs",
        href: "/mis/jobs",
        icon: Briefcase,
    },
    {
        title: "Reports",
        href: "/mis/reports",
        icon: BarChart3,
    },
    {
        title: "Settings",
        href: "/mis/settings",
        icon: Settings,
    },
];

export function MISSidebar() {
    const pathname = usePathname();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <Sidebar collapsible="icon" className="shadow-sm">
            {/* Header with Logo - height matches the header (h-16 = 64px) */}
            <SidebarHeader className="h-16 px-4 flex items-center">
                <Link href="/mis/dashboard" className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden">
                        <Image
                            src="/logo.png"
                            alt="JobGenie"
                            width={36}
                            height={36}
                            className="object-contain"
                            priority
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-sidebar-foreground">
                                JobGenie
                            </span>
                            <span className="text-xs text-muted-foreground">
                                MIS System
                            </span>
                        </div>
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
