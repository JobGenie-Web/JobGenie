import { Metadata } from "next";
import { EmployerLayout } from "@/components/employer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, Users, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RestrictionToastListener } from "@/components/employer/RestrictionToastListener";

export const metadata: Metadata = {
    title: "Dashboard | JobGenie",
    description: "Employer dashboard overview",
};

export default async function EmployerDashboardPage() {
    // Fetch company approval status
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    let isPending = false;

    const { data: employerData } = await supabase
        .from('employers')
        .select(`
            id,
            companies!inner (
                approval_status
            )
        `)
        .eq('user_id', user.id)
        .single();

    // Type assertion for nested company data
    const company = (employerData as any)?.companies;

    // Check if company is pending approval
    if (company?.approval_status === 'pending') {
        isPending = true;
    }

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
            <RestrictionToastListener />

            {/* Pending Status Alert */}
            {isPending && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-4 dark:border-green-900/50 dark:bg-green-900/10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                            <svg className="h-5 w-5 text-green-600 dark:text-green-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-900 dark:text-green-200">
                                Please be patient. Our MIS Admin is reviewing your company profile...
                            </p>
                            <p className="mt-0.5 text-xs text-green-700 dark:text-green-300">
                                You will be notified once the review is complete. You can update your company profile while waiting.
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
