# Production Secrets Reference

## Your Production Project Details

**Project Name:** jobgenie-web  
**Project Ref:** `oxcmkfejolzcyxhgfdhj`  
**Region:** Northeast Asia (Tokyo)  
**Organization ID:** axaiylycvxqyjeuoysfz

---

## Actual Production Values

### 1. CRON_SECRET
**Generated for production (keep this secure!):**
```
88798c506791f2ce3ac21953c1c86969dd1c0332af4e6e2bb81f3b093abc9773
```

### 2. RESEND_API_KEY
**Your existing Resend API key:**
```
re_KoUMwwFD_LNXeiM2AfPpvZJGWWgeBZApE
```

### 3. EMAIL_FROM
**Current value (update if using custom domain):**
```
onboarding@resend.dev
```

**If using custom domain (example):**
```
noreply@jobgenie.com  (Verify this domain in Resend first!)
```

### 4. APP_URL
**⚠️ UPDATE THIS - Your production domain:**
```
https://your-production-domain.com
```

**Examples:**
- Vercel: `https://jobgenie.vercel.app`
- Custom domain: `https://jobgenie.com`
- Staging: `https://jobgenie-staging.vercel.app`

### 5. SUPABASE_URL (Auto-configured by Supabase)
```
https://oxcmkfejolzcyxhgfdhj.supabase.co
```

### 6. SUPABASE_SERVICE_ROLE_KEY
**Production service role key (from Supabase CLI):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Y21rZmVqb2x6Y3l4aGdmZGhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTcyODQ4NCwiZXhwIjoyMDkxMzA0NDg0fQ.GMACF6e30WmHsmawbAbelS-H8k9cvad4erxNhQu0Cmc
```

### 7. SUPABASE_ANON_KEY (for reference)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Y21rZmVqb2x6Y3l4aGdmZGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Mjg0ODQsImV4cCI6MjA5MTMwNDQ4NH0.Q-RyWhdnWXxdkKvABdMfOUfsUgheOfRgxZ6IoSGcgQU
```

---

## Quick Setup Commands

### Option 1: Use the Script (Recommended)

**Windows (PowerShell):**
```powershell
# 1. Edit the script and update APP_URL
notepad scripts\set-production-secrets.ps1

# 2. Run the script
.\scripts\set-production-secrets.ps1
```

**Linux/Mac (Bash):**
```bash
# 1. Make script executable
chmod +x scripts/set-production-secrets.sh

# 2. Edit the script and update APP_URL
nano scripts/set-production-secrets.sh

# 3. Run the script
./scripts/set-production-secrets.sh
```

### Option 2: Manual Commands

Copy and paste these commands **AFTER** updating the APP_URL:

```bash
# Set CRON_SECRET
supabase secrets set CRON_SECRET="88798c506791f2ce3ac21953c1c86969dd1c0332af4e6e2bb81f3b093abc9773" --project-ref oxcmkfejolzcyxhgfdhj

# Set RESEND_API_KEY
supabase secrets set RESEND_API_KEY="re_KoUMwwFD_LNXeiM2AfPpvZJGWWgeBZApE" --project-ref oxcmkfejolzcyxhgfdhj

# Set EMAIL_FROM
supabase secrets set EMAIL_FROM="onboarding@resend.dev" --project-ref oxcmkfejolzcyxhgfdhj

# Set APP_URL (⚠️ UPDATE THIS WITH YOUR ACTUAL PRODUCTION DOMAIN!)
supabase secrets set APP_URL="https://your-production-domain.com" --project-ref oxcmkfejolzcyxhgfdhj

# Set SERVICE_ROLE_KEY
supabase secrets set SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Y21rZmVqb2x6Y3l4aGdmZGhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTcyODQ4NCwiZXhwIjoyMDkxMzA0NDg0fQ.GMACF6e30WmHsmawbAbelS-H8k9cvad4erxNhQu0Cmc" --project-ref oxcmkfejolzcyxhgfdhj
```

---

## Verification

After setting secrets, verify they're configured:

```bash
# List all secrets
supabase secrets list --project-ref oxcmkfejolzcyxhgfdhj

# View a specific secret (shows only digest, not value)
supabase secrets get CRON_SECRET --project-ref oxcmkfejolzcyxhgfdhj
```

---

## Comparison: Dev vs Production

| Secret | Development (qqhdpoddfwkqsubmjskg) | Production (oxcmkfejolzcyxhgfdhj) |
|--------|-----------------------------------|-----------------------------------|
| **CRON_SECRET** | 74a656678155...bac36835 | 88798c506791...3abc9773 |
| **RESEND_API_KEY** | re_KoUMwwFD...WgeBZApE | re_KoUMwwFD...WgeBZApE (same) |
| **EMAIL_FROM** | onboarding@resend.dev | onboarding@resend.dev (same) |
| **APP_URL** | http://localhost:3000 | ⚠️ **YOUR PRODUCTION URL** |
| **SUPABASE_URL** | qqhdpoddfwkqsubmjskg.supabase.co | oxcmkfejolzcyxhgfdhj.supabase.co |
| **SERVICE_ROLE_KEY** | HzQ7tcsIE_dgS2...F8a33xgY | GMACF6e30WmHsm...fRgxZ6IoSGcgQU |

---

## Security Notes

1. **CRON_SECRET**: Each environment has a unique secret for security
2. **SERVICE_ROLE_KEY**: Never commit to Git, never expose to client
3. **RESEND_API_KEY**: Can be shared across environments or separate for production
4. **APP_URL**: Must match your actual production domain for email links to work

---

## Next Steps After Setting Secrets

1. ✅ Set all secrets (using script or manually)
2. ✅ Verify secrets are set: `supabase secrets list --project-ref oxcmkfejolzcyxhgfdhj`
3. 🔄 Deploy Edge Function: `supabase functions deploy interview-reminders --project-ref oxcmkfejolzcyxhgfdhj`
4. 🔄 Apply pg_cron migration (see PHASE4_PGCRON_DEPLOYMENT_GUIDE.md)
5. 🧪 Test interview reminders in production

---

## Troubleshooting

### Issue: "Env name cannot start with SUPABASE_"
**Solution:** This is expected. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-configured by Supabase. Use `SERVICE_ROLE_KEY` instead of `SUPABASE_SERVICE_ROLE_KEY`.

### Issue: Email links go to wrong domain
**Solution:** Double-check APP_URL is set to your production domain.

### Issue: Email sending fails
**Solution:** 
- Verify RESEND_API_KEY is correct
- If using custom domain, verify it in Resend dashboard
- Check Edge Function logs: `supabase functions logs interview-reminders --project-ref oxcmkfejolzcyxhgfdhj`

---

## Important URLs

- **Production Supabase Dashboard**: https://supabase.com/dashboard/project/oxcmkfejolzcyxhgfdhj
- **Edge Functions**: https://supabase.com/dashboard/project/oxcmkfejolzcyxhgfdhj/functions
- **SQL Editor**: https://supabase.com/dashboard/project/oxcmkfejolzcyxhgfdhj/sql/new
- **Logs**: https://supabase.com/dashboard/project/oxcmkfejolzcyxhgfdhj/logs/edge-functions

---

**Last Updated:** May 23, 2026  
**Production Project:** jobgenie-web (oxcmkfejolzcyxhgfdhj)
