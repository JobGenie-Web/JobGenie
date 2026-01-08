-- =============================================
-- RLS POLICIES FOR CORE AUTHENTICATION TABLES
-- CRITICAL: Run this FIRST before other RLS policies
-- =============================================

-- Enable RLS on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mis_user ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Allow users to read their own user record
DROP POLICY IF EXISTS "Users can view own record" ON users;
CREATE POLICY "Users can view own record"
ON users FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own record (limited fields)
DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =============================================
-- CANDIDATES TABLE POLICIES
-- =============================================

-- Candidates can view their own profile
DROP POLICY IF EXISTS "Candidates can view own profile" ON candidates;
CREATE POLICY "Candidates can view own profile"
ON candidates FOR SELECT
USING (user_id = auth.uid());

-- Candidates can insert their own profile
DROP POLICY IF EXISTS "Candidates can insert own profile" ON candidates;
CREATE POLICY "Candidates can insert own profile"
ON candidates FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Candidates can update their own profile
DROP POLICY IF EXISTS "Candidates can update own profile" ON candidates;
CREATE POLICY "Candidates can update own profile"
ON candidates FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Employers can view approved candidates
DROP POLICY IF EXISTS "Employers can view approved candidates" ON candidates;
CREATE POLICY "Employers can view approved candidates"
ON candidates FOR SELECT
USING (
  approval_status = 'approved'
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all candidates
DROP POLICY IF EXISTS "MIS can view all candidates" ON candidates;
CREATE POLICY "MIS can view all candidates"
ON candidates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =============================================
-- EMPLOYERS TABLE POLICIES
-- =============================================

-- Employers can view their own profile
DROP POLICY IF EXISTS "Employers can view own profile" ON employers;
CREATE POLICY "Employers can view own profile"
ON employers FOR SELECT
USING (user_id = auth.uid());

-- Employers can insert their own profile
DROP POLICY IF EXISTS "Employers can insert own profile" ON employers;
CREATE POLICY "Employers can insert own profile"
ON employers FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Employers can update their own profile
DROP POLICY IF EXISTS "Employers can update own profile" ON employers;
CREATE POLICY "Employers can update own profile"
ON employers FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- MIS can view all employers
DROP POLICY IF EXISTS "MIS can view all employers" ON employers;
CREATE POLICY "MIS can view all employers"
ON employers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =============================================
-- MIS_USER TABLE POLICIES
-- =============================================

-- MIS users can view their own record
DROP POLICY IF EXISTS "MIS can view own record" ON mis_user;
CREATE POLICY "MIS can view own record"
ON mis_user FOR SELECT
USING (user_id = auth.uid());

-- =============================================
-- IMPORTANT NOTES
-- =============================================
-- 1. These policies allow authenticated users to read their own data
-- 2. service_role bypasses all RLS policies (used in server-side code)
-- 3. anon role has minimal SELECT access (controlled separately)
-- 4. Make sure to run fix_permissions.sql BEFORE this file
