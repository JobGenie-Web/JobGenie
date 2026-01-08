"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { UserMenu } from "../candidate/UserMenu";
import { cn } from "@/lib/utils";

interface MISHeaderProps {
    user: {
        firstName: string;
        lastName: string;
        email: string;
        profileImage?: string;
    };
    pageTitle?: string;
    pageDescription?: string;
}

export function MISHeader({ user, pageTitle, pageDescription }: MISHeaderProps) {
    const { toggleSidebar, state } = useSidebar();
    const isCollapsed = state === "collapsed";

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
        toggleSidebar();
        // Remove focus to prevent hover state from sticking
        e.currentTarget.blur();
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 bg-background/80 backdrop-blur-md px-4 border-b">
            {/* Modern Circular Toggle */}
            <button
                onClick={handleToggle}
                className={cn(
                    "group relative flex h-9 w-9 items-center justify-center flex-shrink-0",
                    "rounded-full bg-primary/10 hover:bg-primary/20",
                    "transition-all duration-300 ease-out",
                    "active:scale-90",
                    "focus:outline-none"
                )}
                aria-label="Toggle sidebar"
            >
                {/* Arrow Icon with rotation */}
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

            {/* Page Title Area */}
            {pageTitle && (
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold truncate">{pageTitle}</h1>
                    {pageDescription && (
                        <p className="text-sm text-muted-foreground truncate">
                            {pageDescription}
                        </p>
                    )}
                </div>
            )}

            {/* Spacer if no title */}
            {!pageTitle && <div className="flex-1" />}

            {/* Right Side - User Menu */}
            <div className="flex items-center gap-4 flex-shrink-0">
                <UserMenu user={user} />
            </div>
        </header>
    );
}
