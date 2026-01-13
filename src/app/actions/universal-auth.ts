"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ActionState {
    success: boolean;
    message: string;
    redirectTo?: string;
    errors?: Record<string, string[]>;
}

/**
 * Universal Login for Candidates and Employers
 * Automatically detects user role and redirects appropriately
 * MIS login remains separate
 * OPTIMIZED: Minimal database queries for faster login
 */
export async function universalLogin(
    _prevState: ActionState | null,
    formData: FormData
): Promise<ActionState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Basic validation
    if (!email || !password) {
        return {
            success: false,
            message: "Email and password are required.",
        };
    }

    try {
        const supabase = await createClient();
        const adminClient = createAdminClient();

        // OPTIMIZATION 1: Authenticate first (this is the slowest operation)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !authData.session) {
            console.error("Supabase auth error:", authError);
            return {
                success: false,
                message: "Invalid email or password.",
            };
        }

        // OPTIMIZATION 2: Fetch user data with role in single query AFTER auth
        const { data: userData, error: userError } = await adminClient
            .from("users")
            .select("role, status, email_verified")
            .eq("id", authData.user.id)
            .single();

        if (userError || !userData) {
            return {
                success: false,
                message: "User data not found.",
            };
        }

        // Reject MIS users - they should use /mis/login
        if (userData.role === "mis") {
            return {
                success: false,
                message: "Please use the MIS admin login page.",
            };
        }

        // Only allow candidate and employer roles
        if (userData.role !== "candidate" && userData.role !== "employer") {
            return {
                success: false,
                message: "Invalid user role.",
            };
        }

        // Check email verification
        if (!userData.email_verified) {
            const verifyPath = userData.role === "candidate"
                ? "/candidate/verify-email"
                : "/employer/verify-email";

            return {
                success: false,
                message: "Please verify your email before logging in.",
                redirectTo: `${verifyPath}?email=${encodeURIComponent(email)}`,
            };
        }

        // Check account status
        if (userData.status !== "active") {
            return {
                success: false,
                message: "Your account is not active. Please contact support.",
            };
        }

        // OPTIMIZATION 3: Role-specific queries only when needed
        if (userData.role === "candidate") {
            // Single query for candidate profile completion
            const { data: candidateData } = await adminClient
                .from("candidates")
                .select("checkprofile_completed")
                .eq("user_id", authData.user.id)
                .single();

            return {
                success: true,
                message: "Login successful!",
                redirectTo: candidateData?.checkprofile_completed
                    ? "/candidate/dashboard"
                    : "/candidate/create-profile",
            };
        }

        if (userData.role === "employer") {
            // Single query with join for employer + company data
            const { data: employerData } = await adminClient
                .from("employers")
                .select("profile_completed, companies!inner(profile_completed)")
                .eq("user_id", authData.user.id)
                .single();

            if (!employerData) {
                return {
                    success: true,
                    message: "Login successful!",
                    redirectTo: "/employer/complete-profile",
                };
            }

            const companyData = (employerData as any).companies;
            const isProfileIncomplete =
                !employerData.profile_completed || !companyData?.profile_completed;

            return {
                success: true,
                message: "Login successful!",
                redirectTo: isProfileIncomplete ? "/employer/complete-profile" : "/employer/dashboard",
            };
        }

        // Fallback
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
        };
    } catch (error) {
        console.error("Universal login error:", error);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
        };
    }
}
