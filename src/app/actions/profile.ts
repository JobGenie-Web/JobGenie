"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { completeProfileSchema, type CompleteProfileData } from "@/lib/validations/profile-schema";

export type ProfileActionState = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
    redirectTo?: string;
};

export async function completeProfile(
    _prevState: ProfileActionState | null,
    formData: FormData
): Promise<ProfileActionState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: "You must be logged in to complete your profile.",
            };
        }

        // Extract form data
        const industry = formData.get("industry") as string;
        const currentPosition = formData.get("currentPosition") as string;
        const yearsOfExperience = parseInt(formData.get("yearsOfExperience") as string) || 0;
        const experienceLevel = formData.get("experienceLevel") as string;
        const professionalSummary = formData.get("professionalSummary") as string;
        const expectedMonthlySalary = formData.get("expectedMonthlySalary") as string;
        const availabilityStatus = formData.get("availabilityStatus") as string;
        const noticePeriod = formData.get("noticePeriod") as string;
        const employmentType = formData.get("employmentType") as string;
        const country = formData.get("country") as string;
        const qualificationsStr = formData.get("qualifications") as string;

        // Validation
        const errors: Record<string, string[]> = {};

        if (!industry?.trim()) {
            errors.industry = ["Industry is required"];
        }
        if (!currentPosition?.trim()) {
            errors.currentPosition = ["Current position is required"];
        }
        if (!professionalSummary?.trim()) {
            errors.professionalSummary = ["Professional summary is required"];
        }
        if (professionalSummary && professionalSummary.length < 50) {
            errors.professionalSummary = ["Professional summary must be at least 50 characters"];
        }

        if (Object.keys(errors).length > 0) {
            return {
                success: false,
                message: "Please fix the errors below.",
                errors,
            };
        }

        // Parse qualifications
        let qualifications: string[] = [];
        if (qualificationsStr) {
            try {
                qualifications = JSON.parse(qualificationsStr);
            } catch {
                qualifications = [];
            }
        }

        // Update candidate profile
        const { error: updateError } = await supabase
            .from("candidates")
            .update({
                industry: industry.trim(),
                current_position: currentPosition.trim(),
                years_of_experience: yearsOfExperience,
                experience_level: experienceLevel || "entry",
                professional_summary: professionalSummary.trim(),
                expected_monthly_salary: expectedMonthlySalary ? parseFloat(expectedMonthlySalary) : null,
                availability_status: availabilityStatus || "available",
                notice_period: noticePeriod || "immediate",
                employment_type: employmentType || "full_time",
                country: country?.trim() || null,
                qualifications: qualifications,
                profile_completed: true,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

        if (updateError) {
            console.error("Profile update error:", updateError);
            return {
                success: false,
                message: "Failed to update profile. Please try again.",
            };
        }

        revalidatePath("/candidate/dashboard");
        revalidatePath("/candidate/profile");

        return {
            success: true,
            message: "Profile completed successfully!",
            redirectTo: "/candidate/dashboard",
        };
    } catch (error) {
        console.error("Complete profile error:", error);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
        };
    }
}

// Comprehensive profile completion for multi-step form
export async function completeFullProfile(
    userId: string,
    profileData: CompleteProfileData
): Promise<ProfileActionState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.id !== userId) {
            return {
                success: false,
                message: "Unauthorized. Please log in again.",
            };
        }

        // Validate with Zod
        const validation = completeProfileSchema.safeParse(profileData);
        if (!validation.success) {
            const fieldErrors: Record<string, string[]> = {};
            validation.error.issues.forEach((err) => {
                const path = err.path.join(".");
                if (!fieldErrors[path]) fieldErrors[path] = [];
                fieldErrors[path].push(err.message);
            });
            return {
                success: false,
                message: "Validation failed. Please check your inputs.",
                errors: fieldErrors,
            };
        }

        const data = validation.data;

        // Get candidate ID
        const { data: candidate, error: candidateError } = await supabase
            .from("candidates")
            .select("id")
            .eq("user_id", userId)
            .single();

        if (candidateError || !candidate) {
            console.error("Candidate lookup error:", candidateError);
            return {
                success: false,
                message: "Could not find your profile.",
            };
        }

        const candidateId = candidate.id;

        // Update basic candidate info
        const { error: updateError } = await supabase
            .from("candidates")
            .update({
                industry: data.industry,
                first_name: data.basicInfo.firstName,
                last_name: data.basicInfo.lastName,
                email: data.basicInfo.email,
                phone: data.basicInfo.phone,
                alternative_phone: data.basicInfo.alternativePhone || null,
                address: data.basicInfo.address,
                country: data.basicInfo.country || null,
                current_position: data.basicInfo.currentPosition,
                years_of_experience: data.basicInfo.yearsOfExperience,
                experience_level: data.basicInfo.experienceLevel,
                expected_monthly_salary: data.basicInfo.expectedMonthlySalary || null,
                availability_status: data.basicInfo.availabilityStatus,
                notice_period: data.basicInfo.noticePeriod || null,
                employment_type: data.basicInfo.employmentType,
                professional_summary: data.professionalSummary,
                profile_completed: true,
                updated_at: new Date().toISOString(),
            })
            .eq("id", candidateId);

        if (updateError) {
            console.error("Candidate update error:", updateError);
            return {
                success: false,
                message: "Failed to update profile.",
            };
        }

        // Clear existing related records and insert new ones
        // Work Experiences
        await supabase.from("work_experiences").delete().eq("candidate_id", candidateId);
        if (data.workExperiences.length > 0) {
            const now = new Date().toISOString();
            const workExpRecords = data.workExperiences.map((exp) => ({
                candidate_id: candidateId,
                job_title: exp.jobTitle,
                company: exp.company,
                employment_type: exp.employmentType || "full_time",
                location: exp.location || null,
                location_type: exp.locationType || "onsite",
                start_date: exp.startDate || null,
                end_date: exp.isCurrent ? null : exp.endDate || null,
                description: exp.description || null,
                is_current: exp.isCurrent || false,
                created_at: now,
                updated_at: now,
            }));
            const { error: expError } = await supabase.from("work_experiences").insert(workExpRecords);
            if (expError) console.error("Work experience insert error:", expError);
        }

        // Education
        await supabase.from("educations").delete().eq("candidate_id", candidateId);
        if (data.educations.length > 0) {
            const now = new Date().toISOString();
            const eduRecords = data.educations.map((edu) => ({
                candidate_id: candidateId,
                education_type: edu.educationType || "academic",
                degree_diploma: edu.degreeDiploma,
                institution: edu.institution,
                status: edu.status || "complete",
                created_at: now,
                updated_at: now,
            }));
            const { error: eduError } = await supabase.from("educations").insert(eduRecords);
            if (eduError) console.error("Education insert error:", eduError);
        }

        // Awards
        await supabase.from("awards").delete().eq("candidate_id", candidateId);
        if (data.awards.length > 0) {
            const now = new Date().toISOString();
            const awardRecords = data.awards.map((award) => ({
                candidate_id: candidateId,
                nature_of_award: award.natureOfAward,
                offered_by: award.offeredBy || null,
                description: award.description || null,
                created_at: now,
                updated_at: now,
            }));
            const { error: awardError } = await supabase.from("awards").insert(awardRecords);
            if (awardError) console.error("Award insert error:", awardError);
        }

        // IT Industry: Projects
        if (data.projects && data.projects.length > 0) {
            await supabase.from("projects").delete().eq("candidate_id", candidateId);
            const now = new Date().toISOString();
            const projectRecords = data.projects.map((proj) => ({
                candidate_id: candidateId,
                project_name: proj.projectName,
                description: proj.description || null,
                demo_url: proj.demoUrl || null,
                is_current: proj.isCurrent || false,
                created_at: now,
                updated_at: now,
            }));
            const { error: projError } = await supabase.from("projects").insert(projectRecords);
            if (projError) console.error("Project insert error:", projError);
        }

        // IT Industry: Certificates
        if (data.certificates && data.certificates.length > 0) {
            await supabase.from("certificates").delete().eq("candidate_id", candidateId);
            const now = new Date().toISOString();
            const certRecords = data.certificates.map((cert) => ({
                candidate_id: candidateId,
                certificate_name: cert.certificateName,
                issuing_authority: cert.issuingAuthority || null,
                issue_date: cert.issueDate || null,
                expiry_date: cert.expiryDate || null,
                credential_id: cert.credentialId || null,
                credential_url: cert.credentialUrl || null,
                description: cert.description || null,
                created_at: now,
                updated_at: now,
            }));
            const { error: certError } = await supabase.from("certificates").insert(certRecords);
            if (certError) console.error("Certificate insert error:", certError);
        }

        // Banking/Finance: Financial Licenses
        if (data.financialLicenses && data.financialLicenses.length > 0) {
            await supabase.from("financial_licenses").delete().eq("candidate_id", candidateId);
            const now = new Date().toISOString();
            const licenseRecords = data.financialLicenses.map((lic) => ({
                candidate_id: candidateId,
                license_type: lic.licenseType,
                license_name: lic.licenseName,
                issuing_authority: lic.issuingAuthority,
                license_number: lic.licenseNumber || null,
                issue_date: lic.issueDate || null,
                expiry_date: lic.expiryDate || null,
                status: lic.status || "active",
                created_at: now,
                updated_at: now,
            }));
            const { error: licError } = await supabase.from("financial_licenses").insert(licenseRecords);
            if (licError) console.error("Financial license insert error:", licError);
        }

        // Banking/Finance: Banking Skills
        if (data.bankingSkills && data.bankingSkills.length > 0) {
            await supabase.from("banking_skills").delete().eq("candidate_id", candidateId);
            const now = new Date().toISOString();
            const skillRecords = data.bankingSkills.map((skill) => ({
                candidate_id: candidateId,
                skill_category: skill.skillCategory,
                skill_name: skill.skillName,
                proficiency_level: skill.proficiencyLevel || "intermediate",
                years_experience: skill.yearsExperience || 0,
                created_at: now,
                updated_at: now,
            }));
            const { error: skillError } = await supabase.from("banking_skills").insert(skillRecords);
            if (skillError) console.error("Banking skill insert error:", skillError);
        }

        // Banking/Finance: Compliance Trainings
        if (data.complianceTrainings && data.complianceTrainings.length > 0) {
            await supabase.from("compliance_trainings").delete().eq("candidate_id", candidateId);
            const now = new Date().toISOString();
            const trainingRecords = data.complianceTrainings.map((training) => ({
                candidate_id: candidateId,
                training_name: training.trainingName,
                training_type: training.trainingType,
                provider: training.provider || null,
                completion_date: training.completionDate || null,
                validity_period: training.validityPeriod || null,
                expiry_date: training.expiryDate || null,
                certificate_url: training.certificateUrl || null,
                created_at: now,
                updated_at: now,
            }));
            const { error: trainingError } = await supabase.from("compliance_trainings").insert(trainingRecords);
            if (trainingError) console.error("Compliance training insert error:", trainingError);
        }

        revalidatePath("/candidate/dashboard");
        revalidatePath("/candidate/profile");
        revalidatePath("/candidate/create-profile");

        return {
            success: true,
            message: "Profile completed successfully!",
            redirectTo: "/candidate/dashboard",
        };
    } catch (error) {
        console.error("Complete full profile error:", error);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
        };
    }
}
