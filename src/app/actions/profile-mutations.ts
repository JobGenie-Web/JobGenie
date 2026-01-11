"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
    experienceSchema,
    projectSchema,
    certificationSchema,
    awardSchema,
    type ExperienceFormData,
    type ProjectFormData,
    type CertificationFormData,
    type AwardFormData,
} from "@/lib/validations/profile";

type ActionResponse = {
    success: boolean;
    error?: string;
    data?: any;
};

// ============= EXPERIENCE ACTIONS =============

export async function addExperience(data: ExperienceFormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // Get candidate_id
        const { data: candidate } = await supabase
            .from("candidates")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!candidate) {
            return { success: false, error: "Candidate profile not found" };
        }

        // Validate data
        const validated = experienceSchema.parse(data);

        // Insert new experience
        const { error } = await supabase
            .from("work_experiences")
            .insert({
                candidate_id: candidate.id,
                ...validated,
            });

        if (error) {
            console.error("Error adding experience:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in addExperience:", error);
        return { success: false, error: "Failed to add experience" };
    }
}

export async function updateExperience(id: string, data: ExperienceFormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify ownership
        const { data: experience } = await supabase
            .from("work_experiences")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!experience || (experience.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Validate data
        const validated = experienceSchema.parse(data);

        // Update experience
        const { error } = await supabase
            .from("work_experiences")
            .update(validated)
            .eq("id", id);

        if (error) {
            console.error("Error updating experience:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in updateExperience:", error);
        return { success: false, error: "Failed to update experience" };
    }
}

export async function deleteExperience(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify ownership
        const { data: experience } = await supabase
            .from("work_experiences")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!experience || (experience.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Delete experience
        const { error } = await supabase
            .from("work_experiences")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting experience:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in deleteExperience:", error);
        return { success: false, error: "Failed to delete experience" };
    }
}

// ============= PROJECT ACTIONS =============

export async function addProject(data: ProjectFormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: candidate } = await supabase
            .from("candidates")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!candidate) {
            return { success: false, error: "Candidate profile not found" };
        }

        const validated = projectSchema.parse(data);

        const { error } = await supabase
            .from("projects")
            .insert({
                candidate_id: candidate.id,
                ...validated,
            });

        if (error) {
            console.error("Error adding project:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in addProject:", error);
        return { success: false, error: "Failed to add project" };
    }
}

export async function updateProject(id: string, data: ProjectFormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: project } = await supabase
            .from("projects")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!project || (project.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const validated = projectSchema.parse(data);

        const { error } = await supabase
            .from("projects")
            .update(validated)
            .eq("id", id);

        if (error) {
            console.error("Error updating project:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in updateProject:", error);
        return { success: false, error: "Failed to update project" };
    }
}

export async function deleteProject(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: project } = await supabase
            .from("projects")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!project || (project.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting project:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in deleteProject:", error);
        return { success: false, error: "Failed to delete project" };
    }
}

// ============= CERTIFICATION ACTIONS =============

export async function addCertification(data: CertificationFormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: candidate } = await supabase
            .from("candidates")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!candidate) {
            return { success: false, error: "Candidate profile not found" };
        }

        const validated = certificationSchema.parse(data);

        const { error } = await supabase
            .from("certificates")
            .insert({
                candidate_id: candidate.id,
                ...validated,
            });

        if (error) {
            console.error("Error adding certification:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in addCertification:", error);
        return { success: false, error: "Failed to add certification" };
    }
}

export async function updateCertification(id: string, data: CertificationFormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: cert } = await supabase
            .from("certificates")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!cert || (cert.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const validated = certificationSchema.parse(data);

        const { error } = await supabase
            .from("certificates")
            .update(validated)
            .eq("id", id);

        if (error) {
            console.error("Error updating certification:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in updateCertification:", error);
        return { success: false, error: "Failed to update certification" };
    }
}

export async function deleteCertification(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: cert } = await supabase
            .from("certificates")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!cert || (cert.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabase
            .from("certificates")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting certification:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in deleteCertification:", error);
        return { success: false, error: "Failed to delete certification" };
    }
}

// ============= AWARD ACTIONS =============

export async function addAward(data: AwardFormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: candidate } = await supabase
            .from("candidates")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!candidate) {
            return { success: false, error: "Candidate profile not found" };
        }

        const validated = awardSchema.parse(data);

        const { error } = await supabase
            .from("awards")
            .insert({
                candidate_id: candidate.id,
                ...validated,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Error adding award:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in addAward:", error);
        return { success: false, error: "Failed to add award" };
    }
}

export async function updateAward(id: string, data: AwardFormData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: award } = await supabase
            .from("awards")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!award || (award.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const validated = awardSchema.parse(data);

        // Convert undefined to null for database update (to clear fields)
        const updateData = {
            nature_of_award: validated.nature_of_award,
            offered_by: validated.offered_by ?? null,
            description: validated.description ?? null,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from("awards")
            .update(updateData)
            .eq("id", id);

        if (error) {
            console.error("Error updating award:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in updateAward:", error);
        return { success: false, error: "Failed to update award" };
    }
}

export async function deleteAward(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: award } = await supabase
            .from("awards")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!award || (award.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabase
            .from("awards")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting award:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in deleteAward:", error);
        return { success: false, error: "Failed to delete award" };
    }
}
