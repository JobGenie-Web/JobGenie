import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_KEYS = new Set([
    "invitation_received",
    "interview_scheduled",
    "interview_rescheduled",
    "interview_reminder",
    "offer_result_updates",
]);

type NotificationPreferences = Record<string, boolean>;

const DEFAULT_PREFERENCES: NotificationPreferences = {
    invitation_received: true,
    interview_scheduled: true,
    interview_rescheduled: true,
    interview_reminder: true,
    offer_result_updates: true,
};

function mergeWithDefaults(stored: unknown): NotificationPreferences {
    const result = { ...DEFAULT_PREFERENCES };
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
        for (const key of ALLOWED_KEYS) {
            const val = (stored as Record<string, unknown>)[key];
            if (typeof val === "boolean") result[key] = val;
        }
    }
    return result;
}

export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("users")
            .select("notification_preferences")
            .eq("id", user.id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            preferences: mergeWithDefaults(data?.notification_preferences),
        });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const incoming = body?.preferences;

        if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
            return NextResponse.json({ error: "Invalid preferences payload." }, { status: 400 });
        }

        // Only store allowed keys with boolean values
        const validated: NotificationPreferences = {};
        for (const key of ALLOWED_KEYS) {
            const val = (incoming as Record<string, unknown>)[key];
            validated[key] = typeof val === "boolean" ? val : true;
        }

        const admin = createAdminClient();
        const { error } = await admin
            .from("users")
            .update({ notification_preferences: validated, updated_at: new Date().toISOString() })
            .eq("id", user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, preferences: validated });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Internal server error" },
            { status: 500 }
        );
    }
}
