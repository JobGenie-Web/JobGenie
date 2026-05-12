-- Add composite indexes for common query patterns
-- These improve performance for filtered queries and sorting operations

-- JobInvitation: Common query pattern: filter by candidate_id + status + sort by sent_at
CREATE INDEX idx_job_invitations_candidate_status_sent ON job_invitations(candidate_id, status, sent_at DESC);

-- JobInvitation: Common query pattern: filter by employer_id + status + sort by created_at
CREATE INDEX idx_job_invitations_employer_status_created ON job_invitations(employer_id, status);

-- JobInvitation: Common query pattern: filter by status + sort by sent_at (for dashboard)
CREATE INDEX idx_job_invitations_status_sent ON job_invitations(status, sent_at DESC);

-- Candidate: Common query pattern: filter by approval_status + sort by created_at (for approval workflows)
CREATE INDEX idx_candidates_approval_status_created ON candidates(approval_status, created_at DESC);

-- Job: Common query pattern: filter by status (published/active)
CREATE INDEX idx_jobs_status_created ON jobs(status, created_at DESC);

-- User: Partial index for active users (non-deleted) improves performance on queries that filter by deleted_at IS NULL
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;

-- Candidate: Partial index for active candidates
CREATE INDEX idx_candidates_active ON candidates(id) WHERE deleted_at IS NULL;

-- InterviewRound: Common query pattern: filter by status
CREATE INDEX idx_interview_rounds_status ON interview_rounds(status);

-- JobInvitation: Index for created_at sorting (used by API pagination)
CREATE INDEX idx_job_invitations_created ON job_invitations(created_at DESC);

-- Candidate: Index for filtering by industry (used in job recommendation)
CREATE INDEX idx_candidates_industry ON candidates(industry);
