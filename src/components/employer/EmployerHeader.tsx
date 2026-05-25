"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { EmployerUserMenu } from "./EmployerUserMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

interface EmployerHeaderProps {
    user: {
        firstName: string;
        lastName: string;
        email: string;
        companyName?: string;
    };
    pageTitle?: string;
    pageDescription?: string;
}

export function EmployerHeader({ user, pageTitle, pageDescription }: EmployerHeaderProps) {
    const { toggleSidebar, state } = useSidebar();
    const isCollapsed = state === "collapsed";

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
        toggleSidebar();
        e.currentTarget.blur();
    };

    return (
        <header className="sticky top-0 z-40 flex h-[4.25rem] items-center gap-4 border-b border-primary/10 bg-card/92 px-4 shadow-[inset_0_-1px_0_oklch(var(--accent)/0.14)] backdrop-blur-sm dark:bg-card/88 md:px-6">
            <button
                onClick={handleToggle}
                className={cn(
                    "group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    "bg-gradient-to-br from-accent/22 via-primary/14 to-primary/20 ring-1 ring-accent/30",
                    "hover:from-accent/30 hover:via-primary/18 hover:to-primary/26",
                    "active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                )}
                aria-label="Toggle sidebar"
            >
                <svg
                    className={cn(
                        "h-4 w-4 text-primary transition-transform duration-300",
                        isCollapsed ? "rotate-0" : "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>

            {pageTitle ? (
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                        Employer
                    </p>
                    <h1 className="truncate bg-gradient-to-r from-foreground via-foreground to-accent bg-clip-text text-xl font-bold tracking-tight text-transparent md:text-2xl">
                        {pageTitle}
                    </h1>
                    {pageDescription ? (
                        <p className="truncate text-sm text-muted-foreground md:text-[15px]">{pageDescription}</p>
                    ) : null}
                </div>
            ) : (
                <div className="flex-1" />
            )}

            <div className="flex shrink-0 items-center gap-3">
                <ThemeToggle />
                <NotificationBell />
                <EmployerUserMenu user={user} />
            </div>
        </header>
    );
}
