-- CreateTable
CREATE TABLE "industries" (
    "industry_id" INTEGER NOT NULL,
    "industry_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("industry_id")
);

-- CreateTable
CREATE TABLE "seniority_levels" (
    "level_id" INTEGER NOT NULL,
    "level_name" VARCHAR(50) NOT NULL,
    "level_order" INTEGER NOT NULL,

    CONSTRAINT "seniority_levels_pkey" PRIMARY KEY ("level_id")
);

-- CreateTable
CREATE TABLE "job_designations" (
    "designation_id" SERIAL NOT NULL,
    "designation_name" VARCHAR(150) NOT NULL,
    "industry_id" INTEGER NOT NULL,
    "level_id" INTEGER NOT NULL,

    CONSTRAINT "job_designations_pkey" PRIMARY KEY ("designation_id")
);

-- CreateIndex
CREATE INDEX "job_designations_industry_id_idx" ON "job_designations"("industry_id");

-- CreateIndex
CREATE INDEX "job_designations_level_id_idx" ON "job_designations"("level_id");

-- AddForeignKey
ALTER TABLE "job_designations" ADD CONSTRAINT "job_designations_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("industry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_designations" ADD CONSTRAINT "job_designations_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "seniority_levels"("level_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert Industries
INSERT INTO industries (industry_id, industry_name) VALUES
(1, 'Banking & Finance'),
(2, 'Information Technology');

-- Insert Seniority Levels
INSERT INTO seniority_levels (level_id, level_name, level_order) VALUES
(1, 'Junior', 1),
(2, 'Mid', 2),
(3, 'Senior', 3);

-- Insert Banking & Finance Designations - Junior Level
INSERT INTO job_designations (designation_name, industry_id, level_id) VALUES
('Junior Analyst', 1, 1),
('Associate Analyst', 1, 1),
('Credit Analyst', 1, 1),
('Financial Analyst', 1, 1),
('Investment Banking Analyst', 1, 1),
('Risk Analyst', 1, 1),
('Compliance Analyst', 1, 1),
('Wealth Management Associate', 1, 1),
('Private Banking Associate', 1, 1),
('Treasury Analyst', 1, 1),
('Audit Associate', 1, 1),
('Tax Associate', 1, 1),
('Portfolio Analyst', 1, 1),
('Junior Trader', 1, 1),
('Operations Associate', 1, 1),
('Relationship Manager Trainee', 1, 1),
('Junior Accountant', 1, 1),
('Banking Associate', 1, 1),
('Junior Underwriter', 1, 1),
('KYC Analyst', 1, 1);

-- Insert Banking & Finance Designations - Mid Level
INSERT INTO job_designations (designation_name, industry_id, level_id) VALUES
('Senior Analyst', 1, 2),
('Associate', 1, 2),
('Senior Associate', 1, 2),
('Relationship Manager', 1, 2),
('Portfolio Manager', 1, 2),
('Senior Credit Analyst', 1, 2),
('Risk Manager', 1, 2),
('Compliance Manager', 1, 2),
('Investment Manager', 1, 2),
('Treasury Manager', 1, 2),
('Senior Trader', 1, 2),
('Equity Research Associate', 1, 2),
('M&A Associate', 1, 2),
('Quantitative Analyst', 1, 2),
('Financial Consultant', 1, 2),
('Branch Manager', 1, 2),
('Product Manager', 1, 2),
('Asset Manager', 1, 2),
('Senior Underwriter', 1, 2),
('Loan Officer', 1, 2);

-- Insert Banking & Finance Designations - Senior Level
INSERT INTO job_designations (designation_name, industry_id, level_id) VALUES
('Vice President', 1, 3),
('Senior Vice President', 1, 3),
('Director', 1, 3),
('Senior Director', 1, 3),
('Managing Director', 1, 3),
('Executive Director', 1, 3),
('Chief Financial Officer', 1, 3),
('Chief Risk Officer', 1, 3),
('Chief Investment Officer', 1, 3),
('Head of Investment Banking', 1, 3),
('Head of Trading', 1, 3),
('Head of Compliance', 1, 3),
('Head of Treasury', 1, 3),
('Regional Manager', 1, 3),
('Country Head', 1, 3),
('Business Head', 1, 3),
('Principal', 1, 3),
('Partner', 1, 3),
('Executive Vice President', 1, 3),
('Chief Credit Officer', 1, 3);

-- Insert IT Designations - Junior Level
INSERT INTO job_designations (designation_name, industry_id, level_id) VALUES
('Junior Software Engineer', 2, 1),
('Software Developer', 2, 1),
('Junior Developer', 2, 1),
('Associate Software Engineer', 2, 1),
('Programmer Analyst', 2, 1),
('Junior Web Developer', 2, 1),
('Junior Data Analyst', 2, 1),
('QA Analyst', 2, 1),
('Technical Support Engineer', 2, 1),
('Junior System Administrator', 2, 1),
('Help Desk Analyst', 2, 1),
('Junior Network Engineer', 2, 1),
('Junior DevOps Engineer', 2, 1),
('Associate Data Scientist', 2, 1),
('Junior UI/UX Designer', 2, 1),
('Junior Security Analyst', 2, 1),
('Database Administrator', 2, 1),
('Junior Business Analyst', 2, 1),
('Junior Cloud Engineer', 2, 1),
('IT Support Specialist', 2, 1);

-- Insert IT Designations - Mid Level
INSERT INTO job_designations (designation_name, industry_id, level_id) VALUES
('Software Engineer', 2, 2),
('Senior Software Engineer', 2, 2),
('Full Stack Developer', 2, 2),
('Backend Developer', 2, 2),
('Frontend Developer', 2, 2),
('Data Engineer', 2, 2),
('Data Scientist', 2, 2),
('QA Engineer', 2, 2),
('Senior QA Engineer', 2, 2),
('DevOps Engineer', 2, 2),
('System Administrator', 2, 2),
('Network Engineer', 2, 2),
('Security Engineer', 2, 2),
('Business Analyst', 2, 2),
('Senior Business Analyst', 2, 2),
('Product Manager', 2, 2),
('Project Manager', 2, 2),
('Scrum Master', 2, 2),
('Technical Lead', 2, 2),
('Solutions Architect', 2, 2);

-- Insert IT Designations - Senior Level
INSERT INTO job_designations (designation_name, industry_id, level_id) VALUES
('Lead Software Engineer', 2, 3),
('Principal Engineer', 2, 3),
('Staff Engineer', 2, 3),
('Senior Staff Engineer', 2, 3),
('Engineering Manager', 2, 3),
('Senior Engineering Manager', 2, 3),
('Director of Engineering', 2, 3),
('VP of Engineering', 2, 3),
('Chief Technology Officer', 2, 3),
('Chief Information Officer', 2, 3),
('Chief Data Officer', 2, 3),
('Chief Information Security Officer', 2, 3),
('Head of IT', 2, 3),
('Head of Development', 2, 3),
('Technical Architect', 2, 3),
('Enterprise Architect', 2, 3),
('Senior Product Manager', 2, 3),
('VP of Product', 2, 3),
('Senior Director', 2, 3),
('Distinguished Engineer', 2, 3);
