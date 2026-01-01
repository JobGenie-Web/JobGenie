-- Enable RLS on all user-owned tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own user record" ON users;
CREATE POLICY "Users can view own user record"
ON users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own user record" ON users;
CREATE POLICY "Users can update own user record"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Allow users to insert their own record during registration
DROP POLICY IF EXISTS "Users can insert own user record" ON users;
CREATE POLICY "Users can insert own user record"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- CANDIDATES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Candidates can view own profile" ON candidates;
CREATE POLICY "Candidates can view own profile"
ON candidates FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates can update own profile" ON candidates;
CREATE POLICY "Candidates can update own profile"
ON candidates FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Candidates can insert own profile" ON candidates;
CREATE POLICY "Candidates can insert own profile"
ON candidates FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- WORK EXPERIENCES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Candidates can view own work experiences" ON work_experiences;
CREATE POLICY "Candidates can view own work experiences"
ON work_experiences FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own work experiences" ON work_experiences;
CREATE POLICY "Candidates can insert own work experiences"
ON work_experiences FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own work experiences" ON work_experiences;
CREATE POLICY "Candidates can update own work experiences"
ON work_experiences FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own work experiences" ON work_experiences;
CREATE POLICY "Candidates can delete own work experiences"
ON work_experiences FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- ============================================
-- EDUCATIONS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Candidates can view own educations" ON educations;
CREATE POLICY "Candidates can view own educations"
ON educations FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own educations" ON educations;
CREATE POLICY "Candidates can insert own educations"
ON educations FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own educations" ON educations;
CREATE POLICY "Candidates can update own educations"
ON educations FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own educations" ON educations;
CREATE POLICY "Candidates can delete own educations"
ON educations FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- ============================================
-- AWARDS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Candidates can view own awards" ON awards;
CREATE POLICY "Candidates can view own awards"
ON awards FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own awards" ON awards;
CREATE POLICY "Candidates can insert own awards"
ON awards FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own awards" ON awards;
CREATE POLICY "Candidates can update own awards"
ON awards FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own awards" ON awards;
CREATE POLICY "Candidates can delete own awards"
ON awards FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- ============================================
-- PROJECTS POLICIES (IT Industry)
-- ============================================

DROP POLICY IF EXISTS "Candidates can view own projects" ON projects;
CREATE POLICY "Candidates can view own projects"
ON projects FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own projects" ON projects;
CREATE POLICY "Candidates can insert own projects"
ON projects FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own projects" ON projects;
CREATE POLICY "Candidates can update own projects"
ON projects FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own projects" ON projects;
CREATE POLICY "Candidates can delete own projects"
ON projects FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- ============================================
-- CERTIFICATES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Candidates can view own certificates" ON certificates;
CREATE POLICY "Candidates can view own certificates"
ON certificates FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can insert own certificates" ON certificates;
CREATE POLICY "Candidates can insert own certificates"
ON certificates FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can update own certificates" ON certificates;
CREATE POLICY "Candidates can update own certificates"
ON certificates FOR UPDATE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can delete own certificates" ON certificates;
CREATE POLICY "Candidates can delete own certificates"
ON certificates FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
);

-- ============================================
-- EMPLOYERS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Employers can view own profile" ON employers;
CREATE POLICY "Employers can view own profile"
ON employers FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employers can update own profile" ON employers;
CREATE POLICY "Employers can update own profile"
ON employers FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employers can insert own profile" ON employers;
CREATE POLICY "Employers can insert own profile"
ON employers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COMPANIES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Employers can view their company" ON companies;
CREATE POLICY "Employers can view their company"
ON companies FOR SELECT
USING (
  id IN (
    SELECT company_id FROM employers WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Employers can update their company" ON companies;
CREATE POLICY "Employers can update their company"
ON companies FOR UPDATE
USING (
  id IN (
    SELECT company_id FROM employers WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated users can create company" ON companies;
CREATE POLICY "Authenticated users can create company"
ON companies FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- JOBS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view published jobs" ON jobs;
CREATE POLICY "Anyone can view published jobs"
ON jobs FOR SELECT
USING (status = 'published');

DROP POLICY IF EXISTS "Employers can view own company jobs" ON jobs;
CREATE POLICY "Employers can view own company jobs"
ON jobs FOR SELECT
USING (
  employer_id IN (
    SELECT id FROM employers WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Employers can insert jobs" ON jobs;
CREATE POLICY "Employers can insert jobs"
ON jobs FOR INSERT
WITH CHECK (
  employer_id IN (
    SELECT id FROM employers WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Employers can update own jobs" ON jobs;
CREATE POLICY "Employers can update own jobs"
ON jobs FOR UPDATE
USING (
  employer_id IN (
    SELECT id FROM employers WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Employers can delete own jobs" ON jobs;
CREATE POLICY "Employers can delete own jobs"
ON jobs FOR DELETE
USING (
  employer_id IN (
    SELECT id FROM employers WHERE user_id = auth.uid()
  )
);

-- ============================================
-- MIS USER POLICIES (Admin access)
-- ============================================

ALTER TABLE mis_user ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "MIS users can view own profile" ON mis_user;
CREATE POLICY "MIS users can view own profile"
ON mis_user FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "MIS users can update own profile" ON mis_user;
CREATE POLICY "MIS users can update own profile"
ON mis_user FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- MIS USER POLICIES (Admin access)
-- ============================================

ALTER TABLE mis_user ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MIS users can view own profile"
ON mis_user FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "MIS users can update own profile"
ON mis_user FOR UPDATE
USING (auth.uid() = user_id);
