# Phase 4: pg_cron + Edge Functions - COMPLETED ✅

## Summary

Successfully implemented Phase 4 of the Enterprise Supabase Migration: **pg_cron + Edge Functions for Interview Reminders**.

This phase replaces the Vercel Cron-based interview reminder system with a fully Supabase-native solution, eliminating external dependencies and improving reliability.

---

## What Was Created

### 1. SQL Migrations ✅

#### `supabase/migrations/20260523_01_install_pgcron.sql`
- Installs `pg_cron` extension for job scheduling
- Installs `pg_net` extension for HTTP requests from cron jobs
- Grants necessary permissions
- Adds documentation comments

#### `supabase/migrations/20260523_02_schedule_dev.sql`
- Schedules interview reminders Edge Function for **development** environment
- Runs every 15 minutes (`*/15 * * * *`)
- Calls dev Edge Function URL: `https://qqhdpoddfwkqsubmjskg.supabase.co/functions/v1/interview-reminders`
- Uses `app.cron_secret` for authorization

#### `supabase/migrations/20260523_03_schedule_prod.sql`
- Schedules interview reminders Edge Function for **production** environment
- Runs every 15 minutes (`*/15 * * * *`)
- Calls prod Edge Function URL: `https://oxcmkfejolzcyxhgfdhj.supabase.co/functions/v1/interview-reminders`
- Uses `app.cron_secret` for authorization

### 2. Edge Function ✅

#### `supabase/functions/interview-reminders/index.ts`

**Complete Deno/TypeScript implementation** that:
- ✅ Verifies authorization using `CRON_SECRET` Bearer token
- ✅ Queries `mis_interview_reminder_settings` for enabled status and offsets
- ✅ Fetches eligible `job_invitations` with interview rounds (last 6 months)
- ✅ Batch loads user timezones (performance optimization)
- ✅ Processes both initial invitations and multi-round interviews
- ✅ Handles MIS rescheduled interviews
- ✅ Checks interview eligibility (not canceled, not past, confirmed)
- ✅ Compares current time against scheduled time minus offset
- ✅ Deduplicates using `interview_reminder_sent` table
- ✅ Sends emails via **Resend API** (not nodemailer - Deno compatible)
- ✅ Records sent reminders to prevent duplicates
- ✅ Returns metrics: `{ success, scanned, sent, skipped }`

**Key Features:**
- Uses Supabase client with service role for admin access
- Proper TypeScript interfaces for type safety
- Comprehensive error handling and logging
- Supports both online and physical interview modes
- Formats time windows nicely (e.g., "2 hours and 30 minutes")
- Includes interview details in email HTML (company, position, round, date, time, location)

### 3. Documentation ✅

#### `PHASE4_PGCRON_DEPLOYMENT_GUIDE.md`

**Comprehensive 400+ line deployment guide** covering:
- ✅ Architecture diagram
- ✅ Prerequisites checklist
- ✅ Step-by-step deployment instructions
- ✅ Environment variable configuration
- ✅ Supabase CLI authentication
- ✅ Edge Function secrets management
- ✅ Deployment commands for dev + prod
- ✅ pg_cron scheduling with actual SQL
- ✅ Testing procedures (manual + automated)
- ✅ Troubleshooting common issues
- ✅ Rollback instructions
- ✅ Verification queries

---

## Architecture

```
PostgreSQL (Supabase)
    ├─ pg_cron (scheduler)
    │   └─ Runs every 15 minutes
    └─ pg_net (HTTP client)
        └─ Calls Edge Function

        ↓ HTTP POST with Bearer token

Supabase Edge Function (/functions/v1/interview-reminders)
    ├─ Verifies authorization
    ├─ Queries database (service role)
    ├─ Processes reminders
    ├─ Sends emails (Resend API)
    └─ Records sent reminders

        ↓ SMTP

Resend API → Candidate Email Inbox
```

---

## Files Created/Modified

```
c:\Pathum\JG-Backup\JobGenie\
├── supabase/
│   ├── migrations/
│   │   ├── 20260523_01_install_pgcron.sql        # NEW: Install extensions
│   │   ├── 20260523_02_schedule_dev.sql          # NEW: Dev cron schedule
│   │   └── 20260523_03_schedule_prod.sql         # NEW: Prod cron schedule
│   └── functions/
│       └── interview-reminders/
│           └── index.ts                           # NEW: Edge Function (Deno)
├── PHASE4_PGCRON_DEPLOYMENT_GUIDE.md             # NEW: Deployment guide
└── PHASE4_COMPLETION_SUMMARY.md                  # NEW: This file
```

---

## Deployment Checklist

### Prerequisites ✅
- [x] Phase 1 (RLS) completed
- [x] Phase 2 (Environment config) completed
- [x] Phase 3 (Resend) completed
- [x] All necessary files created

### Development Environment
- [ ] Install pg_cron + pg_net extensions (run `20260523_01_install_pgcron.sql`)
- [ ] Generate strong `CRON_SECRET` for dev
- [ ] Set Edge Function secrets via Supabase CLI
- [ ] Deploy Edge Function: `supabase functions deploy interview-reminders --project-ref qqhdpoddfwkqsubmjskg`
- [ ] Update `20260523_02_schedule_dev.sql` with actual `CRON_SECRET`
- [ ] Schedule cron job (run modified `20260523_02_schedule_dev.sql`)
- [ ] Test Edge Function manually with curl
- [ ] Verify cron job is running: `SELECT * FROM cron.job;`
- [ ] Monitor Edge Function logs in Supabase Dashboard
- [ ] Test with real interview data

### Production Environment
- [ ] Install pg_cron + pg_net extensions (run `20260523_01_install_pgcron.sql`)
- [ ] Generate strong `CRON_SECRET` for prod (DIFFERENT from dev!)
- [ ] Set Edge Function secrets via Supabase CLI
- [ ] Deploy Edge Function: `supabase functions deploy interview-reminders --project-ref oxcmkfejolzcyxhgfdhj`
- [ ] Update `20260523_03_schedule_prod.sql` with actual `CRON_SECRET`
- [ ] Schedule cron job (run modified `20260523_03_schedule_prod.sql`)
- [ ] Test Edge Function manually with curl
- [ ] Verify cron job is running: `SELECT * FROM cron.job;`
- [ ] Monitor Edge Function logs in Supabase Dashboard
- [ ] Monitor for 24 hours before considering complete

---

## Required Environment Variables

### Edge Function Secrets (set via Supabase CLI)

Both dev and prod need these secrets:

```bash
# Security
CRON_SECRET="<strong-random-secret>"

# Email (Resend API)
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="noreply@yourdomain.com"

# Application
APP_URL="http://localhost:3000"  # or production URL

# Supabase Connection
SUPABASE_URL="https://qqhdpoddfwkqsubmjskg.supabase.co"  # or prod URL
SUPABASE_SERVICE_ROLE_KEY="<service-role-key-from-env-file>"
```

**Set via CLI:**
```bash
supabase secrets set CRON_SECRET="..." --project-ref <project-id>
supabase secrets set RESEND_API_KEY="..." --project-ref <project-id>
# ... (repeat for all secrets)
```

---

## Testing

### Manual Edge Function Test

**Development:**
```bash
curl -X POST \
  https://qqhdpoddfwkqsubmjskg.supabase.co/functions/v1/interview-reminders \
  -H "Authorization: Bearer YOUR_DEV_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": true,
  "scanned": 0,
  "sent": 0,
  "skipped": 0
}
```

### Verify Cron Job

```sql
-- Check scheduled jobs
SELECT * FROM cron.job;

-- Check execution history
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

### Monitor Edge Function Logs

1. Go to Supabase Dashboard
2. Navigate to: **Functions** → `interview-reminders` → **Logs**
3. Look for executions every 15 minutes
4. Check for any errors or warnings

### Test with Real Data

1. Enable interview reminders in MIS Settings
2. Set offset to 60 minutes (1 hour)
3. Create a test interview invitation
4. Schedule interview 2 hours from now
5. Wait for next cron cycle (max 15 minutes)
6. Check candidate's email inbox
7. Verify `interview_reminder_sent` table:
   ```sql
   SELECT * FROM interview_reminder_sent
   ORDER BY created_at DESC;
   ```

---

## Benefits Over Vercel Cron

| Aspect | Vercel Cron (Old) | pg_cron + Edge Functions (New) |
|--------|-------------------|--------------------------------|
| **External Dependencies** | Requires Vercel scheduler | ✅ Self-contained in Supabase |
| **Reliability** | Subject to Vercel limits | ✅ Postgres-native scheduling |
| **Cost** | Serverless function invocations | ✅ Free with Supabase plan |
| **Logs** | Split across Vercel + Supabase | ✅ Centralized in Supabase |
| **Debugging** | Limited log access | ✅ Full SQL + function logs |
| **Latency** | Next.js cold starts | ✅ Edge Functions (global) |
| **Scalability** | Vercel serverless limits | ✅ Auto-scaling Edge Functions |
| **Database Access** | Through Next.js | ✅ Direct from Postgres |

---

## Common Issues & Solutions

### Issue: Edge Function returns 401 Unauthorized

**Cause:** CRON_SECRET mismatch

**Solution:**
1. Verify Edge Function secret: `supabase secrets list --project-ref <id>`
2. Verify database setting: `SELECT current_setting('app.cron_secret');`
3. Ensure both match exactly

### Issue: Edge Function returns 500 Internal Server Error

**Cause:** Missing environment variables

**Solution:**
1. Check Edge Function logs in Supabase Dashboard
2. Verify all 6 secrets are set:
   - CRON_SECRET
   - RESEND_API_KEY
   - EMAIL_FROM
   - APP_URL
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY

### Issue: Cron job not running

**Cause:** pg_cron not scheduled

**Solution:**
1. Check if job exists: `SELECT * FROM cron.job;`
2. Re-run schedule SQL if missing
3. Verify `active = true` in cron.job table

### Issue: Emails not being sent

**Cause:** Reminder settings disabled or Resend API issue

**Solution:**
1. Check `mis_interview_reminder_settings.enabled = true`
2. Verify `offsets_minutes` array is populated
3. Test Resend API key manually
4. Check Edge Function logs for Resend errors

---

## Comparison: Before vs After

### Before (Phase 3)
```
Vercel Cron Schedule
    ↓
Next.js API Route (/api/cron/interview-reminders)
    ↓
process-interview-reminders.ts (Node.js)
    ↓
Supabase Database (via admin client)
    ↓
nodemailer → Gmail SMTP
```

### After (Phase 4)
```
pg_cron (Postgres)
    ↓
pg_net.http_post()
    ↓
Edge Function (Deno, globally distributed)
    ↓
Supabase Database (service role, direct)
    ↓
Resend API → Email
```

**Key Improvements:**
- ✅ Removed Vercel dependency
- ✅ Removed Next.js API route dependency (but kept as fallback)
- ✅ Faster execution (no cold starts)
- ✅ Better observability (Supabase Dashboard)
- ✅ Globally distributed (Edge Functions)

---

## Next Steps: Phase 5

After Phase 4 is deployed and verified, proceed to **Phase 5: Realtime Notifications**.

**Phase 5 will include:**
- Create `notifications` table with RLS policies
- Add Postgres triggers on status changes:
  - `job_invitations` (new invitation, status change)
  - `interview_rounds` (new round, confirmation)
  - `job_offers` (new offer, acceptance)
- Implement `useNotifications` React hook for real-time subscriptions
- Create `NotificationBell` component with dropdown
- Add to candidate and employer dashboards

---

## Rollback Instructions

If Phase 4 needs to be rolled back:

### 1. Unschedule Cron Jobs

```sql
-- Development
SELECT cron.unschedule('interview-reminders-dev');

-- Production
SELECT cron.unschedule('interview-reminders-prod');
```

### 2. Delete Edge Function

```bash
# Development
supabase functions delete interview-reminders --project-ref qqhdpoddfwkqsubmjskg

# Production
supabase functions delete interview-reminders --project-ref oxcmkfejolzcyxhgfdhj
```

### 3. Revert to Vercel Cron (if needed)

The Next.js API route at `src/app/api/cron/interview-reminders/route.ts` is still intact and can be re-enabled via `vercel.json`.

---

## Documentation

- **Deployment Guide**: `PHASE4_PGCRON_DEPLOYMENT_GUIDE.md`
- **Migration Plan**: `.cursor/plans/enterprise_supabase_migration_108601c1.plan.md`
- **Supabase pg_cron Docs**: https://supabase.com/docs/guides/database/extensions/pg_cron
- **Supabase Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **pg_cron GitHub**: https://github.com/citusdata/pg_cron

---

**Phase 4 Status**: ✅ CODE COMPLETE - Ready for Deployment

**Manual Deployment Required**: ⚠️ Yes (follow `PHASE4_PGCRON_DEPLOYMENT_GUIDE.md`)

**Estimated Deployment Time**: 30-45 minutes (including testing)

**Last Updated**: 2026-05-23
