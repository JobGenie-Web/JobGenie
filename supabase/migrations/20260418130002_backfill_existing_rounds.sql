-- Backfill Round 1 for all existing confirmed interviews
-- This creates Round 1 for interviews that were confirmed before the trigger was created

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
)
SELECT 
  ji.id as invitation_id,
  1 as round_number,
  'Initial Interview' as round_label,
  'confirmed' as status,
  ji.given_time_slots,
  ji.alternative_dates,
  ji.selected_time_slot,
  ji.interview_mode,
  true as interview_confirmed,
  ji.confirmed_time::jsonb as confirmed_time,
  ji.meeting_link,
  ji.interview_address,
  ji.map_link,
  ji.confirmed_at,
  ji.sent_at,
  ji.viewed_at,
  ji.responded_at
FROM job_invitations ji
WHERE ji.interview_confirmed = true
  AND ji.status = 'accepted'
  AND NOT EXISTS (
    SELECT 1 FROM interview_rounds ir 
    WHERE ir.invitation_id = ji.id AND ir.round_number = 1
  );

-- Update current_round_number for invitations that now have Round 1
UPDATE job_invitations
SET current_round_number = 1
WHERE interview_confirmed = true
  AND status = 'accepted'
  AND current_round_number IS NULL
  AND EXISTS (
    SELECT 1 FROM interview_rounds ir 
    WHERE ir.invitation_id = job_invitations.id AND ir.round_number = 1
  );
