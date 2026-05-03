# JobGenie UI/UX Design Specification

## Overview
This document provides an exhaustive, page-by-page detailing of the JobGenie system's User Interfaces. It covers all three primary actors: **Candidate**, **Employer**, and **MIS (Management Information System)**, mapping out every screen, modal, dropdown, form, and interactive component.

---

## 1. Candidate Portal

### 1.1 Layout & Navigation
*   **CandidateLayout Wrapper:** Encapsulates all candidate routes, ensuring consistent navigation and authentication checks.
*   **CandidateSidebar:** 
    *   **Links:** Dashboard, Profile, Resumes, Invitations, Jobs (Browse Jobs), Settings.
    *   **Logic:** Certain links (e.g., Jobs) are disabled or show restriction toasts if the candidate's profile is pending MIS approval.
*   **UserMenu (Navbar):**
    *   **Trigger:** User Avatar (Initials or Profile Picture).
    *   **Dropdown Items:** View Profile, Account Settings, Theme Toggle (Light/Dark mode), Logout.
    *   **Display:** Shows candidate Name, Email, and Membership Number (if assigned).

### 1.2 Dashboard (`/candidate/dashboard`)
*   **Approval Status Notification:** A sticky banner or modal alerting the user if their profile is 'pending', 'approved', or 'rejected'. If rejected, displays the rejection reason.
*   **Statistics Cards:** Shows key metrics (e.g., Profile Completion %, Active Invitations).
*   **Recent Invitations Widget:** A mini-list of recent interview requests.
*   **Recommended Jobs Widget:** (Placeholder/MVP) Displays job matches.

### 1.3 Profile Management (`/candidate/profile`)
*   **View Profile View:** Displays all profile sections (Basic Info, Experience, Education, etc.).
*   **CreateProfileWizard (Multi-step Form):**
    *   **Progress Bar:** Shows completion percentage across steps.
    *   **Step 1: Industry & CV:** Select industry (IT, Finance, Banking, Other). Upload CV (triggers automatic parsing via AI).
    *   **Step 2: Basic Info:** First Name, Last Name, Email, Phone, Alternative Phone, Address, Country, Current Position, Years of Experience, Expected Salary, Notice Period, Availability. Image upload for Profile Picture.
    *   **Step 3: Experience:** Add/Edit Work Experiences (Company, Title, Dates, Description, Is Current).
    *   **Step 4: Education:** Academic and Professional qualifications (dynamically alters based on Industry selection).
    *   **Step 5: Projects / Certificates:** (Specific to IT Industry).
    *   **Step 6: Awards:** Add/Edit achievements.
    *   **Step 7: Summary:** Professional summary text area.
*   **Edit Dialogs / Popups:**
    *   `BasicInfoDialog`: Edit core personal details.
    *   `ExperienceDialog`: Form to add/edit work history.
    *   `EducationDialog`, `FinanceEducationDialog`, `BankingEducationDialog`: Forms to edit academic details.
    *   `ProjectDialog`, `CertificationDialog`, `AwardDialog`: Forms to edit respective entities.

### 1.4 Resume Management (`/candidate/resumes`)
*   **Upload Area:** Drag-and-drop zone for PDF uploads.
*   **Resume List:** Table/List showing uploaded resumes. Includes "Set as Primary" toggle and "Delete" action button.
*   **Resume Preview:** Modal or inline iframe to preview the selected PDF document.

### 1.5 Interview Invitations (`/candidate/invitations`)
*   **Invitations List:** Table showing Company, Job Title, Status, and Actions.
*   **Filters:** All, Pending, Confirmed, Canceled.
*   **RoundResponseCard:** 
    *   Displayed for 'pending' invitations.
    *   Shows Employer's proposed time slots.
    *   Actions: Accept a slot, Propose alternative time, or Decline entirely.
*   **InterviewRoadmap Component:**
    *   Visual timeline of the interview process (Pending -> Accepted -> Confirmed -> Advance/Reject/Offer).
    *   Collapsible sections for each round revealing Interview Date, Time, Mode (Online/Physical), Meeting Link, or Physical Address.

---

## 2. Employer Portal

### 2.1 Layout & Navigation
*   **EmployerLayout Wrapper:** Ensures authentication and company context.
*   **EmployerSidebar:**
    *   **Links:** Dashboard, Invitations, Jobs, Company Profile, Settings.
    *   **Logic:** Restricts actions if the company profile is pending MIS approval.
*   **UserMenu:** Contains Admin details, theme toggle, and logout functionality.

### 2.2 Dashboard (`/employer/dashboard`)
*   **Company Approval Banner:** Alerts if the company is pending MIS verification.
*   **Recruitment Stats:** Active Jobs, Pending Candidates, Interviews Scheduled.

### 2.3 Employer Registration (`EmployerSignupWizard`)
*   **Multi-step Form:**
    *   **Company Details:** Company Name, Registration Number, Industry.
    *   **Admin Details:** Name, Contact, Designation.
    *   **Documentation:** File upload for Business Registration (BR) documents.

### 2.4 Interview Management (`/employer/invitations`)
*   **InviteCandidateButton / Dialog:**
    *   **Form:** Select Candidate, Select Job.
    *   **Time Slots:** Generate 3 proposed time slots (9 AM - 5 PM).
    *   **Interview Mode:** Toggle Online (requires Meeting Link) or Physical (requires Address/Map Link).
*   **RoundConfirmDialog:**
    *   Triggered when a candidate accepts a proposed slot.
    *   **Form:** Confirm the slot, finalize Meeting Link or physical Address.
*   **NextRoundDialog:**
    *   **Form:** Schedule subsequent rounds (Round 2, Round 3, etc.). Inherits the same Time Slot generation and Mode logic as the initial invite.
*   **InterviewFeedbackDialog:**
    *   **Actions:** Advance to next round, Reject, or Extend Offer.
    *   **Form:** Textarea for internal feedback notes.
*   **JobOfferDialog:**
    *   **Form:** Salary Amount, Currency, Expected Start Date, Offer Document URL, Expiration Date.

### 2.5 Company Profile (`CompanyInfoDialog`)
*   **Edit Form:** Company Logo upload, specialized tagging (e.g., Tech Stack, Domains), Location, Website, and Social Links.

---

## 3. MIS Portal (Admin)

### 3.1 Layout & Navigation
*   **MISLayout Wrapper:** High-security admin shell.
*   **MISSidebar:**
    *   **Links:** Dashboard, Candidates, Employers, Interviews, Users, Roles, Master Data, Audit Logs, Reports.

### 3.2 Dashboard (`/mis/dashboard`)
*   **System Overview Stats:** Total Users, Active Candidates, Approved Employers, Ongoing Interviews.

### 3.3 Candidate Management (`/mis/candidates`)
*   **CandidateTable:** List of all candidates. Filters: Pending, Approved, Rejected.
*   **CandidateProfileView (Slide-out Sheet):**
    *   **Details:** Exhaustive view of Candidate's Profile (Basic Info, Experience, Education, CV preview link).
    *   **Actions:** 
        *   `Approve Profile` button.
        *   `Reject Profile` button (opens a sub-form requiring a `Rejection Reason` textarea).
        *   `Revoke & Reset to Pending` button (for already processed profiles).

### 3.4 Employer Management (`/mis/employers`)
*   **EmployerTable:** List of registered companies. Filters: Pending, Approved, Rejected.
*   **EmployerProfileView (Slide-out Sheet):**
    *   **Details:** Company Info, BR Document links, Admin details.
    *   **Actions:** Approve, Reject (with reason via Textarea form), Revoke.

### 3.5 Interview Oversight (`/mis/interviews`)
*   **InterviewStatsCards:** Metrics on interview statuses.
*   **InterviewTable:** Global list of all system interviews.
*   **InterviewDetailView (Dialog):** Deep dive into a specific interview's roadmap and history.
*   **RescheduleModal:**
    *   **Admin Override Form:** Allows MIS to forcefully reschedule an interview. Input for new Date, Time, Mode (Online/Physical), and Reason for rescheduling. Validates URLs for online meetings.

### 3.6 Access Control (Roles & Users)
*   **Roles (`/mis/roles`):**
    *   **RolesTable:** Edit, Manage Permissions, Delete actions.
    *   **Role Form:** Create/Edit role definitions and permission toggles.
*   **Users (`/mis/users`):**
    *   **UserTable:** Manage MIS administrators, assign roles, deactivate accounts.

### 3.7 Settings / Master Data (`/mis/settings`)
*   **MasterDataClient:**
    *   **Tabs:** Industries, Designations, Seniority.
    *   **Forms:** Add/Edit/Delete lookup values to maintain system standardization. Forms validate string uniqueness.

### 3.8 Audit Logs (`/mis/audit`)
*   **AuditLogsClient:**
    *   **Tabs:** Event Records, Unresolved Errors.
    *   **Filters:** Category, User Role, Action Search.
    *   **Detail Dialog:** Deep dive into the JSON metadata of specific system events (User Agent, IPs, Payloads).

### 3.9 Reports (`/mis/reports`)
*   **ReportsClient:** Generate analytical reports on platform performance, user growth, and placement success metrics. Displays dynamic charts and data grids.

---
*End of Specification*
