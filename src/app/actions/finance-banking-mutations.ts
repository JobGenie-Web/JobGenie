"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
    financeAcademicEducationSchema,
    financeProfessionalEducationSchema,
    bankingAcademicEducationSchema,
    bankingProfessionalEducationSchema,
    bankingSpecializedTrainingSchema,
    type FinanceAcademicEducationData,
    type FinanceProfessionalEducationData,
    type BankingAcademicEducationData,
    type BankingProfessionalEducationData,
    type BankingSpecializedTrainingData,
} from "@/lib/validations/profile-schema";

type ActionResponse = {
    success: boolean;
    error?: string;
    data?: any;
};

// ============= FINANCE ACADEMIC EDUCATION ACTIONS =============

export async function addFinanceAcademicEducation(data: FinanceAcademicEducationData): Promise<ActionResponse> {
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

        const validated = financeAcademicEducationSchema.parse(data);

        // Convert camelCase to snake_case for database
        const { error } = await supabase
            .from("finance_academic_education")
            .insert({
                candidate_id: candidate.id,
                degree_diploma: validated.degreeDiploma,
                institution: validated.institution,
                status: validated.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Error adding finance academic education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in addFinanceAcademicEducation:", error);
        return { success: false, error: "Failed to add finance academic education" };
    }
}

export async function updateFinanceAcademicEducation(id: string, data: FinanceAcademicEducationData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: education } = await supabase
            .from("finance_academic_education")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!education || (education.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const validated = financeAcademicEducationSchema.parse(data);

        const { error } = await supabase
            .from("finance_academic_education")
            .update({
                degree_diploma: validated.degreeDiploma,
                institution: validated.institution,
                status: validated.status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            console.error("Error updating finance academic education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in updateFinanceAcademicEducation:", error);
        return { success: false, error: "Failed to update finance academic education" };
    }
}

export async function deleteFinanceAcademicEducation(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: education } = await supabase
            .from("finance_academic_education")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!education || (education.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabase
            .from("finance_academic_education")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting finance academic education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in deleteFinanceAcademicEducation:", error);
        return { success: false, error: "Failed to delete finance academic education" };
    }
}

// ============= FINANCE PROFESSIONAL EDUCATION ACTIONS =============

export async function addFinanceProfessionalEducation(data: FinanceProfessionalEducationData): Promise<ActionResponse> {
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

        const validated = financeProfessionalEducationSchema.parse(data);

        const { error } = await supabase
            .from("finance_professional_education")
            .insert({
                candidate_id: candidate.id,
                professional_qualification: validated.professionalQualification,
                institution: validated.institution,
                status: validated.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Error adding finance professional education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in addFinanceProfessionalEducation:", error);
        return { success: false, error: "Failed to add finance professional education" };
    }
}

export async function updateFinanceProfessionalEducation(id: string, data: FinanceProfessionalEducationData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: education } = await supabase
            .from("finance_professional_education")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!education || (education.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const validated = financeProfessionalEducationSchema.parse(data);

        const { error } = await supabase
            .from("finance_professional_education")
            .update({
                professional_qualification: validated.professionalQualification,
                institution: validated.institution,
                status: validated.status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            console.error("Error updating finance professional education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in updateFinanceProfessionalEducation:", error);
        return { success: false, error: "Failed to update finance professional education" };
    }
}

export async function deleteFinanceProfessionalEducation(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: education } = await supabase
            .from("finance_professional_education")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!education || (education.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabase
            .from("finance_professional_education")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting finance professional education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in deleteFinanceProfessionalEducation:", error);
        return { success: false, error: "Failed to delete finance professional education" };
    }
}

// ============= BANKING ACADEMIC EDUCATION ACTIONS =============

export async function addBankingAcademicEducation(data: BankingAcademicEducationData): Promise<ActionResponse> {
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

        const validated = bankingAcademicEducationSchema.parse(data);

        const { error } = await supabase
            .from("banking_academic_education")
            .insert({
                candidate_id: candidate.id,
                degree_diploma: validated.degreeDiploma,
                institution: validated.institution,
                status: validated.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Error adding banking academic education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in addBankingAcademicEducation:", error);
        return { success: false, error: "Failed to add banking academic education" };
    }
}

export async function updateBankingAcademicEducation(id: string, data: BankingAcademicEducationData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: education } = await supabase
            .from("banking_academic_education")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!education || (education.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const validated = bankingAcademicEducationSchema.parse(data);

        const { error } = await supabase
            .from("banking_academic_education")
            .update({
                degree_diploma: validated.degreeDiploma,
                institution: validated.institution,
                status: validated.status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            console.error("Error updating banking academic education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in updateBankingAcademicEducation:", error);
        return { success: false, error: "Failed to update banking academic education" };
    }
}

export async function deleteBankingAcademicEducation(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: education } = await supabase
            .from("banking_academic_education")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!education || (education.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabase
            .from("banking_academic_education")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting banking academic education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in deleteBankingAcademicEducation:", error);
        return { success: false, error: "Failed to delete banking academic education" };
    }
}

// ============= BANKING PROFESSIONAL EDUCATION ACTIONS =============

export async function addBankingProfessionalEducation(data: BankingProfessionalEducationData): Promise<ActionResponse> {
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

        const validated = bankingProfessionalEducationSchema.parse(data);

        const { error } = await supabase
            .from("banking_professional_education")
            .insert({
                candidate_id: candidate.id,
                professional_qualification: validated.professionalQualification,
                institution: validated.institution,
                status: validated.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Error adding banking professional education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in addBankingProfessionalEducation:", error);
        return { success: false, error: "Failed to add banking professional education" };
    }
}

export async function updateBankingProfessionalEducation(id: string, data: BankingProfessionalEducationData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: education } = await supabase
            .from("banking_professional_education")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!education || (education.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const validated = bankingProfessionalEducationSchema.parse(data);

        const { error } = await supabase
            .from("banking_professional_education")
            .update({
                professional_qualification: validated.professionalQualification,
                institution: validated.institution,
                status: validated.status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            console.error("Error updating banking professional education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in updateBankingProfessionalEducation:", error);
        return { success: false, error: "Failed to update banking professional education" };
    }
}

export async function deleteBankingProfessionalEducation(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: education } = await supabase
            .from("banking_professional_education")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!education || (education.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabase
            .from("banking_professional_education")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting banking professional education:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in deleteBankingProfessionalEducation:", error);
        return { success: false, error: "Failed to delete banking professional education" };
    }
}

// ============= BANKING SPECIALIZED TRAINING ACTIONS =============

export async function addBankingSpecializedTraining(data: BankingSpecializedTrainingData): Promise<ActionResponse> {
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

        const validated = bankingSpecializedTrainingSchema.parse(data);

        const { error } = await supabase
            .from("banking_specialized_training")
            .insert({
                candidate_id: candidate.id,
                certificate_name: validated.certificateName,
                issuing_authority: validated.issuingAuthority,
                certificate_issue_month: validated.certificateIssueMonth || null,
                status: validated.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Error adding banking specialized training:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in addBankingSpecializedTraining:", error);
        return { success: false, error: "Failed to add banking specialized training" };
    }
}

export async function updateBankingSpecializedTraining(id: string, data: BankingSpecializedTrainingData): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: training } = await supabase
            .from("banking_specialized_training")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!training || (training.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const validated = bankingSpecializedTrainingSchema.parse(data);

        const { error } = await supabase
            .from("banking_specialized_training")
            .update({
                certificate_name: validated.certificateName,
                issuing_authority: validated.issuingAuthority,
                certificate_issue_month: validated.certificateIssueMonth || null,
                status: validated.status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            console.error("Error updating banking specialized training:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in updateBankingSpecializedTraining:", error);
        return { success: false, error: "Failed to update banking specialized training" };
    }
}

export async function deleteBankingSpecializedTraining(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const { data: training } = await supabase
            .from("banking_specialized_training")
            .select("candidate_id, candidates!inner(user_id)")
            .eq("id", id)
            .single();

        if (!training || (training.candidates as any).user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabase
            .from("banking_specialized_training")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting banking specialized training:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/candidate/profile");
        return { success: true };
    } catch (error) {
        console.error("Error in deleteBankingSpecializedTraining:", error);
        return { success: false, error: "Failed to delete banking specialized training" };
    }
}
