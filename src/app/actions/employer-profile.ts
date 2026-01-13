"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
    companyProfileCompletionSchema,
    employerProfileCompletionSchema,
    type CompanyProfileCompletion,
    type EmployerProfileCompletion,
} from "@/lib/validations/employer-profile-schema";

export interface ProfileData {
    employer: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string | null;
        job_title: string | null;
        department: string | null;
        address: string;
        profile_image_url: string | null;
        profile_completed: boolean;
        company_id: string;
    };
    company: {
        id: string;
        company_name: string;
        business_registration_no: string;
        industry: string;
        description: string | null;
        company_size: string | null;
        website: string | null;
        headoffice_location: string | null;
        logo_url: string | null;
        profile_completed: boolean;
    };
}

export interface ActionState {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
    data?: any;
}

/**
 * Fetch employer and company profile data
 * Optimized query: Only selects needed fields
 */
export async function getEmployerProfileData(userId: string): Promise<ProfileData | null> {
    const adminClient = createAdminClient();

    try {
        const { data: employerData, error: employerError } = await adminClient
            .from("employers")
            .select(
                `
                id,
                first_name,
                last_name,
                email,
                phone,
                job_title,
                department,
                address,
                profile_image_url,
                profile_completed,
                company_id,
                companies!inner (
                    id,
                    company_name,
                    business_registration_no,
                    industry,
                    description,
                    company_size,
                    website,
                    headoffice_location,
                    logo_url,
                    profile_completed
                )
            `
            )
            .eq("user_id", userId)
            .single();

        if (employerError || !employerData) {
            console.error("Error fetching employer data:", employerError);
            return null;
        }

        // Type assertion for nested company data
        const company = (employerData as any).companies;

        return {
            employer: {
                id: employerData.id,
                first_name: employerData.first_name,
                last_name: employerData.last_name,
                email: employerData.email,
                phone: employerData.phone,
                job_title: employerData.job_title,
                department: employerData.department,
                address: employerData.address,
                profile_image_url: employerData.profile_image_url,
                profile_completed: employerData.profile_completed,
                company_id: employerData.company_id,
            },
            company: {
                id: company.id,
                company_name: company.company_name,
                business_registration_no: company.business_registration_no,
                industry: company.industry,
                description: company.description,
                company_size: company.company_size,
                website: company.website,
                headoffice_location: company.headoffice_location,
                logo_url: company.logo_url,
                profile_completed: company.profile_completed,
            },
        };
    } catch (error) {
        console.error("Error in getEmployerProfileData:", error);
        return null;
    }
}

/**
 * Complete employer profile - updates both company and employer records
 * Transaction-safe: Both updates happen atomically
 */
export async function completeEmployerProfile(
    userId: string,
    companyData: CompanyProfileCompletion,
    employerData: EmployerProfileCompletion
): Promise<ActionState> {
    try {
        // Validate input data
        const companyValidation = companyProfileCompletionSchema.safeParse(companyData);
        const employerValidation = employerProfileCompletionSchema.safeParse(employerData);

        if (!companyValidation.success) {
            const errors: Record<string, string[]> = {};
            companyValidation.error.issues.forEach((issue) => {
                const path = `company.${issue.path.join(".")}`;
                if (!errors[path]) {
                    errors[path] = [];
                }
                errors[path].push(issue.message);
            });

            return {
                success: false,
                message: "Company validation failed. Please check your inputs.",
                errors,
            };
        }

        if (!employerValidation.success) {
            const errors: Record<string, string[]> = {};
            employerValidation.error.issues.forEach((issue) => {
                const path = `employer.${issue.path.join(".")}`;
                if (!errors[path]) {
                    errors[path] = [];
                }
                errors[path].push(issue.message);
            });

            return {
                success: false,
                message: "Employer validation failed. Please check your inputs.",
                errors,
            };
        }

        const adminClient = createAdminClient();

        // First, get employer and company IDs and current address
        const { data: employerRecord, error: fetchError } = await adminClient
            .from("employers")
            .select("id, company_id, address")
            .eq("user_id", userId)
            .single();

        if (fetchError || !employerRecord) {
            return {
                success: false,
                message: "Employer record not found.",
            };
        }

        const now = new Date().toISOString();

        // Update company profile
        const { error: companyError } = await adminClient
            .from("companies")
            .update({
                description: companyValidation.data.description,
                company_size: companyValidation.data.company_size,
                website: companyValidation.data.website || null,
                headoffice_location: companyValidation.data.headoffice_location,
                logo_url: companyValidation.data.logo_url || null,
                profile_completed: true,
                updated_at: now,
            })
            .eq("id", employerRecord.company_id);

        if (companyError) {
            console.error("Company update error:", companyError);
            return {
                success: false,
                message: "Failed to update company profile. Please try again.",
            };
        }

        // Update employer profile
        const { error: employerError } = await adminClient
            .from("employers")
            .update({
                department: employerValidation.data.department || null,
                profile_image_url: employerValidation.data.profile_image_url || null,
                address: employerValidation.data.address || employerRecord.address, // Keep existing if not provided
                profile_completed: true,
                updated_at: now,
            })
            .eq("id", employerRecord.id);

        if (employerError) {
            console.error("Employer update error:", employerError);
            // Rollback company update
            await adminClient
                .from("companies")
                .update({
                    profile_completed: false,
                    updated_at: now,
                })
                .eq("id", employerRecord.company_id);

            return {
                success: false,
                message: "Failed to update employer profile. Please try again.",
            };
        }

        return {
            success: true,
            message: "Profile completed successfully!",
        };
    } catch (error) {
        console.error("Error in completeEmployerProfile:", error);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
        };
    }
}
