# Phase 4: pg_cron + Edge Functions Deployment Guide

## Overview

Phase 4 replaces the Vercel Cron-based interview reminder system with a fully Supabase-native solution using:

- **pg_cron**: PostgreSQL extension for job scheduling
- **pg_net**: PostgreSQL extension for HTTP requests
- **Supabase Edge Functions**: Deno-based serverless functions

This eliminates the dependency on external schedulers and moves interview reminder processing entirely into Supabase infrastructure.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Database (Supabase)                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  pg_cron (every 15 minutes)                          │   │
│  │  ├─ Reads: app.cron_secret                           │   │
│  │  └─ Executes: pg_net.http_post()                     │   │
│  └────────────────────┬─────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │ HTTP POST
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase Edge Function: /functions/v1/interview-reminders │
│  ├─ Verifies: Authorization Bearer token                    │
│  ├─ Queries: mis_interview_reminder_settings                │
│  ├─ Queries: job_invitations + interview_rounds             │
│  ├─ Checks: interview_reminder_sent (deduplication)         │
│  ├─ Sends: Email via Resend API                             │
│  └─ Records: interview_reminder_sent                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before starting Phase 4, ensure:

- ✅ **Phase 1** (RLS policies) is applied
- ✅ **Phase 2** (Environment config) is complete
- ✅ **Phase 3** (Resend integration) is complete
- ✅ You have `CRON_SECRET` generated (strong random string)
- ✅ You have Supabase CLI installed: `npm install -g supabase`
- ✅ You have access to both Supabase projects (dev + prod)

---

## Step-by-Step Deployment

### Step 1: Install pg_cron and pg_net Extensions

#### Option A: Via Supabase MCP (Development Database)

```typescript
// Using the Supabase MCP tool to execute SQL on dev database
```

Or manually via Supabase Dashboard:

1. Go to: [https://supabase.com/dashboard/project/qqhdpoddfwkqsubmjskg/sql/new](https://supabase.com/dashboard/project/qqhdpoddfwkqsubmjskg/sql/new)
2. Paste the contents of: `supabase/migrations/20260523_01_install_pgcron.sql`
3. Click **Run**

#### Option B: For Production Database

1. Go to: [https://supabase.com/dashboard/project/oxcmkfejolzcyxhgfdhj/sql/new](https://supabase.com/dashboard/project/oxcmkfejolzcyxhgfdhj/sql/new)
2. Paste the contents of: `supabase/migrations/20260523_01_install_pgcron.sql`
3. Click **Run**

**Verify extensions are installed:**

```sql
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
```

You should see both extensions listed.

---

### Step 2: Configure Environment Variables

#### Development Environment (`.env.local`)

Add/verify these variables:

```env
# Cron secret for securing Edge Function calls
CRON_SECRET=your-strong-random-secret-dev

# Already configured in Phase 3
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# App URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Production Environment (`.env.prod`)

```env
# Cron secret for securing Edge Function calls (DIFFERENT from dev!)
CRON_SECRET=your-strong-random-secret-prod

# Already configured in Phase 3
RESEND_API_KEY=re_your_production_resend_api_key
EMAIL_FROM=noreply@jobgenie.com

# App URL for email links
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

**Generate strong secrets:**

```bash
# Generate a random 32-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 3: Deploy Edge Function

#### A. Set Up Supabase CLI Authentication

```bash
# Login to Supabase CLI
supabase login

# Verify you're logged in
supabase projects list
```

You should see both projects:

- `qqhdpoddfwkqsubmjskg` (Development)
- `oxcmkfejolzcyxhgfdhj` (Production)

#### B. Set Edge Function Secrets (Development)

```bash
# Set secrets for development project
supabase secrets set CRON_SECRET="your-strong-random-secret-dev" --project-ref qqhdpoddfwkqsubmjskg
supabase secrets set RESEND_API_KEY="re_your_resend_api_key" --project-ref qqhdpoddfwkqsubmjskg
supabase secrets set EMAIL_FROM="noreply@yourdomain.com" --project-ref qqhdpoddfwkqsubmjskg
supabase secrets set APP_URL="http://localhost:3000" --project-ref qqhdpoddfwkqsubmjskg
supabase secrets set SUPABASE_URL="https://qqhdpoddfwkqsubmjskg.supabase.co" --project-ref qqhdpoddfwkqsubmjskg
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-from-env-local" --project-ref qqhdpoddfwkqsubmjskg
```

**Get service role key from:**

- `.env.local` → `SUPABASE_SERVICE_ROLE_KEY`

#### C. Set Edge Function Secrets (Production)

```bash
# Set secrets for production project
supabase secrets set CRON_SECRET="74a656678155c36c6e823845f82a05da556f134b55382130ef1f27cdbac36835" --project-ref oxcmkfejolzcyxhgfdhj
supabase secrets set RESEND_API_KEY="re_KoUMwwFD_LNXeiM2AfPpvZJGWWgeBZApE" --project-ref oxcmkfejolzcyxhgfdhj
supabase secrets set EMAIL_FROM="onboarding@resend.dev" --project-ref oxcmkfejolzcyxhgfdhj
supabase secrets set APP_URL="https://job-genie-web.vercel.app" --project-ref oxcmkfejolzcyxhgfdhj
supabase secrets set SUPABASE_URL="https://oxcmkfejolzcyxhgfdhj.supabase.co" --project-ref oxcmkfejolzcyxhgfdhj
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Y21rZmVqb2x6Y3l4aGdmZGhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTcyODQ4NCwiZXhwIjoyMDkxMzA0NDg0fQ.GMACF6e30WmHsmawbAbelS-H8k9cvad4erxNhQu0Cmc" --project-ref oxcmkfejolzcyxhgfdhj
```

**Get service role key from:**

- `.env.prod` → `SUPABASE_SERVICE_ROLE_KEY`

#### D. Deploy Edge Function to Development

```bash
supabase functions deploy interview-reminders --project-ref qqhdpoddfwkqsubmjskg
```

Expected output:

```
Deploying interview-reminders (project ref: qqhdpoddfwkqsubmjskg)
✓ Function deployed successfully
Function URL: https://qqhdpoddfwkqsubmjskg.supabase.co/functions/v1/interview-reminders
```

#### E. Deploy Edge Function to Production

```bash
supabase functions deploy interview-reminders --project-ref oxcmkfejolzcyxhgfdhj
```

Expected output:

```
Deploying interview-reminders (project ref: oxcmkfejolzcyxhgfdhj)
✓ Function deployed successfully
Function URL: https://oxcmkfejolzcyxhgfdhj.supabase.co/functions/v1/interview-reminders
```

---

### Step 4: Schedule with pg_cron

#### A. Development Database Schedule

1. Open the dev schedule SQL file: `supabase/migrations/20260523_02_schedule_dev.sql`
2. **Replace** `'your-cron-secret-here'` with your actual dev `CRON_SECRET` value
3. Execute via Supabase Dashboard:
  - Go to: [https://supabase.com/dashboard/project/qqhdpoddfwkqsubmjskg/sql/new](https://supabase.com/dashboard/project/qqhdpoddfwkqsubmjskg/sql/new)
  - Paste the modified SQL
  - Click **Run**

#### B. Production Database Schedule

1. Open the prod schedule SQL file: `supabase/migrations/20260523_03_schedule_prod.sql`
2. **Replace** `'your-cron-secret-here'` with your actual prod `CRON_SECRET` value
3. Execute via Supabase Dashboard:
  - Go to: [https://supabase.com/dashboard/project/oxcmkfejolzcyxhgfdhj/sql/new](https://supabase.com/dashboard/project/oxcmkfejolzcyxhgfdhj/sql/new)
  - Paste the modified SQL
  - Click **Run**

#### C. Verify Cron Job is Scheduled

Run this query in the SQL editor:

```sql
SELECT 
  jobid, 
  jobname, 
  schedule, 
  active,
  nodename
FROM cron.job;
```

Expected result:

- **Dev**: Job named `interview-reminders-dev` with schedule `*/15 * * * `*
- **Prod**: Job named `interview-reminders-prod` with schedule `*/15 * * * `*

---

## Testing

### Manual Edge Function Test (Development)

Test the Edge Function directly using curl:

```bash
curl -X POST \
  https://qqhdpoddfwkqsubmjskg.supabase.co/functions/v1/interview-reminders \
  -H "Authorization: Bearer YOUR_DEV_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected response:**

```json
{
  "success": true,
  "scanned": 0,
  "sent": 0,
  "skipped": 0
}
```

### Manual Edge Function Test (Production)

```bash
curl -X POST \
  https://oxcmkfejolzcyxhgfdhj.supabase.co/functions/v1/interview-reminders \
  -H "Authorization: Bearer YOUR_PROD_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Check Cron Execution Logs

View the latest cron job runs:

```sql
SELECT 
  runid,
  jobid,
  job_pid,
  status,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### Monitor Edge Function Logs

1. **Go to Supabase Dashboard**:
  - Dev: [https://supabase.com/dashboard/project/qqhdpoddfwkqsubmjskg/functions](https://supabase.com/dashboard/project/qqhdpoddfwkqsubmjskg/functions)
  - Prod: [https://supabase.com/dashboard/project/oxcmkfejolzcyxhgfdhj/functions](https://supabase.com/dashboard/project/oxcmkfejolzcyxhgfdhj/functions)
2. **Click**: `interview-reminders` function
3. **View**: Logs tab
4. **Look for**: Successful executions every 15 minutes

### Test with Real Data

1. **Create a test interview invitation** in the MIS dashboard
2. **Set reminder offsets**: Go to MIS Settings → Interview Reminders
  - Enable reminders
  - Set offset: e.g., 60 minutes (1 hour)
3. **Schedule an interview** 2 hours from now
4. **Wait for cron job** to run (next 15-minute mark)
5. **Check email** sent to candidate
6. **Verify database**: Check `interview_reminder_sent` table

```sql
SELECT * FROM interview_reminder_sent
ORDER BY created_at DESC
LIMIT 10;
```

---

## Troubleshooting

### Edge Function Returns 401 Unauthorized

**Cause**: CRON_SECRET mismatch or not set

**Fix**:

1. Verify Edge Function secret:
  ```bash
   supabase secrets list --project-ref qqhdpoddfwkqsubmjskg
  ```
2. Verify database setting:
  ```sql
   SELECT current_setting('app.cron_secret');
  ```
3. Ensure both match exactly

### Edge Function Returns 500 Error

**Cause**: Missing environment variables or database connection issue

**Fix**:

1. Check Edge Function logs in Supabase Dashboard
2. Verify all secrets are set:
  ```bash
   supabase secrets list --project-ref qqhdpoddfwkqsubmjskg
  ```
3. Required secrets:
  - `CRON_SECRET`
  - `RESEND_API_KEY`
  - `EMAIL_FROM`
  - `APP_URL`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Cron Job Not Running

**Cause**: pg_cron not scheduled or inactive

**Fix**:

1. Check if job exists:
  ```sql
   SELECT * FROM cron.job WHERE jobname LIKE 'interview-reminders%';
  ```
2. If missing, re-run Step 4 (Schedule with pg_cron)
3. Verify job is active (active = true)

### Emails Not Being Sent

**Cause**: Resend API key issue or reminder settings disabled

**Fix**:

1. Check Edge Function logs for Resend API errors
2. Verify `mis_interview_reminder_settings`:
  ```sql
   SELECT * FROM mis_interview_reminder_settings WHERE id = 1;
  ```
3. Ensure `enabled = true` and `offsets_minutes` is populated
4. Test Resend API key:
  ```bash
   curl https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"from":"test@yourdomain.com","to":"you@example.com","subject":"Test","html":"Test"}'
  ```

### Duplicate Reminders Being Sent

**Cause**: Deduplication logic issue or `interview_reminder_sent` table not working

**Fix**:

1. Check `interview_reminder_sent` table structure:
  ```sql
   \d interview_reminder_sent
  ```
2. Verify unique constraint exists on `(target_key, offset_minutes, interview_scheduled_at)`
3. Check for duplicate rows:
  ```sql
   SELECT target_key, offset_minutes, interview_scheduled_at, COUNT(*)
   FROM interview_reminder_sent
   GROUP BY target_key, offset_minutes, interview_scheduled_at
   HAVING COUNT(*) > 1;
  ```

---

## Rollback Instructions

If you need to rollback Phase 4:

### 1. Unschedule Cron Jobs

**Development:**

```sql
SELECT cron.unschedule('interview-reminders-dev');
```

**Production:**

```sql
SELECT cron.unschedule('interview-reminders-prod');
```

### 2. Delete Edge Function

**Development:**

```bash
supabase functions delete interview-reminders --project-ref qqhdpoddfwkqsubmjskg
```

**Production:**

```bash
supabase functions delete interview-reminders --project-ref oxcmkfejolzcyxhgfdhj
```

### 3. Uninstall Extensions (Optional - not recommended)

Only do this if you have no other use for pg_cron or pg_net:

```sql
DROP EXTENSION pg_cron CASCADE;
DROP EXTENSION pg_net CASCADE;
```

### 4. Revert to Vercel Cron

Keep the existing Next.js API route at:

- `src/app/api/cron/interview-reminders/route.ts`

Re-add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/interview-reminders",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

---

## Benefits of Phase 4

✅ **No External Dependencies**: Fully self-contained in Supabase  
✅ **Better Reliability**: No reliance on Vercel cron limits  
✅ **Cost Savings**: No Vercel serverless function invocations  
✅ **Centralized Logs**: All logs in Supabase Dashboard  
✅ **Easier Debugging**: Direct access to pg_cron execution logs  
✅ **Scalability**: Edge Functions auto-scale globally  
✅ **Lower Latency**: Edge Functions run closer to database  

---

## Next Steps: Phase 5

After Phase 4 is complete and verified, proceed to:

### Phase 5: Realtime Notifications

- Create `notifications` table with RLS
- Add Postgres triggers on status changes
- Implement `useNotifications` hook for real-time updates
- Add `NotificationBell` component to dashboards

---

## Support & Documentation

- **Supabase pg_cron**: [https://supabase.com/docs/guides/database/extensions/pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron)
- **Supabase Edge Functions**: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **pg_cron GitHub**: [https://github.com/citusdata/pg_cron](https://github.com/citusdata/pg_cron)
- **pg_net GitHub**: [https://github.com/supabase/pg_net](https://github.com/supabase/pg_net)

---

**Phase 4 Checklist:**

- Install pg_cron + pg_net (dev)
- Install pg_cron + pg_net (prod)
- Generate CRON_SECRET values (dev + prod)
- Deploy Edge Function (dev)
- Deploy Edge Function (prod)
- Set Edge Function secrets (dev)
- Set Edge Function secrets (prod)
- Schedule cron job (dev)
- Schedule cron job (prod)
- Test Edge Function manually (dev)
- Test Edge Function manually (prod)
- Verify cron execution (dev)
- Verify cron execution (prod)
- Test with real interview data
- Monitor logs for 24 hours
- Document any issues encountered

**Status**: Ready for deployment
**Last Updated**: 2026-05-23