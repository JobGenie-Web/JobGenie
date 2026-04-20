# Multi-Round Interview System - Testing Guide

## Prerequisites

1. **Database Migrations Applied**
   ```bash
   npx supabase db push
   ```
   
   Verify these migrations exist:
   - `supabase/migrations/20260418130000_interview_rounds_system.sql`

2. **Test Users**
   - **Employer**: employer@test.com
   - **Candidate**: candidate@test.com
   
   Or create new users via the registration flow.

3. **Development Server Running**
   ```bash
   npm run dev
   ```

---

## Test Flow 1: Complete 2-Round Interview (Happy Path)

### Step 1: Employer Sends Initial Invitation

1. Login as **Employer**
2. Navigate to **Candidates** page
3. Find a candidate and click **Invite to Interview**
4. Fill in the form:
   - Industry: Select from dropdown
   - Job Designation: e.g., "Software Engineer"
   - Add 2-3 time slots (dates + times)
   - Optional: Add personal message
5. Click **Send Invitation**

**Expected Result:**
- ✅ Success toast message
- ✅ Invitation appears in employer's invitations list
- ✅ Status: "Pending"

---

### Step 2: Candidate Accepts Invitation

1. Login as **Candidate**
2. Navigate to **Invitations** page
3. Click on the new invitation
4. Review details
5. Complete acceptance steps:
   - **Step 1**: Select interview mode (Online or Physical)
   - **Step 2**: Choose preferred time slot
6. Click **Accept Invitation**

**Expected Result:**
- ✅ Success toast message
- ✅ Status changes to "Pending Confirmation"
- ✅ Selected time slot and mode are saved

---

### Step 3: Employer Confirms 1st Round

1. Login as **Employer**
2. Go to **Invitations** → filter by "Accepted"
3. Click on the accepted invitation
4. Click **Confirm Interview** button
5. Fill in confirmation details:
   - **If Online**: Provide meeting link (e.g., Google Meet)
   - **If Physical**: Provide address + optional map link
   - **If Alternative Date**: Provide time slot
6. Click **Confirm Interview**

**Expected Result:**
- ✅ Success toast message
- ✅ Status changes to "Confirmed"
- ✅ **InterviewRoadmap** appears showing Round 1
- ✅ Round 1 shows as "Confirmed" with full details
- ✅ Candidate receives confirmation email

**Database Check:**
```sql
SELECT * FROM interview_rounds WHERE invitation_id = 'your-invitation-id';
-- Should see 1 row with round_number = 1, status = 'confirmed'
```

---

### Step 4: Candidate Views Roadmap

1. Login as **Candidate**
2. Go to invitation details
3. Scroll to **Interview Roadmap** section

**Expected Result:**
- ✅ Visual timeline displayed
- ✅ Round 1 shown with:
  - Green checkmark icon
  - "Confirmed" badge
  - Interview date, time, mode
  - Meeting link or address visible
- ✅ Expandable/collapsible round details

---

### Step 5: Employer Adds Feedback (Advance)

1. Login as **Employer**
2. Go to invitation details
3. In **InterviewRoundsDisplay** section
4. Expand Round 1
5. Click **Add Feedback** button
6. In the feedback dialog:
   - Select outcome: **"Advance to Next Round"**
   - Add feedback notes (optional for advance)
7. Click **Save Feedback**

**Expected Result:**
- ✅ Success toast message
- ✅ Round 1 status changes to "Passed"
- ✅ Green badge with "Advanced to Next Round"
- ✅ **"Schedule Next Round"** button appears
- ✅ Previous round details collapse automatically

**Database Check:**
```sql
SELECT outcome, outcome_notes FROM interview_rounds WHERE invitation_id = 'your-invitation-id' AND round_number = 1;
-- Should show outcome = 'advance'
```

---

### Step 6: Employer Schedules Round 2

1. Still as **Employer**, same invitation
2. Click **Schedule Next Round** button
3. Fill in Round 2 details:
   - Round Label: "Technical Interview"
   - Add 1-3 time slots
   - Optional: Add message
4. Click **Schedule Next Round**

**Expected Result:**
- ✅ Success toast message
- ✅ Round 2 appears in roadmap
- ✅ Round 2 status: "Invitation Sent"
- ✅ Candidate receives email notification

**Database Check:**
```sql
SELECT * FROM interview_rounds WHERE invitation_id = 'your-invitation-id' ORDER BY round_number;
-- Should see 2 rows: Round 1 and Round 2
```

---

### Step 7: Candidate Responds to Round 2

1. Login as **Candidate**
2. Go to invitation details
3. See **RoundResponseCard** for Round 2
4. Complete response:
   - Select interview mode
   - Choose time slot
5. Click **Accept Interview**

**Expected Result:**
- ✅ Success toast message
- ✅ Round 2 status: "Awaiting Confirmation"
- ✅ Response card disappears
- ✅ Round 2 shows in roadmap with "accepted" status

---

### Step 8: Employer Confirms Round 2

1. Login as **Employer**
2. Go to invitation details
3. In InterviewRoundsDisplay, expand Round 2
4. Click **Confirm Interview** button
5. Provide meeting/location details
6. Click **Confirm Interview**

**Expected Result:**
- ✅ Round 2 status: "Confirmed"
- ✅ Full details visible in roadmap
- ✅ "Add Feedback" button available

---

### Step 9: Employer Adds Feedback (Offer)

1. Still as **Employer**
2. Expand Round 2 in InterviewRoundsDisplay
3. Click **Add Feedback**
4. Select outcome: **"Offer Job"**
5. Add congratulatory notes
6. Click **Save Feedback**

**Expected Result:**
- ✅ Success toast message
- ✅ Round 2 shows "Offer Extended" badge
- ✅ Blue success message
- ✅ **"Create Job Offer"** button appears
- ✅ Pipeline status: "offered"

---

### Step 10: Candidate Sees Final Outcome

1. Login as **Candidate**
2. Go to invitation details
3. View **Interview Roadmap**

**Expected Result:**
- ✅ Visual timeline shows both rounds
- ✅ Round 1: Collapsed, shows "Passed"
- ✅ Round 2: Shows "Offer Extended" with congratulations message
- ✅ Employer feedback visible
- ✅ "Interview process completed successfully" message at bottom

---

## Test Flow 2: Rejection After Round 1

Follow Steps 1-5 from Test Flow 1, then:

### At Step 5 (Modified): Employer Rejects

1. Click **Add Feedback**
2. Select outcome: **"Reject Candidate"**
3. **Required**: Add feedback notes explaining reason
4. Click **Save Feedback**

**Expected Result:**
- ✅ Round 1 shows "Rejected" badge (red)
- ✅ No "Schedule Next Round" button
- ✅ Pipeline status: "rejected"
- ✅ Process is concluded

### Candidate View:
- ✅ Roadmap shows rejection message
- ✅ Feedback visible to candidate
- ✅ "Interview process has concluded" message

---

## Test Flow 3: Multiple Rounds (3+ Rounds)

Repeat the flow but add feedback as "Advance" multiple times:

1. Round 1 → Feedback: Advance → Schedule Round 2
2. Round 2 → Feedback: Advance → Schedule Round 3
3. Round 3 → Feedback: Advance → Schedule Round 4
4. Round 4 → Feedback: Offer

**Expected Result:**
- ✅ All rounds visible in timeline
- ✅ Completed rounds collapse automatically
- ✅ Latest round always expanded
- ✅ Clear progression indicators
- ✅ Timeline connector lines between rounds

---

## Visual Checks

### Interview Roadmap Component

**Check these UI elements:**

1. **Timeline Structure**
   - [ ] Vertical timeline with connector lines
   - [ ] Color-coded icons (green/red/blue)
   - [ ] Round badges (Passed, Confirmed, Pending, etc.)
   - [ ] Collapsible/expandable sections

2. **Round Details**
   - [ ] Date and time display correctly
   - [ ] Interview mode shown (Online/Physical)
   - [ ] Meeting link/address visible (when appropriate)
   - [ ] Employer feedback displayed

3. **Status Indicators**
   - [ ] Icons change based on outcome
   - [ ] Colors match status (green=success, red=reject, blue=offer)
   - [ ] Badges show correct labels

4. **Interactive Elements**
   - [ ] Click to expand/collapse rounds
   - [ ] Auto-expand latest round
   - [ ] Auto-expand rounds with outcomes
   - [ ] Smooth transitions

### RoundResponseCard (Candidate)

**Check these features:**

1. **Step 1: Interview Mode**
   - [ ] Two clear options (Online/Physical)
   - [ ] Icons display correctly
   - [ ] Selection highlights chosen option
   - [ ] Checkmark appears when selected

2. **Step 2: Time Slot Selection**
   - [ ] All slots listed clearly
   - [ ] Alternative dates marked
   - [ ] Date/time formatted correctly
   - [ ] Selection highlights chosen slot

3. **Action Buttons**
   - [ ] Accept button disabled until both steps complete
   - [ ] Decline button always enabled
   - [ ] Loading state during submission
   - [ ] Error messages display if validation fails

### InterviewRoundsDisplay (Employer)

**Check these features:**

1. **Round Cards**
   - [ ] Expand/collapse functionality
   - [ ] Status badges
   - [ ] Outcome indicators

2. **Action Buttons Appear Correctly**
   - [ ] "Confirm Interview" → Only for accepted rounds
   - [ ] "Add Feedback" → Only for confirmed rounds without outcome
   - [ ] "Schedule Next Round" → Only after "advance" outcome
   - [ ] "Create Job Offer" → Only after "offer" outcome

3. **Feedback Dialog**
   - [ ] Three outcome options (Advance, Reject, Offer)
   - [ ] Feedback notes textarea
   - [ ] Color-coded options
   - [ ] Validation messages

4. **Confirm Dialog**
   - [ ] Shows correct round info
   - [ ] Time input for alternative dates
   - [ ] Meeting link for online
   - [ ] Address for physical
   - [ ] Validation works

---

## Database Verification

### Check Tables

```sql
-- View all rounds for an invitation
SELECT 
    round_number, 
    round_label, 
    status, 
    outcome,
    interview_confirmed,
    confirmed_at
FROM interview_rounds 
WHERE invitation_id = 'your-invitation-id'
ORDER BY round_number;

-- Check pipeline status
SELECT 
    pipeline_status,
    current_round_number,
    interview_confirmed
FROM job_invitations
WHERE id = 'your-invitation-id';

-- Verify trigger created Round 1
SELECT * FROM interview_rounds 
WHERE invitation_id = 'your-invitation-id' AND round_number = 1;
-- Should exist if interview was confirmed
```

---

## Common Issues & Solutions

### Issue 1: Round 1 Not Created Automatically

**Symptoms:**
- Empty roadmap after confirmation
- "Run migration" message displays

**Solution:**
```bash
# Apply migrations
npx supabase db push

# Verify trigger exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'create_first_interview_round';
```

### Issue 2: Can't Respond to Round 2

**Symptoms:**
- No response card appears
- API errors in console

**Solution:**
- Check API endpoint exists: `/api/candidate/interview-rounds/[roundId]/respond`
- Verify RLS policies allow candidate access
- Check browser console for errors

### Issue 3: Feedback Not Updating Pipeline

**Symptoms:**
- Feedback saved but invitation status unchanged

**Solution:**
```sql
-- Check if trigger exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'update_pipeline_status_from_outcome';

-- Manually check pipeline status
SELECT pipeline_status FROM job_invitations WHERE id = 'your-invitation-id';
```

### Issue 4: Previous Round Details Not Hiding

**Symptoms:**
- All rounds show full details even after advancement

**Solution:**
- Check `InterviewRoadmap.tsx` line 331-336
- Logic: `shouldShowDetails = round.outcome === 'advance' ? false : true`
- Make sure rounds have outcome set

---

## Performance Checks

### Load Times
- [ ] Roadmap loads within 1 second
- [ ] Round details expand smoothly
- [ ] No layout shifts

### API Response Times
- [ ] GET /api/{role}/invitations/[id]/rounds < 500ms
- [ ] POST respond/confirm < 1000ms
- [ ] POST feedback < 1000ms

### Real-time Updates
- [ ] Components refresh after actions
- [ ] Toast notifications appear
- [ ] No manual page refresh needed

---

## Accessibility Checks

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators visible
- [ ] Buttons have clear labels

---

## Mobile Responsiveness

Test on different screen sizes:
- [ ] Timeline displays vertically on mobile
- [ ] Action buttons stack properly
- [ ] Forms are touch-friendly
- [ ] Text is readable (not too small)
- [ ] No horizontal scrolling

---

## Success Criteria

Your implementation is successful if:

1. ✅ Complete 2-3 round interview flow works end-to-end
2. ✅ Both employer and candidate see roadmap clearly
3. ✅ Previous round details hide after advancement
4. ✅ Feedback system works (advance/reject/offer)
5. ✅ Email notifications sent at each step
6. ✅ Database triggers create rounds automatically
7. ✅ UI is professional and intuitive
8. ✅ No console errors during normal flow
9. ✅ All validation messages are helpful
10. ✅ Visual indicators are clear and consistent

---

## Next Steps After Testing

1. **Bug Fixes**: Address any issues found during testing
2. **User Feedback**: Get real users to test the flow
3. **Documentation**: Update user guides
4. **Monitoring**: Set up error tracking (Sentry, LogRocket)
5. **Performance**: Optimize if load times exceed targets

---

## Support

If you encounter issues not covered here:
1. Check `INTERVIEW_ROADMAP_SYSTEM.md` for detailed documentation
2. Review console logs for errors
3. Check database tables for data consistency
4. Verify all migrations are applied

Happy Testing! 🎉
