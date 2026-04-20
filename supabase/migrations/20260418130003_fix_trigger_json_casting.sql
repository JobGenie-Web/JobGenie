-- Fix the trigger to handle confirmed_time properly
-- The issue is that confirmed_time is a string, not JSON

DROP TRIGGER IF EXISTS trg_create_first_interview_round ON job_invitations;
DROP FUNCTION IF EXISTS create_first_interview_round();

-- Recreate the function with proper handling
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
      CASE 
        WHEN NEW.confirmed_time IS NOT NULL THEN 
          jsonb_build_object('time', NEW.confirmed_time)
        ELSE NULL 
      END,
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
CREATE TRIGGER trg_create_first_interview_round
  BEFORE UPDATE ON job_invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_first_interview_round();

-- Also update the backfill script data for existing rounds
UPDATE interview_rounds
SET confirmed_time = jsonb_build_object('time', (confirmed_time->>'time'))
WHERE confirmed_time IS NOT NULL 
  AND jsonb_typeof(confirmed_time) = 'string';
