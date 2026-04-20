# 🚀 Setup Interview Feedback System

## Quick Setup (3 Steps)

### Step 1: Run Database Migration

Open your terminal and run:

```bash
cd c:\Pathum\JG-Backup\JobGenie
npx supabase db push
```

This will:
- Add feedback columns to `interview_rounds` table
- Create performance indexes
- Set up automatic triggers to create Round 1 when interviews are confirmed

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Restart Development Server

If your dev server is running, restart it:

```bash
# Press Ctrl+C to stop
npm run dev
```

## ✅ Verify It's Working

1. **Go to Invitations Page**
   - Navigate to `/employer/invitations`
   
2. **Select a Confirmed Interview**
   - Click on an invitation that has status "Accepted" and is confirmed
   
3. **You Should See:**
   - Interview details (date, time, meeting link/address)
   - Three prominent buttons:
     - ✅ **Accept** (green) - Advance to next round
     - ❌ **Reject** (red) - Reject candidate  
     - 💼 **Offer Job** (blue) - Extend job offer

## 📋 Testing the Workflow

### Test Accept (Advance to Next Round)

1. Click **"Accept"** button
2. Select "Advance to Next Round"
3. Add feedback notes (optional)
4. Click "Save Feedback"
5. **Expected:** "Schedule Next Interview Round" button appears
6. Click it to schedule Round 2

### Test Reject

1. Click **"Reject"** button
2. Select "Reject Candidate"
3. Add feedback notes (required)
4. Click "Save Feedback"
5. **Expected:** Shows "Candidate has been rejected"

### Test Offer Job

1. Click **"Offer Job"** button
2. Select "Offer Job"
3. Add feedback notes
4. Click "Save Feedback"
5. **Expected:** "Create Job Offer" button appears
6. Fill in offer details and submit

## 🎨 What You'll See

### Before Migration
If you see a yellow banner saying:
> "Database migration required to enable feedback system"

Run the migration (Step 1 above).

### After Migration
You'll see a card with:
- **Round 1 - Interview Details** header
- Interview date, time, and location
- Three action buttons (Accept/Reject/Offer Job)
- Status badge showing "Awaiting Feedback"

### After Adding Feedback
- Badge changes to show outcome (Advanced/Rejected/Offer Extended)
- Appropriate next action button appears
- Full interview history shows below

## 🔍 Troubleshooting

### Issue: Yellow Warning Still Shows After Migration

**Solution:** 
1. Check migration ran successfully:
   ```bash
   npx supabase db pull
   ```
2. Refresh the page (Ctrl+R)
3. Check browser console for errors

### Issue: Buttons Don't Appear

**Checklist:**
- ✅ Interview must be confirmed (not just accepted)
- ✅ Migration must be run
- ✅ Page must be refreshed after migration
- ✅ Check browser console for API errors

### Issue: "Failed to load interview round"

**Solution:**
1. Check API endpoint is accessible:
   ```
   /api/employer/invitations/[id]/current-round
   ```
2. Check browser Network tab for errors
3. Verify employer authentication

## 📁 Files Modified

### New Files Created:
1. `src/components/employer/InterviewFeedbackPanel.tsx` - Main feedback UI
2. `src/app/api/employer/invitations/[id]/current-round/route.ts` - API endpoint
3. `supabase/migrations/20260418130000_interview_rounds_system.sql` - Database migration

### Modified Files:
1. `src/app/employer/(dashboard)/invitations/InvitationsClient.tsx` - Integrated panel
2. `prisma/schema.prisma` - Updated schema
3. `src/components/employer/InterviewRoundsDisplay.tsx` - Better error messages

## 🎯 Features Enabled

After setup, you can:

✅ Add feedback to completed interviews
✅ Accept candidates and schedule next rounds
✅ Reject candidates with reasons
✅ Create job offers directly from interviews
✅ Track unlimited interview rounds
✅ View complete interview history
✅ See pipeline status updates automatically

## 📞 Need Help?

If you encounter issues:

1. **Check Migration Status:**
   ```bash
   npx supabase db pull
   ```

2. **View Database Logs:**
   - Go to Supabase Dashboard
   - Check Database → Logs

3. **Check Browser Console:**
   - Press F12
   - Look for red errors
   - Check Network tab for failed requests

## 🎉 Success!

Once you see the three buttons (Accept/Reject/Offer Job) on a confirmed interview, the system is fully operational!

---

**Version:** 1.0  
**Last Updated:** April 18, 2026  
**Status:** ✅ Ready to Use
