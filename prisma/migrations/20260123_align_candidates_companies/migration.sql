-- Align candidates / companies with prisma/schema.prisma (init predates these fields).

-- ── candidates ───────────────────────────────────────────────────────────────
DO $c$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'candidates' AND column_name = 'profile_image'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'candidates' AND column_name = 'profile_image_url'
    ) THEN
        ALTER TABLE "candidates" RENAME COLUMN "profile_image" TO "profile_image_url";
    END IF;
END
$c$;

ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "membership_no" VARCHAR(20);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "resume_url" VARCHAR(255);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "resume_copy_url" VARCHAR(255);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "highest_qualification" "ProfessionalQualification";
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "expected_positions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "approval_status_message_seen" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMP(3);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "reviewed_by" UUID;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT;

ALTER TABLE "candidates" DROP CONSTRAINT IF EXISTS "candidates_reviewed_by_fkey";
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "mis_user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ── companies ────────────────────────────────────────────────────────────────
DO $co$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'headquarters_location'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'headoffice_location'
    ) THEN
        ALTER TABLE "companies" RENAME COLUMN "headquarters_location" TO "headoffice_location";
    END IF;
END
$co$;

ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "bio" VARCHAR(255);
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "company_size" VARCHAR(50);
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "specialities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "map_link" VARCHAR(1000);

ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "profile_completed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "approval_status_message_seen" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3);
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMP(3);
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "reviewed_by" UUID;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT;
