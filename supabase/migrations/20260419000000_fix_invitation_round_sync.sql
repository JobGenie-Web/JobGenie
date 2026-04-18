-- Fix invitation and rounds synchronization
-- Ensures job_invitations table properly tracks current round

-- Verify columns exist (they should, but this ensures it)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'job_invitations' 
                   AND column_name = 'current_round_number') THEN
        ALTER TABLE job_invitations ADD COLUMN current_round_number INT DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'job_invitations' 
                   AND column_name = 'pipeline_status') THEN
        ALTER TABLE job_invitations ADD COLUMN pipeline_status TEXT DEFAULT 'active';
    END IF;
END $$;

-- Create function to sync invitation when round is created
CREATE OR REPLACE FUNCTION sync_invitation_on_round_create()
RETURNS TRIGGER AS $$
BEGIN
    -- When a new round is created, update the invitation's current_round_number
    -- if the new round number is higher
    UPDATE job_invitations
    SET 
        current_round_number = GREATEST(current_round_number, NEW.round_number),
        pipeline_status = CASE 
            WHEN pipeline_status = 'active' THEN 'active'
            ELSE pipeline_status
        END
    WHERE id = NEW.invitation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trg_sync_invitation_on_round_create ON interview_rounds;

-- Create trigger to auto-sync when rounds are created
CREATE TRIGGER trg_sync_invitation_on_round_create
    AFTER INSERT ON interview_rounds
    FOR EACH ROW
    EXECUTE FUNCTION sync_invitation_on_round_create();

-- Note: We don't need a separate trigger for status changes since the main sync
-- happens on INSERT and the pipeline_status is managed by the outcome trigger

-- Backfill: Ensure all invitations have correct current_round_number
UPDATE job_invitations ji
SET current_round_number = COALESCE(
    (SELECT MAX(round_number) 
     FROM interview_rounds ir 
     WHERE ir.invitation_id = ji.id),
    1
)
WHERE EXISTS (
    SELECT 1 FROM interview_rounds ir WHERE ir.invitation_id = ji.id
);

-- Add helpful comments
COMMENT ON FUNCTION sync_invitation_on_round_create IS 
    'Automatically updates job_invitations.current_round_number when a new interview round is created';


-- Verify RLS policies allow updates
DO $$
BEGIN
    -- Log policy status (for debugging)
    RAISE NOTICE 'Checking RLS policies for job_invitations...';
    
    -- Verify UPDATE policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'job_invitations' 
        AND cmd = 'UPDATE'
        AND policyname LIKE '%Employers%'
    ) THEN
        RAISE WARNING 'Employer UPDATE policy missing for job_invitations!';
    END IF;
END $$;
