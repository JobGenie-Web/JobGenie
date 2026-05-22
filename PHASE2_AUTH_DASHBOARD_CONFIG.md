# Phase 2c: Supabase Auth Dashboard Configuration

This document provides step-by-step instructions for configuring Supabase Auth settings in the Dashboard. These settings must be configured for **both** development and production environments.

## Environments

| Environment | Supabase Project | Project Ref | Region |
|-------------|------------------|-------------|--------|
| Development | `qqhdpoddfwkqsubmjskg` | [Dashboard Link](https://supabase.com/dashboard/project/qqhdpoddfwkqsubmjskg) | ap-southeast-2 (Sydney) |
| Production | `oxcmkfejolzcyxhgfdhj` | [Dashboard Link](https://supabase.com/dashboard/project/oxcmkfejolzcyxhgfdhj) | ap-northeast-1 (Tokyo) |

## Configuration Steps

### 1. Password Security Settings

Navigate to: **Dashboard → Authentication → Policies**

1. **Enable Leaked Password Protection**
   - Toggle ON "Leaked Password Protection"
   - This integrates with HaveIBeenPwned.org to prevent users from using compromised passwords
   - No API key required (Supabase handles this)

2. **Password Strength Requirements**
   - Set **Minimum Password Length**: `8` characters
   - Enable **Require Special Character**: ✅ ON
   - Enable **Require Number**: ✅ ON
   - Enable **Require Uppercase**: ✅ ON
   - Enable **Require Lowercase**: ✅ ON

### 2. JWT & Session Configuration

Navigate to: **Dashboard → Authentication → Settings → Security**

1. **JWT Expiry**
   - Current default: `3600` seconds (1 hour)
   - Recommended: `3600` (1 hour) for production
   - Rationale: Balances security (shorter tokens) with UX (fewer re-logins)

2. **Refresh Token Settings**
   - **Refresh Token Rotation**: ✅ Enabled (should be default)
   - **Refresh Token Reuse Interval**: `10` seconds (default)
   - This prevents token theft attacks by rotating refresh tokens on each use

3. **Session Timeout**
   - **Inactive Session Timeout**: Keep default or set to `604800` (7 days)
   - Users will need to re-authenticate after 7 days of inactivity

### 3. SMTP Configuration (Resend Integration)

Navigate to: **Dashboard → Authentication → Settings → SMTP Settings**

> **Note**: This will be fully configured in Phase 3 when Resend is integrated. For now, verify current settings.

Current Configuration:
- Using Gmail SMTP (`smtp.gmail.com`)
- Will be replaced with Resend SMTP relay in Phase 3

**Phase 3 Configuration (for reference)**:
```
SMTP Host: smtp.resend.com
SMTP Port: 465 (SSL) or 587 (STARTTLS)
Username: resend
Password: [Your Resend API Key - re_...]
From Email: noreply@yourdomain.com
```

### 4. Email Templates Review

Navigate to: **Dashboard → Authentication → Email Templates**

Verify that all email templates are configured correctly:
- ✅ **Confirmation Email** (email verification)
- ✅ **Magic Link** (passwordless login, if enabled)
- ✅ **Reset Password** (password reset)
- ✅ **Invite User** (MIS invitations)

**Action Required**: Update all template links to use production domain in production environment:
- Replace `http://localhost:3000` with `https://your-production-domain.com`
- This is now handled automatically via `NEXT_PUBLIC_APP_URL` env var

### 5. Security Best Practices Verification

Navigate to: **Dashboard → Authentication → Settings**

Verify these settings are configured:
- ✅ **Disable Signup**: OFF (allow public signup for candidates/employers)
- ✅ **Email Confirmations**: ON (require email verification)
- ✅ **Secure Email Change**: ON (require confirmation for email changes)
- ✅ **Email Double Confirm**: ON (send confirmation to both old and new emails)

### 6. Rate Limiting (Optional but Recommended)

Navigate to: **Dashboard → Authentication → Settings → Security**

Configure rate limiting to prevent abuse:
- **Email Sends**: `4` emails per hour per user (default)
- **SMS Sends**: Not used (can leave at default)
- **Verify Attempts**: `10` attempts per hour (default)

## Verification Checklist

After completing all configurations, verify:

- [ ] Leaked Password Protection is enabled in both dev and prod
- [ ] Password complexity requirements are enforced
- [ ] JWT expiry is set to 3600 seconds (1 hour)
- [ ] Refresh token rotation is enabled
- [ ] All email templates use correct domain URLs
- [ ] Email confirmations are required
- [ ] Rate limiting is configured

## Testing After Configuration

1. **Test Password Requirements**:
   - Try creating an account with a weak password (should fail)
   - Try creating an account with a leaked password like `password123` (should fail)
   - Create an account with a strong password (should succeed)

2. **Test JWT Expiry**:
   - Log in and wait 1 hour
   - Verify session is automatically refreshed with refresh token
   - Check browser dev tools → Application → Cookies for `sb-access-token` and `sb-refresh-token`

3. **Test Email Flows**:
   - Sign up → verify email confirmation is sent
   - Request password reset → verify reset email is sent
   - Change email → verify confirmation is required

## Notes

- These settings should be identical in both **development** (`qqhdpoddfwkqsubmjskg`) and **production** (`oxcmkfejolzcyxhgfdhj`) projects
- Changes to auth settings take effect immediately (no restart required)
- JWT expiry only affects newly issued tokens (existing tokens will expire based on their original expiry time)
- Always test in development before applying to production

## Next Steps

After completing Phase 2c:
- ✅ Phase 2a: Fixed `next.config.ts` hostname (completed)
- ✅ Phase 2b: Fixed middleware key inconsistency (completed)
- ✅ Phase 2b: Added `NEXT_PUBLIC_APP_URL` to `.env.local` (completed)
- 🔄 Phase 2c: Configure Auth Dashboard settings (manual - use this guide)
- ⏭️ **Next**: Phase 3 - Resend Email Integration (replaces Gmail SMTP)
