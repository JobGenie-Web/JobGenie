-- Align remote DB with app + Prisma: job_invitations.alternative_dates (JSONB)
-- Fixes PostgREST PGRST204 when inserting/selecting invitations.
ALTER TABLE public.job_invitations
    ADD COLUMN IF NOT EXISTS alternative_dates jsonb;

COMMENT ON COLUMN public.job_invitations.alternative_dates IS
    'Array of {date, time, order, is_alternative?} for employer-proposed alternative calendar days';
