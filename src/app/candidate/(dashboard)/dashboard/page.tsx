import { FileText, Users, Gift, Bookmark, AlertTriangle } from 'lucide-react';
import { CandidateLayout } from '@/components/candidate';
import { ApprovalStatusNotification } from '@/components/candidate/ApprovalStatusNotification';
import { RestrictionToastListener } from '@/components/candidate/RestrictionToastListener';
import { getCandidateDashboardData } from '@/app/actions/candidate-dashboard-data';
import { DashboardStatsCard } from '@/components/candidate/dashboard/DashboardStatsCard';
import { RecommendedJobsWidget } from '@/components/candidate/dashboard/RecommendedJobsWidget';
import { ProfileStrengthWidget } from '@/components/candidate/dashboard/ProfileStrengthWidget';
import { UpgradeProCard } from '@/components/candidate/dashboard/UpgradeProCard';
import { InterviewCalendarWidget } from '@/components/candidate/dashboard/InterviewCalendarWidget';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function CandidateDashboardPage() {
    // Fetch approval notification state (for the modal)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let showNotification = false;
    let approvalStatus: 'approved' | 'rejected' | null = null;
    let rejectionReason: string | null = null;

    if (user) {
        const { data: candidateData } = await supabase
            .from('candidates')
            .select('approval_status, approval_status_message_seen, rejection_reason')
            .eq('user_id', user.id)
            .single();

        if (candidateData && !candidateData.approval_status_message_seen) {
            if (
                candidateData.approval_status === 'approved' ||
                candidateData.approval_status === 'rejected'
            ) {
                showNotification = true;
                approvalStatus = candidateData.approval_status as 'approved' | 'rejected';
                rejectionReason = candidateData.rejection_reason;
            }
        }
    }

    // Fetch all dashboard data
    const data = await getCandidateDashboardData();

    const isPending = data?.approvalStatus === 'pending';

    return (
        <CandidateLayout
            pageTitle="Overview"
            pageDescription={data ? `Welcome back, ${data.firstName}!` : 'Welcome back!'}
        >
            <RestrictionToastListener />

            {/* Approval notification modal */}
            {showNotification && approvalStatus && (
                <ApprovalStatusNotification
                    approvalStatus={approvalStatus}
                    rejectionReason={rejectionReason}
                />
            )}

            {/* ─── Approve Pending Banner ──────────────────────────────────── */}
            {isPending && (
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20 p-3 flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                            Approval Pending
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            Your profile is currently under review by our masterful team. You can browse jobs, but applications are restricted until approval is complete est. 24h.
                        </p>
                    </div>
                    <Link
                        href="/candidate/profile"
                        className="flex-shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline whitespace-nowrap"
                    >
                        Check Status
                    </Link>
                </div>
            )}

            {!data ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <p className="text-muted-foreground">Unable to load dashboard data. Please refresh.</p>
                </div>
            ) : (
                <div className="space-y-5">

                    {/* ─── Row 1: My Application Statuses ─────────────────────── */}
                    <div>
                        <h2 className="text-sm font-semibold text-foreground mb-3">My Application Statuses</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <DashboardStatsCard
                                title="Under Review"
                                value={data.underReviewApplications}
                                icon={<FileText className="h-5 w-5" />}
                                colorScheme="blue"
                            />
                            <DashboardStatsCard
                                title="Interviews"
                                value={data.interviews}
                                icon={<Users className="h-5 w-5" />}
                                colorScheme="purple"
                            />
                            <DashboardStatsCard
                                title="Offers Received"
                                value={data.offersReceived}
                                icon={<Gift className="h-5 w-5" />}
                                colorScheme="green"
                            />
                            <DashboardStatsCard
                                title="Saved Jobs"
                                value={data.savedJobs}
                                icon={<Bookmark className="h-5 w-5" />}
                                colorScheme="amber"
                            />
                        </div>
                    </div>

                    {/* ─── Row 2: Main two-column layout ──────────────────────── */}
                    <div className="grid gap-5 lg:grid-cols-5">

                        {/* ── Left column (3/5): Recommended Jobs ─────────────── */}
                        <div className="lg:col-span-3 flex flex-col gap-5">
                            <RecommendedJobsWidget jobs={data.recommendedJobs} />
                        </div>

                        {/* ── Right column (2/5): Calendar + Profile Strength + Upgrade card ─ */}
                        <div className="lg:col-span-2 flex flex-col gap-5">
                            <InterviewCalendarWidget events={data.interviewEvents} />
                            <ProfileStrengthWidget data={data} />
                            <UpgradeProCard />
                        </div>
                    </div>


                </div>
            )}
        </CandidateLayout>
    );
}
