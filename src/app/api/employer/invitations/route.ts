import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Helper to calculate alternative dates (3 working days)
function calculateAlternativeDates(date: Date): Date[] {
    const alternatives: Date[] = [];
    let currentDate = new Date(date);
    let workingDaysAdded = 0;

    while (workingDaysAdded < 3) {
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();

        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            alternatives.push(new Date(currentDate));
            workingDaysAdded++;
        }
    }

    return alternatives;
}

// GET /api/employer/invitations - Fetch all invitations for the company
export async function GET(request: Request) {
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
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
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

        // Parse request body
        const body = await request.json();
        const { candidateId, industry, jobDesignation, message, timeSlots } = body;

        if (!candidateId || !industry || !jobDesignation) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
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

        // Check for existing active invitation (exclude canceled)
        const { data: existingInvitation } = await supabase
            .from('job_invitations')
            .select('id')
            .eq('candidate_id', candidateId)
            .eq('employer_id', employer.id)
            .eq('invitation_canceled', false)  // Only check active invitations
            .maybeSingle();

        if (existingInvitation) {
            return NextResponse.json(
                { success: false, error: "You have already sent an invitation to this candidate" },
                { status: 409 }
            );
        }

        // Create invitation record (no job_id needed)
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
                alternative_dates: calculateAlternativeDatesArray(timeSlots)  // Calculate and store
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

        // TODO: Send email notification to candidate (async)
        // This can be implemented later using your email service

        return NextResponse.json({
            success: true,
            message: "Invitation sent successfully",
            data: {
                ...invitation,
                time_slots_count: timeSlots.length,
                alternative_slots_count: 3
            }
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Helper function to calculate alternative dates
function calculateAlternativeDatesArray(timeSlots: any[]): any[] {
    if (!timeSlots || timeSlots.length === 0) return [];

    const latestDate = new Date(Math.max(...timeSlots.map((s: any) => new Date(s.date).getTime())));
    const alternatives: any[] = [];
    let currentDate = new Date(latestDate);
    let workingDaysAdded = 0;

    while (workingDaysAdded < 3) {
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();

        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            alternatives.push({
                date: currentDate.toISOString().split('T')[0],
                time: "09:00",
                order: timeSlots.length + workingDaysAdded + 1,
                is_alternative: true
            });
            workingDaysAdded++;
        }
    }

    return alternatives;
}
