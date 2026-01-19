import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/employer/invitations/[id]/confirm
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { confirmed_time, meeting_link, interview_address, map_link } = await request.json();

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
            .select('id, company_id')
            .eq('user_id', user.id)
            .single();

        if (employerError || !employer) {
            return NextResponse.json(
                { success: false, error: "Employer profile not found" },
                { status: 404 }
            );
        }

        const { id } = await params;

        // Verify the invitation belongs to this company and is accepted
        const { data: invitation, error: invitationError } = await supabase
            .from('job_invitations')
            .select('id, status, interview_mode, selected_time_slot, interview_confirmed')
            .eq('id', id)
            .eq('company_id', employer.company_id)
            .eq('status', 'accepted')
            .single();

        if (invitationError || !invitation) {
            return NextResponse.json(
                { success: false, error: "Accepted invitation not found" },
                { status: 404 }
            );
        }

        // Check if already confirmed
        if (invitation.interview_confirmed) {
            return NextResponse.json(
                { success: false, error: "Interview already confirmed" },
                { status: 400 }
            );
        }

        // Validate based on interview mode
        if (invitation.interview_mode === 'online') {
            if (!meeting_link || meeting_link.trim() === '') {
                return NextResponse.json(
                    { success: false, error: "Meeting link is required for online interviews" },
                    { status: 400 }
                );
            }
        } else if (invitation.interview_mode === 'physical') {
            if (!interview_address || interview_address.trim() === '') {
                return NextResponse.json(
                    { success: false, error: "Interview address is required for physical interviews" },
                    { status: 400 }
                );
            }
        }

        // Check if it's an alternative date
        const selectedSlot = invitation.selected_time_slot as any;
        if (selectedSlot?.is_alternative && (!confirmed_time || confirmed_time.trim() === '')) {
            return NextResponse.json(
                { success: false, error: "Time slot is required for alternative dates" },
                { status: 400 }
            );
        }

        // Update invitation with confirmation details
        const updateData: any = {
            interview_confirmed: true,
            confirmed_at: new Date().toISOString()
        };

        if (selectedSlot?.is_alternative && confirmed_time) {
            updateData.confirmed_time = confirmed_time;
        }

        if (invitation.interview_mode === 'online') {
            updateData.meeting_link = meeting_link;
        } else if (invitation.interview_mode === 'physical') {
            updateData.interview_address = interview_address;
            if (map_link && map_link.trim() !== '') {
                updateData.map_link = map_link;
            }
        }

        const { error: updateError } = await supabase
            .from('job_invitations')
            .update(updateData)
            .eq('id', id);

        if (updateError) {
            console.error('Error confirming interview:', updateError);
            return NextResponse.json(
                { success: false, error: "Failed to confirm interview" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Interview confirmed successfully"
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
