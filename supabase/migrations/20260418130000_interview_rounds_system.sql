-- =====================================================
-- INTERVIEW ROUNDS AND FEEDBACK SYSTEM
-- Enterprise-grade multi-round interview management
-- =====================================================

-- Add feedback/outcome related columns to interview_rounds if not exists
ALTER TABLE interview_rounds 
  ADD COLUMN IF NOT EXISTS outcome_notes TEXT,
  ADD COLUMN IF NOT EXISTS outcome_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS outcome_by UUID REFERENCES users(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_interview_rounds_outcome ON interview_rounds(outcome);
CREATE INDEX IF NOT EXISTS idx_interview_rounds_status ON interview_rounds(status);
CREATE INDEX IF NOT EXISTS idx_interview_rounds_outcome_by ON interview_rounds(outcome_by);
CREATE INDEX IF NOT EXISTS idx_job_invitations_pipeline_status ON job_invitations(pipeline_status);
CREATE INDEX IF NOT EXISTS idx_job_invitations_current_round ON job_invitations(current_round_number);

-- Add composite index for invitation + round lookup
CREATE INDEX IF NOT EXISTS idx_interview_rounds_invitation_round ON interview_rounds(invitation_id, round_number);

-- Create function to auto-create first interview round when invitation is confirmed
CREATE OR REPLACE FUNCTION create_first_interview_round()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create round 1 if interview is being confirmed for the first time
  -- and no rounds exist yet for this invitation
  IF NEW.interview_confirmed = true 
     AND (OLD.interview_confirmed IS NULL OR OLD.interview_confirmed = false)
     AND NEW.status = 'accepted'
     AND NOT EXISTS (
       SELECT 1 FROM interview_rounds WHERE invitation_id = NEW.id
     ) THEN
    
    -- Create the first interview round with confirmed details
    INSERT INTO interview_rounds (
      invitation_id,
      round_number,
      round_label,
      status,
      given_time_slots,
      alternative_dates,
      selected_time_slot,
      interview_mode,
      interview_confirmed,
      confirmed_time,
      meeting_link,
      interview_address,
      map_link,
      confirmed_at,
      sent_at,
      viewed_at,
      responded_at
    ) VALUES (
      NEW.id,
      1,
      'Initial Interview',
      'confirmed',
      NEW.given_time_slots,
      NEW.alternative_dates,
      NEW.selected_time_slot,
      NEW.interview_mode,
      true,
      NEW.confirmed_time::jsonb,
      NEW.meeting_link,
      NEW.interview_address,
      NEW.map_link,
      NEW.confirmed_at,
      NEW.sent_at,
      NEW.viewed_at,
      NEW.responded_at
    );
    
    -- Update invitation's current round number
    NEW.current_round_number = 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-creating first round
DROP TRIGGER IF EXISTS trg_create_first_interview_round ON job_invitations;
CREATE TRIGGER trg_create_first_interview_round
  BEFORE UPDATE ON job_invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_first_interview_round();

-- Create function to update pipeline status based on round outcomes
CREATE OR REPLACE FUNCTION update_pipeline_status_from_outcome()
RETURNS TRIGGER AS $$
BEGIN
  -- When a round outcome is set, update the invitation's pipeline status
  IF NEW.outcome IS NOT NULL AND (OLD.outcome IS NULL OR OLD.outcome != NEW.outcome) THEN
    
    CASE NEW.outcome
      WHEN 'reject' THEN
        -- Mark invitation as rejected
        UPDATE job_invitations 
        SET 
          pipeline_status = 'rejected',
          closed_at = NOW(),
          closed_reason = COALESCE(NEW.outcome_notes, 'Candidate rejected after round ' || NEW.round_number)
        WHERE id = NEW.invitation_id;
        
      WHEN 'offer' THEN
        -- Mark invitation as offered (job offer will be created separately)
        UPDATE job_invitations 
        SET pipeline_status = 'offered'
        WHERE id = NEW.invitation_id;
        
      WHEN 'advance' THEN
        -- Keep pipeline as active, will create next round separately
        UPDATE job_invitations 
        SET pipeline_status = 'active'
        WHERE id = NEW.invitation_id;
        
      ELSE
        -- no_decision or other - keep active
        NULL;
    END CASE;
    
    -- Mark this round as completed
    IF NEW.outcome != 'advance' OR NEW.outcome = 'offer' THEN
      NEW.status = 'completed';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pipeline status updates
DROP TRIGGER IF EXISTS trg_update_pipeline_status ON interview_rounds;
CREATE TRIGGER trg_update_pipeline_status
  BEFORE UPDATE ON interview_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_status_from_outcome();

-- Add comments for documentation
COMMENT ON COLUMN interview_rounds.outcome IS 'Interview outcome: advance (pass to next round), reject (failed), offer (extend job offer), no_decision';
COMMENT ON COLUMN interview_rounds.outcome_notes IS 'Employer feedback and notes about the interview performance';
COMMENT ON COLUMN interview_rounds.outcome_at IS 'Timestamp when outcome decision was made';
COMMENT ON COLUMN interview_rounds.outcome_by IS 'User ID of employer who made the outcome decision';
COMMENT ON COLUMN interview_rounds.round_label IS 'Optional label like "Technical Interview", "Culture Fit", "Final Round"';

COMMENT ON TABLE interview_rounds IS 'Multi-round interview tracking with scheduling, feedback, and outcomes';
COMMENT ON COLUMN job_invitations.current_round_number IS 'Current active interview round number for this invitation';
COMMENT ON COLUMN job_invitations.pipeline_status IS 'Overall candidate pipeline status: active, rejected, offered, hired, withdrawn, expired';
