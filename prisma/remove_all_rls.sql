-- =====================================================
-- REMOVE ALL RLS POLICIES AND DISABLE RLS
-- =====================================================
-- ⚠️ WARNING: This removes ALL security from your database!
-- Only use this for testing/debugging. NEVER in production!
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL POLICIES
-- =====================================================

-- Users table
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Users can insert during registration" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "MIS can view all users" ON users;
DROP POLICY IF EXISTS "MIS can update any user" ON users;

-- Candidates table
DROP POLICY IF EXISTS "Candidates can view own profile" ON candidates;
DROP POLICY IF EXISTS "Candidates can insert own profile" ON candidates;
DROP POLICY IF EXISTS "Candidates can update own profile" ON candidates;
DROP POLICY IF EXISTS "Candidates can delete own profile" ON candidates;
DROP POLICY IF EXISTS "Employers can view approved candidates" ON candidates;
DROP POLICY IF EXISTS "MIS can view all candidates" ON candidates;
DROP POLICY IF EXISTS "MIS can update any candidate" ON candidates;

-- Work Experiences table
DROP POLICY IF EXISTS "Candidates can view own work experiences" ON work_experiences;
DROP POLICY IF EXISTS "Candidates can insert own work experiences" ON work_experiences;
DROP POLICY IF EXISTS "Candidates can update own work experiences" ON work_experiences;
DROP POLICY IF EXISTS "Candidates can delete own work experiences" ON work_experiences;
DROP POLICY IF EXISTS "Employers can view approved candidate work experiences" ON work_experiences;
DROP POLICY IF EXISTS "MIS can view all work experiences" ON work_experiences;

-- Educations table
DROP POLICY IF EXISTS "Candidates can view own educations" ON educations;
DROP POLICY IF EXISTS "Candidates can insert own educations" ON educations;
DROP POLICY IF EXISTS "Candidates can update own educations" ON educations;
DROP POLICY IF EXISTS "Candidates can delete own educations" ON educations;
DROP POLICY IF EXISTS "Employers can view approved candidate educations" ON educations;
DROP POLICY IF EXISTS "MIS can view all educations" ON educations;

-- Awards table
DROP POLICY IF EXISTS "Candidates can view own awards" ON awards;
DROP POLICY IF EXISTS "Candidates can insert own awards" ON awards;
DROP POLICY IF EXISTS "Candidates can update own awards" ON awards;
DROP POLICY IF EXISTS "Candidates can delete own awards" ON awards;
DROP POLICY IF EXISTS "Employers can view approved candidate awards" ON awards;
DROP POLICY IF EXISTS "MIS can view all awards" ON awards;

-- Projects table
DROP POLICY IF EXISTS "Candidates can view own projects" ON projects;
DROP POLICY IF EXISTS "Candidates can insert own projects" ON projects;
DROP POLICY IF EXISTS "Candidates can update own projects" ON projects;
DROP POLICY IF EXISTS "Candidates can delete own projects" ON projects;
DROP POLICY IF EXISTS "Employers can view approved candidate projects" ON projects;
DROP POLICY IF EXISTS "MIS can view all projects" ON projects;

-- Certificates table
DROP POLICY IF EXISTS "Candidates can view own certificates" ON certificates;
DROP POLICY IF EXISTS "Candidates can insert own certificates" ON certificates;
DROP POLICY IF EXISTS "Candidates can update own certificates" ON certificates;
DROP POLICY IF EXISTS "Candidates can delete own certificates" ON certificates;
DROP POLICY IF EXISTS "Employers can view approved candidate certificates" ON certificates;
DROP POLICY IF EXISTS "MIS can view all certificates" ON certificates;

-- Industry Specializations table
DROP POLICY IF EXISTS "Candidates can view own industry specializations" ON industry_specializations;
DROP POLICY IF EXISTS "Candidates can insert own industry specializations" ON industry_specializations;
DROP POLICY IF EXISTS "Candidates can update own industry specializations" ON industry_specializations;
DROP POLICY IF EXISTS "Candidates can delete own industry specializations" ON industry_specializations;
DROP POLICY IF EXISTS "Employers can view approved candidate specializations" ON industry_specializations;
DROP POLICY IF EXISTS "MIS can view all specializations" ON industry_specializations;

-- Finance Academic Education table
DROP POLICY IF EXISTS "Candidates can view own finance academic education" ON finance_academic_education;
DROP POLICY IF EXISTS "Candidates can insert own finance academic education" ON finance_academic_education;
DROP POLICY IF EXISTS "Candidates can update own finance academic education" ON finance_academic_education;
DROP POLICY IF EXISTS "Candidates can delete own finance academic education" ON finance_academic_education;
DROP POLICY IF EXISTS "Employers can view approved candidate finance academic education" ON finance_academic_education;
DROP POLICY IF EXISTS "MIS can view all finance academic education" ON finance_academic_education;

-- Finance Professional Education table
DROP POLICY IF EXISTS "Candidates can view own finance professional education" ON finance_professional_education;
DROP POLICY IF EXISTS "Candidates can insert own finance professional education" ON finance_professional_education;
DROP POLICY IF EXISTS "Candidates can update own finance professional education" ON finance_professional_education;
DROP POLICY IF EXISTS "Candidates can delete own finance professional education" ON finance_professional_education;
DROP POLICY IF EXISTS "Employers can view approved candidate finance professional education" ON finance_professional_education;
DROP POLICY IF EXISTS "MIS can view all finance professional education" ON finance_professional_education;

-- Banking Academic Education table
DROP POLICY IF EXISTS "Candidates can view own banking academic education" ON banking_academic_education;
DROP POLICY IF EXISTS "Candidates can insert own banking academic education" ON banking_academic_education;
DROP POLICY IF EXISTS "Candidates can update own banking academic education" ON banking_academic_education;
DROP POLICY IF EXISTS "Candidates can delete own banking academic education" ON banking_academic_education;
DROP POLICY IF EXISTS "Employers can view approved candidate banking academic education" ON banking_academic_education;
DROP POLICY IF EXISTS "MIS can view all banking academic education" ON banking_academic_education;

-- Banking Professional Education table
DROP POLICY IF EXISTS "Candidates can view own banking professional education" ON banking_professional_education;
DROP POLICY IF EXISTS "Candidates can insert own banking professional education" ON banking_professional_education;
DROP POLICY IF EXISTS "Candidates can update own banking professional education" ON banking_professional_education;
DROP POLICY IF EXISTS "Candidates can delete own banking professional education" ON banking_professional_education;
DROP POLICY IF EXISTS "Employers can view approved candidate banking professional education" ON banking_professional_education;
DROP POLICY IF EXISTS "MIS can view all banking professional education" ON banking_professional_education;

-- Banking Specialized Training table
DROP POLICY IF EXISTS "Candidates can view own banking specialized training" ON banking_specialized_training;
DROP POLICY IF EXISTS "Candidates can insert own banking specialized training" ON banking_specialized_training;
DROP POLICY IF EXISTS "Candidates can update own banking specialized training" ON banking_specialized_training;
DROP POLICY IF EXISTS "Candidates can delete own banking specialized training" ON banking_specialized_training;
DROP POLICY IF EXISTS "Employers can view approved candidate banking specialized training" ON banking_specialized_training;
DROP POLICY IF EXISTS "MIS can view all banking specialized training" ON banking_specialized_training;

-- Employers table
DROP POLICY IF EXISTS "Employers can view own profile" ON employers;
DROP POLICY IF EXISTS "Employers can insert own profile" ON employers;
DROP POLICY IF EXISTS "Employers can update own profile" ON employers;
DROP POLICY IF EXISTS "Employers can delete own profile" ON employers;
DROP POLICY IF EXISTS "MIS can view all employers" ON employers;
DROP POLICY IF EXISTS "MIS can update any employer" ON employers;

-- Companies table
DROP POLICY IF EXISTS "Employers can view own company" ON companies;
DROP POLICY IF EXISTS "Employers can insert company" ON companies;
DROP POLICY IF EXISTS "Employers can update own company" ON companies;
DROP POLICY IF EXISTS "Employers can delete own company" ON companies;
DROP POLICY IF EXISTS "MIS can view all companies" ON companies;
DROP POLICY IF EXISTS "MIS can update any company" ON companies;

-- Jobs table
DROP POLICY IF EXISTS "Employers can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Employers can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Employers can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Employers can delete own jobs" ON jobs;
DROP POLICY IF EXISTS "Candidates can view published jobs" ON jobs;
DROP POLICY IF EXISTS "MIS can view all jobs" ON jobs;
DROP POLICY IF EXISTS "MIS can update any job" ON jobs;

-- MIS User table
DROP POLICY IF EXISTS "MIS can view own record" ON mis_user;
DROP POLICY IF EXISTS "MIS can insert during invitation" ON mis_user;
DROP POLICY IF EXISTS "MIS can update own record" ON mis_user;
DROP POLICY IF EXISTS "MIS can view all MIS users" ON mis_user;

-- =====================================================
-- STEP 2: DISABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE employers DISABLE ROW LEVEL SECURITY;
ALTER TABLE mis_user DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- Candidate related tables
ALTER TABLE work_experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE educations DISABLE ROW LEVEL SECURITY;
ALTER TABLE awards DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE industry_specializations DISABLE ROW LEVEL SECURITY;

-- Finance/Banking education tables
ALTER TABLE finance_academic_education DISABLE ROW LEVEL SECURITY;
ALTER TABLE finance_professional_education DISABLE ROW LEVEL SECURITY;
ALTER TABLE banking_academic_education DISABLE ROW LEVEL SECURITY;
ALTER TABLE banking_professional_education DISABLE ROW LEVEL SECURITY;
ALTER TABLE banking_specialized_training DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- All RLS policies have been removed and RLS is disabled.
-- Your database is now COMPLETELY OPEN - no security!
--
-- ⚠️ SECURITY WARNING:
-- - Anyone with database access can read/modify ALL data
-- - Use ONLY for local development/testing
-- - NEVER do this in production!
--
-- To re-enable security, run: complete_rls_policies.sql
-- =====================================================
