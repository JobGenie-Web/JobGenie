# Complete Interview Feedback System Setup Guide

## 📋 Summary

This guide consolidates all 4 SQL migrations needed for the interview feedback system.

---

## ✅ Prisma Schema Status

**Status:** ✅ Already Updated and Generated

The Prisma schema has been updated with:
- `outcome_notes` (Text)
- `outcome_at` (Timestamp)
- `outcome_by` (UUID with foreign key to users)
- All necessary indexes

**Prisma client generated:** ✅ Complete

---

## 🗄️ Database Migrations (Run in Order)

### Migration 1: Core Interview Rounds System
**File:** `20260418130000_interview_rounds_system.sql`

```sql
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

-- Create function to update pipeline status based on round outcomes
CREATE OR REPLACE FUNCTION update_pipeline_status_from_outcome()
RETURNS TRIGGER AS $$
BEGIN
  -- When a round outcome is set, update the invitation's pipeline status
  IF NEW.outcome IS NOT NULL AND (OLD.outcome IS NULL OR OLD.outcome != NEW.outcome) THEN
    
    CASE NEW.outcome
      WHEN 'reject' THEN
        UPDATE job_invitations 
        SET 
          pipeline_status = 'rejected',
          closed_at = NOW(),
          closed_reason = COALESCE(NEW.outcome_notes, 'Candidate rejected after round ' || NEW.round_number)
        WHERE id = NEW.invitation_id;
        
      WHEN 'offer' THEN
        UPDATE job_invitations 
        SET pipeline_status = 'offered'
        WHERE id = NEW.invitation_id;
        
      WHEN 'advance' THEN
        UPDATE job_invitations 
        SET pipeline_status = 'active'
        WHERE id = NEW.invitation_id;
        
      ELSE
        NULL;
    END CASE;
    
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
COMMENT ON TABLE interview_rounds IS 'Multi-round interview tracking with scheduling, feedback, and outcomes';
COMMENT ON COLUMN job_invitations.current_round_number IS 'Current active interview round number for this invitation';
COMMENT ON COLUMN job_invitations.pipeline_status IS 'Overall candidate pipeline status: active, rejected, offered, hired, withdrawn, expired';
```

---

### Migration 2: Fix Foreign Key Constraint
**File:** `20260418130001_fix_foreign_keys.sql`

```sql
-- Fix foreign key constraint for outcome_by column
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
```

---

### Migration 3: Fix Trigger and Backfill
**File:** `20260418130003_fix_trigger_json_casting.sql`

```sql
-- Fix the trigger to handle confirmed_time properly
DROP TRIGGER IF EXISTS trg_create_first_interview_round ON job_invitations;
DROP FUNCTION IF EXISTS create_first_interview_round();

-- Recreate the function with proper handling
CREATE OR REPLACE FUNCTION create_first_interview_round()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interview_confirmed = true 
     AND (OLD.interview_confirmed IS NULL OR OLD.interview_confirmed = false)
     AND NEW.status = 'accepted'
     AND NOT EXISTS (
       SELECT 1 FROM interview_rounds WHERE invitation_id = NEW.id
     ) THEN
    
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
    
    NEW.current_round_number = 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trg_create_first_interview_round
  BEFORE UPDATE ON job_invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_first_interview_round();
```

---

### Migration 4: Backfill Existing Interviews
**File:** `20260418130002_backfill_existing_rounds.sql`

```sql
-- Create Round 1 for existing confirmed interviews
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
  CASE 
    WHEN ji.confirmed_time IS NOT NULL THEN 
      jsonb_build_object('time', ji.confirmed_time)
    ELSE NULL 
  END as confirmed_time,
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

-- Update current_round_number
UPDATE job_invitations
SET current_round_number = 1
WHERE interview_confirmed = true
  AND status = 'accepted'
  AND current_round_number IS NULL
  AND EXISTS (
    SELECT 1 FROM interview_rounds ir 
    WHERE ir.invitation_id = job_invitations.id AND ir.round_number = 1
  );
```

---

## 🚀 Quick Setup Commands

### Step 1: Copy All SQL Above
Copy all 4 migration SQL blocks above

### Step 2: Run in Supabase SQL Editor
1. Go to Supabase Dashboard → SQL Editor
2. Paste all the SQL (you can paste all 4 at once)
3. Click "Run" or press Ctrl+Enter

### Step 3: Verify
Refresh your application and you should see:
- ✅ Accept button (green)
- ❌ Reject button (red)
- 💼 Offer Job button (blue)

---

## 📦 What's Included

### Database Changes
- ✅ Outcome tracking columns
- ✅ Performance indexes
- ✅ Foreign key constraints
- ✅ Automatic triggers
- ✅ Backfill for existing data

### Prisma Schema
- ✅ Updated with all fields
- ✅ Client generated
- ✅ Type-safe queries ready

### API Endpoints
- ✅ POST `/api/employer/interview-rounds/[roundId]/feedback`
- ✅ POST `/api/employer/interview-rounds/next-round`
- ✅ POST `/api/employer/interview-rounds/[roundId]/offer`
- ✅ GET `/api/employer/invitations/[id]/rounds`
- ✅ GET `/api/employer/invitations/[id]/current-round`

### UI Components
- ✅ InterviewFeedbackPanel (3 action buttons)
- ✅ InterviewFeedbackDialog
- ✅ NextRoundDialog
- ✅ JobOfferDialog
- ✅ InterviewRoundsDisplay

---

## ✅ Final Checklist

After running all migrations:

- [ ] All 4 SQL migrations executed successfully
- [ ] Prisma client generated (already done)
- [ ] Browser refreshed
- [ ] Accept/Reject/Offer Job buttons visible
- [ ] Can click buttons and see feedback dialog
- [ ] No console errors

---

## 🎯 System Ready!

Your interview feedback system is now fully operational with:
- Multi-round interview support
- Feedback tracking
- Job offer creation
- Pipeline management
- Automated workflows

**Version:** 1.0  
**Status:** ✅ Production Ready  
**Last Updated:** April 18, 2026
