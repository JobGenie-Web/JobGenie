-- CreateTable (referenced by prisma/complete_rls_policies.sql; extend columns via future migrations as needed)
CREATE TABLE "interview_rounds" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitation_id" UUID NOT NULL,

    CONSTRAINT "interview_rounds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "interview_rounds" ADD CONSTRAINT "interview_rounds_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "job_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex (name matches prisma/complete_rls_policies.sql)
CREATE INDEX IF NOT EXISTS "idx_interview_rounds_invitation_id" ON "interview_rounds"("invitation_id");
