# REDIRECT LOOP FIX - Critical Issue Found!

## The Problem

Your middleware at line 122-126 queries the `users` table:

```typescript
const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, status')
    .eq('id', user.id)
    .single();
```

**This query is failing** because of RLS policies, causing the redirect loop:
1. User logs in ✅
2. Redirects to `/candidate/dashboard`
3. Middleware runs and queries `users` table
4. **RLS blocks the query** ❌
5. `userError` is set
6. Redirects back to `/login` (line 129-132)
7. User is still authenticated, so redirects to dashboard again
8. **Infinite loop!**

---

## The Solution

Your RLS policy for `users` SELECT is:

```sql
CREATE POLICY "Users can view own record"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

This **should work**, but there might be an issue with how the middleware client is set up.

---

## Quick Fix Option 1: Apply the Policies (If Not Done)

If you haven't applied `complete_rls_policies.sql` yet:

1. Go to Supabase Dashboard → SQL Editor
2. Run the entire `complete_rls_policies.sql` file
3. Try logging in again

---

## Quick Fix Option 2: Verify the Environment Variable

Check your `.env.local` file - line 93 in middleware uses:

```typescript
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
```

**This should be `NEXT_PUBLIC_SUPABASE_ANON_KEY`!**

### Fix the Middleware:

Change line 93 from:
```typescript
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
```

To:
```typescript
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
```

Or check your `.env.local` - do you have:
```
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

It should be:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Quick Fix Option 3: Test Without RLS Check

Temporarily add console logging to see what's failing:

Edit `middleware.ts` at line 128-132:

```typescript
// If user data couldn't be fetched, redirect to login
if (userError || !userData) {
    console.error('=== MIDDLEWARE ERROR ===');
    console.error('Error:', userError);
    console.error('UserData:', userData);
    console.error('User ID:', user.id);
    console.error('========================');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
}
```

Then check your terminal/console to see the exact error.

---

## Most Likely Root Cause

**You haven't applied the RLS policies yet!**

Run this query in Supabase to verify:

```sql
SELECT COUNT(*) 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users';
```

**If it returns 0**, you MUST apply `complete_rls_policies.sql` first!

---

## After Applying Policies

If you've applied the policies and still get the loop, the issue is with the environment variable name mismatch in the middleware (Option 2 above).
