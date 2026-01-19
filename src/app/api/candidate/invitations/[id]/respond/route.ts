import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/candidate/invitations/:id/respond
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { action, selected_time_slot } = await request.json();

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
        if (!['accept', 'decline'].includes(action)) {
            return NextResponse.json(
                { success: false, error: "Invalid action. Must be 'accept' or 'decline'" },
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

        // Check if invitation has already been responded to
        if (invitation.status !== 'pending' && invitation.status !== 'viewed') {
            return NextResponse.json(
                { success: false, error: "Invitation has already been responded to" },
                { status: 400 }
            );
        }

        // Update invitation based on action
        const updateData: any = {
            status: action === 'accept' ? 'accepted' : 'declined',
            responded_at: new Date().toISOString()
        };

        // Add selected_time_slot if accepting
        if (action === 'accept' && selected_time_slot) {
            updateData.selected_time_slot = selected_time_slot;
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

        return NextResponse.json({
            success: true,
            message: action === 'accept'
                ? 'Invitation accepted successfully'
                : 'Invitation declined successfully'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
