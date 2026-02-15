import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";

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

        // Fetch published jobs - optimized query with only needed fields
        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select('id, job_title, location, job_type, deadline')
            .eq('employer_id', employer.id)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (jobsError) {
            console.error('Error fetching jobs:', jobsError);
            return NextResponse.json(
                { success: false, error: "Failed to fetch jobs" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: jobs || []
        });

    } catch (error) {
        console.error('API error:', error);
        await logError({ source: "api/employer/jobs/active:GET", errorType: "APIError", message: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
