import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logBusiness, logError } from "@/lib/logger";

// POST /api/candidate/invitations/:id/respond
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { action, selected_time_slot, interview_mode } = await request.json();

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

        const { id } = await params;

        // Validate action
        if (!['accept', 'decline', 'cancel'].includes(action)) {
            return NextResponse.json(
                { success: false, error: "Invalid action. Must be 'accept', 'decline', or 'cancel'" },
                { status: 400 }
            );
        }

        // For accept action, selected_time_slot is required
        if (action === 'accept' && !selected_time_slot) {
            return NextResponse.json(
                { success: false, error: "Selected time slot is required when accepting" },
                { status: 400 }
            );
        }

        // For accept action, interview_mode is required
        if (action === 'accept' && !interview_mode) {
            return NextResponse.json(
                { success: false, error: "Interview mode is required when accepting" },
                { status: 400 }
            );
        }

        // Validate interview_mode if provided
        if (interview_mode && !['online', 'physical'].includes(interview_mode)) {
            return NextResponse.json(
                { success: false, error: "Interview mode must be either 'online' or 'physical'" },
                { status: 400 }
            );
        }

        // Verify the invitation belongs to this candidate
        const { data: invitation, error: invitationError } = await supabase
            .from('job_invitations')
            .select('id, status')
            .eq('id', id)
            .eq('candidate_id', candidate.id)
            .eq('invitation_canceled', false)
            .single();

        if (invitationError || !invitation) {
            return NextResponse.json(
                { success: false, error: "Invitation not found" },
                { status: 404 }
            );
        }

        // Check if invitation has already been responded to (unless canceling)
        if (action !== 'cancel' && invitation.status !== 'pending' && invitation.status !== 'viewed') {
            return NextResponse.json(
                { success: false, error: "Invitation has already been responded to" },
                { status: 400 }
            );
        }

        // For cancel action, verify invitation is currently accepted or declined
        if (action === 'cancel' && invitation.status !== 'accepted' && invitation.status !== 'declined') {
            return NextResponse.json(
                { success: false, error: "Can only cancel accepted or declined invitations" },
                { status: 400 }
            );
        }

        // Update invitation based on action
        let updateData: any = {};

        if (action === 'cancel') {
            // Reset to pending and clear selected time slot and interview mode
            updateData = {
                status: 'pending',
                selected_time_slot: null,
                interview_mode: null,
                responded_at: null
            };
        } else {
            // Handle accept or decline
            updateData = {
                status: action === 'accept' ? 'accepted' : 'declined',
                responded_at: new Date().toISOString()
            };

            // Add selected_time_slot and interview_mode if accepting
            if (action === 'accept' && selected_time_slot) {
                updateData.selected_time_slot = selected_time_slot;
                updateData.interview_mode = interview_mode;
            }
        }

        const { error: updateError } = await supabase
            .from('job_invitations')
            .update(updateData)
            .eq('id', id);

        if (updateError) {
            console.error('Error updating invitation:', updateError);
            return NextResponse.json(
                { success: false, error: "Failed to update invitation" },
                { status: 500 }
            );
        }

        const messages = {
            accept: 'Invitation accepted successfully',
            decline: 'Invitation declined successfully',
            cancel: 'Acceptance cancelled successfully'
        };

        await logBusiness(`invitation_${action}`, user.id, "candidate", "job_invitation", id, { action, interview_mode });
        return NextResponse.json({
            success: true,
            message: messages[action as keyof typeof messages]
        });

    } catch (error) {
        console.error('API error:', error);
        await logError({ source: "api/candidate/invitations/respond:POST", errorType: "APIError", message: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
