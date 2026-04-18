import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logBusiness, logError } from "@/lib/logger";
import { sendInterviewConfirmedEmail } from "@/lib/interview-emails";
import { getUserTimezoneByEmail } from "@/lib/user-timezone";

// POST /api/employer/interview-rounds/:roundId/confirm
// Employer confirms an interview round after candidate acceptance
export async function POST(
    request: Request,
    { params }: { params: Promise<{ roundId: string }> }
) {
    try {
        const supabase = await createClient();
        const { roundId } = await params;
        const body = await request.json();
        const { confirmed_time, meeting_link, interview_address, map_link } = body;

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get employer record
        const { data: employer, error: employerError } = await supabase
            .from('employers')
            .select('id, company_id, first_name, last_name')
            .eq('user_id', user.id)
            .single();

        if (employerError || !employer) {
            return NextResponse.json(
                { success: false, error: "Employer profile not found" },
                { status: 404 }
            );
        }

        // Get the interview round and verify permissions
        const { data: round, error: roundError } = await supabase
            .from('interview_rounds')
            .select(`
                id,
                round_number,
                round_label,
                status,
                selected_time_slot,
                interview_mode,
                invitation:job_invitations!inner(
                    id,
                    company_id,
                    candidate_id,
                    job_designation,
                    candidate:candidates(
                        first_name,
                        last_name,
                        email
                    )
                )
            `)
            .eq('id', roundId)
            .single();

        if (roundError || !round) {
            return NextResponse.json(
                { success: false, error: "Interview round not found" },
                { status: 404 }
            );
        }

        const invitation = round.invitation as any;

        // Verify the round belongs to this company
        if (invitation.company_id !== employer.company_id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized access to this interview round" },
                { status: 403 }
            );
        }

        // Check if round is in accepted status
        if (round.status !== 'accepted') {
            return NextResponse.json(
                { success: false, error: "Can only confirm rounds that have been accepted by the candidate" },
                { status: 400 }
            );
        }

        // Validate required fields based on interview mode
        const selectedSlot = round.selected_time_slot as any;
        const isAlternative = selectedSlot?.is_alternative;

        if (isAlternative && !confirmed_time) {
            return NextResponse.json(
                { success: false, error: "Confirmed time is required for alternative dates" },
                { status: 400 }
            );
        }

        if (round.interview_mode === 'online' && !meeting_link) {
            return NextResponse.json(
                { success: false, error: "Meeting link is required for online interviews" },
                { status: 400 }
            );
        }

        if (round.interview_mode === 'physical' && !interview_address) {
            return NextResponse.json(
                { success: false, error: "Interview address is required for physical interviews" },
                { status: 400 }
            );
        }

        // Update the round with confirmation details
        const updateData: any = {
            interview_confirmed: true,
            status: 'confirmed',
            confirmed_at: new Date().toISOString()
        };

        if (confirmed_time) {
            updateData.confirmed_time = { time: confirmed_time };
        }
        if (meeting_link) {
            updateData.meeting_link = meeting_link;
        }
        if (interview_address) {
            updateData.interview_address = interview_address;
        }
        if (map_link) {
            updateData.map_link = map_link;
        }

        const { error: updateError } = await supabase
            .from('interview_rounds')
            .update(updateData)
            .eq('id', roundId);

        if (updateError) {
            console.error('Error confirming interview round:', updateError);
            return NextResponse.json(
                { success: false, error: "Failed to confirm interview round" },
                { status: 500 }
            );
        }

        // Get company info for email
        const { data: company } = await supabase
            .from('companies')
            .select('company_name')
            .eq('id', employer.company_id)
            .single();

        // Send confirmation email to candidate
        const candidate = invitation.candidate;
        if (candidate && company) {
            const recipientTz = await getUserTimezoneByEmail(candidate.email);
            const interviewDate = selectedSlot?.date;
            const interviewTime = confirmed_time || selectedSlot?.time;
            
            sendInterviewConfirmedEmail(
                candidate.email,
                candidate.first_name,
                company.company_name,
                invitation.job_designation,
                interviewDate,
                interviewTime,
                round.interview_mode,
                meeting_link || null,
                interview_address || null,
                map_link || null,
                invitation.id,
                recipientTz
            ).catch(err => console.error('Email send error:', err));
        }

        await logBusiness(
            "interview_round_confirmed",
            user.id,
            "employer",
            "interview_round",
            roundId,
            { 
                round_number: round.round_number,
                invitation_id: invitation.id,
                interview_mode: round.interview_mode
            }
        );

        return NextResponse.json({
            success: true,
            message: "Interview round confirmed successfully",
            data: {
                round_id: roundId,
                round_number: round.round_number,
                status: 'confirmed'
            }
        });

    } catch (error) {
        console.error('API error:', error);
        await logError({
            source: "api/employer/interview-rounds/confirm:POST",
            errorType: "APIError",
            message: error instanceof Error ? error.message : String(error)
        });
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
