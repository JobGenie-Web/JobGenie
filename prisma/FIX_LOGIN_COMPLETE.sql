-- =============================================
-- COMPLETE FIX FOR LOGIN ISSUES
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- STEP 1: Grant basic permissions
-- =============================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL PRIVILEGES ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- STEP 2: Enable RLS on core tables
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mis_user ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create RLS Policies for USERS table
-- =============================================
DROP POLICY IF EXISTS "Users can view own record" ON users;
CREATE POLICY "Users can view own record"
ON users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- STEP 4: Create RLS Policies for CANDIDATES table
-- =============================================
DROP POLICY IF EXISTS "Candidates can view own profile" ON candidates;
CREATE POLICY "Candidates can view own profile"
ON candidates FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Candidates can insert own profile" ON candidates;
CREATE POLICY "Candidates can insert own profile"
ON candidates FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Candidates can update own profile" ON candidates;
CREATE POLICY "Candidates can update own profile"
ON candidates FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Employers can view approved candidates" ON candidates;
CREATE POLICY "Employers can view approved candidates"
ON candidates FOR SELECT
USING (
  approval_status = 'approved'
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "MIS can view all candidates" ON candidates;
CREATE POLICY "MIS can view all candidates"
ON candidates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- STEP 5: Create RLS Policies for EMPLOYERS table
-- =============================================
DROP POLICY IF EXISTS "Employers can view own profile" ON employers;
CREATE POLICY "Employers can view own profile"
ON employers FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Employers can insert own profile" ON employers;
CREATE POLICY "Employers can insert own profile"
ON employers FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Employers can update own profile" ON employers;
CREATE POLICY "Employers can update own profile"
ON employers FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "MIS can view all employers" ON employers;
CREATE POLICY "MIS can view all employers"
ON employers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- STEP 6: Create RLS Policies for MIS_USER table
-- =============================================
DROP POLICY IF EXISTS "MIS can view own record" ON mis_user;
CREATE POLICY "MIS can view own record"
ON mis_user FOR SELECT
USING (user_id = auth.uid());

-- =============================================
-- VERIFICATION
-- =============================================
-- Check if policies were created successfully
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'candidates', 'employers', 'mis_user')
ORDER BY tablename, policyname;
