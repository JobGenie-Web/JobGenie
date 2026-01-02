import { z } from "zod";

// ============================================
// INDUSTRY TYPES
// ============================================
export const INDUSTRY_OPTIONS = [
    { value: "it_software", label: "Information Technology" },
    { value: "banking", label: "Banking" },
    { value: "finance_investment", label: "Finance & Investment" },
    { value: "insurance", label: "Insurance" },
    { value: "fintech", label: "FinTech" },
    { value: "accounting", label: "Accounting" },
] as const;

export const IT_INDUSTRIES = ["it_software", "fintech"] as const;
export const BANKING_FINANCE_INDUSTRIES = ["banking", "finance_investment", "insurance", "accounting"] as const;

// ============================================
// BASE SCHEMAS
// ============================================
export const genderSchema = z.enum(["male", "female", "other"], {
    message: "Gender is required",
});

export const experienceLevelSchema = z.enum(["entry", "junior", "mid", "senior", "lead", "principal"]);

export const employmentTypeSchema = z.enum(["full_time", "part_time", "contract", "internship", "freelance", "volunteer"]);

export const locationTypeSchema = z.enum(["remote", "hybrid", "onsite"]);

export const educationTypeSchema = z.enum(["academic", "professional"]);

export const educationStatusSchema = z.enum(["incomplete", "complete"]);

export const availabilityStatusSchema = z.enum(["available", "open_to_opportunities", "not_looking"]);

export const industryTypeSchema = z.enum(["it_software", "banking", "finance_investment", "insurance", "fintech", "accounting", "other"]);

// ============================================
// BANKING & FINANCE ENUMS
// ============================================
export const financialLicenseTypeSchema = z.enum([
    "cfa", "cpa", "acca", "cima", "frm", "cfp", "caia", "chfc", "casl",
    "aml_certification", "securities_license", "banking_license", "insurance_license",
    "cma", "cia", "other"
]);

export const licenseStatusSchema = z.enum(["active", "expired", "pending_renewal", "revoked", "suspended"]);

export const bankingSkillCategorySchema = z.enum([
    "retail_banking", "corporate_banking", "investment_banking", "private_banking", "commercial_banking",
    "credit_analysis", "financial_modeling", "risk_assessment", "portfolio_management", "financial_reporting",
    "aml_kyc", "regulatory_compliance", "internal_audit", "external_audit", "fraud_detection",
    "forex_trading", "securities_trading", "derivatives", "fixed_income", "equity_research",
    "core_banking_systems", "trading_platforms", "erp_systems", "treasury_systems",
    "wealth_management", "loan_processing", "trade_finance", "treasury_operations", "payments_settlement", "client_relationship",
    "other"
]);

export const proficiencyLevelSchema = z.enum(["beginner", "intermediate", "advanced", "expert"]);

export const complianceTrainingTypeSchema = z.enum([
    "aml_cft", "kyc", "data_privacy", "fraud_prevention", "sanctions_screening",
    "code_of_conduct", "information_security", "regulatory_updates", "whistleblower_policy",
    "market_abuse", "insider_trading", "customer_due_diligence", "risk_management",
    "credit_risk", "operational_risk", "other"
]);

// ============================================
// WORK EXPERIENCE SCHEMA
// ============================================
export const workExperienceSchema = z.object({
    id: z.string().optional(),
    jobTitle: z.string().min(1, "Job title is required").max(200),
    company: z.string().min(1, "Company is required").max(200),
    employmentType: employmentTypeSchema.optional().default("full_time"),
    location: z.string().max(200).optional(),
    locationType: locationTypeSchema.optional().default("onsite"),
    startDate: z.string().optional(),
    endDate: z.string().optional().nullable(),
    description: z.string().optional(),
    isCurrent: z.boolean().default(false),
});

export type WorkExperienceData = z.infer<typeof workExperienceSchema>;

// ============================================
// EDUCATION SCHEMA
// ============================================
export const educationSchema = z.object({
    id: z.string().optional(),
    educationType: educationTypeSchema.default("academic"),
    degreeDiploma: z.string().min(1, "Degree/Diploma is required").max(200),
    institution: z.string().min(1, "Institution is required").max(200),
    status: educationStatusSchema.default("complete"),
});

export type EducationData = z.infer<typeof educationSchema>;

// ============================================
// AWARD SCHEMA
// ============================================
export const awardSchema = z.object({
    id: z.string().optional(),
    natureOfAward: z.string().min(1, "Award name is required").max(300),
    offeredBy: z.string().max(200).optional(),
    description: z.string().optional(),
});

export type AwardData = z.infer<typeof awardSchema>;

// ============================================
// IT INDUSTRY - PROJECT SCHEMA
// ============================================
export const projectSchema = z.object({
    id: z.string().optional(),
    projectName: z.string().min(1, "Project name is required").max(200),
    description: z.string().optional(),
    demoUrl: z.string().url().max(500).optional().or(z.literal("")),
    isCurrent: z.boolean().default(false),
});

export type ProjectData = z.infer<typeof projectSchema>;

// ============================================
// IT INDUSTRY - CERTIFICATE SCHEMA
// ============================================
export const certificateSchema = z.object({
    id: z.string().optional(),
    certificateName: z.string().min(1, "Certificate name is required").max(200),
    issuingAuthority: z.string().max(200).optional(),
    issueDate: z.string().optional(),
    expiryDate: z.string().optional().nullable(),
    credentialId: z.string().max(100).optional(),
    credentialUrl: z.string().url().max(500).optional().or(z.literal("")),
    description: z.string().optional(),
});

export type CertificateData = z.infer<typeof certificateSchema>;

// ============================================
// BANKING - FINANCIAL LICENSE SCHEMA
// ============================================
export const financialLicenseSchema = z.object({
    id: z.string().optional(),
    licenseType: financialLicenseTypeSchema,
    licenseName: z.string().min(1, "License name is required").max(200),
    issuingAuthority: z.string().min(1, "Issuing authority is required").max(200),
    licenseNumber: z.string().max(100).optional(),
    issueDate: z.string().optional(),
    expiryDate: z.string().optional().nullable(),
    status: licenseStatusSchema.default("active"),
});

export type FinancialLicenseData = z.infer<typeof financialLicenseSchema>;

// ============================================
// BANKING - SKILL SCHEMA
// ============================================
export const bankingSkillSchema = z.object({
    id: z.string().optional(),
    skillCategory: bankingSkillCategorySchema,
    skillName: z.string().min(1, "Skill name is required").max(200),
    proficiencyLevel: proficiencyLevelSchema.default("intermediate"),
    yearsExperience: z.number().min(0).max(50).optional(),
});

export type BankingSkillData = z.infer<typeof bankingSkillSchema>;

// ============================================
// BANKING - COMPLIANCE TRAINING SCHEMA
// ============================================
export const complianceTrainingSchema = z.object({
    id: z.string().optional(),
    trainingName: z.string().min(1, "Training name is required").max(300),
    trainingType: complianceTrainingTypeSchema,
    provider: z.string().max(200).optional(),
    completionDate: z.string().optional(),
    validityPeriod: z.string().max(50).optional(),
    expiryDate: z.string().optional().nullable(),
    certificateUrl: z.string().url().max(500).optional().or(z.literal("")),
});

export type ComplianceTrainingData = z.infer<typeof complianceTrainingSchema>;

// ============================================
// BASIC INFO SCHEMA
// ============================================
export const basicInfoSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    email: z.string().email("Invalid email address").max(255),
    phone: z.string().min(1, "Phone number is required").max(20),
    alternativePhone: z.string().max(20).optional(),
    address: z.string().min(1, "Address is required"),
    country: z.string().max(100).optional(),
    currentPosition: z.string().min(1, "Current position is required").max(200),
    yearsOfExperience: z.number().min(0).max(50).default(0),
    experienceLevel: experienceLevelSchema.default("entry"),
    expectedMonthlySalary: z.number().min(0).optional(),
    availabilityStatus: availabilityStatusSchema.default("available"),
    noticePeriod: z.string().max(50).optional(),
    employmentType: employmentTypeSchema.default("full_time"),
});

export type BasicInfoData = z.infer<typeof basicInfoSchema>;

// ============================================
// COMPLETE PROFILE SCHEMA
// ============================================
export const completeProfileSchema = z.object({
    industry: industryTypeSchema,
    basicInfo: basicInfoSchema,
    professionalSummary: z.string().min(50, "Professional summary must be at least 50 characters").max(1000),
    workExperiences: z.array(workExperienceSchema),
    educations: z.array(educationSchema),
    awards: z.array(awardSchema),
    // IT Industry specific
    projects: z.array(projectSchema).optional(),
    certificates: z.array(certificateSchema).optional(),
    // Banking/Finance specific
    financialLicenses: z.array(financialLicenseSchema).optional(),
    bankingSkills: z.array(bankingSkillSchema).optional(),
    complianceTrainings: z.array(complianceTrainingSchema).optional(),
});

export type CompleteProfileData = z.infer<typeof completeProfileSchema>;

// ============================================
// CV EXTRACTION RESULT SCHEMA
// ============================================
export const cvExtractionResultSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    currentPosition: z.string().optional(),
    yearsOfExperience: z.number().optional(),
    professionalSummary: z.string().optional(),
    workExperiences: z.array(z.object({
        jobTitle: z.string().optional(),
        company: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        description: z.string().optional(),
        isCurrent: z.boolean().optional(),
    })).optional(),
    educations: z.array(z.object({
        degreeDiploma: z.string().optional(),
        institution: z.string().optional(),
        status: z.string().optional(),
    })).optional(),
    skills: z.array(z.string()).optional(),
    certificates: z.array(z.object({
        certificateName: z.string().optional(),
        issuingAuthority: z.string().optional(),
        issueDate: z.string().optional(),
    })).optional(),
    projects: z.array(z.object({
        projectName: z.string().optional(),
        description: z.string().optional(),
        demoUrl: z.string().optional(),
    })).optional(),
});

export type CVExtractionResult = z.infer<typeof cvExtractionResultSchema>;
