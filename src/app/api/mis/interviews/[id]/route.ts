import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/logger";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authenticate user
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in" },
                { status: 401 }
            );
        }

        // Verify user is MIS user
        const adminClient = createAdminClient();
        const { data: userRecord, error: userError } = await adminClient
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (userError || !userRecord || userRecord.role !== "mis") {
            return NextResponse.json(
                { error: "Forbidden - MIS access required" },
                { status: 403 }
            );
        }

        const { id } = await params;

        // Fetch detailed interview information
        const { data: interview, error: fetchError } = await adminClient
            .from("job_invitations")
            .select(`
                *,
                candidate:candidates!inner(
                    id,
                    first_name,
                    last_name,
                    email,
                    phone,
                    industry,
                    current_position,
                    years_of_experience,
                    experience_level,
                    profile_image_url
                ),
                employer:employers!inner(
                    id,
                    first_name,
                    last_name,
                    email,
                    phone,
                    designation,
                    job_title,
                    department,
                    company_id,
                    profile_image_url
                ),
                company:companies!inner(
                    id,
                    company_name,
                    industry,
                    logo_url,
                    website,
                    phone,
                    headoffice_location
                ),
                job:jobs(
                    id,
                    job_title,
                    location,
                    job_type,
                    description
                )
            `)
            .eq("id", id)
            .single();

        if (fetchError || !interview) {
            return NextResponse.json(
                { error: "Interview not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            interview,
        });
    } catch (error) {
        console.error("Error fetching interview details:", error);
        await logError({ source: "api/mis/interviews/[id]:GET", errorType: "APIError", message: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { error: "Failed to fetch interview details" },
            { status: 500 }
        );
    }
}
