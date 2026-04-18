import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

// GET /api/candidate/invitations/[id]/offer
// Fetch job offer for a specific invitation (candidate view)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: invitationId } = await params;

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get candidate record
        const { data: candidate } = await supabase
            .from('candidates')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!candidate) {
            return NextResponse.json(
                { success: false, error: "Candidate profile not found" },
                { status: 404 }
            );
        }

        // Verify invitation belongs to this candidate
        const { data: invitation } = await supabase
            .from('job_invitations')
            .select('id, candidate_id')
            .eq('id', invitationId)
            .eq('candidate_id', candidate.id)
            .single();

        if (!invitation) {
            return NextResponse.json(
                { success: false, error: "Invitation not found or unauthorized" },
                { status: 404 }
            );
        }

        // Fetch the job offer
        const { data: offer, error: offerError } = await supabase
            .from('job_offers')
            .select(`
                id,
                job_title,
                salary_amount,
                salary_currency,
                salary_period,
                start_date,
                expiry_date,
                offer_letter_url,
                description,
                status,
                created_at,
                responded_at
            `)
            .eq('invitation_id', invitationId)
            .maybeSingle();

        if (offerError) {
            console.error('Database error fetching offer:', offerError);
            await logError({
                source: "api/candidate/invitations/offer:GET",
                errorType: "DatabaseError",
                message: offerError.message
            });
            return NextResponse.json(
                { success: false, error: "Failed to fetch offer" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            offer: offer || null
        });

    } catch (error) {
        console.error('API error:', error);
        await logError({
            source: "api/candidate/invitations/offer:GET",
            errorType: "APIError",
            message: error instanceof Error ? error.message : String(error)
        });
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
