import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/logger";

export async function GET(request: NextRequest) {
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

        // Fetch all MIS users
        const { data: misUsers, error: fetchError } = await adminClient
            .from("mis_user")
            .select("user_id, first_name, last_name, email, created_at")
            .order("created_at", { ascending: false });

        if (fetchError) {
            console.error("Error fetching MIS users:", fetchError);
            return NextResponse.json(
                { error: "Failed to fetch MIS users" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            users: misUsers || [],
        });
    } catch (error) {
        console.error("Error fetching MIS users:", error);
        await logError({ source: "api/mis/users:GET", errorType: "APIError", message: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { error: "Failed to fetch MIS users" },
            { status: 500 }
        );
    }
}
