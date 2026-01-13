import { Metadata } from "next";
import { EmployerLayout } from "@/components/employer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
    title: "Dashboard | JobGenie",
    description: "Employer dashboard overview",
};

export default async function EmployerDashboardPage() {
    // TODO: Fetch real stats from database
    const stats = {
        activeJobs: 0,
        totalApplications: 0,
        shortlisted: 0,
        newApplications: 0,
    };

    return (
        <EmployerLayout
            pageTitle="Dashboard"
            pageDescription="Welcome back! Here's an overview of your recruitment activities."
        >
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Job Postings</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeJobs}</div>
                            <p className="text-xs text-muted-foreground">
                                Jobs currently open
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalApplications}</div>
                            <p className="text-xs text-muted-foreground">
                                All time applications
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.shortlisted}</div>
                            <p className="text-xs text-muted-foreground">
                                Candidates under review
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.newApplications}</div>
                            <p className="text-xs text-muted-foreground">
                                In the last 7 days
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                            No recent activity to display
                        </div>
                    </CardContent>
                </Card>
            </div>
        </EmployerLayout>
    );
}
