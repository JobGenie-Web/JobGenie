# Fix: Invitation and Round Synchronization Issue

## Problem Identified

When scheduling Round 2, the `interview_rounds` table was being updated correctly, but the `job_invitations` table was not properly synchronized. This caused:

1. Round 2 showing as "pending" in UI even after creation
2. `job_invitations.current_round_number` not updating
3. Possible RLS policy or update failure issues

## Root Causes

### 1. Silent Update Failures
The API was logging errors but not failing the request, making it hard to detect issues:

```typescript
if (updateError) {
    console.error('Error updating current round:', updateError);
    // Operation continues even if update fails! ❌
}
```

### 2. No Database-Level Synchronization
There was no database trigger to automatically sync `job_invitations` when new rounds were created, relying solely on application-level updates.

### 3. Lack of Verification
No verification step to confirm the update actually worked before returning success.

---

## Solution Implemented

### Part 1: Database-Level Fix (Migration) ✅

**File Created:** `supabase/migrations/20260419000000_fix_invitation_round_sync.sql`

**What it does:**

1. **Verifies Columns Exist**
   ```sql
   -- Ensures current_round_number and pipeline_status columns exist
   ALTER TABLE job_invitations ADD COLUMN IF NOT EXISTS current_round_number INT DEFAULT 1;
   ALTER TABLE job_invitations ADD COLUMN IF NOT EXISTS pipeline_status TEXT DEFAULT 'active';
   ```

2. **Creates Auto-Sync Trigger**
   ```sql
   CREATE TRIGGER trg_sync_invitation_on_round_create
       AFTER INSERT ON interview_rounds
       FOR EACH ROW
       EXECUTE FUNCTION sync_invitation_on_round_create();
   ```
   
   This trigger AUTOMATICALLY updates `job_invitations.current_round_number` whenever a new round is inserted!

3. **Backfills Existing Data**
   ```sql
   UPDATE job_invitations ji
   SET current_round_number = (
       SELECT MAX(round_number) 
       FROM interview_rounds ir 
       WHERE ir.invitation_id = ji.id
   );
   ```
   
   Fixes any existing invitations that are out of sync.

4. **Verifies RLS Policies**
   Checks that UPDATE policies exist for employers.

### Part 2: Application-Level Fix (API) ✅

**File Modified:** `src/app/api/employer/interview-rounds/next-round/route.ts`

**Changes Made:**

1. **Better Error Handling**
   ```typescript
   const { data: updateData, error: updateError } = await supabase
       .from('job_invitations')
       .update({
           current_round_number: nextRoundNumber,
           pipeline_status: 'active'
       })
       .eq('id', invitation.id)
       .select('id, current_round_number, pipeline_status') // Returns updated data
       .single();
   ```

2. **Verification Step**
   ```typescript
   if (updateData.current_round_number !== nextRoundNumber) {
       console.warn('WARNING: current_round_number mismatch!');
   }
   ```

3. **Detailed Logging**
   Now logs success/failure with all relevant data for debugging.

---

## How to Apply the Fix

### Step 1: Apply Database Migration

Run this command to apply the new migration:

```bash
npx supabase db push
```

**Expected Output:**
```
Applying migration 20260419000000_fix_invitation_round_sync.sql...
✓ Migration applied successfully
```

### Step 2: Verify Migration Applied

Check your Supabase dashboard or run:

```sql
-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'trg_sync_invitation_on_round_create';

-- Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'sync_invitation_on_round_create';
```

**Expected Result:** Both should return 1 row.

### Step 3: Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Test the Fix

1. **Login as Employer**
2. Navigate to an invitation with Round 1 completed
3. Click "Schedule Next Round"
4. Fill in Round 2 details and submit
5. **Check the following:**
   - ✅ Round 2 appears in "Interview Rounds" section
   - ✅ Round 2 shows proposed time slots
   - ✅ No errors in browser console
   - ✅ Database `job_invitations` table shows `current_round_number = 2`

### Step 5: Verify in Database

Open Supabase Studio and check:

```sql
SELECT 
    id,
    candidate_id,
    current_round_number,
    pipeline_status,
    interview_confirmed
FROM job_invitations
WHERE id = 'your-invitation-id';
```

**Expected:**
- `current_round_number`: 2 (or whatever round you're on)
- `pipeline_status`: 'active'

**Also check:**
```sql
SELECT 
    round_number,
    round_label,
    status,
    given_time_slots
FROM interview_rounds
WHERE invitation_id = 'your-invitation-id'
ORDER BY round_number;
```

**Expected:**
- Row 1: `round_number: 1`, `status: 'completed'`
- Row 2: `round_number: 2`, `status: 'pending'`

---

## What This Fixes

### Before Fix ❌

```
interview_rounds table:
✓ Round 1 exists (round_number: 1, status: completed)
✓ Round 2 created (round_number: 2, status: pending)

job_invitations table:
✗ current_round_number: 1  ← STUCK AT 1!
✗ pipeline_status: might be wrong

UI Display:
✗ Round 2 shows "pending" but looks broken
✗ Employer can't see proper status
```

### After Fix ✅

```
interview_rounds table:
✓ Round 1 exists (round_number: 1, status: completed)
✓ Round 2 created (round_number: 2, status: pending)

job_invitations table:
✓ current_round_number: 2  ← SYNCED!
✓ pipeline_status: active

UI Display:
✓ Round 2 shows correct status
✓ Proposed time slots visible
✓ Everything works properly
```

---

## Technical Details

### Database Trigger Logic

```sql
CREATE OR REPLACE FUNCTION sync_invitation_on_round_create()
RETURNS TRIGGER AS $$
BEGIN
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
```

**Key Points:**
- `SECURITY DEFINER`: Runs with creator's privileges, bypassing RLS
- `GREATEST()`: Only increases round number, never decreases
- Preserves `pipeline_status` if it's been set to rejected/offered/etc.

### Why SECURITY DEFINER?

The trigger runs as the function creator (superuser), which bypasses Row Level Security. This ensures the update always works, even if RLS policies have issues.

Without it, the trigger would fail if RLS policies block the update!

---

## Troubleshooting

### Issue 1: Migration Fails to Apply

**Error:** `relation "job_invitations" does not exist`

**Solution:**
```bash
# Apply all previous migrations first
npx supabase db push

# Then apply this one
```

### Issue 2: Trigger Not Firing

**Check if trigger exists:**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trg_sync_invitation_on_round_create';
```

**If empty, manually create:**
```bash
npx supabase migration up
```

### Issue 3: Still Not Syncing

**Debug steps:**

1. **Check server logs:**
   ```bash
   # Look for these messages in terminal:
   SUCCESS: Invitation updated: {...}
   ERROR: Failed to update invitation current_round_number: {...}
   ```

2. **Check database directly:**
   ```sql
   -- See actual values
   SELECT current_round_number FROM job_invitations WHERE id = 'xxx';
   
   -- See if trigger fired
   SELECT * FROM interview_rounds WHERE invitation_id = 'xxx';
   ```

3. **Test trigger manually:**
   ```sql
   -- This should auto-update job_invitations
   INSERT INTO interview_rounds (
       invitation_id, round_number, round_label, status, given_time_slots
   ) VALUES (
       'your-invitation-id', 3, 'Round 3', 'pending', '[]'::jsonb
   );
   
   -- Check if current_round_number updated
   SELECT current_round_number FROM job_invitations WHERE id = 'your-invitation-id';
   -- Should show 3
   ```

### Issue 4: RLS Policy Blocking Updates

**Check policies:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'job_invitations' AND cmd = 'UPDATE';
```

**Should see:**
- "Employers can update company invitations"
- "Candidates can update own invitations"
- "MIS can update all invitations"

**If missing, apply:**
```bash
npx supabase db reset  # WARNING: Deletes all data!
# OR manually create policies from 20260330120000_jobgenie_complete_rls.sql
```

---

## Verification Checklist

After applying the fix, verify:

- [ ] Migration file exists: `supabase/migrations/20260419000000_fix_invitation_round_sync.sql`
- [ ] Migration applied successfully (`npx supabase db push`)
- [ ] Trigger exists in database
- [ ] Function exists in database
- [ ] API code updated with better error handling
- [ ] Development server restarted
- [ ] Can create Round 2 successfully
- [ ] Database shows correct `current_round_number`
- [ ] UI displays Round 2 properly
- [ ] No errors in browser console
- [ ] No errors in server logs

---

## Benefits of This Fix

1. **Automatic Synchronization** ✅
   - Database trigger ensures sync happens even if API fails
   - No reliance on application code alone

2. **Better Debugging** ✅
   - Detailed logs show exactly what's happening
   - Easy to identify if update succeeds or fails

3. **Data Integrity** ✅
   - Backfill corrects any existing inconsistencies
   - Trigger prevents future desync

4. **Performance** ✅
   - Trigger is fast (runs at database level)
   - No extra API calls needed

5. **Reliability** ✅
   - `SECURITY DEFINER` bypasses RLS issues
   - Works even if application code has bugs

---

## Files Changed

### New Files
1. `supabase/migrations/20260419000000_fix_invitation_round_sync.sql`
2. `FIX_INVITATION_ROUND_SYNC.md` (this document)

### Modified Files
1. `src/app/api/employer/interview-rounds/next-round/route.ts`

---

## Next Steps

1. Apply the migration
2. Restart server
3. Test creating Round 2
4. Verify data in database
5. Monitor logs for any issues

---

## Support

If issues persist after applying this fix:

1. **Check Server Logs**
   - Look for "SUCCESS: Invitation updated" or "ERROR: Failed to update"
   - Share any error messages

2. **Check Database**
   - Verify trigger exists
   - Check actual table values
   - Test trigger manually

3. **Check Browser Console**
   - Look for API errors
   - Check network tab for failed requests

4. **Share Debug Info**
   - Server logs
   - Database query results
   - Browser console errors

---

Last Updated: 2026-04-19  
Status: ✅ Ready to Apply
