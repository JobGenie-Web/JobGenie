"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CandidateActionState = {
    success: boolean;
    message: string;
};

/**
 * Mark the approval status message as seen for the current user's candidate profile
 */
export async function markApprovalMessageAsSeen(): Promise<CandidateActionState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: "You must be logged in.",
            };
        }

        const { error } = await supabase
            .from("candidates")
            .update({
                approval_status_message_seen: true,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

        if (error) {
            console.error("Mark message as seen error:", error);
            return {
                success: false,
                message: "Failed to update message status.",
            };
        }

        revalidatePath("/candidate/dashboard");

        return {
            success: true,
            message: "Message marked as seen.",
        };
    } catch (error) {
        console.error("Mark approval message as seen error:", error);
        return {
            success: false,
            message: "An unexpected error occurred.",
        };
    }
}

/**
 * Approve a candidate profile (MIS Admin only)
 */
export async function approveCandidateProfile(
    candidateId: string
): Promise<CandidateActionState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: "You must be logged in.",
            };
        }

        // Verify user is MIS admin
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (userError || !userData || userData.role !== "mis") {
            return {
                success: false,
                message: "Unauthorized. Only MIS admins can approve candidates.",
            };
        }

        // Update candidate approval status
        const { error } = await supabase
            .from("candidates")
            .update({
                approval_status: "approved",
                approved_at: new Date().toISOString(),
                rejected_at: null,
                reviewed_by: user.id,
                rejection_reason: null,
                approval_status_message_seen: false, // Show message on next login
                updated_at: new Date().toISOString(),
            })
            .eq("id", candidateId);

        if (error) {
            console.error("Approve candidate error:", error);
            return {
                success: false,
                message: "Failed to approve candidate.",
            };
        }

        revalidatePath("/mis/candidates");

        return {
            success: true,
            message: "Candidate approved successfully!",
        };
    } catch (error) {
        console.error("Approve candidate profile error:", error);
        return {
            success: false,
            message: "An unexpected error occurred.",
        };
    }
}

/**
 * Reject a candidate profile (MIS Admin only)
 */
export async function rejectCandidateProfile(
    candidateId: string,
    reason?: string
): Promise<CandidateActionState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: "You must be logged in.",
            };
        }

        // Verify user is MIS admin
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (userError || !userData || userData.role !== "mis") {
            return {
                success: false,
                message: "Unauthorized. Only MIS admins can reject candidates.",
            };
        }

        // Update candidate approval status
        const { error } = await supabase
            .from("candidates")
            .update({
                approval_status: "rejected",
                rejected_at: new Date().toISOString(),
                approved_at: null,
                reviewed_by: user.id,
                rejection_reason: reason || "Profile needs improvement. Please update and resubmit.",
                approval_status_message_seen: false, // Show message on next login
                updated_at: new Date().toISOString(),
            })
            .eq("id", candidateId);

        if (error) {
            console.error("Reject candidate error:", error);
            return {
                success: false,
                message: "Failed to reject candidate.",
            };
        }

        revalidatePath("/mis/candidates");

        return {
            success: true,
            message: "Candidate rejected successfully.",
        };
    } catch (error) {
        console.error("Reject candidate profile error:", error);
        return {
            success: false,
            message: "An unexpected error occurred.",
        };
    }
}

/**
 * Revoke a candidate approval/rejection status (MIS Admin only)
 * Resets the candidate back to pending status
 */
export async function revokeCandidateApproval(
    candidateId: string
): Promise<CandidateActionState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: "You must be logged in.",
            };
        }

        // Verify user is MIS admin
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (userError || !userData || userData.role !== "mis") {
            return {
                success: false,
                message: "Unauthorized. Only MIS admins can revoke approval status.",
            };
        }

        // Reset candidate to pending status
        const { error } = await supabase
            .from("candidates")
            .update({
                approval_status: "pending",
                approved_at: null,
                rejected_at: null,
                reviewed_by: null,
                rejection_reason: null,
                approval_status_message_seen: false,
                updated_at: new Date().toISOString(),
            })
            .eq("id", candidateId);

        if (error) {
            console.error("Revoke approval error:", error);
            return {
                success: false,
                message: "Failed to revoke approval status.",
            };
        }

        revalidatePath("/mis/candidates");

        return {
            success: true,
            message: "Approval status revoked. Candidate is now pending review.",
        };
    } catch (error) {
        console.error("Revoke candidate approval error:", error);
        return {
            success: false,
            message: "An unexpected error occurred.",
        };
    }
}
