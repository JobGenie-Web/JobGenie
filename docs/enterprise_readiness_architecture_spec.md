# JobGenie Missing Features (Current System Only)

**Date:** 2026-02-18  
**Scope:** Only missing features that are already implied by the current codebase (routes, schema, UI links, TODOs, existing flows).

## 1. Missing Pages/Modules Already Referenced in the App

These are already linked/protected in navigation/middleware but not implemented as pages.

1. Employer pages missing:
- `src/app/employer/jobs/page.tsx` (missing)
- `src/app/employer/applications/page.tsx` (missing)
- `src/app/employer/settings/page.tsx` (missing)

2. MIS pages missing:
- `src/app/mis/jobs/page.tsx` (missing)
- `src/app/mis/reports/page.tsx` (missing)
- `src/app/mis/settings/page.tsx` (missing)

Evidence:
- Linked in `src/components/employer/EmployerSidebar.tsx`
- Linked in `src/components/mis/MISSidebar.tsx`
- Protected in `src/middleware.ts`

## 2. Existing Candidate Features Still Placeholder/Incomplete

1. Candidate job browsing is placeholder-only:
- `src/app/candidate/(dashboard)/jobs/page.tsx` (`Jobs Coming Soon`)

2. Candidate applications is placeholder-only:
- `src/app/candidate/(dashboard)/applications/page.tsx` (`No Applications Yet`)

3. Candidate settings is placeholder-only:
- `src/app/candidate/(dashboard)/settings/page.tsx` (`Settings Coming Soon`)

4. Employer dashboard metrics are not implemented:
- `src/app/employer/(dashboard)/dashboard/page.tsx` has `TODO: Fetch real stats from database`

5. Company profile jobs section is placeholder-only:
- `src/components/employer/CompanyProfileClient.tsx` shows `No jobs posted yet`

## 3. Missing Backend Feature Coverage for Existing Domain Models/Navigation

1. Job posting management workflow is incomplete.
- `jobs` table/model exists.
- Employer nav includes `Job Postings`.
- But route/API coverage only includes active jobs fetch (`src/app/api/employer/jobs/active/route.ts`), not full create/update/publish/close lifecycle.

2. Applications workflow is missing end-to-end.
- Candidate and employer nav include `Applications`.
- Candidate applications page is placeholder.
- No application model/workflow is implemented in current schema/routes.

3. MIS reports module is missing.
- MIS dashboard/sidebar links to reports.
- No `/mis/reports` page/API implementation exists.

## 4. Missing Access-Control Features on Existing APIs/Actions

1. Generic upload API missing authentication/authorization checks.
- `src/app/api/upload/route.ts` accepts bucket/folder and uploads via service-role client.
- No `auth.getUser()` and no role/bucket authorization.

2. Generic delete-file API missing authentication/authorization checks.
- `src/app/api/delete-file/route.ts` deletes by URL-derived bucket/path via service-role client.
- No caller identity check and no ownership check.

3. BR verification endpoint lacks request-level access controls.
- `src/app/api/verify-br-certificate/route.ts` is open POST endpoint.
- No authentication/rate-limit controls in current implementation.

4. Privileged employer profile actions rely on caller-provided identity argument.
- `src/app/actions/employer-profile.ts` (`completeEmployerProfile`, `updateCompanyInfo`) uses `createAdminClient()` and `userId` parameter.
- No internal `auth.getUser()` actor verification in these actions.

## 5. Missing Auth/Account Features Already Indicated by Existing Schema/Flows

1. Forgot/reset password flow is not implemented end-to-end.
- Schema has `password_reset_token` and `password_reset_expires_at` in `prisma/schema.prisma`.
- No corresponding user-facing flow/routes are implemented.

2. OAuth login flow is not implemented.
- Schema has `provider` / `provider_id` fields in `prisma/schema.prisma`.
- No OAuth runtime flow in auth actions/routes.

3. Universal login candidate completion check uses wrong field name.
- `src/app/actions/universal-auth.ts` selects `checkprofile_completed`.
- Current schema uses `profile_completed`.

## 6. Missing Policy Coverage for Existing Tables/Flows

1. RLS policy script does not cover all current tables used by the app.
- `prisma/complete_rls_policies.sql` covers many core tables, but no policies are defined for:
  - `job_invitations`
  - `event_logs`
  - `api_request_logs`
  - `error_logs`

2. Current policy script has permissive insert policies that are broad.
- Examples in `prisma/complete_rls_policies.sql`:
  - `TO anon, authenticated`
  - `WITH CHECK (true)` on key tables.

3. Storage policy coverage is partial.
- Separate policy file exists for `company-logos` only:
  - `supabase/company-logos-rls-policies.sql`
- No equivalent storage policy coverage for all currently used buckets (`resume`, `resume_copy`, `profile-images`, `br-certificates`, `uploads`).

## 7. Missing Request-Completion Logging for Existing Logging Design

1. API logs are recorded only at request start in middleware.
- `src/middleware.ts` logs `status: 0` and `duration: 0`.
- No completion-phase logging with real HTTP status and latency.

---

## Summary (Strictly Current-System Missing Features)

The main missing features in the existing system are:

1. Missing pages/routes already referenced by nav and middleware.
2. Placeholder candidate/employer modules not yet implemented.
3. Missing backend lifecycle coverage for jobs/applications/reports.
4. Missing access-control enforcement on generic file and verification APIs.
5. Missing account flows already implied by schema (password reset, OAuth).
6. Missing policy coverage for currently active tables/buckets.
7. Missing final API status/latency logging in the existing logging pipeline.
