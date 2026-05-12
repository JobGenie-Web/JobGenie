-- MIS-configurable interview email reminders (singleton id = 1)
CREATE TABLE "mis_interview_reminder_settings" (
    "id" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "offsets_minutes" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_user_id" UUID,

    CONSTRAINT "mis_interview_reminder_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "interview_reminder_sent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "target_key" VARCHAR(120) NOT NULL,
    "job_invitation_id" UUID NOT NULL,
    "offset_minutes" INTEGER NOT NULL,
    "interview_scheduled_at" TIMESTAMPTZ(6) NOT NULL,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_reminder_sent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "interview_reminder_sent_target_key_offset_minutes_interview_scheduled_at_key" ON "interview_reminder_sent"("target_key", "offset_minutes", "interview_scheduled_at");

CREATE INDEX "interview_reminder_sent_job_invitation_id_idx" ON "interview_reminder_sent"("job_invitation_id");

ALTER TABLE "interview_reminder_sent" ADD CONSTRAINT "interview_reminder_sent_job_invitation_id_fkey" FOREIGN KEY ("job_invitation_id") REFERENCES "job_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "mis_interview_reminder_settings" ("id", "enabled", "offsets_minutes")
VALUES (1, false, ARRAY[]::INTEGER[])
ON CONFLICT ("id") DO NOTHING;
