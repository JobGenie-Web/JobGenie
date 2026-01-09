# Login Troubleshooting Guide

## Step 1: Verify RLS Policies Are Applied

**CRITICAL**: The policies must be applied to Supabase before anything will work.

### Apply Policies Now:
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Copy the **entire** contents of `complete_rls_policies.sql`
4. Paste into SQL Editor
5. Click **Run**
6. You should see: "Success. No rows returned"

### Verify Policies Exist:

Run this query in SQL Editor to check:

```sql
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'candidates')
ORDER BY tablename, cmd;
```

**Expected Result**: You should see policies for both `users` and `candidates` including INSERT policies.

If you see **0 rows**, the policies are NOT applied - go back to Step 1.

---

## Step 2: Check Specific Error Message

### Where are you seeing the error?

**Option A: In the browser**
- Open Developer Tools (F12)
- Go to **Console** tab
- Try to login
- Copy the **exact error message** you see

**Option B: In the UI**
- What message does the login form show?
- "Invalid email or password"?
- "Row-level security policy violated"?
- Network error?

---

## Step 3: Common Login Issues & Fixes

### Issue 1: "Invalid email or password"

**Possible causes:**
1. User doesn't exist in database
2. Email not verified
3. Wrong password
4. User has wrong role (not a candidate)

**How to check:**
Run this in Supabase SQL Editor:

```sql
-- Replace YOUR_EMAIL with the email you're trying to login with
SELECT 
  email,
  role,
  status,
  email_verified
FROM users 
WHERE email = 'YOUR_EMAIL';
```

**What to look for:**
- Does the user exist? If no rows returned, you need to register first
- `role` should be `'candidate'`
- `email_verified` should be `true`
- `status` should be `'active'`

**Fix if email not verified:**
```sql
-- Replace YOUR_EMAIL
UPDATE users 
SET email_verified = true, 
    status = 'active'
WHERE email = 'YOUR_EMAIL';
```

---

### Issue 2: "New row violates row-level security policy"

**This means:** RLS policies are blocking the operation

**Which table?** The error should mention the table name, like:
- `new row for relation "users" violates row-level security policy`
- `new row for relation "candidates" violates row-level security policy`

**Fix:** Apply the `complete_rls_policies.sql` file (see Step 1)

---

### Issue 3: Network/Connection Errors

**Check:**
1. Is your dev server running? (`npm run dev`)
2. Is Supabase accessible? (check Supabase dashboard)
3. Are environment variables set correctly?

**Verify .env.local:**
```bash
# Check these exist and are correct
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

### Issue 4: Session/Cookie Issues

**Try:**
1. Clear browser cookies for localhost
2. Try in Incognito/Private window
3. Hard refresh the page (Ctrl+Shift+R)

---

## Step 4: Test with Admin Client Bypass

To verify if it's an RLS issue, let's check if the user exists at all.

### Temporary Debug Check:

Add this to your login code temporarily (in `auth.ts`):

```typescript
// At line 414, right after checking userData
console.log("=== DEBUG USER DATA ===");
console.log("User exists:", !!userData);
console.log("Role:", userData?.role);
console.log("Status:", userData?.status);
console.log("Email verified:", userData?.email_verified);
console.log("======================");
```

This will show you if the user lookup is working.

---

## Step 5: Check Supabase Logs

1. Go to Supabase Dashboard
2. Click **Logs** → **Postgres Logs**
3. Filter by: `row-level security` or `policy`
4. Look for recent errors

**Copy the exact error** - it will tell us which table and operation is failing.

---

## Step 6: Nuclear Option - Disable RLS Temporarily

**ONLY FOR TESTING - NOT FOR PRODUCTION**

To test if RLS is the problem:

```sql
-- Disable RLS on users table temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
```

Try to login now. If it works, the issue is definitely RLS policies.

Then **RE-ENABLE** immediately:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
```

And apply the correct policies from `complete_rls_policies.sql`.

---

## Quick Diagnostic Checklist

Run through this checklist and tell me which step fails:

- [ ] Step 1: I applied `complete_rls_policies.sql` in Supabase SQL Editor
- [ ] Step 2: I verified policies exist using the query above
- [ ] Step 3: I confirmed the user exists in the `users` table
- [ ] Step 4: The user's `email_verified` is `true`
- [ ] Step 5: The user's `status` is `'active'`
- [ ] Step 6: The user's `role` is `'candidate'`
- [ ] Step 7: I can see the error in browser console (F12)
- [ ] Step 8: I copied the exact error message

---

## What to Send Me

To help you further, please provide:

1. **Exact error message** from browser console
2. **Result of this query:**
   ```sql
   SELECT email, role, status, email_verified 
   FROM users 
   WHERE email = 'your_email@example.com';
   ```
3. **Result of this query:**
   ```sql
   SELECT COUNT(*) as policy_count
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```
   (Should be > 0 if policies are applied)

4. **Which step in the checklist above fails?**
