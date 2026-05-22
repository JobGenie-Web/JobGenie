# Phase 4: Deployment Status

## ✅ COMPLETED

### 1. Edge Function Deployed
- **Status**: ✅ Working perfectly
- **URL**: `https://qqhdpoddfwkqsubmjskg.supabase.co/functions/v1/interview-reminders`
- **Test Result**: `{"success":true,"message":"Reminders disabled","scanned":0,"sent":0,"skipped":0}`

### 2. Secrets Configured
All 4 required secrets are set:
- ✅ `CRON_SECRET`
- ✅ `RESEND_API_KEY`  
- ✅ `EMAIL_FROM`
- ✅ `APP_URL`

### 3. Authentication Fixed
Edge Functions require **TWO headers**:
1. `Authorization: Bearer <service_role_key>` - for Supabase API Gateway
2. `x-cron-secret: <your_secret>` - for custom auth validation

The pg_cron schedule SQL files have been updated to include both headers.

---

## ⚠️ REMAINING STEPS (Manual)

### Step 1: Install pg_cron Extensions

Run this SQL in **Supabase Dashboard → SQL Editor** (dev project):

1. Go to: https://supabase.com/dashboard/project/qqhdpoddfwkqsubmjskg/sql/new
2. Paste the contents of: `supabase/migrations/20260523_01_install_pgcron.sql`
3. Click **Run**

**Expected output**: No errors, extensions installed.

**Verify**:
```sql
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
```

---

### Step 2: Schedule the Cron Job

Run this SQL in **Supabase Dashboard → SQL Editor** (dev project):

1. Open file: `supabase/migrations/20260523_02_schedule_dev.sql`
2. **Important**: Replace `'your-cron-secret-here'` on line 6 with:
   ```sql
   ALTER DATABASE postgres SET app.cron_secret = '74a656678155c36c6e823845f82a05da556f134b55382130ef1f27cdbac36835';
   ```
3. Copy the entire modified SQL
4. Paste into: https://supabase.com/dashboard/project/qqhdpoddfwkqsubmjskg/sql/new
5. Click **Run**

**Expected output**: Job scheduled successfully.

**Verify**:
```sql
SELECT jobid, jobname, schedule, active FROM cron.job;
```

You should see: `interview-reminders-dev` with schedule `*/15 * * * *` and `active = true`.

---

### Step 3: Monitor Cron Execution

**Check job runs**:
```sql
SELECT 
  runid,
  jobid,
  status,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

**Monitor Edge Function logs**:
1. Go to: https://supabase.com/dashboard/project/qqhdpoddfwkqsubmjskg/functions/interview-reminders/logs
2. You should see executions every 15 minutes
3. Look for: `{"success":true, ...}` responses

---

### Step 4: Test with Real Data

1. **Enable reminders in MIS**:
   ```sql
   UPDATE mis_interview_reminder_settings 
   SET enabled = true, 
       offsets_minutes = ARRAY[60, 1440]  -- 1 hour and 1 day
   WHERE id = 1;
   ```

2. **Create a test interview** (via MIS dashboard):
   - Schedule it 2 hours from now
   - Confirm the interview
   
3. **Wait for next cron cycle** (max 15 minutes)

4. **Check if reminder was sent**:
   ```sql
   SELECT * FROM interview_reminder_sent
   ORDER BY created_at DESC
   LIMIT 5;
   ```

5. **Check candidate's email inbox**

---

## Production Deployment

After dev is working, repeat for production:

### Production Project: `oxcmkfejolzcyxhgfdhj`

1. **Set secrets** (already have commands in chat history - use prod values!)

2. **Deploy Edge Function**:
   ```bash
   supabase functions deploy interview-reminders --project-ref oxcmkfejolzcyxhgfdhj
   ```

3. **Install extensions**:
   - Run `20260523_01_install_pgcron.sql` in prod SQL editor

4. **Schedule cron**:
   - Run `20260523_03_schedule_prod.sql` (after updating CRON_SECRET)
   - Use prod project URL in SQL

---

## Test Commands

**Manual Edge Function test** (PowerShell):
```powershell
Invoke-RestMethod -Uri "https://qqhdpoddfwkqsubmjskg.supabase.co/functions/v1/interview-reminders" -Method Post -Headers @{"Authorization"="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxaGRwb2RkZndrcXN1Ym1qc2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA3NjUxOSwiZXhwIjoyMDkxNjUyNTE5fQ.HzQ7tcsIE_dgS2LneXkf8PkZDk6Z4o6KmDfF8a33xgY"; "x-cron-secret"="74a656678155c36c6e823845f82a05da556f134b55382130ef1f27cdbac36835"; "Content-Type"="application/json"} -Body "{}"
```

**Expected response**:
```
success : True
message : Reminders disabled
scanned : 0
sent    : 0
skipped : 0
```

---

## Files Modified/Created

```
✅ supabase/functions/interview-reminders/index.ts - Edge Function code
✅ supabase/functions/deno.json - Deno configuration
✅ supabase/migrations/20260523_01_install_pgcron.sql - Install extensions
✅ supabase/migrations/20260523_02_schedule_dev.sql - Dev cron schedule
✅ supabase/migrations/20260523_03_schedule_prod.sql - Prod cron schedule
```

---

## Troubleshooting

### Reminder not being sent?

1. Check settings are enabled:
   ```sql
   SELECT * FROM mis_interview_reminder_settings;
   ```

2. Check interview exists and is confirmed:
   ```sql
   SELECT id, job_designation, interview_confirmed, confirmed_time 
   FROM job_invitations 
   WHERE interview_confirmed = true 
   AND invitation_canceled = false
   ORDER BY confirmed_time;
   ```

3. Check Edge Function logs in Dashboard

4. Manually trigger the function with test command above

### Cron not running?

1. Verify job is scheduled and active:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'interview-reminders-dev';
   ```

2. Check execution history:
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
   ```

3. Check pg_net extension is working:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_net';
   ```

---

## Next: Phase 5

Once Phase 4 is verified working, proceed to **Phase 5: Realtime Notifications**

---

**Status**: ✅ Dev Edge Function deployed and working  
**Next Step**: Run Step 1 & 2 above to complete dev deployment  
**Last Updated**: 2026-05-23
