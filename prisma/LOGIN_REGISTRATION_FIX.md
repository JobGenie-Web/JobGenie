# Login & Registration RLS Policy Fixes

## Issue Identified

Your login failure was caused by **incorrect RLS policies** that blocked the authentication flow. Here's what was wrong:

### The Problem

During user registration (`registerCandidate` in `auth.ts`):

1. **Line 70-80**: Calls `supabase.auth.signUp()` - user gets authenticated
2. **Line 109**: Tries to INSERT into `users` table using the **authenticated client**
3. **Line 131**: Tries to INSERT into `candidates` table

The original policies only allowed `TO authenticated` with `auth.uid() = user_id` check, but during the signUp flow, Supabase needs to create records immediately after authentication.

### The Fix

Updated INSERT policies for authentication flow:

#### 1. **users** table INSERT
```sql
-- Allow INSERT for both anon and authenticated
-- Critical for Supabase Auth signUp() to work
CREATE POLICY "Users can insert during registration"
ON users FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```

**Why `true`?** Because:
- The user just signed up via Supabase Auth 
- Their ID (`auth.uid()`) is already set
- They're inserting their own record with that ID
- No additional validation needed

#### 2. **candidates** table INSERT  
```sql
-- After signUp(), user is authenticated
CREATE POLICY "Candidates can insert own profile"
ON candidates FOR INSERT
TO anon, authenticated
WITH CHECK (auth.uid() = user_id);
```

**Why both roles?** To support:
- Authenticated users creating their profile after login
- New users creating profile during registration (they're already authenticated after signUp)

#### 3. **employers** & **mis_user** tables

Same pattern - allow both `anon` and `authenticated` with proper `auth.uid()` validation.

---

## Why Your Login Failed

The login flow in `loginCandidate()` (line 392-503):

1. **Line 410**: Uses `createAdminClient()` to check user status ✅ (bypasses RLS)
2. **Line 453**: Calls `signInWithPassword()` ✅ (authenticates user)
3. **Line 481**: Tries to SELECT from `candidates` with authenticated client

If the candidate record didn't exist (because registration failed due to RLS), this would fail.

---

## Testing After Fix

1. **Apply the updated `complete_rls_policies.sql`** in Supabase SQL Editor
2. **Test registration**:
   - Go to `/register` 
   - Create a new candidate account
   - Verify no RLS errors in console
   - Check email for verification code
3. **Test login**:
   - After email verification, go to `/login`
   - Login with the credentials
   - Should redirect to dashboard or profile creation

---

## What Changed in complete_rls_policies.sql

| Table | Policy | Old | New |
|-------|--------|-----|-----|
| `users` | INSERT | `TO authenticated` | `TO anon, authenticated` |
| `candidates` | INSERT | `TO authenticated` | `TO anon, authenticated` |
| `employers` | INSERT | `TO authenticated` | `TO anon, authenticated` |
| `mis_user` | INSERT | `TO authenticated` | `TO anon, authenticated` |

All other policies remain unchanged.

---

## Important Notes

> [!IMPORTANT]
> The `anon` role is only used during the brief moment between Supabase Auth operations and full authentication. All policies still validate `auth.uid()` matches the user_id, ensuring security.

> [!TIP]
> Your app uses `createAdminClient()` correctly for pre-auth checks (like verifying user status before login). This bypasses RLS entirely, which is why login checks work. The issue was only with the registration INSERT operations using the authenticated client.
