-- =============================================
-- RLS POLICIES FOR FINANCE & BANKING EDUCATION
-- Run this AFTER migrations in Supabase SQL Editor
-- =============================================

-- Enable RLS on new education tables
ALTER TABLE finance_academic_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_professional_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_academic_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_professional_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_specialized_training ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FINANCE ACADEMIC EDUCATION POLICIES
-- =============================================

DROP POLICY IF EXISTS "Candidates can view own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can view own finance academic education"
ON finance_academic_education FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can insert own finance academic education"
ON finance_academic_education FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can update own finance academic education"
ON finance_academic_education FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own finance academic education" ON finance_academic_education;
CREATE POLICY "Candidates can delete own finance academic education"
ON finance_academic_education FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- =============================================
-- FINANCE PROFESSIONAL EDUCATION POLICIES
-- =============================================

DROP POLICY IF EXISTS "Candidates can view own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can view own finance professional education"
ON finance_professional_education FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can insert own finance professional education"
ON finance_professional_education FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can update own finance professional education"
ON finance_professional_education FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own finance professional education" ON finance_professional_education;
CREATE POLICY "Candidates can delete own finance professional education"
ON finance_professional_education FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- =============================================
-- BANKING ACADEMIC EDUCATION POLICIES
-- =============================================

DROP POLICY IF EXISTS "Candidates can view own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can view own banking academic education"
ON banking_academic_education FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can insert own banking academic education"
ON banking_academic_education FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can update own banking academic education"
ON banking_academic_education FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own banking academic education" ON banking_academic_education;
CREATE POLICY "Candidates can delete own banking academic education"
ON banking_academic_education FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- =============================================
-- BANKING PROFESSIONAL EDUCATION POLICIES
-- =============================================

DROP POLICY IF EXISTS "Candidates can view own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can view own banking professional education"
ON banking_professional_education FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can insert own banking professional education"
ON banking_professional_education FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can update own banking professional education"
ON banking_professional_education FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own banking professional education" ON banking_professional_education;
CREATE POLICY "Candidates can delete own banking professional education"
ON banking_professional_education FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- =============================================
-- BANKING SPECIALIZED TRAINING POLICIES
-- =============================================

DROP POLICY IF EXISTS "Candidates can view own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can view own banking specialized training"
ON banking_specialized_training FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can insert own banking specialized training"
ON banking_specialized_training FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can update own banking specialized training"
ON banking_specialized_training FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own banking specialized training" ON banking_specialized_training;
CREATE POLICY "Candidates can delete own banking specialized training"
ON banking_specialized_training FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- =============================================
-- EMPLOYER/MIS VIEW ACCESS (for job matching)
-- =============================================

-- Employers can view approved candidates' finance academic education
DROP POLICY IF EXISTS "Employers can view approved candidate finance academic education" ON finance_academic_education;
CREATE POLICY "Employers can view approved candidate finance academic education"
ON finance_academic_education FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' finance professional education
DROP POLICY IF EXISTS "Employers can view approved candidate finance professional education" ON finance_professional_education;
CREATE POLICY "Employers can view approved candidate finance professional education"
ON finance_professional_education FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' banking academic education
DROP POLICY IF EXISTS "Employers can view approved candidate banking academic education" ON banking_academic_education;
CREATE POLICY "Employers can view approved candidate banking academic education"
ON banking_academic_education FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' banking professional education
DROP POLICY IF EXISTS "Employers can view approved candidate banking professional education" ON banking_professional_education;
CREATE POLICY "Employers can view approved candidate banking professional education"
ON banking_professional_education FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' banking specialized training
DROP POLICY IF EXISTS "Employers can view approved candidate banking specialized training" ON banking_specialized_training;
CREATE POLICY "Employers can view approved candidate banking specialized training"
ON banking_specialized_training FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- =============================================
-- MIS ACCESS (full access to all data)
-- =============================================

-- MIS users get full SELECT access (controlled by role check)
DROP POLICY IF EXISTS "MIS can view all finance academic education" ON finance_academic_education;
CREATE POLICY "MIS can view all finance academic education"
ON finance_academic_education FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "MIS can view all finance professional education" ON finance_professional_education;
CREATE POLICY "MIS can view all finance professional education"
ON finance_professional_education FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "MIS can view all banking academic education" ON banking_academic_education;
CREATE POLICY "MIS can view all banking academic education"
ON banking_academic_education FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "MIS can view all banking professional education" ON banking_professional_education;
CREATE POLICY "MIS can view all banking professional education"
ON banking_professional_education FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "MIS can view all banking specialized training" ON banking_specialized_training;
CREATE POLICY "MIS can view all banking specialized training"
ON banking_specialized_training FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mis_user WHERE user_id = auth.uid()
  )
);
