-- Track whether the employer has opened/caught up with each invitation row (sidebar unread badge).
-- NULL = employer has not marked this row seen since the last candidate-side activity.

ALTER TABLE public.job_invitations
    ADD COLUMN IF NOT EXISTS employer_last_seen_at TIMESTAMPTZ;

COMMENT ON COLUMN public.job_invitations.employer_last_seen_at IS
    'When the employer last acknowledged this invitation in the UI; NULL means unread updates for the employer.';

-- Existing rows: treat as already seen at send time so we do not flood badges.
UPDATE public.job_invitations
SET employer_last_seen_at = COALESCE(employer_last_seen_at, sent_at)
WHERE employer_last_seen_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_job_invitations_company_employer_seen
    ON public.job_invitations (company_id, employer_last_seen_at)
    WHERE invitation_canceled = false;
