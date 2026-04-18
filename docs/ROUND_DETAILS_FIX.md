# Round Details Display Fix

## Issues Fixed

### Issue 1: Time Slots Not Showing for Candidate Response
**Problem:** When candidate tried to respond to an interview round, the time slot selection section was empty.

**Root Cause:** The API endpoint `/api/candidate/invitations/[id]/rounds` was not returning the `given_time_slots` and `alternative_dates` fields.

**Solution:**
- Updated API to include `given_time_slots` and `alternative_dates` in the SELECT query
- Updated TypeScript interface to include these fields
- Added empty state message if no slots available

**Files Modified:**
- `src/app/api/candidate/invitations/[id]/rounds/route.ts`
- `src/components/shared/InterviewRoadmap.tsx` (interface)
- `src/components/candidate/RoundResponseCard.tsx` (empty state)

---

### Issue 2: Round 2 Details Not Showing for Employer
**Problem:** When employer scheduled Round 2, the details weren't visible in the Interview Roadmap while waiting for candidate response (status: pending).

**Root Cause:** The InterviewRoadmap component was only showing interview details for rounds that had been accepted by the candidate (`round.status !== 'pending'`). For pending rounds, no information was displayed.

**Solution:**
Added a new section specifically for employers viewing pending rounds that shows:
- Proposed time slots that were sent
- Alternative dates (if any)
- Clear indication that it's awaiting candidate response

**Visual Result for Employer:**

```
Round 2: Technical Interview [pending]
┌─────────────────────────────────────────────────┐
│ Proposed Time Slots (Awaiting Candidate        │
│ Response)                                        │
│                                                  │
│ 📅 Monday, May 20, 2026  🕐 2:00 PM            │
│ 📅 Tuesday, May 21, 2026  🕐 10:00 AM          │
│ 📅 Wednesday, May 22, 2026  🕐 3:00 PM         │
│                                                  │
│ Alternative Dates                                │
│ 📅 Friday, May 24, 2026  [Alternative]         │
│ 📅 Monday, May 27, 2026  [Alternative]         │
└─────────────────────────────────────────────────┘
```

**Files Modified:**
- `src/components/shared/InterviewRoadmap.tsx`

---

## Code Changes

### 1. API Update (Candidate Rounds Endpoint)

**File:** `src/app/api/candidate/invitations/[id]/rounds/route.ts`

```typescript
// Added these fields to the SELECT query:
given_time_slots,
alternative_dates,
```

### 2. TypeScript Interface Update

**File:** `src/components/shared/InterviewRoadmap.tsx`

```typescript
interface InterviewRound {
    // ... existing fields
    given_time_slots: any;        // Added
    alternative_dates: any;        // Added
    // ... rest of fields
}
```

### 3. Employer Pending Round Display

**File:** `src/components/shared/InterviewRoadmap.tsx`

Added new section after confirmed interview details:

```typescript
{/* Pending Round - Show Proposed Time Slots (Employer View) */}
{userRole === 'employer' && round.status === 'pending' && round.given_time_slots && (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs font-medium">
            Proposed Time Slots (Awaiting Candidate Response)
        </p>
        {/* Display given_time_slots */}
        {/* Display alternative_dates if available */}
    </div>
)}
```

### 4. Empty State for Candidate

**File:** `src/components/candidate/RoundResponseCard.tsx`

```typescript
{allSlots.length === 0 ? (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p>No time slots available. Please contact the employer.</p>
    </div>
) : (
    // Normal slot display
)}
```

---

## Testing

### Test Case 1: Candidate Responding to Round
1. ✅ Employer schedules Round 2
2. ✅ Candidate navigates to invitation
3. ✅ Candidate sees RoundResponseCard with time slots
4. ✅ Time slots display correctly with dates and times
5. ✅ Candidate can select and respond

### Test Case 2: Employer Viewing Pending Round
1. ✅ Employer schedules Round 2
2. ✅ Before candidate responds, employer views invitation
3. ✅ Interview Roadmap shows Round 2
4. ✅ Round 2 displays proposed time slots
5. ✅ Shows "Awaiting Candidate Response" message
6. ✅ Alternative dates shown if available

### Test Case 3: After Candidate Accepts
1. ✅ Candidate accepts Round 2
2. ✅ Employer views invitation
3. ✅ Round 2 shows selected time slot
4. ✅ Shows candidate's chosen mode (online/physical)
5. ✅ "Confirm Interview" button appears

---

## User Experience Improvements

### For Employers:
- **Before Fix:** Blank/empty Round 2 section, confusing whether round was created
- **After Fix:** Clear visibility of what was sent, awaiting response indicator

### For Candidates:
- **Before Fix:** Empty time slot section, couldn't proceed with response
- **After Fix:** All available slots displayed, can select and respond

---

## Technical Details

### Why Different Display Logic?

The roadmap component needs to handle multiple scenarios:

1. **Pending (Candidate View):**
   - Show response card with time slots
   - Allow selection and acceptance

2. **Pending (Employer View):**
   - Show what was proposed
   - Indicate waiting for response
   - No action needed yet

3. **Accepted:**
   - Show selected slot
   - Show confirmation button (employer)
   - Show confirmation details (candidate)

4. **Confirmed:**
   - Show full interview details
   - Show meeting link/address
   - Show feedback button (employer)

5. **Completed (with outcome):**
   - Show outcome (advance/reject/offer)
   - Hide details if advanced
   - Show full details if final outcome

### Data Flow

```
Employer schedules Round 2
        ↓
given_time_slots stored in database
        ↓
API returns round data with time slots
        ↓
InterviewRoadmap receives data
        ↓
├─ Employer View: Shows proposed slots (blue box)
└─ Candidate View: Shows RoundResponseCard with slots

Candidate responds
        ↓
selected_time_slot updated
        ↓
Round status: pending → accepted
        ↓
Both parties see selected slot
```

---

## Refresh Instructions

After deploying these changes:

1. **Hard refresh browser:** `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. If using dev server, restart: `npm run dev`
3. Clear browser cache if needed

---

## Future Enhancements

Potential improvements for round details display:

1. **Edit Proposed Slots:** Allow employer to modify time slots before candidate responds
2. **Push Notifications:** Real-time updates when candidate responds
3. **Expiration Indicator:** Show how long candidate has to respond
4. **Reminder System:** Auto-remind candidate after X days
5. **Bulk View:** Show all pending rounds across multiple invitations

---

## Related Files

All files involved in the fix:

- `src/components/shared/InterviewRoadmap.tsx` - Main roadmap component
- `src/components/candidate/RoundResponseCard.tsx` - Response interface
- `src/app/api/candidate/invitations/[id]/rounds/route.ts` - Rounds API

---

## Support

If issues persist:
1. Check browser console for errors
2. Verify database has `given_time_slots` data
3. Check API response includes the fields
4. Ensure proper role (employer/candidate) is set

---

Last Updated: 2026-04-19
