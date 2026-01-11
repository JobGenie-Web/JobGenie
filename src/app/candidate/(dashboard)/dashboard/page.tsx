import Link from 'next/link';
import { User, Briefcase, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CandidateLayout } from '@/components/candidate';
import { ApprovalStatusNotification } from '@/components/candidate/ApprovalStatusNotification';
import { createClient } from '@/lib/supabase/server';
import { RestrictionToastListener } from '@/components/candidate/RestrictionToastListener';

export default async function CandidateDashboardPage() {
    // Fetch candidate approval status
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let showNotification = false;
    let approvalStatus: "approved" | "rejected" | null = null;
    let rejectionReason: string | null = null;
    let isPending = false;

    if (user) {
        const { data: candidateData } = await supabase
            .from('candidates')
            .select('approval_status, approval_status_message_seen, rejection_reason')
            .eq('user_id', user.id)
            .single();

        if (candidateData && !candidateData.approval_status_message_seen) {
            if (candidateData.approval_status === 'approved' || candidateData.approval_status === 'rejected') {
                showNotification = true;
                approvalStatus = candidateData.approval_status as "approved" | "rejected";
                rejectionReason = candidateData.rejection_reason;
            }
        }

        // Check if candidate is pending
        if (candidateData?.approval_status === 'pending') {
            isPending = true;
        }
    }

    return (
        <CandidateLayout
            pageTitle="Dashboard"
            pageDescription="Welcome back! Manage your job applications and profile."
        >
            <RestrictionToastListener />

            {showNotification && approvalStatus && (
                <ApprovalStatusNotification
                    approvalStatus={approvalStatus}
                    rejectionReason={rejectionReason}
                />
            )}

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
                                Please be patient. Our MIS Admin is reviewing your profile...
                            </p>
                            <p className="mt-0.5 text-xs text-green-700 dark:text-green-300">
                                You will be notified once the review is complete.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Quick Actions Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Profile Card */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-blue-500/10 p-3 text-blue-500">
                            <User className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">My Profile</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Update your personal information and CV
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/candidate/profile">View Profile</Link>
                        </Button>
                    </div>

                    {/* Jobs Card */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-green-500/10 p-3 text-green-500">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">Browse Jobs</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Discover new opportunities that match your skills
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/candidate/jobs">Find Jobs</Link>
                        </Button>
                    </div>

                    {/* Applications Card */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-purple-500/10 p-3 text-purple-500">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">Applications</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Track the status of your job applications
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/candidate/applications">View Applications</Link>
                        </Button>
                    </div>

                    {/* Settings Card */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-orange-500/10 p-3 text-orange-500">
                            <Settings className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">Settings</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Manage your account preferences and notifications
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/candidate/settings">Settings</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </CandidateLayout>
    );
}
