-- =====================================================
-- COMPLETE RLS POLICIES FOR ALL TABLES
-- =====================================================
-- This file contains ALL Row Level Security policies for the JobGenie application.
-- Apply this file after EVERY Prisma migration to ensure policies are in place.
--
-- HOW TO USE:
-- 1. After running `prisma migrate dev`, go to Supabase Dashboard
-- 2. Open SQL Editor
-- 3. Copy and paste this entire file
-- 4. Execute
-- 5. Verify "Success" message
--
-- IMPORTANT: Prisma migrations DO NOT manage RLS policies!
-- You MUST apply this file manually after each migration.
-- =====================================================

-- =====================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mis_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Candidate related tables
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_specializations ENABLE ROW LEVEL SECURITY;

-- Finance/Banking education tables
ALTER TABLE finance_academic_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_professional_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_academic_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_professional_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_specialized_training ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: USERS TABLE POLICIES
-- =====================================================

-- Users can view their own user record (must be authenticated)
DROP POLICY IF EXISTS "Users can view own record" ON users;
CREATE POLICY "Users can view own record"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow user INSERT during registration (both anon and authenticated)
-- This is critical for Supabase Auth signUp() to create user records
DROP POLICY IF EXISTS "Users can insert during registration" ON users;
CREATE POLICY "Users can insert during registration"
ON users FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Users can update their own record (must be authenticated)
DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- MIS users can view all users for admin purposes
DROP POLICY IF EXISTS "MIS can view all users" ON users;
CREATE POLICY "MIS can view all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- MIS users can update any user (for status changes, approvals, etc)
DROP POLICY IF EXISTS "MIS can update any user" ON users;
CREATE POLICY "MIS can update any user"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 3: CANDIDATES TABLE POLICIES
-- =====================================================

-- Candidates can view their own profile
DROP POLICY IF EXISTS "Candidates can view own profile" ON candidates;
CREATE POLICY "Candidates can view own profile"
ON candidates FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Candidates can insert their own profile (during registration or after login)
-- After signUp(), user is authenticated, so auth.uid() is available
DROP POLICY IF EXISTS "Candidates can insert own profile" ON candidates;
CREATE POLICY "Candidates can insert own profile"
ON candidates FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Allow if the user_id being inserted matches the authenticated user
  auth.uid() = user_id
);

-- Candidates can update their own profile
DROP POLICY IF EXISTS "Candidates can update own profile" ON candidates;
CREATE POLICY "Candidates can update own profile"
ON candidates FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Candidates can delete their own profile
DROP POLICY IF EXISTS "Candidates can delete own profile" ON candidates;
CREATE POLICY "Candidates can delete own profile"
ON candidates FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Employers can view approved candidates
DROP POLICY IF EXISTS "Employers can view approved candidates" ON candidates;
CREATE POLICY "Employers can view approved candidates"
ON candidates FOR SELECT
TO authenticated
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
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- MIS can update any candidate (for approvals)
DROP POLICY IF EXISTS "MIS can update any candidate" ON candidates;
CREATE POLICY "MIS can update any candidate"
ON candidates FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 4: WORK EXPERIENCES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Candidates can view own work experiences" ON work_experiences;
CREATE POLICY "Candidates can view own work experiences"
ON work_experiences FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own work experiences" ON work_experiences;
CREATE POLICY "Candidates can insert own work experiences"
ON work_experiences FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own work experiences" ON work_experiences;
CREATE POLICY "Candidates can update own work experiences"
ON work_experiences FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own work experiences" ON work_experiences;
CREATE POLICY "Candidates can delete own work experiences"
ON work_experiences FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' work experiences
DROP POLICY IF EXISTS "Employers can view approved candidate work experiences" ON work_experiences;
CREATE POLICY "Employers can view approved candidate work experiences"
ON work_experiences FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all work experiences
DROP POLICY IF EXISTS "MIS can view all work experiences" ON work_experiences;
CREATE POLICY "MIS can view all work experiences"
ON work_experiences FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 5: EDUCATIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Candidates can view own educations" ON educations;
CREATE POLICY "Candidates can view own educations"
ON educations FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own educations" ON educations;
CREATE POLICY "Candidates can insert own educations"
ON educations FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own educations" ON educations;
CREATE POLICY "Candidates can update own educations"
ON educations FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own educations" ON educations;
CREATE POLICY "Candidates can delete own educations"
ON educations FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' educations
DROP POLICY IF EXISTS "Employers can view approved candidate educations" ON educations;
CREATE POLICY "Employers can view approved candidate educations"
ON educations FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all educations
DROP POLICY IF EXISTS "MIS can view all educations" ON educations;
CREATE POLICY "MIS can view all educations"
ON educations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 6: AWARDS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Candidates can view own awards" ON awards;
CREATE POLICY "Candidates can view own awards"
ON awards FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own awards" ON awards;
CREATE POLICY "Candidates can insert own awards"
ON awards FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own awards" ON awards;
CREATE POLICY "Candidates can update own awards"
ON awards FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own awards" ON awards;
CREATE POLICY "Candidates can delete own awards"
ON awards FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' awards
DROP POLICY IF EXISTS "Employers can view approved candidate awards" ON awards;
CREATE POLICY "Employers can view approved candidate awards"
ON awards FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all awards
DROP POLICY IF EXISTS "MIS can view all awards" ON awards;
CREATE POLICY "MIS can view all awards"
ON awards FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 7: PROJECTS TABLE POLICIES (IT Industry)
-- =====================================================

DROP POLICY IF EXISTS "Candidates can view own projects" ON projects;
CREATE POLICY "Candidates can view own projects"
ON projects FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own projects" ON projects;
CREATE POLICY "Candidates can insert own projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own projects" ON projects;
CREATE POLICY "Candidates can update own projects"
ON projects FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own projects" ON projects;
CREATE POLICY "Candidates can delete own projects"
ON projects FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' projects
DROP POLICY IF EXISTS "Employers can view approved candidate projects" ON projects;
CREATE POLICY "Employers can view approved candidate projects"
ON projects FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all projects
DROP POLICY IF EXISTS "MIS can view all projects" ON projects;
CREATE POLICY "MIS can view all projects"
ON projects FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 8: CERTIFICATES TABLE POLICIES (IT Industry)
-- =====================================================

DROP POLICY IF EXISTS "Candidates can view own certificates" ON certificates;
CREATE POLICY "Candidates can view own certificates"
ON certificates FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own certificates" ON certificates;
CREATE POLICY "Candidates can insert own certificates"
ON certificates FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own certificates" ON certificates;
CREATE POLICY "Candidates can update own certificates"
ON certificates FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own certificates" ON certificates;
CREATE POLICY "Candidates can delete own certificates"
ON certificates FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' certificates
DROP POLICY IF EXISTS "Employers can view approved candidate certificates" ON certificates;
CREATE POLICY "Employers can view approved candidate certificates"
ON certificates FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all certificates
DROP POLICY IF EXISTS "MIS can view all certificates" ON certificates;
CREATE POLICY "MIS can view all certificates"
ON certificates FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 9: INDUSTRY SPECIALIZATIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Candidates can view own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can view own industry specializations"
ON industry_specializations FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can insert own industry specializations"
ON industry_specializations FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can update own industry specializations"
ON industry_specializations FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can delete own industry specializations"
ON industry_specializations FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' specializations
DROP POLICY IF EXISTS "Employers can view approved candidate specializations" ON industry_specializations;
CREATE POLICY "Employers can view approved candidate specializations"
ON industry_specializations FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all specializations
DROP POLICY IF EXISTS "MIS can view all specializations" ON industry_specializations;
CREATE POLICY "MIS can view all specializations"
ON industry_specializations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 10: FINANCE ACADEMIC EDUCATION TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Candidates can view own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can view own finance academic education"
ON finance_academic_education FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can insert own finance academic education"
ON finance_academic_education FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can update own finance academic education"
ON finance_academic_education FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can delete own finance academic education"
ON finance_academic_education FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' finance academic education
DROP POLICY IF EXISTS "Employers can view approved candidate finance academic education" ON finance_academic_education;
CREATE POLICY "Employers can view approved candidate finance academic education"
ON finance_academic_education FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all finance academic education
DROP POLICY IF EXISTS "MIS can view all finance academic education" ON finance_academic_education;
CREATE POLICY "MIS can view all finance academic education"
ON finance_academic_education FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 11: FINANCE PROFESSIONAL EDUCATION TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Candidates can view own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can view own finance professional education"
ON finance_professional_education FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can insert own finance professional education"
ON finance_professional_education FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can update own finance professional education"
ON finance_professional_education FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can delete own finance professional education"
ON finance_professional_education FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' finance professional education
DROP POLICY IF EXISTS "Employers can view approved candidate finance professional education" ON finance_professional_education;
CREATE POLICY "Employers can view approved candidate finance professional education"
ON finance_professional_education FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all finance professional education
DROP POLICY IF EXISTS "MIS can view all finance professional education" ON finance_professional_education;
CREATE POLICY "MIS can view all finance professional education"
ON finance_professional_education FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 12: BANKING ACADEMIC EDUCATION TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Candidates can view own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can view own banking academic education"
ON banking_academic_education FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can insert own banking academic education"
ON banking_academic_education FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can update own banking academic education"
ON banking_academic_education FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can delete own banking academic education"
ON banking_academic_education FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' banking academic education
DROP POLICY IF EXISTS "Employers can view approved candidate banking academic education" ON banking_academic_education;
CREATE POLICY "Employers can view approved candidate banking academic education"
ON banking_academic_education FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all banking academic education
DROP POLICY IF EXISTS "MIS can view all banking academic education" ON banking_academic_education;
CREATE POLICY "MIS can view all banking academic education"
ON banking_academic_education FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 13: BANKING PROFESSIONAL EDUCATION TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Candidates can view own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can view own banking professional education"
ON banking_professional_education FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can insert own banking professional education"
ON banking_professional_education FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can update own banking professional education"
ON banking_professional_education FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can delete own banking professional education"
ON banking_professional_education FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' banking professional education
DROP POLICY IF EXISTS "Employers can view approved candidate banking professional education" ON banking_professional_education;
CREATE POLICY "Employers can view approved candidate banking professional education"
ON banking_professional_education FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all banking professional education
DROP POLICY IF EXISTS "MIS can view all banking professional education" ON banking_professional_education;
CREATE POLICY "MIS can view all banking professional education"
ON banking_professional_education FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 14: BANKING SPECIALIZED TRAINING TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Candidates can view own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can view own banking specialized training"
ON banking_specialized_training FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can insert own banking specialized training"
ON banking_specialized_training FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can update own banking specialized training"
ON banking_specialized_training FOR UPDATE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can delete own banking specialized training"
ON banking_specialized_training FOR DELETE
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' banking specialized training
DROP POLICY IF EXISTS "Employers can view approved candidate banking specialized training" ON banking_specialized_training;
CREATE POLICY "Employers can view approved candidate banking specialized training"
ON banking_specialized_training FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all banking specialized training
DROP POLICY IF EXISTS "MIS can view all banking specialized training" ON banking_specialized_training;
CREATE POLICY "MIS can view all banking specialized training"
ON banking_specialized_training FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 15: EMPLOYERS TABLE POLICIES
-- =====================================================

-- Employers can view their own profile
DROP POLICY IF EXISTS "Employers can view own profile" ON employers;
CREATE POLICY "Employers can view own profile"
ON employers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Employers can insert their own profile (during registration or after login)
DROP POLICY IF EXISTS "Employers can insert own profile" ON employers;
CREATE POLICY "Employers can insert own profile"
ON employers FOR INSERT
TO anon, authenticated
WITH CHECK (auth.uid() = user_id);

-- Employers can update their own profile
DROP POLICY IF EXISTS "Employers can update own profile" ON employers;
CREATE POLICY "Employers can update own profile"
ON employers FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Employers can delete their own profile
DROP POLICY IF EXISTS "Employers can delete own profile" ON employers;
CREATE POLICY "Employers can delete own profile"
ON employers FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- MIS can view all employers
DROP POLICY IF EXISTS "MIS can view all employers" ON employers;
CREATE POLICY "MIS can view all employers"
ON employers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- MIS can update any employer
DROP POLICY IF EXISTS "MIS can update any employer" ON employers;
CREATE POLICY "MIS can update any employer"
ON employers FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 16: COMPANIES TABLE POLICIES
-- =====================================================

-- Employers from the company can view their company
DROP POLICY IF EXISTS "Employers can view own company" ON companies;
CREATE POLICY "Employers can view own company"
ON companies FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT company_id FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can insert a company during registration
DROP POLICY IF EXISTS "Employers can insert company" ON companies;
CREATE POLICY "Employers can insert company"
ON companies FOR INSERT
TO authenticated
WITH CHECK (true);

-- Employers from the company can update their company
DROP POLICY IF EXISTS "Employers can update own company" ON companies;
CREATE POLICY "Employers can update own company"
ON companies FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT company_id FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can delete their company
DROP POLICY IF EXISTS "Employers can delete own company" ON companies;
CREATE POLICY "Employers can delete own company"
ON companies FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT company_id FROM employers WHERE user_id = auth.uid()
  )
);

-- MIS can view all companies
DROP POLICY IF EXISTS "MIS can view all companies" ON companies;
CREATE POLICY "MIS can view all companies"
ON companies FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- MIS can update any company (for approvals)
DROP POLICY IF EXISTS "MIS can update any company" ON companies;
CREATE POLICY "MIS can update any company"
ON companies FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 17: JOBS TABLE POLICIES
-- =====================================================

-- Employers can view their own company's jobs
DROP POLICY IF EXISTS "Employers can view own jobs" ON jobs;
CREATE POLICY "Employers can view own jobs"
ON jobs FOR SELECT
TO authenticated
USING (
  employer_id IN (
    SELECT id FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can create jobs for their company
DROP POLICY IF EXISTS "Employers can insert jobs" ON jobs;
CREATE POLICY "Employers can insert jobs"
ON jobs FOR INSERT
TO authenticated
WITH CHECK (
  employer_id IN (
    SELECT id FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can update their own jobs
DROP POLICY IF EXISTS "Employers can update own jobs" ON jobs;
CREATE POLICY "Employers can update own jobs"
ON jobs FOR UPDATE
TO authenticated
USING (
  employer_id IN (
    SELECT id FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can delete their own jobs
DROP POLICY IF EXISTS "Employers can delete own jobs" ON jobs;
CREATE POLICY "Employers can delete own jobs"
ON jobs FOR DELETE
TO authenticated
USING (
  employer_id IN (
    SELECT id FROM employers WHERE user_id = auth.uid()
  )
);

-- Candidates can view published jobs
DROP POLICY IF EXISTS "Candidates can view published jobs" ON jobs;
CREATE POLICY "Candidates can view published jobs"
ON jobs FOR SELECT
TO authenticated
USING (
  status = 'published'
  AND EXISTS (
    SELECT 1 FROM candidates WHERE user_id = auth.uid()
  )
);

-- MIS can view all jobs
DROP POLICY IF EXISTS "MIS can view all jobs" ON jobs;
CREATE POLICY "MIS can view all jobs"
ON jobs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- MIS can update any job
DROP POLICY IF EXISTS "MIS can update any job" ON jobs;
CREATE POLICY "MIS can update any job"
ON jobs FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 18: MIS_USER TABLE POLICIES
-- =====================================================

-- MIS users can view their own record
DROP POLICY IF EXISTS "MIS can view own record" ON mis_user;
CREATE POLICY "MIS can view own record"
ON mis_user FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow MIS user creation during invitation/registration flow
DROP POLICY IF EXISTS "MIS can insert during invitation" ON mis_user;
CREATE POLICY "MIS can insert during invitation"
ON mis_user FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- MIS users can update their own record
DROP POLICY IF EXISTS "MIS can update own record" ON mis_user;
CREATE POLICY "MIS can update own record"
ON mis_user FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- MIS users can view all other MIS users
DROP POLICY IF EXISTS "MIS can view all MIS users" ON mis_user;
CREATE POLICY "MIS can view all MIS users"
ON mis_user FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- POLICIES APPLIED SUCCESSFULLY!
-- =====================================================
-- Next steps:
-- 1. Verify policies with: SELECT * FROM pg_policies WHERE schemaname = 'public';
-- 2. Test candidate operations (view/edit profile, work experience, etc)
-- 3. Test employer operations (create jobs, view candidates)
-- 4. Test MIS operations (view all data, approve candidates/companies)
-- 5. Monitor for any RLS violations in Supabase logs
-- =====================================================
