-- ============================================
-- RLS POLICIES FOR BANKING & FINANCE MODELS
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS on new tables
ALTER TABLE financial_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_specializations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FINANCIAL LICENSES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Candidates can view own financial licenses" ON financial_licenses;
CREATE POLICY "Candidates can view own financial licenses"
ON financial_licenses FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own financial licenses" ON financial_licenses;
CREATE POLICY "Candidates can insert own financial licenses"
ON financial_licenses FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own financial licenses" ON financial_licenses;
CREATE POLICY "Candidates can update own financial licenses"
ON financial_licenses FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own financial licenses" ON financial_licenses;
CREATE POLICY "Candidates can delete own financial licenses"
ON financial_licenses FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- ============================================
-- BANKING SKILLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Candidates can view own banking skills" ON banking_skills;
CREATE POLICY "Candidates can view own banking skills"
ON banking_skills FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own banking skills" ON banking_skills;
CREATE POLICY "Candidates can insert own banking skills"
ON banking_skills FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own banking skills" ON banking_skills;
CREATE POLICY "Candidates can update own banking skills"
ON banking_skills FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own banking skills" ON banking_skills;
CREATE POLICY "Candidates can delete own banking skills"
ON banking_skills FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- ============================================
-- COMPLIANCE TRAININGS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Candidates can view own compliance trainings" ON compliance_trainings;
CREATE POLICY "Candidates can view own compliance trainings"
ON compliance_trainings FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own compliance trainings" ON compliance_trainings;
CREATE POLICY "Candidates can insert own compliance trainings"
ON compliance_trainings FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own compliance trainings" ON compliance_trainings;
CREATE POLICY "Candidates can update own compliance trainings"
ON compliance_trainings FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own compliance trainings" ON compliance_trainings;
CREATE POLICY "Candidates can delete own compliance trainings"
ON compliance_trainings FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- ============================================
-- INDUSTRY SPECIALIZATIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Candidates can view own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can view own industry specializations"
ON industry_specializations FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can insert own industry specializations"
ON industry_specializations FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can update own industry specializations"
ON industry_specializations FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own industry specializations" ON industry_specializations;
CREATE POLICY "Candidates can delete own industry specializations"
ON industry_specializations FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- ============================================
-- EMPLOYER/MIS VIEW ACCESS (for job matching)
-- ============================================

-- Employers can view approved candidates' licenses for job matching
DROP POLICY IF EXISTS "Employers can view approved candidate licenses" ON financial_licenses;
CREATE POLICY "Employers can view approved candidate licenses"
ON financial_licenses FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' banking skills
DROP POLICY IF EXISTS "Employers can view approved candidate banking skills" ON banking_skills;
CREATE POLICY "Employers can view approved candidate banking skills"
ON banking_skills FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' compliance trainings
DROP POLICY IF EXISTS "Employers can view approved candidate compliance trainings" ON compliance_trainings;
CREATE POLICY "Employers can view approved candidate compliance trainings"
ON compliance_trainings FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);

-- Employers can view approved candidates' specializations
DROP POLICY IF EXISTS "Employers can view approved candidate specializations" ON industry_specializations;
CREATE POLICY "Employers can view approved candidate specializations"
ON industry_specializations FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE approval_status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM employers WHERE user_id = auth.uid()
  )
);
