"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CandidateDashboardData } from "@/app/actions/candidate-dashboard-data";

interface ProfileStrengthWidgetProps {
    data: CandidateDashboardData;
}

// Circular progress SVG
function CircularProgress({ percent }: { percent: number }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    const strokeColor =
        percent >= 80 ? "#10b981" : percent >= 50 ? "#3b82f6" : "#f59e0b";

    return (
        <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="absolute h-36 w-36 -rotate-90" viewBox="0 0 128 128">
                {/* Track */}
                <circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-muted/30"
                />
                {/* Progress */}
                <circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                />
            </svg>
            <div className="flex flex-col items-center z-10">
                <span className="text-3xl font-bold text-foreground tabular-nums">
                    {percent}%
                </span>
            </div>
        </div>
    );
}

export function ProfileStrengthWidget({ data }: ProfileStrengthWidgetProps) {
    const { profileCompletionPercent, profileCompletionItems } = data;

    const incompleteItems = profileCompletionItems.filter(i => !i.done).slice(0, 3);

    return (
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 flex flex-col items-center text-center gap-4">
            <div className="w-full flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-foreground">Profile Strength</h3>
            </div>

            {/* Circular progress */}
            <CircularProgress percent={profileCompletionPercent} />

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed">
                {incompleteItems.length > 0
                    ? "Complete your profile to increase visibility to recruiters."
                    : "Your profile is fully complete!"}
            </p>

            {/* Incomplete items hint */}
            {incompleteItems.length > 0 && (
                <div className="w-full space-y-1.5 text-left">
                    {incompleteItems.map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA Button */}
            <Link
                href="/candidate/profile"
                className={cn(
                    "w-full rounded-xl py-2.5 text-sm font-semibold transition-colors",
                    "bg-foreground text-background hover:bg-foreground/90",
                    "flex items-center justify-center"
                )}
            >
                {incompleteItems.length > 0 ? "Complete Profile" : "View Profile"}
            </Link>
        </div>
    );
}
