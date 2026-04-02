-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'viewed', 'accepted', 'declined', 'expired');

-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('online', 'physical');

-- CreateEnum
CREATE TYPE "CanceledBy" AS ENUM ('candidate', 'employer');

-- CreateTable
CREATE TABLE "job_invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID,
    "candidate_id" UUID NOT NULL,
    "employer_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "industry" VARCHAR(100) NOT NULL,
    "job_designation" VARCHAR(200) NOT NULL,
    "given_time_slots" JSONB,
    "alternative_dates" JSONB,
    "selected_time_slot" JSONB,
    "interview_mode" "InterviewMode",
    "interview_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_time" VARCHAR(10),
    "meeting_link" TEXT,
    "interview_address" TEXT,
    "map_link" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "invitation_canceled" BOOLEAN NOT NULL DEFAULT false,
    "canceled_by" "CanceledBy",
    "cancellation_reason" TEXT,
    "canceled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewed_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),

    CONSTRAINT "job_invitations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "job_invitations" ADD CONSTRAINT "job_invitations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_invitations" ADD CONSTRAINT "job_invitations_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_invitations" ADD CONSTRAINT "job_invitations_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_invitations" ADD CONSTRAINT "job_invitations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "job_invitations_candidate_id_employer_id_key" ON "job_invitations"("candidate_id", "employer_id");

-- CreateIndex
CREATE INDEX "job_invitations_candidate_id_status_idx" ON "job_invitations"("candidate_id", "status");

-- CreateIndex
CREATE INDEX "job_invitations_employer_id_idx" ON "job_invitations"("employer_id");

-- CreateIndex
CREATE INDEX "job_invitations_company_id_idx" ON "job_invitations"("company_id");

-- CreateIndex
CREATE INDEX "job_invitations_sent_at_idx" ON "job_invitations"("sent_at");

-- CreateIndex
CREATE INDEX "job_invitations_job_id_idx" ON "job_invitations"("job_id");
