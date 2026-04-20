# Interview Feedback System - Setup Guide

## Quick Start

Follow these steps to set up the interview feedback and multi-round interview system:

### 1. Run Database Migration

```bash
# Apply the migration to your Supabase database
# The migration file is located at:
# supabase/migrations/20260418130000_interview_rounds_system.sql

# Using Supabase CLI:
npx supabase db push

# Or manually run the SQL file in your Supabase dashboard
```

### 2. Update Prisma Client

```bash
# Generate the Prisma client with updated schema
npx prisma generate
```

### 3. Restart Your Development Server

```bash
npm run dev
```

## What's Included

### Database Changes
- ✅ New columns in `interview_rounds` table
- ✅ Indexes for performance optimization
- ✅ Database triggers for automation
- ✅ Pipeline status management

### API Endpoints
- ✅ `POST /api/employer/interview-rounds/[roundId]/feedback` - Add feedback
- ✅ `POST /api/employer/interview-rounds/next-round` - Create next round
- ✅ `POST /api/employer/interview-rounds/[roundId]/offer` - Create job offer
- ✅ `GET /api/employer/invitations/[id]/rounds` - Get all rounds

### UI Components
- ✅ `InterviewFeedbackDialog` - Add feedback modal
- ✅ `NextRoundDialog` - Schedule next round modal
- ✅ `JobOfferDialog` - Create offer modal
- ✅ `InterviewRoundsDisplay` - Display all rounds
- ✅ Updated `InvitationsClient` - Integrated rounds display

## Testing the Feature

### Test Scenario 1: Basic Multi-Round Interview

1. **As Employer:**
   - Navigate to Candidates page
   - Send an interview invitation to a candidate
   - Provide 3 time slots

2. **As Candidate:**
   - Accept the invitation
   - Select a time slot and interview mode

3. **As Employer:**
   - Confirm the interview with meeting link or address
   - ✅ **Verify:** Round 1 appears in the interview rounds section

4. **After Interview:**
   - Click "Add Feedback" button
   - Select "Advance to Next Round"
   - Add feedback notes
   - Submit

5. **Create Next Round:**
   - Click "Schedule Next Round" button
   - Set round label (e.g., "Technical Interview")
   - Add time slots
   - Submit

6. **Repeat:**
   - Continue the process for multiple rounds

### Test Scenario 2: Job Offer Flow

1. Complete interview rounds
2. On final round, select "Offer Job" as outcome
3. Click "Create Job Offer" button
4. Fill in offer details:
   - Job title
   - Salary information
   - Start date
   - Offer expiry date
   - Benefits and terms
5. Submit the offer
6. ✅ **Verify:** Pipeline status changes to "offered"

### Test Scenario 3: Rejection Flow

1. After any interview round
2. Click "Add Feedback"
3. Select "Reject Candidate"
4. Provide detailed feedback (required)
5. Submit
6. ✅ **Verify:** Pipeline status changes to "rejected"
7. ✅ **Verify:** No further rounds can be scheduled

## Verification Checklist

Use this checklist to verify the implementation:

### Database
- [ ] Migration applied successfully
- [ ] `interview_rounds` table has new columns
- [ ] Indexes created (check with `\d interview_rounds` in psql)
- [ ] Triggers created and active

### API Endpoints
- [ ] Feedback endpoint returns 200 on success
- [ ] Next round endpoint creates new round
- [ ] Job offer endpoint creates offer record
- [ ] Get rounds endpoint returns all rounds
- [ ] Proper error handling (401, 403, 404, 500)
- [ ] Company-level access control working

### UI/UX
- [ ] Interview rounds section appears after confirmation
- [ ] "Add Feedback" button visible on confirmed rounds
- [ ] Feedback dialog opens and submits successfully
- [ ] Next round dialog opens and submits successfully
- [ ] Job offer dialog opens and submits successfully
- [ ] Round cards are collapsible
- [ ] Outcome badges display correctly
- [ ] Real-time updates after actions

### Automation
- [ ] Round 1 auto-created on interview confirmation
- [ ] Pipeline status updates on outcome
- [ ] Email notifications sent to candidates

### Security
- [ ] Only employer from same company can add feedback
- [ ] Cannot add feedback twice to same round
- [ ] Cannot create next round without 'advance' outcome
- [ ] Cannot create offer without 'offer' outcome

## Common Issues & Solutions

### Issue: Migration Fails

**Error:** `column "outcome_notes" already exists`

**Solution:** The column might already exist. Check the table schema:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interview_rounds';
```

If columns exist, you can skip the ALTER TABLE commands in the migration.

### Issue: Round 1 Not Auto-Created

**Possible Causes:**
1. Trigger not created
2. Interview not properly confirmed
3. Round already exists

**Debug:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trg_create_first_interview_round';

-- Check invitation status
SELECT id, status, interview_confirmed 
FROM job_invitations 
WHERE id = 'your-invitation-id';

-- Check existing rounds
SELECT * FROM interview_rounds 
WHERE invitation_id = 'your-invitation-id';
```

### Issue: Cannot Add Feedback

**Possible Causes:**
1. Round status not 'confirmed'
2. Feedback already exists
3. Permission issue

**Debug:**
```sql
-- Check round status and outcome
SELECT id, status, outcome 
FROM interview_rounds 
WHERE id = 'your-round-id';

-- Check employer permissions
SELECT i.company_id, e.company_id 
FROM interview_rounds r
JOIN job_invitations i ON r.invitation_id = i.id
JOIN employers e ON e.id = 'your-employer-id';
```

### Issue: Prisma Client Errors

**Error:** `Unknown field 'outcome_notes'`

**Solution:** Regenerate Prisma client:
```bash
npx prisma generate --schema=./prisma/schema.prisma
```

## Environment-Specific Notes

### Development
- Use `npm run dev` for hot reload
- Check browser console for client-side errors
- Check terminal for API errors

### Production
- Ensure migration runs before deployment
- Regenerate Prisma client in build step
- Test with real data in staging first

## Support & Documentation

- **Full Documentation:** See `INTERVIEW_FEEDBACK_SYSTEM.md`
- **API Reference:** Check individual route files
- **Database Schema:** See `prisma/schema.prisma`
- **UI Components:** See `src/components/employer/` directory

## Next Steps

After setup is complete:

1. ✅ Test the complete workflow
2. ✅ Train your team on the new features
3. ✅ Update user documentation
4. ✅ Monitor system performance
5. ✅ Gather user feedback

## Rollback Plan

If you need to rollback this feature:

1. **Remove UI Integration:**
   ```typescript
   // Comment out in InvitationsClient.tsx
   // <InterviewRoundsDisplay ... />
   ```

2. **Disable Triggers:**
   ```sql
   DROP TRIGGER IF EXISTS trg_create_first_interview_round ON job_invitations;
   DROP TRIGGER IF EXISTS trg_update_pipeline_status ON interview_rounds;
   ```

3. **Keep Data:**
   - Don't drop columns or tables
   - Data will remain intact for future re-enablement

## Success Metrics

Track these metrics to measure success:

- Average time per round
- Percentage of candidates advancing through rounds
- Job offer acceptance rate
- Employer satisfaction with feedback process
- System performance and response times

---

**Implementation Date:** April 18, 2026  
**Version:** 1.0  
**Status:** ✅ Ready for Production
