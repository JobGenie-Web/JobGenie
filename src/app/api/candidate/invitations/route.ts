import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

export const dynamic = 'force-dynamic';

// GET /api/candidate/invitations
export async function GET() {
    try {
        const supabase = await createClient();

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get candidate record
        const { data: candidate, error: candidateError } = await supabase
            .from('candidates')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (candidateError || !candidate) {
            return NextResponse.json(
                { success: false, error: "Candidate profile not found" },
                { status: 404 }
            );
        }

        // Fetch invitations for this candidate (only active, non-canceled)
        const { data: invitations, error: invitationsError } = await supabase
            .from('job_invitations')
            .select(`
                id,
                industry,
                job_designation,
                message,
                given_time_slots,
                alternative_dates,
                status,
                interview_confirmed,
                pipeline_status,
                current_round_number,
                invitation_canceled,
                mis_rescheduled,
                candidate_reschedule_requested,
                canceled_by,
                cancellation_reason,
                canceled_at,
                sent_at,
                viewed_at,
                job_offers(id, status),
                employer:employers(id, user_id),
                company:companies(company_name, logo_url, industry, headoffice_location)
            `)
            .eq('candidate_id', candidate.id)
            .order('sent_at', { ascending: false });

        if (invitationsError) {
            console.error('Error fetching invitations:', invitationsError);
            return NextResponse.json(
                { success: false, error: "Failed to fetch invitations" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: invitations || []
        });

    } catch (error) {
        console.error('API error:', error);
        await logError({ source: "api/candidate/invitations:GET", errorType: "APIError", message: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
