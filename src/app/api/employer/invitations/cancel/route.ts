import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// DELETE /api/employer/invitations?candidateId=xxx
export async function DELETE(request: Request) {
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

        // Get candidate ID from query params
        const { searchParams } = new URL(request.url);
        const candidateId = searchParams.get("candidateId");

        if (!candidateId) {
            return NextResponse.json(
                { success: false, error: "Missing candidate ID" },
                { status: 400 }
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
                { success: false, error: "Employer profile not found" },
                { status: 404 }
            );
        }

        // Soft delete invitation (set canceled flag instead of deleting)
        const { error: updateError } = await supabase
            .from('job_invitations')
            .update({
                invitation_canceled: true,
                canceled_at: new Date().toISOString()
            })
            .eq('candidate_id', candidateId)
            .eq('employer_id', employer.id);

        if (updateError) {
            console.error('Error canceling invitation:', updateError);
            return NextResponse.json(
                { success: false, error: "Failed to cancel invitation" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Invitation cancelled successfully"
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
