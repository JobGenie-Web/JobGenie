-- Fix foreign key constraint for outcome_by column
-- This migration ensures the foreign key is properly set up

-- First, drop the column if it exists without proper constraint
ALTER TABLE interview_rounds DROP COLUMN IF EXISTS outcome_by;

-- Re-add the column with proper foreign key constraint
ALTER TABLE interview_rounds 
  ADD COLUMN outcome_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Ensure outcome_notes and outcome_at columns exist
ALTER TABLE interview_rounds 
  ADD COLUMN IF NOT EXISTS outcome_notes TEXT,
  ADD COLUMN IF NOT EXISTS outcome_at TIMESTAMPTZ;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_interview_rounds_outcome ON interview_rounds(outcome);
CREATE INDEX IF NOT EXISTS idx_interview_rounds_status ON interview_rounds(status);
CREATE INDEX IF NOT EXISTS idx_interview_rounds_outcome_by ON interview_rounds(outcome_by);

-- Add comment
COMMENT ON COLUMN interview_rounds.outcome_by IS 'User ID of employer who made the outcome decision';
