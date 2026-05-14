import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { sendInterviewInvitationEmail } from "@/lib/interview-emails";
import { getUserTimezoneByEmail } from "@/lib/user-timezone";
import { logBusiness, logError } from "@/lib/logger";



// GET /api/employer/invitations - Fetch all invitations for the company
export async function GET(request: Request) {
    try {
        const authClient = await createClient();

        // Get the current user
        const { data: { user } } = await authClient.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const supabase = createAdminClient();

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

        // Fetch all invitations for this company
        const { data: invitations, error: invitationsError } = await supabase
            .from('job_invitations')
            .select(`
                id,
                industry,
                job_designation,
                message,
                given_time_slots,
                alternative_dates,
                selected_time_slot,
                interview_mode,
                status,
                invitation_canceled,
                sent_at,
                viewed_at,
                responded_at,
                interview_confirmed,
                confirmed_time,
                meeting_link,
                interview_address,
                map_link,
                confirmed_at,
                canceled_by,
                cancellation_reason,
                canceled_at,
                mis_rescheduled,
                mis_rescheduled_at,
                mis_reschedule_data,
                pipeline_status,
                current_round_number,
                job_offers(id, status),
                candidate:candidates(id, first_name, last_name, email, phone, current_position, profile_image_url),
                employer:employers(id, first_name, last_name)
            `)
            .eq('company_id', employer.company_id)
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
        await logError({ source: "api/employer/invitations:GET", errorType: "APIError", message: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const authClient = await createClient();

        // Get the current user
        const { data: { user } } = await authClient.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const supabase = createAdminClient();

        // Parse request body
        const body = await request.json();
        const { candidateId, industry, jobDesignation, message, timeSlots, interviewMode, interviewAddress, mapLink } = body;

        if (!candidateId || !industry || !jobDesignation || !interviewMode) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (interviewMode === 'physical' && !interviewAddress) {
            return NextResponse.json(
                { success: false, error: "Interview address is required for physical interviews" },
                { status: 400 }
            );
        }

        if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0 || timeSlots.length > 3) {
            return NextResponse.json(
                { success: false, error: "Invalid time slots (must be 1-3)" },
                { status: 400 }
            );
        }

        // Validate time slots
        for (const slot of timeSlots) {
            if (!slot.date || !slot.time || !slot.order) {
                return NextResponse.json(
                    { success: false, error: "Incomplete time slot data" },
                    { status: 400 }
                );
            }
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

        // Verify candidate exists and is approved
        const { data: candidate, error: candidateError } = await supabase
            .from('candidates')
            .select('id, approval_status')
            .eq('id', candidateId)
            .eq('approval_status', 'approved')
            .single();

        if (candidateError || !candidate) {
            return NextResponse.json(
                { success: false, error: "Candidate not found or not approved" },
                { status: 404 }
            );
        }

        // Check for existing active invitation (exclude canceled and completed interviews)
        const { data: existingInvitation } = await supabase
            .from('job_invitations')
            .select('id, status, invitation_canceled')
            .eq('candidate_id', candidateId)
            .eq('employer_id', employer.id)
            .neq('invitation_canceled', true)  // Not cancelled
            .not('status', 'in', '(accepted,declined,expired)')  // Not in final status
            .maybeSingle();

        if (existingInvitation) {
            return NextResponse.json(
                { success: false, error: "You have already sent an active invitation to this candidate. Wait for their response or cancel the existing invitation first." },
                { status: 409 }
            );
        }

        // Create invitation record (no job_id needed)
        const sentNow = new Date().toISOString();
        const { data: invitation, error: invitationError } = await supabase
            .from('job_invitations')
            .insert({
                candidate_id: candidateId,
                employer_id: employer.id,
                company_id: employer.company_id,
                industry: industry,
                job_designation: jobDesignation,
                message: message || null,
                status: 'pending',
                given_time_slots: timeSlots,  // Store as JSON array
                alternative_dates: null,  // Removed alternative dates logic
                employer_last_seen_at: sentNow,
                interview_mode: interviewMode,
                interview_address: interviewAddress || null,
                map_link: mapLink || null,
            })
            .select()
            .single();

        if (invitationError) {
            console.error('Error creating invitation:', invitationError);
            return NextResponse.json(
                { success: false, error: "Failed to send invitation" },
                { status: 500 }
            );
        }

        // Send email notification to candidate (async - non-blocking)
        const { data: candidateData } = await supabase
            .from('candidates')
            .select('first_name, email')
            .eq('id', candidateId)
            .single();

        const { data: companyData } = await supabase
            .from('companies')
            .select('company_name')
            .eq('id', employer.company_id)
            .single();

        if (candidateData && companyData) {
            const recipientTz = await getUserTimezoneByEmail(candidateData.email);
            sendInterviewInvitationEmail(
                candidateData.email,
                candidateData.first_name,
                companyData.company_name,
                jobDesignation,
                timeSlots,
                invitation.id,
                recipientTz
            ).catch(err => console.error('Email send error:', err));
        }

        await logBusiness("invitation_sent", user.id, "employer", "job_invitation", invitation.id, { candidateId, industry, jobDesignation });
        return NextResponse.json({
            success: true,
            message: "Invitation sent successfully",
            data: {
                ...invitation,
                time_slots_count: timeSlots.length
            }
        });

    } catch (error) {
        console.error('API error:', error);
        await logError({ source: "api/employer/invitations:POST", errorType: "APIError", message: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

