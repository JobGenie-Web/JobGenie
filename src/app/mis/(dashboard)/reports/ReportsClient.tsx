"use client";

import { useState, useEffect } from "react";
import { formatTimestamp } from "@/lib/date-utils";
import {
    Users,
    Building2,
    Briefcase,
    Calendar,
    CheckCircle,
    Clock,
    TrendingUp,
    Activity,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
    totalCandidates: number;
    totalEmployers: number;
    totalJobs: number;
    totalInterviews: number;
    pendingCandidates: number;
    pendingEmployers: number;
    activeJobs: number;
    confirmedInterviews: number;
    recentApprovals: {
        candidates: number;
        employers: number;
    };
}

interface RecentActivity {
    id: string;
    action: string;
    category: string;
    label: string | null;
    created_at: string;
    user_role: string | null;
}

export function ReportsClient() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [activity, setActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/mis/analytics/stats");
                const data = await response.json();

                if (data.success) {
                    setStats(data.stats);
                    setActivity(data.recentActivity);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading || !stats) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader className="pb-3">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const mainStats = [
        {
            title: "Total Candidates",
            value: stats.totalCandidates,
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Total Employers",
            value: stats.totalEmployers,
            icon: Building2,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Total Jobs",
            value: stats.totalJobs,
            icon: Briefcase,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Total Interviews",
            value: stats.totalInterviews,
            icon: Calendar,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
    ];

    const actionableStats = [
        {
            title: "Pending Approvals",
            description: "Candidates awaiting review",
            value: stats.pendingCandidates,
            icon: Clock,
            color: "text-yellow-600",
            urgent: stats.pendingCandidates > 5,
        },
        {
            title: "Employer Approvals",
            description: "Companies awaiting review",
            value: stats.pendingEmployers,
            icon: Clock,
            color: "text-yellow-600",
            urgent: stats.pendingEmployers > 3,
        },
        {
            title: "Active Jobs",
            description: "Currently published",
            value: stats.activeJobs,
            icon: CheckCircle,
            color: "text-green-600",
            urgent: false,
        },
        {
            title: "Confirmed Interviews",
            description: "Scheduled interviews",
            value: stats.confirmedInterviews,
            icon: CheckCircle,
            color: "text-green-600",
            urgent: false,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mainStats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Actionable Stats */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Actionable Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {actionableStats.map((stat) => (
                        <Card
                            key={stat.title}
                            className={stat.urgent ? "border-yellow-500 border-2" : ""}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    {stat.urgent && <Badge variant="destructive">Urgent</Badge>}
                                </div>
                                <CardDescription className="text-xs">
                                    {stat.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Approvals (Last 30 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Candidates Approved</span>
                            <span className="text-2xl font-bold">{stats.recentApprovals.candidates}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Employers Approved</span>
                            <span className="text-2xl font-bold">{stats.recentApprovals.employers}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {activity.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No recent activity</p>
                            ) : (
                                activity.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-start justify-between text-sm border-b pb-2 last:border-0"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{event.action}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {event.label || event.category}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {formatTimestamp(event.created_at, "MMM dd HH:mm")}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Health */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Platform Health</CardTitle>
                    <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">Approval Rate</div>
                            <div className="text-2xl font-bold">
                                {stats.totalCandidates > 0
                                    ? Math.round(
                                          ((stats.totalCandidates - stats.pendingCandidates) /
                                              stats.totalCandidates) *
                                              100
                                      )
                                    : 0}
                                %
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Candidate approvals processed
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">Interview Conversion</div>
                            <div className="text-2xl font-bold">
                                {stats.totalInterviews > 0
                                    ? Math.round(
                                          (stats.confirmedInterviews / stats.totalInterviews) * 100
                                      )
                                    : 0}
                                %
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Interviews confirmed
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">Active Job Rate</div>
                            <div className="text-2xl font-bold">
                                {stats.totalJobs > 0
                                    ? Math.round((stats.activeJobs / stats.totalJobs) * 100)
                                    : 0}
                                %
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Jobs currently active
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
