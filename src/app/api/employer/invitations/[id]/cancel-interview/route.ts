import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/employer/invitations/:id/cancel-interview
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { cancellation_reason } = await request.json();

        if (!cancellation_reason || cancellation_reason.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Cancellation reason is required' },
                { status: 400 }
            );
        }

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get employer record
        const { data: employer, error: employerError } = await supabase
            .from('employers')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (employerError || !employer) {
            return NextResponse.json(
                { success: false, error: 'Employer profile not found' },
                { status: 404 }
            );
        }

        const { id } = await params;

        // Verify the invitation belongs to this employer
        const { data: invitation, error: invitationError } = await supabase
            .from('job_invitations')
            .select('id, status, interview_confirmed, invitation_canceled')
            .eq('id', id)
            .eq('employer_id', employer.id)
            .single();

        if (invitationError || !invitation) {
            return NextResponse.json(
                { success: false, error: 'Invitation not found' },
                { status: 404 }
            );
        }

        // Verify the interview is confirmed
        if (!invitation.interview_confirmed) {
            return NextResponse.json(
                { success: false, error: 'Interview is not confirmed yet' },
                { status: 400 }
            );
        }

        // Verify it's not already canceled
        if (invitation.invitation_canceled) {
            return NextResponse.json(
                { success: false, error: 'Interview is already canceled' },
                { status: 400 }
            );
        }

        // Cancel the interview
        const { error: updateError } = await supabase
            .from('job_invitations')
            .update({
                invitation_canceled: true,
                canceled_by: 'employer',
                cancellation_reason: cancellation_reason.trim(),
                canceled_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) {
            console.error('Error canceling interview:', updateError);
            return NextResponse.json(
                { success: false, error: 'Failed to cancel interview' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Interview canceled successfully'
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
