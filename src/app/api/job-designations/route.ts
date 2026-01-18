import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const industryId = searchParams.get("industryId");

        // Build query to fetch job designations with related industry and seniority level
        let query = supabase
            .from("job_designations")
            .select(`
                designation_id,
                designation_name,
                industry_id,
                level_id,
                industries!inner (
                    industry_id,
                    industry_name
                ),
                seniority_levels!inner (
                    level_id,
                    level_name,
                    level_order
                )
            `)
            .order("designation_name", { ascending: true });

        // Filter by industry if provided
        if (industryId) {
            query = query.eq("industry_id", parseInt(industryId));
        }

        const { data: jobDesignations, error } = await query;

        if (error) {
            console.error("Error fetching job designations:", error);
            return NextResponse.json(
                { success: false, error: "Failed to fetch job designations" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: jobDesignations || []
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
