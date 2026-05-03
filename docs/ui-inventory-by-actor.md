# JobGenie UI inventory (by actor)

This document maps **routes, navigation, layouts, forms, dialogs/modals, dropdowns, filters, and notable empty states** as implemented in the codebase. It is intended for **UI/UX design** (wireframes, flows, consistency).  

**Scope:** Reflects the Next.js `src/app` routes and primary client components under `src/components` at documentation time. Some sidebar links point to routes that **do not yet have a `page.tsx`**—those are called out under **Implementation gaps**.

---

## Shared shell & cross-cutting UI

| Area | Details |
|------|---------|
| **Design system** | shadcn/ui primitives: `Button`, `Card`, `Input`, `Label`, `Badge`, `Avatar`, `Separator`, `Tabs`, `Table`, `Skeleton`, `ScrollArea`, `Collapsible`, `Tooltip`, `Progress`, `DropdownMenu`, `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `Select`, `Combobox`, `Textarea`, `Sidebar` layout |
| **Feedback** | `sonner` toasts; `Toaster` in dashboard layouts; some candidate resume flows use `useToast` |
| **Theme** | `next-themes`: light/dark toggle in user avatar menus (candidate & employer) |
| **Auth shell** | Centered card on muted background; icon header; primary CTA; links to signup/forgot password |

---

## Public & shared routes (all actors)

| Route | Purpose | Main UI |
|-------|---------|---------|
| `/` | Marketing landing | `Header`, `Footer`, `Hero`, `Features`, **Contact** section (info cards + contact **form**: name, email, message, submit—**form is presentational only**, no submit handler wired in component) |
| `/login` | Universal login | **UniversalLoginForm**: email, password (show/hide), submit; links: forgot password, candidate signup, employer signup, back home |
| `/forgot-password` | Password recovery | **ForgotPasswordForm** |
| `/reset-password` | Set new password | **ResetPasswordForm** |

---

## Candidate

### Global navigation (authenticated)

**Layout:** `CandidateLayout` — collapsible **sidebar** (`CandidateSidebar`), **header** (`CandidateHeader`), main content, `Toaster`.

**Sidebar items** (`CandidateSidebar.tsx`):

| Item | Path | Notes |
|------|------|------|
| Dashboard | `/candidate/dashboard` | Always |
| Browse Jobs | `/candidate/jobs` | **Disabled** until MIS approval (`approval_status === 'approved'`); tooltip “Awaiting MIS approval” |
| Applications | `/candidate/applications` | Same gate |
| Invitations | `/candidate/invitations` | Same gate; **badge** count for unopened invitations |
| My Profile | `/candidate/profile` | Always |
| My Resumes | `/candidate/resumes` | Always |
| Settings | `/candidate/settings` | Same gate as jobs |

**Header user menu** (`UserMenu`): avatar dropdown — name, email, **membership number** (if set), links to Profile & Settings, **theme toggle**, logout.

### Onboarding & auth (candidate-specific)

| Route | UI summary |
|-------|------------|
| `/candidate/signup` | **CandidateSignupForm** in card; back home |
| `/candidate/verify-email` | **VerifyEmailForm** |
| `/candidate/create-profile` | Back home; intro card; **CreateProfileWizard** (multi-step, progress bar) |

**Create profile wizard — steps** (visibility depends on **industry**):

1. **Industry & CV** — industry selection, optional CV upload / extraction (`CVUpload`).
2. **Basic Info** — personal & job-search fields (name, contact, address, country, current role, experience level, salary, availability, notice period, employment type, expected positions, etc.).
3. **Experience** — repeatable work history.
4. **Education** — **standard** path for IT/general; **Finance** or **Banking** variants replace standard education when industry matches.
5. **Projects** — IT only.
6. **Certificates** — IT only.
7. **Awards** — repeatable.
8. **Summary** — review & submit.

Industry-driven branching: IT gets Projects + Certificates; Finance/Banking use dedicated education step lists.

### Dashboard (`/candidate/dashboard`)

- Optional **banner**: “Approval Pending” (amber) with link to profile when not approved.
- **Modal** (`ApprovalStatusNotification`): non-dismissable overlay until acknowledged — shows **approved** or **rejected** with optional rejection reason; primary button marks message seen (Dialog, no outside click).
- **RestrictionToastListener** (client listener for gated actions).
- **Stats row**: Under Review, Interviews, Offers Received, Saved Jobs (`DashboardStatsCard`).
- **Widgets**: Recommended jobs, interview calendar, profile strength, “Upgrade Pro” card.
- Loading / error states for dashboard data.

### Jobs (`/candidate/jobs`)

- Placeholder card: “Jobs Coming Soon” (no job listing UI yet).

### Applications (`/candidate/applications`)

- Empty state: “No Applications Yet”.

### Invitations

| Route | UI summary |
|-------|------------|
| `/candidate/invitations` | List with **filter chips**: All, Pending, Accepted, Declined, Cancelled (counts). Cards show company, role, status badges, journey styling; click navigates to detail. Loading spinner; empty state. |
| `/candidate/invitations/[id]` | **InvitationDetailClient**: rich detail — company/employer info, roadmap (`InterviewRoadmap`), time slot selection, **online vs physical** mode, accept/decline actions, meeting link / address / map links, MIS reschedule notice, **cancel invitation** flow (**Dialog** + reason **textarea**), job offer area (`JobOfferCard`), real-time updates via Supabase channel. Uses **Inputs**, **Buttons**, **Badges**, **Dialogs**. |

### Profile (`/candidate/profile`)

- **ProfileContent** loads `/api/candidate/profile`.
- **ProfileHeader** — photo, name, edit entry points.
- **Sections** (each with edit patterns):
  - **About** — `AboutDialog`
  - **Experience** — list + `ExperienceDialog`; delete uses `DeleteConfirmDialog`
  - **Education** — `EducationDialog` (+ finance/banking variants if applicable)
  - **Projects** — `ProjectDialog`
  - **Certifications** — `CertificationDialog`
  - **Awards** — `AwardDialog`
- **BasicInfoDialog** for core profile fields.
- Skeleton loading; error card if load fails.

### Resumes (`/candidate/resumes`)

- **ResumesClientContent**: card “Current Resume”; **file input** (PDF only, max 5MB); upload via `/api/candidate/upload-resume`; open/download links if `resume_url` present; loading skeletons and error alert.

### Settings (`/candidate/settings`)

- Placeholder: “Settings Coming Soon”.

---

## Employer

### Global navigation (authenticated)

**Layout:** `EmployerLayout` — `EmployerSidebar`, `EmployerHeader`, main, `Toaster`. Realtime: `EmployerInvitationRealtimeBridge`, `TimezoneSync` in dashboard layout.

**Sidebar** (`EmployerSidebar.tsx`):

| Item | Path | Gate |
|------|------|------|
| Dashboard | `/employer/dashboard` | Open |
| Job Postings | `/employer/jobs` | **Requires company MIS approval** — disabled + tooltip “Awaiting MIS approval” |
| Applications | `/employer/applications` | Same |
| Candidates | `/employer/candidates` | Same |
| Invitations | `/employer/invitations` | Same; **badge** for pending employer actions |
| Company Profile | `/employer/company` | Open |
| Company Admins | `/employer/admins` | Same as jobs |
| Settings | `/employer/settings` | Same |

**Header user menu** (`EmployerUserMenu`): company name; **Settings** link; theme toggle; logout. (Commented-out Company Admins link in source.)

### Onboarding & auth

| Route | UI summary |
|-------|------------|
| `/employer/signup` | **EmployerSignupWizard** — Step 1 **Company Information** (`CompanyInfoStep`: company name, BR number, industry, address, BR certificate upload); Step 2 **Your Information** (`EmployerProfileStep`: name, phone, email, password, job title). Progress bar; localStorage persistence; verify BR flow flag. |
| `/employer/verify-email` | **VerifyEmailForm** |
| `/employer/setup-password` | **EmployerSetupPasswordForm** |
| `/employer/login` | Employer-specific login form pattern (see `CandidateLoginForm` / employer variant if split) |
| `/employer/complete-profile` | **EmployerProfileWizard**: super admin — **Company Details** then **Your Details**; sub-admin — **Your Details** only. Company: description, size, website, HQ location, logo upload. Employer: department, address, phone. |

### Dashboard (`/employer/dashboard`)

- Pending company approval: **green informational banner** (spinner, copy about MIS review).
- **RestrictionToastListener**.
- **Stat cards**: Active Job Postings, Total Applications, Shortlisted, New Applications (placeholder zeros).
- **Recent Activity** card — empty placeholder.

### Candidates (`/employer/candidates`)

- **CandidateTable**:
  - **Filters**: **Combobox** / **Select** for **industry** (from DB); **job designation** depends on industry (API `/api/job-designations`).
  - **Table** of candidates with badges and metrics.
  - Row/detail: opens **CandidateDetailModal** — **Sheet** side panel with full profile sections, collapsible blocks, **PDF CV viewer** in **Dialog** (iframe pagination), **InviteCandidateButton**.

**InviteCandidateButton** (dialog workflow):

- **Dialog** for composing invitation: optional message, **dynamic time slots** (date + time selects, add/remove), industry/designation **Selects** (pre-filled from filters); submit sends invitation.
- **AlertDialog** for cancel invitation confirmation.
- Toast feedback.

### Invitations (`/employer/invitations`)

- **InvitationsClient**: master–detail pattern — list + selected invitation; URL query `?id=` sync.
- **Filters** for invitation status (all / pending / accepted / etc.).
- **Collapsible** sections: original details, confirmed interview, cancellation.
- **Dialog** to confirm interview time / enter **meeting link**, **address**, **map link** (employer confirmation step).
- **Dialog** for cancel with **textarea** reason.
- **InterviewRoundsDisplay**, **InterviewRoadmap**, pipeline badges.
- Components for feedback / next round / offers appear in related flows (`InterviewFeedbackDialog`, `NextRoundDialog`, `JobOfferDialog`, `RoundConfirmDialog`) when used from invitation or round UI.

### Company profile (`/employer/company`)

- **CompanyProfileClient**: view/edit company; super admin may open **CompanyInfoDialog**; approval-oriented messaging; potential industry/branding fields.

### Employer profile (`/employer/profile`)

- Read-only **Cards**: avatar fallback, name, job title, badges (department, designation), contact (email, phone, address), professional details.

### Company admins

| Route | UI summary |
|-------|------------|
| `/employer/admins` | Header: badge **Sub-Admins count / 5**; **Add Sub-Admin** button (super admin only, disabled at cap). **AdminProfilesClient** table/cards of admins. |
| `/employer/admins/add` | Back link; counter; warning banner if at limit; **AddSubAdminForm** in card (super admin only). |

---

## MIS (Management Information System)

### Global navigation

**Layout:** `MISLayout` — `MISSidebar`, `MISHeader`, main content.

**Sidebar** (`MISSidebar.tsx`): Dashboard, MIS User Management, Roles & Permissions, Candidates, Employers, Interviews, **Jobs**, Reports & Analytics, Audit Logs, Master Data.

**Header:** Sidebar toggle; page title/description; **`UserMenu`** (same component as candidate — dropdown links point to `/candidate/profile` and `/candidate/settings` in code).

### Auth & registration

| Route | UI summary |
|-------|------------|
| `/mis/login` | **MISLoginForm** |
| `/mis/register` | **MISSignupForm** (if enabled in product) |
| `/mis/setup-password` | **SetupPasswordForm** |

### Dashboard (`/mis/dashboard`)

- Grid of **linked cards** to main modules (users, roles, candidates, employers, jobs, reports, audit, master data) with icons and short descriptions; some cards show **counts** from DB.

### MIS users

| Route | UI summary |
|-------|------------|
| `/mis/users` | Primary button **Add MIS User**; **MISUserTable** (role, super admin flag, etc.). |
| `/mis/users/add` | Back link; **AddMISUserForm** in card. |

### Roles & permissions

| Route | UI summary |
|-------|------------|
| `/mis/roles` | Description text; **Create Role** button; **RolesTable** (actions, links to detail). |
| `/mis/roles/create` | **CreateRoleForm**. |
| `/mis/roles/[roleId]` | **EditRoleForm** + role metadata. |
| `/mis/roles/[roleId]/permissions` | Permission matrix / toggles (role-specific). |

### Candidate approvals (`/mis/candidates`)

- **CandidateTable**: **filter cards** — Pending / Approved / Rejected counts; table rows; opens **CandidateProfileView** (sheet or full-width detail) with **CandidateApprovalActions** (approve / reject + optional reason patterns).

### Employer (company) approvals (`/mis/employers`)

- **EmployerTable**: companies pending review; profile view; **EmployerApprovalActions**.

### Interviews (`/mis/interviews`)

- **InterviewsClient**: list/calendar-style overview; stats; **InterviewDetailView** for a row.
- **RescheduleModal**: MIS-driven reschedule (**Dialog**): date, time, mode, links/address, notes.
- Filters/status badges tied to invitation pipeline.

### Master data (`/mis/settings`)

- **MasterDataClient**: **Tabs** — Industries | Job designations (labels in UI).
- **Tables** with refresh/add.
- **Dialogs**: Add Industry (input name); Add Designation (name, **industry** select, **seniority level** select from fixed list Entry→Principal).
- Uses **Select**, **Input**, **Button**, toast notifications.

### Reports (`/mis/reports`)

- **ReportsClient**: dashboard-style **cards** — totals (candidates, employers, jobs, interviews, pending queues, activity); **recent activity** list with badges; loading skeletons.

### Audit logs (`/mis/audit`)

- **AuditLogsClient**: filterable **table** / log viewer (authentication events, errors — see component for columns and filters).

---

## Shared / reusable dialogs & modals (inventory)

| Component | Typical trigger |
|-----------|-----------------|
| `ApprovalStatusNotification` | Candidate dashboard after MIS decision |
| `InviteCandidateButton` | Employer candidate sheet |
| `CandidateDetailModal` | Employer browse candidates |
| `InterviewFeedbackDialog`, `NextRoundDialog`, `JobOfferDialog`, `RoundConfirmDialog` | Employer invitation / rounds flow |
| `CompanyInfoDialog` | Employer company edit |
| Candidate profile `*Dialog` components | Profile section edit |
| `DeleteConfirmDialog` | Deleting profile sub-records |
| `RescheduleModal` | MIS interviews |

---

## Implementation gaps (navigation vs routes)

These paths appear in **sidebars or menus** but **no matching `page.tsx`** was found under `src/app` at inventory time — designers should confirm whether they are planned screens or legacy links:

| Path | Referenced by |
|------|----------------|
| `/employer/jobs` | Employer sidebar |
| `/employer/applications` | Employer sidebar |
| `/employer/settings` | Employer sidebar + `EmployerUserMenu` |
| `/mis/jobs` | MIS sidebar + MIS dashboard card |

---

## Design notes for consistency

1. **Approval gating:** Candidate and employer sidebars **grey out** nav items until MIS approves profile/company; tooltips explain why.
2. **Invitation flows:** Heavy use of **dialogs** for cancel/reschedule/confirm; **badges** for pipeline state; **collapsibles** for long detail.
3. **Tables + filters:** Employer candidates (industry + designation); MIS candidates (status cards); MIS master data (tabs).
4. **Empty & loading:** Most list pages define skeletons, spinners, or friendly empty copy.
5. **MIS header user menu** reuses candidate links — may need redesign if MIS users should not land on candidate routes.

---

*Generated from repository structure and component usage. Update this file when adding routes or changing flows.*
