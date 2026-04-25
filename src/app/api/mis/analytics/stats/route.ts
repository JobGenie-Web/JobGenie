import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/logger";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();
        const { data: misUser, error: misUserError } = await adminClient
            .from("mis_user")
            .select("user_id")
            .eq("user_id", user.id)
            .single();

        if (misUserError || !misUser) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get counts
        const [
            candidatesResult,
            employersResult,
            jobsResult,
            interviewsResult,
            pendingCandidatesResult,
            pendingEmployersResult,
            activeJobsResult,
            confirmedInterviewsResult,
        ] = await Promise.all([
            adminClient.from("candidates").select("*", { count: "exact", head: true }),
            adminClient.from("companies").select("*", { count: "exact", head: true }),
            adminClient.from("jobs").select("*", { count: "exact", head: true }),
            adminClient.from("job_invitations").select("*", { count: "exact", head: true }),
            adminClient.from("candidates").select("*", { count: "exact", head: true }).eq("approval_status", "pending"),
            adminClient.from("companies").select("*", { count: "exact", head: true }).eq("approval_status", "pending"),
            adminClient.from("jobs").select("*", { count: "exact", head: true }).eq("status", "published"),
            adminClient.from("job_invitations").select("*", { count: "exact", head: true }).eq("interview_confirmed", true),
        ]);

        // Get recent activity
        const { data: recentActivity } = await adminClient
            .from("event_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

        // Get approval trends (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: approvedCandidates } = await adminClient
            .from("candidates")
            .select("approved_at")
            .eq("approval_status", "approved")
            .gte("approved_at", thirtyDaysAgo.toISOString());

        const { data: approvedEmployers } = await adminClient
            .from("companies")
            .select("approved_at")
            .eq("approval_status", "approved")
            .gte("approved_at", thirtyDaysAgo.toISOString());

        return NextResponse.json({
            success: true,
            stats: {
                totalCandidates: candidatesResult.count || 0,
                totalEmployers: employersResult.count || 0,
                totalJobs: jobsResult.count || 0,
                totalInterviews: interviewsResult.count || 0,
                pendingCandidates: pendingCandidatesResult.count || 0,
                pendingEmployers: pendingEmployersResult.count || 0,
                activeJobs: activeJobsResult.count || 0,
                confirmedInterviews: confirmedInterviewsResult.count || 0,
                recentApprovals: {
                    candidates: approvedCandidates?.length || 0,
                    employers: approvedEmployers?.length || 0,
                },
            },
            recentActivity: recentActivity || [],
        });
    } catch (error) {
        console.error("Error in GET /api/mis/analytics/stats:", error);
        await logError({
            source: "api/mis/analytics/stats:GET",
            errorType: "APIError",
            message: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
