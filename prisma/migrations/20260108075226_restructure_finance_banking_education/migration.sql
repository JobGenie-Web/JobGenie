/*
  Warnings:

  - The values [complete] on the enum `EducationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [lead,principal] on the enum `ExperienceLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [insurance,fintech,accounting,other] on the enum `IndustryType` will be removed. If these variants are still used in the database, this will fail.
  - The values [high_school,associate_degree,some_college] on the enum `ProfessionalQualification` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `headquarters_location` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the `banking_skills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `compliance_trainings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `financial_licenses` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "FinanceEducationStatus" AS ENUM ('incomplete', 'first_class', 'second_class_upper', 'second_class_lower', 'general');

-- CreateEnum
CREATE TYPE "BankingEducationStatus" AS ENUM ('incomplete', 'first_class', 'second_class_upper', 'second_class_lower', 'general');

-- AlterEnum
BEGIN;
CREATE TYPE "EducationStatus_new" AS ENUM ('incomplete', 'first_class', 'second_class_upper', 'second_class_lower', 'general');
ALTER TABLE "public"."educations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "educations" ALTER COLUMN "status" TYPE "EducationStatus_new" USING ("status"::text::"EducationStatus_new");
ALTER TYPE "EducationStatus" RENAME TO "EducationStatus_old";
ALTER TYPE "EducationStatus_new" RENAME TO "EducationStatus";
DROP TYPE "public"."EducationStatus_old";
ALTER TABLE "educations" ALTER COLUMN "status" SET DEFAULT 'incomplete';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ExperienceLevel_new" AS ENUM ('entry', 'junior', 'mid', 'senior');
ALTER TABLE "public"."candidates" ALTER COLUMN "experience_level" DROP DEFAULT;
ALTER TABLE "candidates" ALTER COLUMN "experience_level" TYPE "ExperienceLevel_new" USING ("experience_level"::text::"ExperienceLevel_new");
ALTER TYPE "ExperienceLevel" RENAME TO "ExperienceLevel_old";
ALTER TYPE "ExperienceLevel_new" RENAME TO "ExperienceLevel";
DROP TYPE "public"."ExperienceLevel_old";
ALTER TABLE "candidates" ALTER COLUMN "experience_level" SET DEFAULT 'entry';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "IndustryType_new" AS ENUM ('it_software', 'banking', 'finance_investment');
ALTER TABLE "industry_specializations" ALTER COLUMN "industry" TYPE "IndustryType_new" USING ("industry"::text::"IndustryType_new");
ALTER TYPE "IndustryType" RENAME TO "IndustryType_old";
ALTER TYPE "IndustryType_new" RENAME TO "IndustryType";
DROP TYPE "public"."IndustryType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProfessionalQualification_new" AS ENUM ('bachelors_degree', 'masters_degree', 'doctorate_phd', 'undergraduate', 'post_graduate', 'diploma', 'certificate', 'professional_certification', 'vocational_training', 'no_formal_education');
ALTER TABLE "candidates" ALTER COLUMN "qualifications" TYPE "ProfessionalQualification_new"[] USING ("qualifications"::text::"ProfessionalQualification_new"[]);
ALTER TYPE "ProfessionalQualification" RENAME TO "ProfessionalQualification_old";
ALTER TYPE "ProfessionalQualification_new" RENAME TO "ProfessionalQualification";
DROP TYPE "public"."ProfessionalQualification_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "banking_skills" DROP CONSTRAINT "banking_skills_candidate_id_fkey";

-- DropForeignKey
ALTER TABLE "compliance_trainings" DROP CONSTRAINT "compliance_trainings_candidate_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_licenses" DROP CONSTRAINT "financial_licenses_candidate_id_fkey";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "headquarters_location",
ADD COLUMN     "headoffice_location" VARCHAR(200);

-- AlterTable
ALTER TABLE "educations" ADD COLUMN     "professional_qualification" VARCHAR(200);

-- DropTable
DROP TABLE "banking_skills";

-- DropTable
DROP TABLE "compliance_trainings";

-- DropTable
DROP TABLE "financial_licenses";

-- DropEnum
DROP TYPE "BankingSkillCategory";

-- DropEnum
DROP TYPE "ComplianceTrainingType";

-- DropEnum
DROP TYPE "FinancialLicenseType";

-- DropEnum
DROP TYPE "LicenseStatus";

-- DropEnum
DROP TYPE "ProficiencyLevel";

-- CreateTable
CREATE TABLE "finance_academic_education" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "degree_diploma" VARCHAR(200) NOT NULL,
    "institution" VARCHAR(200) NOT NULL,
    "status" "FinanceEducationStatus" NOT NULL DEFAULT 'incomplete',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_academic_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_professional_education" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "professional_qualification" VARCHAR(300) NOT NULL,
    "institution" VARCHAR(200) NOT NULL,
    "status" "FinanceEducationStatus" NOT NULL DEFAULT 'incomplete',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_professional_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banking_academic_education" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "degree_diploma" VARCHAR(200) NOT NULL,
    "institution" VARCHAR(200) NOT NULL,
    "status" "BankingEducationStatus" NOT NULL DEFAULT 'incomplete',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banking_academic_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banking_professional_education" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "professional_qualification" VARCHAR(300) NOT NULL,
    "institution" VARCHAR(200) NOT NULL,
    "status" "BankingEducationStatus" NOT NULL DEFAULT 'incomplete',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banking_professional_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banking_specialized_training" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "certificate_name" VARCHAR(300) NOT NULL,
    "issuing_authority" VARCHAR(200) NOT NULL,
    "certificate_issue_month" DATE,
    "status" "BankingEducationStatus" NOT NULL DEFAULT 'incomplete',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banking_specialized_training_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "finance_academic_education_candidate_id_idx" ON "finance_academic_education"("candidate_id");

-- CreateIndex
CREATE INDEX "finance_professional_education_candidate_id_idx" ON "finance_professional_education"("candidate_id");

-- CreateIndex
CREATE INDEX "banking_academic_education_candidate_id_idx" ON "banking_academic_education"("candidate_id");

-- CreateIndex
CREATE INDEX "banking_professional_education_candidate_id_idx" ON "banking_professional_education"("candidate_id");

-- CreateIndex
CREATE INDEX "banking_specialized_training_candidate_id_idx" ON "banking_specialized_training"("candidate_id");

-- CreateIndex
CREATE INDEX "banking_specialized_training_certificate_issue_month_idx" ON "banking_specialized_training"("certificate_issue_month");

-- AddForeignKey
ALTER TABLE "finance_academic_education" ADD CONSTRAINT "finance_academic_education_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_professional_education" ADD CONSTRAINT "finance_professional_education_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banking_academic_education" ADD CONSTRAINT "banking_academic_education_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banking_professional_education" ADD CONSTRAINT "banking_professional_education_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banking_specialized_training" ADD CONSTRAINT "banking_specialized_training_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
