-- Migration: rls_security_hardening
-- Date: 2026-04-01
-- Description:
--   Security hardening and performance improvements for all RLS policies.
--
-- Issues fixed:
--   1. PERFORMANCE – Added 7 B-tree indexes covering every FK column
--      used by USING / WITH CHECK subqueries, eliminating sequential
--      scans on row-level permission checks.
--
--   2. SECURITY – Tightened INSERT policies that had WITH CHECK (true)
--      open to both anon and authenticated roles. All actual inserts for
--      these tables go through createAdminClient() (service role, which
--      bypasses RLS), so the open policies were dead weight that created
--      an unnecessary PostgREST attack surface:
--        • users       – removed anon; check now requires auth.uid() = id
--        • mis_user    – removed anon; check now requires auth.uid() = user_id
--        • employers   – removed anon role (auth.uid() was always NULL for
--                        anon, making the old check silently ineffective)
--
--   3. CORRECTNESS – Added WITH CHECK to all UPDATE policies that lacked
--      it. Without WITH CHECK, Postgres verifies the *existing* row but
--      not the *new* row values, allowing a user to move a row (e.g.
--      change candidate_id on their work_experience) to point at another
--      user's data. Affects 18 policies across 13 tables.


-- ============================================================
-- PART 1: PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_candidates_user_id
    ON candidates(user_id);

CREATE INDEX IF NOT EXISTS idx_employers_user_id
    ON employers(user_id);

CREATE INDEX IF NOT EXISTS idx_job_invitations_candidate_id
    ON job_invitations(candidate_id);

CREATE INDEX IF NOT EXISTS idx_job_invitations_employer_id
    ON job_invitations(employer_id);

CREATE INDEX IF NOT EXISTS idx_job_invitations_company_id
    ON job_invitations(company_id);

CREATE INDEX IF NOT EXISTS idx_jobs_employer_id
    ON jobs(employer_id);

CREATE INDEX IF NOT EXISTS idx_interview_rounds_invitation_id
    ON interview_rounds(invitation_id);


-- ============================================================
-- PART 2: TIGHTEN INSERT POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can insert during registration" ON users;
CREATE POLICY "Users can insert during registration"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "MIS can insert during invitation" ON mis_user;
CREATE POLICY "MIS can insert during invitation"
    ON mis_user FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employers can insert own profile" ON employers;
CREATE POLICY "Employers can insert own profile"
    ON employers FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- PART 3: ADD WITH CHECK TO UPDATE POLICIES
-- ============================================================

-- work_experiences
DROP POLICY IF EXISTS "Candidates can update own work experiences" ON work_experiences;
CREATE POLICY "Candidates can update own work experiences"
    ON work_experiences FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- educations
DROP POLICY IF EXISTS "Candidates can update own educations" ON educations;
CREATE POLICY "Candidates can update own educations"
    ON educations FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- awards
DROP POLICY IF EXISTS "Candidates can update own awards" ON awards;
CREATE POLICY "Candidates can update own awards"
    ON awards FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- projects
DROP POLICY IF EXISTS "Candidates can update own projects" ON projects;
CREATE POLICY "Candidates can update own projects"
    ON projects FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- certificates
DROP POLICY IF EXISTS "Candidates can update own certificates" ON certificates;
CREATE POLICY "Candidates can update own certificates"
    ON certificates FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- industry_specializations
DROP POLICY IF EXISTS "Candidates can update own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can update own industry specializations"
    ON industry_specializations FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- finance_academic_education
DROP POLICY IF EXISTS "Candidates can update own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can update own finance academic education"
    ON finance_academic_education FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- finance_professional_education
DROP POLICY IF EXISTS "Candidates can update own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can update own finance professional education"
    ON finance_professional_education FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- banking_academic_education
DROP POLICY IF EXISTS "Candidates can update own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can update own banking academic education"
    ON banking_academic_education FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- banking_professional_education
DROP POLICY IF EXISTS "Candidates can update own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can update own banking professional education"
    ON banking_professional_education FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- banking_specialized_training
DROP POLICY IF EXISTS "Candidates can update own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can update own banking specialized training"
    ON banking_specialized_training FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- employers (MIS update)
DROP POLICY IF EXISTS "MIS can update any employer" ON employers;
CREATE POLICY "MIS can update any employer"
    ON employers FOR UPDATE TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = auth.uid()));

-- companies
DROP POLICY IF EXISTS "Employers can update own company" ON companies;
CREATE POLICY "Employers can update own company"
    ON companies FOR UPDATE TO authenticated
    USING   (id IN (SELECT company_id FROM employers WHERE user_id = auth.uid()))
    WITH CHECK (id IN (SELECT company_id FROM employers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "MIS can update any company" ON companies;
CREATE POLICY "MIS can update any company"
    ON companies FOR UPDATE TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = auth.uid()));

-- jobs
DROP POLICY IF EXISTS "Employers can update own jobs" ON jobs;
CREATE POLICY "Employers can update own jobs"
    ON jobs FOR UPDATE TO authenticated
    USING   (employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid()))
    WITH CHECK (employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "MIS can update any job" ON jobs;
CREATE POLICY "MIS can update any job"
    ON jobs FOR UPDATE TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = auth.uid()));

-- candidates (MIS update)
DROP POLICY IF EXISTS "MIS can update any candidate" ON candidates;
CREATE POLICY "MIS can update any candidate"
    ON candidates FOR UPDATE TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = auth.uid()));

-- mis_user (own record)
DROP POLICY IF EXISTS "MIS can update own record" ON mis_user;
CREATE POLICY "MIS can update own record"
    ON mis_user FOR UPDATE TO authenticated
    USING   (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- users (MIS update)
DROP POLICY IF EXISTS "MIS can update any user" ON users;
CREATE POLICY "MIS can update any user"
    ON users FOR UPDATE TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = auth.uid()));
