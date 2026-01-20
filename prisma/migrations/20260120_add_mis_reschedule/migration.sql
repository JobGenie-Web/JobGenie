-- Add MIS Reschedule columns to job_invitations table
-- This allows MIS to reschedule cancelled confirmed interviews while preserving original data

ALTER TABLE job_invitations
ADD COLUMN IF NOT EXISTS mis_rescheduled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mis_rescheduled_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS mis_rescheduled_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS mis_reschedule_data JSONB;

-- Create index for querying rescheduled interviews
CREATE INDEX IF NOT EXISTS job_invitations_mis_rescheduled_idx ON job_invitations(mis_rescheduled) WHERE mis_rescheduled = true;

-- Create index for mis_rescheduled_by for foreign key performance
CREATE INDEX IF NOT EXISTS job_invitations_mis_rescheduled_by_idx ON job_invitations(mis_rescheduled_by) WHERE mis_rescheduled_by IS NOT NULL;

-- Add comment to document the JSONB structure
COMMENT ON COLUMN job_invitations.mis_reschedule_data IS 'MIS reschedule data structure: {date, time, interview_mode, meeting_link?, interview_address?, map_link?, notes?}';
