# Row Level Security (RLS) Management Guide

## 🔥 Critical Understanding

**RLS policies are NOT part of your database schema** - they are **security rules** that exist separately from tables, columns, and indexes.

### Why Migrations Remove Your Policies

When you run `prisma migrate dev`:
- ✅ Prisma manages: tables, columns, indexes, foreign keys, enums
- ❌ Prisma does NOT manage: RLS policies, triggers, functions

**Result:** Your RLS policies are NOT automatically reapplied after migrations.

---

## 📋 Required Workflow

### After Every Migration

```bash
# 1. Run Prisma migration
npx prisma migrate dev

# 2. Apply RLS policies manually
# Go to Supabase Dashboard → SQL Editor
# Copy and execute: prisma/complete_rls_policies.sql
```

---

## 🚀 Quick Fix for Current Issues

### Step 1: Apply Complete RLS Policies

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Navigate to: **SQL Editor**
3. Copy the entire content of `prisma/complete_rls_policies.sql`
4. Paste and **Run** the SQL
5. Verify you see "Success. No rows returned"

### Step 2: Verify Policies Are Applied

Run this query in SQL Editor:

```sql
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

You should see policies for **all 21 tables** in your schema.

### Step 3: Test Your Application

- **Candidates**: Login and try to edit profile, add work experience
- **Employers**: Login and try to create a job posting
- **Monitor**: Check browser console for RLS violation errors

---

## 📊 Tables Requiring RLS Policies

### Core User Tables (4)
- ✅ `users` - User authentication
- ✅ `candidates` - Candidate profiles
- ✅ `employers` - Employer profiles  
- ✅ `mis_user` - MIS admin users

### Candidate Profile Tables (6)
- ✅ `work_experiences` - Work history
- ✅ `educations` - General education
- ✅ `awards` - Awards & achievements
- ✅ `projects` - IT projects
- ✅ `certificates` - IT certifications
- ✅ `industry_specializations` - Industry-specific specializations

### Finance/Banking Education Tables (5)
- ✅ `finance_academic_education` - Finance degrees
- ✅ `finance_professional_education` - Finance certifications
- ✅ `banking_academic_education` - Banking degrees
- ✅ `banking_professional_education` - Banking certifications
- ✅ `banking_specialized_training` - Banking training programs

### Company & Jobs Tables (2)
- ✅ `companies` - Company profiles
- ✅ `jobs` - Job postings

**Total: 21 tables, all covered in `complete_rls_policies.sql`**

---

## 🔒 Policy Structure

Each table has policies for different user roles:

### Candidates
- **SELECT**: View their own data only
- **INSERT**: Create their own records
- **UPDATE**: Modify their own data
- **DELETE**: Remove their own records

### Employers
- **SELECT**: View own company, own jobs, approved candidates
- **INSERT**: Create jobs
- **UPDATE**: Modify own jobs and company
- **DELETE**: Remove own jobs

### MIS Users (Admins)
- **SELECT**: View ALL data across all tables
- **UPDATE**: Modify any record (for approvals, status changes)

---

## ⚠️ Common RLS Violations

### Error: "new row violates row-level security policy"

**Cause**: Missing INSERT policy for the table

**Fix**: Apply `complete_rls_policies.sql` which includes INSERT policies for all tables

### Error: "Failed to fetch" or empty results

**Cause**: Missing SELECT policy or incorrect user role check

**Fix**: 
1. Verify user is authenticated: `SELECT auth.uid();` should return a UUID
2. Check policies exist: Use verification query above
3. Ensure user has correct role in `users` table

### Error: "permission denied for table"

**Cause**: RLS is enabled but NO policies exist for that table

**Fix**: Apply `complete_rls_policies.sql` immediately

---

## 🔧 Troubleshooting Commands

### Check if RLS is enabled on tables

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### View all active policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

### Test specific policy (as current user)

```sql
-- Check if you can select from candidates
SELECT * FROM candidates;

-- Check current user ID
SELECT auth.uid();

-- Check if you're in candidates table
SELECT * FROM candidates WHERE user_id = auth.uid();
```

### View policy violations in logs

Go to: **Supabase Dashboard → Logs → Postgres Logs**

Filter for: `row-level security` or `policy`

---

## 🎯 Best Practices

### 1. **Always Apply Policies After Migrations**

Create a checklist:
- [ ] Run `prisma migrate dev`
- [ ] Open Supabase SQL Editor
- [ ] Execute `complete_rls_policies.sql`
- [ ] Verify with policy check query
- [ ] Test application functionality

### 2. **Use Service Role Sparingly**

Your `createAdminClient()` bypasses ALL RLS policies. Use it only for:
- User registration (before user exists)
- Email verification
- Password resets
- MIS admin operations that require full access

For normal operations, use the client-side Supabase client.

### 3. **Test in Development First**

Before deploying to production:
1. Apply policies in development database
2. Test all user flows
3. Monitor for violations
4. Fix any issues
5. Then apply to production

### 4. **Keep Policy File Updated**

When you add new tables:
1. Add them to `schema.prisma`
2. Create migration with `prisma migrate dev`
3. **Update `complete_rls_policies.sql`** with new policies
4. Apply the updated policy file

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

## 🆘 Still Getting Violations?

If you've applied `complete_rls_policies.sql` and still see violations:

1. **Check your application code** - ensure you're using the authenticated Supabase client, not admin client
2. **Verify JWT token** - ensure `auth.uid()` returns a valid UUID
3. **Check user role** - verify the user has the correct role in the `users` table
4. **Review specific policy** - the error message will tell you which table/operation failed
5. **Check Supabase logs** - detailed error messages in Postgres Logs

**Need help?** Share:
- The exact error message
- Which operation failed (SELECT/INSERT/UPDATE/DELETE)
- Which table  
- User role (candidate/employer/mis)
