"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    description?: string;
    trend?: "up" | "down" | "neutral";
    trendLabel?: string;
    colorScheme?: "blue" | "green" | "amber" | "purple" | "rose" | "cyan";
}

const colorMap = {
    blue: {
        iconBg: "bg-[linear-gradient(135deg,oklch(from_var(--accent-sky)_l_c_h_/_0.12),oklch(from_var(--accent-sky)_l_c_h_/_0.06))]",
        iconColor: "text-blue-600 dark:text-blue-400",
        valueColor: "text-foreground",
        border: "border-blue-100 dark:border-blue-900/30",
    },
    green: {
        iconBg: "bg-[linear-gradient(135deg,oklch(from_var(--primary)_l_c_h_/_0.12),oklch(from_var(--accent)_l_c_h_/_0.06))]",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        valueColor: "text-foreground",
        border: "border-emerald-100 dark:border-emerald-900/30",
    },
    amber: {
        iconBg: "bg-[linear-gradient(135deg,oklch(from_var(--accent-amber)_l_c_h_/_0.12),oklch(from_var(--accent-amber)_l_c_h_/_0.06))]",
        iconColor: "text-amber-600 dark:text-amber-400",
        valueColor: "text-foreground",
        border: "border-amber-100 dark:border-amber-900/30",
    },
    purple: {
        iconBg: "bg-[linear-gradient(135deg,oklch(from_var(--accent-violet)_l_c_h_/_0.12),oklch(from_var(--accent-violet)_l_c_h_/_0.06))]",
        iconColor: "text-violet-600 dark:text-violet-400",
        valueColor: "text-foreground",
        border: "border-violet-100 dark:border-violet-900/30",
    },
    rose: {
        iconBg: "bg-[linear-gradient(135deg,oklch(from_var(--accent-rose)_l_c_h_/_0.12),oklch(from_var(--accent-rose)_l_c_h_/_0.06))]",
        iconColor: "text-rose-600 dark:text-rose-400",
        valueColor: "text-foreground",
        border: "border-rose-100 dark:border-rose-900/30",
    },
    cyan: {
        iconBg: "bg-[linear-gradient(135deg,oklch(from_var(--accent-sky)_l_c_h_/_0.12),oklch(from_var(--accent-sky)_l_c_h_/_0.06))]",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        valueColor: "text-foreground",
        border: "border-cyan-100 dark:border-cyan-900/30",
    },
};

export function DashboardStatsCard({
    title,
    value,
    icon,
    description,
    trend,
    trendLabel,
    colorScheme = "blue",
}: DashboardStatsCardProps) {
    const colors = colorMap[colorScheme];

    return (
        <div
            className={cn(
                "flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm",
                colors.border
            )}
        >
            <div
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    colors.iconBg, colors.iconColor
                )}
            >
                {icon}
            </div>

            <div>
                <p className="text-3xl font-bold tabular-nums text-foreground leading-none">
                    {value}
                </p>
                <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                    {title}
                </p>
                {description && (
                    <p className="mt-0.5 text-xs text-muted-foreground/70">{description}</p>
                )}
            </div>

            {trend && trendLabel && (
                <div className="flex items-center gap-1 mt-auto">
                    {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                    {trend === "down" && <TrendingDown className="h-3 w-3 text-rose-500" />}
                    {trend === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
                    <span
                        className={cn(
                            "text-xs font-medium",
                            trend === "up" && "text-emerald-600 dark:text-emerald-400",
                            trend === "down" && "text-rose-600 dark:text-rose-400",
                            trend === "neutral" && "text-muted-foreground"
                        )}
                    >
                        {trendLabel}
                    </span>
                </div>
            )}
        </div>
    );
}
