-- Migration: rls_auth_uid_initplan_fix
-- Date: 2026-04-01
-- Description:
--   Fixes auth.uid() InitPlan performance issue across all RLS policies.
--
--   Problem (WARN from Supabase performance advisor – auth_rls_initplan):
--     When auth.uid() appears directly in a USING / WITH CHECK expression,
--     the Postgres query planner may treat it as a volatile function and
--     re-evaluate it once per row instead of once per query. On tables with
--     thousands of rows this can cause significant overhead.
--
--   Fix (per Supabase docs):
--     Replace every bare  auth.uid()  with  (SELECT auth.uid()).
--     The subselect forces the planner to materialise the value once as a
--     query-level constant, which is then reused for every row in the scan.
--
--   Also adds idx_candidates_reviewed_by (flagged by unindexed FK advisor).
--
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0013_auth_rls_initplan


CREATE INDEX IF NOT EXISTS idx_candidates_reviewed_by
    ON candidates(reviewed_by);


-- USERS
DROP POLICY IF EXISTS "Users can view own record" ON users;
CREATE POLICY "Users can view own record"
    ON users FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert during registration" ON users;
CREATE POLICY "Users can insert during registration"
    ON users FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record"
    ON users FOR UPDATE TO authenticated
    USING   ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "MIS can view all users" ON users;
CREATE POLICY "MIS can view all users"
    ON users FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "MIS can update any user" ON users;
CREATE POLICY "MIS can update any user"
    ON users FOR UPDATE TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- CANDIDATES
DROP POLICY IF EXISTS "Candidates can view own profile" ON candidates;
CREATE POLICY "Candidates can view own profile"
    ON candidates FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Candidates can insert own profile" ON candidates;
CREATE POLICY "Candidates can insert own profile"
    ON candidates FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Candidates can update own profile" ON candidates;
CREATE POLICY "Candidates can update own profile"
    ON candidates FOR UPDATE TO authenticated
    USING   (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Candidates can delete own profile" ON candidates;
CREATE POLICY "Candidates can delete own profile"
    ON candidates FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Employers can view approved candidates" ON candidates;
CREATE POLICY "Employers can view approved candidates"
    ON candidates FOR SELECT TO authenticated
    USING (
        approval_status = 'approved'
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all candidates" ON candidates;
CREATE POLICY "MIS can view all candidates"
    ON candidates FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "MIS can update any candidate" ON candidates;
CREATE POLICY "MIS can update any candidate"
    ON candidates FOR UPDATE TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- WORK_EXPERIENCES
DROP POLICY IF EXISTS "Candidates can view own work experiences" ON work_experiences;
CREATE POLICY "Candidates can view own work experiences"
    ON work_experiences FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can insert own work experiences" ON work_experiences;
CREATE POLICY "Candidates can insert own work experiences"
    ON work_experiences FOR INSERT TO authenticated
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own work experiences" ON work_experiences;
CREATE POLICY "Candidates can update own work experiences"
    ON work_experiences FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can delete own work experiences" ON work_experiences;
CREATE POLICY "Candidates can delete own work experiences"
    ON work_experiences FOR DELETE TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view approved candidate work experiences" ON work_experiences;
CREATE POLICY "Employers can view approved candidate work experiences"
    ON work_experiences FOR SELECT TO authenticated
    USING (
        candidate_id IN (SELECT id FROM candidates WHERE approval_status = 'approved')
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all work experiences" ON work_experiences;
CREATE POLICY "MIS can view all work experiences"
    ON work_experiences FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- EDUCATIONS
DROP POLICY IF EXISTS "Candidates can view own educations" ON educations;
CREATE POLICY "Candidates can view own educations"
    ON educations FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can insert own educations" ON educations;
CREATE POLICY "Candidates can insert own educations"
    ON educations FOR INSERT TO authenticated
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own educations" ON educations;
CREATE POLICY "Candidates can update own educations"
    ON educations FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can delete own educations" ON educations;
CREATE POLICY "Candidates can delete own educations"
    ON educations FOR DELETE TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view approved candidate educations" ON educations;
CREATE POLICY "Employers can view approved candidate educations"
    ON educations FOR SELECT TO authenticated
    USING (
        candidate_id IN (SELECT id FROM candidates WHERE approval_status = 'approved')
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all educations" ON educations;
CREATE POLICY "MIS can view all educations"
    ON educations FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- AWARDS
DROP POLICY IF EXISTS "Candidates can view own awards" ON awards;
CREATE POLICY "Candidates can view own awards"
    ON awards FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can insert own awards" ON awards;
CREATE POLICY "Candidates can insert own awards"
    ON awards FOR INSERT TO authenticated
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own awards" ON awards;
CREATE POLICY "Candidates can update own awards"
    ON awards FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can delete own awards" ON awards;
CREATE POLICY "Candidates can delete own awards"
    ON awards FOR DELETE TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view approved candidate awards" ON awards;
CREATE POLICY "Employers can view approved candidate awards"
    ON awards FOR SELECT TO authenticated
    USING (
        candidate_id IN (SELECT id FROM candidates WHERE approval_status = 'approved')
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all awards" ON awards;
CREATE POLICY "MIS can view all awards"
    ON awards FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- PROJECTS
DROP POLICY IF EXISTS "Candidates can view own projects" ON projects;
CREATE POLICY "Candidates can view own projects"
    ON projects FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can insert own projects" ON projects;
CREATE POLICY "Candidates can insert own projects"
    ON projects FOR INSERT TO authenticated
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own projects" ON projects;
CREATE POLICY "Candidates can update own projects"
    ON projects FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can delete own projects" ON projects;
CREATE POLICY "Candidates can delete own projects"
    ON projects FOR DELETE TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view approved candidate projects" ON projects;
CREATE POLICY "Employers can view approved candidate projects"
    ON projects FOR SELECT TO authenticated
    USING (
        candidate_id IN (SELECT id FROM candidates WHERE approval_status = 'approved')
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all projects" ON projects;
CREATE POLICY "MIS can view all projects"
    ON projects FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- CERTIFICATES
DROP POLICY IF EXISTS "Candidates can view own certificates" ON certificates;
CREATE POLICY "Candidates can view own certificates"
    ON certificates FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can insert own certificates" ON certificates;
CREATE POLICY "Candidates can insert own certificates"
    ON certificates FOR INSERT TO authenticated
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own certificates" ON certificates;
CREATE POLICY "Candidates can update own certificates"
    ON certificates FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can delete own certificates" ON certificates;
CREATE POLICY "Candidates can delete own certificates"
    ON certificates FOR DELETE TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view approved candidate certificates" ON certificates;
CREATE POLICY "Employers can view approved candidate certificates"
    ON certificates FOR SELECT TO authenticated
    USING (
        candidate_id IN (SELECT id FROM candidates WHERE approval_status = 'approved')
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all certificates" ON certificates;
CREATE POLICY "MIS can view all certificates"
    ON certificates FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- INDUSTRY_SPECIALIZATIONS
DROP POLICY IF EXISTS "Candidates can view own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can view own industry specializations"
    ON industry_specializations FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can insert own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can insert own industry specializations"
    ON industry_specializations FOR INSERT TO authenticated
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can update own industry specializations"
    ON industry_specializations FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can delete own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can delete own industry specializations"
    ON industry_specializations FOR DELETE TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view approved candidate specializations" ON industry_specializations;
CREATE POLICY "Employers can view approved candidate specializations"
    ON industry_specializations FOR SELECT TO authenticated
    USING (
        candidate_id IN (SELECT id FROM candidates WHERE approval_status = 'approved')
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all specializations" ON industry_specializations;
CREATE POLICY "MIS can view all specializations"
    ON industry_specializations FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- FINANCE_ACADEMIC_EDUCATION
DROP POLICY IF EXISTS "Candidates can view own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can view own finance academic education"
    ON finance_academic_education FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can insert own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can insert own finance academic education"
    ON finance_academic_education FOR INSERT TO authenticated
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can update own finance academic education"
    ON finance_academic_education FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can delete own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can delete own finance academic education"
    ON finance_academic_education FOR DELETE TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view approved candidate finance academic education" ON finance_academic_education;
CREATE POLICY "Employers can view approved candidate finance academic education"
    ON finance_academic_education FOR SELECT TO authenticated
    USING (
        candidate_id IN (SELECT id FROM candidates WHERE approval_status = 'approved')
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all finance academic education" ON finance_academic_education;
CREATE POLICY "MIS can view all finance academic education"
    ON finance_academic_education FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- FINANCE_PROFESSIONAL_EDUCATION
DROP POLICY IF EXISTS "Candidates can view own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can view own finance professional education"
    ON finance_professional_education FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can insert own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can insert own finance professional education"
    ON finance_professional_education FOR INSERT TO authenticated
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can update own finance professional education"
    ON finance_professional_education FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can delete own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can delete own finance professional education"
    ON finance_professional_education FOR DELETE TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view approved candidate finance professional education" ON finance_professional_education;
CREATE POLICY "Employers can view approved candidate finance professional education"
    ON finance_professional_education FOR SELECT TO authenticated
    USING (
        candidate_id IN (SELECT id FROM candidates WHERE approval_status = 'approved')
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all finance professional education" ON finance_professional_education;
CREATE POLICY "MIS can view all finance professional education"
    ON finance_professional_education FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- BANKING_ACADEMIC_EDUCATION
DROP POLICY IF EXISTS "Candidates can view own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can view own banking academic education"
    ON banking_academic_education FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can insert own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can insert own banking academic education"
    ON banking_academic_education FOR INSERT TO authenticated
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can update own banking academic education"
    ON banking_academic_education FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can delete own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can delete own banking academic education"
    ON banking_academic_education FOR DELETE TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view approved candidate banking academic education" ON banking_academic_education;
CREATE POLICY "Employers can view approved candidate banking academic education"
    ON banking_academic_education FOR SELECT TO authenticated
    USING (
        candidate_id IN (SELECT id FROM candidates WHERE approval_status = 'approved')
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all banking academic education" ON banking_academic_education;
CREATE POLICY "MIS can view all banking academic education"
    ON banking_academic_education FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- BANKING_PROFESSIONAL_EDUCATION
DROP POLICY IF EXISTS "Candidates can view own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can view own banking professional education"
    ON banking_professional_education FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can insert own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can insert own banking professional education"
    ON banking_professional_education FOR INSERT TO authenticated
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can update own banking professional education"
    ON banking_professional_education FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can delete own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can delete own banking professional education"
    ON banking_professional_education FOR DELETE TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view approved candidate banking professional education" ON banking_professional_education;
CREATE POLICY "Employers can view approved candidate banking professional education"
    ON banking_professional_education FOR SELECT TO authenticated
    USING (
        candidate_id IN (SELECT id FROM candidates WHERE approval_status = 'approved')
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all banking professional education" ON banking_professional_education;
CREATE POLICY "MIS can view all banking professional education"
    ON banking_professional_education FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- BANKING_SPECIALIZED_TRAINING
DROP POLICY IF EXISTS "Candidates can view own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can view own banking specialized training"
    ON banking_specialized_training FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can insert own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can insert own banking specialized training"
    ON banking_specialized_training FOR INSERT TO authenticated
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can update own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can update own banking specialized training"
    ON banking_specialized_training FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can delete own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can delete own banking specialized training"
    ON banking_specialized_training FOR DELETE TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view approved candidate banking specialized training" ON banking_specialized_training;
CREATE POLICY "Employers can view approved candidate banking specialized training"
    ON banking_specialized_training FOR SELECT TO authenticated
    USING (
        candidate_id IN (SELECT id FROM candidates WHERE approval_status = 'approved')
        AND EXISTS (SELECT 1 FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all banking specialized training" ON banking_specialized_training;
CREATE POLICY "MIS can view all banking specialized training"
    ON banking_specialized_training FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- EMPLOYERS
DROP POLICY IF EXISTS "Employers can view own profile" ON employers;
CREATE POLICY "Employers can view own profile"
    ON employers FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Employers can insert own profile" ON employers;
CREATE POLICY "Employers can insert own profile"
    ON employers FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Employers can update own profile" ON employers;
CREATE POLICY "Employers can update own profile"
    ON employers FOR UPDATE TO authenticated
    USING   (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Employers can delete own profile" ON employers;
CREATE POLICY "Employers can delete own profile"
    ON employers FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "MIS can view all employers" ON employers;
CREATE POLICY "MIS can view all employers"
    ON employers FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "MIS can update any employer" ON employers;
CREATE POLICY "MIS can update any employer"
    ON employers FOR UPDATE TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- COMPANIES
DROP POLICY IF EXISTS "Employers can view own company" ON companies;
CREATE POLICY "Employers can view own company"
    ON companies FOR SELECT TO authenticated
    USING (id IN (SELECT company_id FROM employers WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can update own company" ON companies;
CREATE POLICY "Employers can update own company"
    ON companies FOR UPDATE TO authenticated
    USING   (id IN (SELECT company_id FROM employers WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (id IN (SELECT company_id FROM employers WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can delete own company" ON companies;
CREATE POLICY "Employers can delete own company"
    ON companies FOR DELETE TO authenticated
    USING (id IN (SELECT company_id FROM employers WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "MIS can view all companies" ON companies;
CREATE POLICY "MIS can view all companies"
    ON companies FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "MIS can update any company" ON companies;
CREATE POLICY "MIS can update any company"
    ON companies FOR UPDATE TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- JOBS
DROP POLICY IF EXISTS "Employers can view own jobs" ON jobs;
CREATE POLICY "Employers can view own jobs"
    ON jobs FOR SELECT TO authenticated
    USING (employer_id IN (SELECT id FROM employers WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can insert jobs" ON jobs;
CREATE POLICY "Employers can insert jobs"
    ON jobs FOR INSERT TO authenticated
    WITH CHECK (employer_id IN (SELECT id FROM employers WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can update own jobs" ON jobs;
CREATE POLICY "Employers can update own jobs"
    ON jobs FOR UPDATE TO authenticated
    USING   (employer_id IN (SELECT id FROM employers WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (employer_id IN (SELECT id FROM employers WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can delete own jobs" ON jobs;
CREATE POLICY "Employers can delete own jobs"
    ON jobs FOR DELETE TO authenticated
    USING (employer_id IN (SELECT id FROM employers WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Candidates can view published jobs" ON jobs;
CREATE POLICY "Candidates can view published jobs"
    ON jobs FOR SELECT TO authenticated
    USING (
        status = 'published'
        AND EXISTS (SELECT 1 FROM candidates WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "MIS can view all jobs" ON jobs;
CREATE POLICY "MIS can view all jobs"
    ON jobs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "MIS can update any job" ON jobs;
CREATE POLICY "MIS can update any job"
    ON jobs FOR UPDATE TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- MIS_USER
DROP POLICY IF EXISTS "MIS can view own record" ON mis_user;
CREATE POLICY "MIS can view own record"
    ON mis_user FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "MIS can insert during invitation" ON mis_user;
CREATE POLICY "MIS can insert during invitation"
    ON mis_user FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "MIS can update own record" ON mis_user;
CREATE POLICY "MIS can update own record"
    ON mis_user FOR UPDATE TO authenticated
    USING   (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "MIS can view all MIS users" ON mis_user;
CREATE POLICY "MIS can view all MIS users"
    ON mis_user FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user mis_user_1 WHERE mis_user_1.user_id = (SELECT auth.uid())));

-- JOB_INVITATIONS
DROP POLICY IF EXISTS "Candidates can view own invitations" ON job_invitations;
CREATE POLICY "Candidates can view own invitations"
    ON job_invitations FOR SELECT TO authenticated
    USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can view company invitations" ON job_invitations;
CREATE POLICY "Employers can view company invitations"
    ON job_invitations FOR SELECT TO authenticated
    USING (company_id IN (SELECT company_id FROM employers WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "MIS can view all invitations" ON job_invitations;
CREATE POLICY "MIS can view all invitations"
    ON job_invitations FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can create invitations" ON job_invitations;
CREATE POLICY "Employers can create invitations"
    ON job_invitations FOR INSERT TO authenticated
    WITH CHECK (
        employer_id IN (SELECT id FROM employers WHERE user_id = (SELECT auth.uid()))
        AND company_id IN (SELECT company_id FROM employers WHERE user_id = (SELECT auth.uid()))
    );

DROP POLICY IF EXISTS "Candidates can update own invitations" ON job_invitations;
CREATE POLICY "Candidates can update own invitations"
    ON job_invitations FOR UPDATE TO authenticated
    USING   (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Employers can update company invitations" ON job_invitations;
CREATE POLICY "Employers can update company invitations"
    ON job_invitations FOR UPDATE TO authenticated
    USING   (company_id IN (SELECT company_id FROM employers WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (company_id IN (SELECT company_id FROM employers WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "MIS can update all invitations" ON job_invitations;
CREATE POLICY "MIS can update all invitations"
    ON job_invitations FOR UPDATE TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- INTERVIEW_ROUNDS
DROP POLICY IF EXISTS "Candidates can view own interview rounds" ON interview_rounds;
CREATE POLICY "Candidates can view own interview rounds"
    ON interview_rounds FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM job_invitations ji
            JOIN candidates c ON c.id = ji.candidate_id
            WHERE ji.id = interview_rounds.invitation_id
              AND c.user_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "Employers can view related interview rounds" ON interview_rounds;
CREATE POLICY "Employers can view related interview rounds"
    ON interview_rounds FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM job_invitations ji
            JOIN employers e ON e.id = ji.employer_id
            WHERE ji.id = interview_rounds.invitation_id
              AND e.user_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "MIS full access interview_rounds" ON interview_rounds;
CREATE POLICY "MIS full access interview_rounds"
    ON interview_rounds FOR ALL TO authenticated
    USING   (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

-- LOG TABLES
DROP POLICY IF EXISTS "MIS can read event logs" ON event_logs;
CREATE POLICY "MIS can read event logs"
    ON event_logs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "MIS can read api request logs" ON api_request_logs;
CREATE POLICY "MIS can read api request logs"
    ON api_request_logs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "MIS can read error logs" ON error_logs;
CREATE POLICY "MIS can read error logs"
    ON error_logs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM mis_user WHERE user_id = (SELECT auth.uid())));
