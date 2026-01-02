-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('candidate', 'employer', 'mis');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('entry', 'junior', 'mid', 'senior', 'lead', 'principal');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "ProfessionalQualification" AS ENUM ('high_school', 'associate_degree', 'bachelors_degree', 'masters_degree', 'doctorate_phd', 'undergraduate', 'post_graduate', 'diploma', 'certificate', 'professional_certification', 'vocational_training', 'some_college', 'no_formal_education');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('available', 'open_to_opportunities', 'not_looking');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance', 'volunteer');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('remote', 'hybrid', 'onsite');

-- CreateEnum
CREATE TYPE "EducationType" AS ENUM ('academic', 'professional');

-- CreateEnum
CREATE TYPE "EducationStatus" AS ENUM ('incomplete', 'complete');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('draft', 'published', 'paused', 'closed', 'archived');

-- CreateEnum
CREATE TYPE "FinancialLicenseType" AS ENUM ('cfa', 'cpa', 'acca', 'cima', 'frm', 'cfp', 'caia', 'chfc', 'casl', 'aml_certification', 'securities_license', 'banking_license', 'insurance_license', 'cma', 'cia', 'other');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('active', 'expired', 'pending_renewal', 'revoked', 'suspended');

-- CreateEnum
CREATE TYPE "BankingSkillCategory" AS ENUM ('retail_banking', 'corporate_banking', 'investment_banking', 'private_banking', 'commercial_banking', 'credit_analysis', 'financial_modeling', 'risk_assessment', 'portfolio_management', 'financial_reporting', 'aml_kyc', 'regulatory_compliance', 'internal_audit', 'external_audit', 'fraud_detection', 'forex_trading', 'securities_trading', 'derivatives', 'fixed_income', 'equity_research', 'core_banking_systems', 'trading_platforms', 'erp_systems', 'treasury_systems', 'wealth_management', 'loan_processing', 'trade_finance', 'treasury_operations', 'payments_settlement', 'client_relationship', 'other');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- CreateEnum
CREATE TYPE "ComplianceTrainingType" AS ENUM ('aml_cft', 'kyc', 'data_privacy', 'fraud_prevention', 'sanctions_screening', 'code_of_conduct', 'information_security', 'regulatory_updates', 'whistleblower_policy', 'market_abuse', 'insider_trading', 'customer_due_diligence', 'risk_management', 'credit_risk', 'operational_risk', 'other');

-- CreateEnum
CREATE TYPE "IndustryType" AS ENUM ('it_software', 'banking', 'finance_investment', 'insurance', 'fintech', 'accounting', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'pending_verification',
    "provider" VARCHAR(50),
    "provider_id" VARCHAR(255),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" VARCHAR(255),
    "verification_token_expires_at" TIMESTAMP(3),
    "password_reset_token" VARCHAR(255),
    "password_reset_expires_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "nicPassport" VARCHAR(20) NOT NULL,
    "dob" DATE NOT NULL,
    "contact_no" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "gender" "Gender" NOT NULL,
    "current_position" VARCHAR(200) NOT NULL,
    "industry" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "alternative_phone" VARCHAR(20),
    "country" VARCHAR(100),
    "years_of_experience" INTEGER DEFAULT 0,
    "experience_level" "ExperienceLevel" DEFAULT 'entry',
    "qualifications" "ProfessionalQualification"[],
    "expected_monthly_salary" DECIMAL(12,2),
    "availability_status" "AvailabilityStatus" DEFAULT 'available',
    "notice_period" VARCHAR(50),
    "employment_type" "EmploymentType" DEFAULT 'full_time',
    "professional_summary" VARCHAR(1000),
    "profile_image" TEXT,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'pending',
    "profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_experiences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "job_title" VARCHAR(200),
    "company" VARCHAR(200),
    "employment_type" "EmploymentType" DEFAULT 'full_time',
    "location" VARCHAR(200),
    "location_type" "LocationType" DEFAULT 'onsite',
    "start_date" DATE,
    "end_date" DATE,
    "description" TEXT,
    "is_current" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "education_type" "EducationType" NOT NULL DEFAULT 'academic',
    "degree_diploma" VARCHAR(200),
    "institution" VARCHAR(200),
    "status" "EducationStatus" NOT NULL DEFAULT 'incomplete',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "awards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "nature_of_award" VARCHAR(300),
    "offered_by" VARCHAR(200),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "project_name" VARCHAR(200),
    "description" TEXT,
    "demo_url" VARCHAR(500),
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "certificate_name" VARCHAR(200),
    "issuing_authority" VARCHAR(200),
    "issue_date" DATE,
    "expiry_date" DATE,
    "credential_id" VARCHAR(100),
    "credential_url" VARCHAR(500),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_licenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "license_type" "FinancialLicenseType" NOT NULL,
    "license_name" VARCHAR(200) NOT NULL,
    "issuing_authority" VARCHAR(200) NOT NULL,
    "license_number" VARCHAR(100),
    "issue_date" DATE,
    "expiry_date" DATE,
    "status" "LicenseStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banking_skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "skill_category" "BankingSkillCategory" NOT NULL,
    "skill_name" VARCHAR(200) NOT NULL,
    "proficiency_level" "ProficiencyLevel" NOT NULL DEFAULT 'intermediate',
    "years_experience" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banking_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_trainings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "training_name" VARCHAR(300) NOT NULL,
    "training_type" "ComplianceTrainingType" NOT NULL,
    "provider" VARCHAR(200),
    "completion_date" DATE,
    "validity_period" VARCHAR(50),
    "expiry_date" DATE,
    "certificate_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_specializations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "industry" "IndustryType" NOT NULL,
    "specialization" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "years_experience" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_name" VARCHAR(200) NOT NULL,
    "business_registration_no" VARCHAR(50) NOT NULL,
    "industry" VARCHAR(100) NOT NULL,
    "business_registered_address" TEXT NOT NULL,
    "br_certificate_url" TEXT NOT NULL,
    "logo_url" TEXT,
    "description" TEXT,
    "phone" VARCHAR(20) NOT NULL,
    "website" VARCHAR(255),
    "headquarters_location" VARCHAR(200),
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "designation" VARCHAR(200),
    "phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mis_user" (
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mis_user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employer_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "job_title" VARCHAR(200) NOT NULL,
    "location" VARCHAR(200),
    "industry" VARCHAR(100),
    "deadline" DATE,
    "job_type" "JobType" NOT NULL DEFAULT 'full_time',
    "advertisement_link" VARCHAR(500),
    "description" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_user_id_key" ON "candidates"("user_id");
CREATE INDEX "candidates_user_id_idx" ON "candidates"("user_id");
CREATE INDEX "candidates_industry_idx" ON "candidates"("industry");
CREATE INDEX "candidates_experience_level_idx" ON "candidates"("experience_level");
CREATE INDEX "candidates_availability_status_idx" ON "candidates"("availability_status");
CREATE INDEX "candidates_country_idx" ON "candidates"("country");
CREATE INDEX "candidates_approval_status_idx" ON "candidates"("approval_status");

-- CreateIndex
CREATE INDEX "work_experiences_candidate_id_idx" ON "work_experiences"("candidate_id");
CREATE INDEX "work_experiences_is_current_idx" ON "work_experiences"("is_current");
CREATE INDEX "work_experiences_start_date_idx" ON "work_experiences"("start_date");

-- CreateIndex
CREATE INDEX "educations_candidate_id_idx" ON "educations"("candidate_id");
CREATE INDEX "educations_education_type_idx" ON "educations"("education_type");

-- CreateIndex
CREATE INDEX "awards_candidate_id_idx" ON "awards"("candidate_id");

-- CreateIndex
CREATE INDEX "projects_candidate_id_idx" ON "projects"("candidate_id");
CREATE INDEX "projects_is_current_idx" ON "projects"("is_current");

-- CreateIndex
CREATE INDEX "certificates_candidate_id_idx" ON "certificates"("candidate_id");
CREATE INDEX "certificates_issue_date_idx" ON "certificates"("issue_date");
CREATE INDEX "certificates_expiry_date_idx" ON "certificates"("expiry_date");

-- CreateIndex
CREATE INDEX "financial_licenses_candidate_id_idx" ON "financial_licenses"("candidate_id");
CREATE INDEX "financial_licenses_license_type_idx" ON "financial_licenses"("license_type");
CREATE INDEX "financial_licenses_status_idx" ON "financial_licenses"("status");
CREATE INDEX "financial_licenses_expiry_date_idx" ON "financial_licenses"("expiry_date");

-- CreateIndex
CREATE INDEX "banking_skills_candidate_id_idx" ON "banking_skills"("candidate_id");
CREATE INDEX "banking_skills_skill_category_idx" ON "banking_skills"("skill_category");
CREATE INDEX "banking_skills_proficiency_level_idx" ON "banking_skills"("proficiency_level");

-- CreateIndex
CREATE INDEX "compliance_trainings_candidate_id_idx" ON "compliance_trainings"("candidate_id");
CREATE INDEX "compliance_trainings_training_type_idx" ON "compliance_trainings"("training_type");
CREATE INDEX "compliance_trainings_expiry_date_idx" ON "compliance_trainings"("expiry_date");

-- CreateIndex
CREATE INDEX "industry_specializations_candidate_id_idx" ON "industry_specializations"("candidate_id");
CREATE INDEX "industry_specializations_industry_idx" ON "industry_specializations"("industry");

-- CreateIndex
CREATE UNIQUE INDEX "companies_business_registration_no_key" ON "companies"("business_registration_no");
CREATE INDEX "companies_business_registration_no_idx" ON "companies"("business_registration_no");
CREATE INDEX "companies_industry_idx" ON "companies"("industry");
CREATE INDEX "companies_approval_status_idx" ON "companies"("approval_status");

-- CreateIndex
CREATE UNIQUE INDEX "employers_user_id_key" ON "employers"("user_id");
CREATE INDEX "employers_user_id_idx" ON "employers"("user_id");
CREATE INDEX "employers_company_id_idx" ON "employers"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "mis_user_email_key" ON "mis_user"("email");

-- CreateIndex
CREATE INDEX "jobs_employer_id_idx" ON "jobs"("employer_id");
CREATE INDEX "jobs_company_id_idx" ON "jobs"("company_id");
CREATE INDEX "jobs_status_idx" ON "jobs"("status");
CREATE INDEX "jobs_job_type_idx" ON "jobs"("job_type");
CREATE INDEX "jobs_industry_idx" ON "jobs"("industry");
CREATE INDEX "jobs_published_at_idx" ON "jobs"("published_at");
CREATE INDEX "jobs_deadline_idx" ON "jobs"("deadline");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educations" ADD CONSTRAINT "educations_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "awards" ADD CONSTRAINT "awards_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_licenses" ADD CONSTRAINT "financial_licenses_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banking_skills" ADD CONSTRAINT "banking_skills_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_trainings" ADD CONSTRAINT "compliance_trainings_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_specializations" ADD CONSTRAINT "industry_specializations_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employers" ADD CONSTRAINT "employers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employers" ADD CONSTRAINT "employers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mis_user" ADD CONSTRAINT "mis_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
