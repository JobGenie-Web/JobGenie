# JobGenie Implementation Plan (Based on Current Missing-Features Document)

**Date:** 2026-02-18  
**Source:** `enterprise_readiness_architecture_spec.md`  
**Scope Rule:** Only items already identified as missing in the current system.

## 1. Delivery Approach

1. Plan horizon: 12 weeks (6 sprints, 2 weeks each).
2. Parallel workstreams:
- Workstream A: Product pages and UX completion.
- Workstream B: Jobs, applications, and reports backend.
- Workstream C: Security and authorization hardening.
- Workstream D: Auth/account flows.
- Workstream E: RLS/storage policy completion.
- Workstream F: Logging completion and quality gates.
3. Release strategy:
- Internal staging release at end of Sprint 3.
- Full production release at end of Sprint 6.

## 2. Epic Backlog (Mapped 1:1 to Missing Features)

| Epic ID | Epic | Missing Feature Covered | Key Outputs |
|---|---|---|---|
| EP-01 | Missing employer/MIS route implementation | Missing pages referenced in nav/middleware | Add pages for `/employer/jobs`, `/employer/applications`, `/employer/settings`, `/mis/jobs`, `/mis/reports`, `/mis/settings` |
| EP-02 | Candidate placeholder replacement | Candidate jobs/applications/settings placeholders | Real candidate jobs/applications/settings UIs wired to APIs |
| EP-03 | Employer dashboard and company jobs section completion | Employer stats TODO and company profile jobs placeholder | Real dashboard metrics + company jobs list |
| EP-04 | Jobs lifecycle completion | Incomplete job posting management workflow | Create/edit/publish/pause/close APIs + UI |
| EP-05 | Applications workflow implementation | Missing end-to-end applications flow | Application model + API + employer/candidate screens |
| EP-06 | MIS reports module implementation | Missing MIS reports module | Reports API + `/mis/reports` page |
| EP-07 | Generic upload/delete access control hardening | Missing authz on `/api/upload` and `/api/delete-file` | Authenticated + role/bucket/object checks |
| EP-08 | BR verification endpoint hardening | Missing access controls on `/api/verify-br-certificate` | Auth/rate limits/request validation |
| EP-09 | Privileged action actor verification | Missing actor verification in employer profile actions | Server-side `auth.getUser()` enforcement in privileged actions |
| EP-10 | Password reset flow implementation | Missing forgot/reset flow implied by schema | Forgot/reset pages + server actions + email flow |
| EP-11 | OAuth login implementation | Schema includes provider fields, runtime flow missing | OAuth provider login + callback + account linking |
| EP-12 | Universal login field fix | Wrong field `checkprofile_completed` | Fix to `profile_completed` and regression tests |
| EP-13 | RLS policy completion and tightening | Missing table coverage and permissive inserts | Full policy coverage for `job_invitations`, logs, stricter insert rules |
| EP-14 | Storage bucket policy completion | Partial storage policy coverage | Policies for all active buckets |
| EP-15 | API completion logging | Start-only API log with status=0/duration=0 | Final status/duration logging per request |

## 3. Sprint Plan

## Sprint 1 (Weeks 1-2): Critical Correctness + Security Baseline

1. Deliver EP-12 (universal login field fix).
2. Start EP-07: protect `/api/upload` and `/api/delete-file` with authentication and bucket allowlist.
3. Start EP-09: add actor verification in `completeEmployerProfile` and `updateCompanyInfo`.
4. Add tests for fixed auth redirect logic and protected file APIs.

**Exit Criteria**
- No unauthenticated upload/delete allowed.
- Candidate login redirect works with `profile_completed`.
- Privileged employer profile updates cannot be executed with forged userId.

## Sprint 2 (Weeks 3-4): Route Completion + Policy Foundation

1. Deliver EP-01 by creating all missing employer/MIS pages.
2. Start EP-13: add missing RLS policies for `job_invitations`, `event_logs`, `api_request_logs`, `error_logs`.
3. Start EP-14: add storage policies for `resume`, `resume_copy`, `profile-images`, `br-certificates`, `uploads`.
4. Remove/bound permissive `TO anon, authenticated` + `WITH CHECK (true)` cases where not required.

**Exit Criteria**
- All nav-linked routes exist and render.
- Policy script covers all currently used tables/buckets.

## Sprint 3 (Weeks 5-6): Jobs Workflow Completion

1. Deliver EP-04: job posting lifecycle APIs.
2. Implement employer jobs page UI on top of lifecycle APIs.
3. Deliver EP-03 (part 1): company profile jobs section with real data.
4. Deliver EP-03 (part 2): employer dashboard real metrics (active jobs, applications, etc.).

**Exit Criteria**
- Employers can create, edit, publish, pause, close jobs.
- Company jobs section and dashboard are data-driven.

## Sprint 4 (Weeks 7-8): Applications Workflow

1. Deliver EP-05: applications data model and status lifecycle.
2. Implement candidate applications page (replace placeholder).
3. Implement employer applications page (replace missing module).
4. Ensure invitation flow and applications flow are integrated coherently in UI.

**Exit Criteria**
- Candidate can view application list/status.
- Employer can view and update application statuses.

## Sprint 5 (Weeks 9-10): MIS Reports + Account Flows

1. Deliver EP-06: `/mis/reports` page with report endpoints.
2. Deliver EP-10: forgot/reset password flow.
3. Deliver EP-11: OAuth login flow.
4. Implement candidate settings page using real account/security controls tied to EP-10/EP-11.

**Exit Criteria**
- MIS reports module operational.
- Users can reset passwords end-to-end.
- OAuth login works for configured providers.

## Sprint 6 (Weeks 11-12): Logging Completion + Hardening + UAT

1. Deliver EP-15: request completion logging with final status and duration.
2. Deliver EP-08: BR verification endpoint controls (auth/rate limits/validation).
3. Full regression/UAT across candidate/employer/MIS flows.
4. Production readiness checklist and staged rollout.

**Exit Criteria**
- API logs contain accurate completion metrics.
- BR verification endpoint is protected.
- UAT sign-off from product + engineering.

## 4. Detailed Task Breakdown by Epic

## EP-01: Missing employer/MIS route implementation

1. Create route files for all missing pages.
2. Connect pages to existing layouts and sidebars.
3. Add loading/error boundaries where needed.
4. Add smoke tests for route accessibility by role.

## EP-02: Candidate placeholder replacement

1. Replace `candidate/jobs` placeholder with jobs query/filter UI.
2. Replace `candidate/applications` placeholder with application list and status timeline.
3. Replace `candidate/settings` placeholder with account/security settings surface.

## EP-03: Employer dashboard + company jobs completion

1. Replace dashboard TODO with real aggregate queries.
2. Replace company profile jobs placeholder with company jobs list.
3. Validate approval-state restrictions remain intact.

## EP-04: Jobs lifecycle completion

1. Add employer jobs APIs for create/edit/publish/pause/close.
2. Add server-side validations and role checks.
3. Build employer job-management UI actions.
4. Add audit/event logs for lifecycle transitions.

## EP-05: Applications workflow implementation

1. Add schema and migration for applications domain.
2. Add candidate apply/list/detail APIs.
3. Add employer review/status update APIs.
4. Add MIS visibility/reporting hooks for applications.

## EP-06: MIS reports module

1. Define report metrics based on existing entities.
2. Implement report query endpoints.
3. Build `/mis/reports` dashboard page.
4. Add export-friendly API response format.

## EP-07: Secure upload/delete APIs

1. Enforce authenticated sessions for both endpoints.
2. Add per-role bucket allowlist.
3. Add ownership/tenant checks before delete.
4. Remove direct free-form bucket/path manipulation from client payload usage.

## EP-08: BR verification endpoint hardening

1. Add auth check (or controlled anonymous flow with strict limits if required).
2. Add rate limiting and payload-size limits.
3. Add request schema validation and robust error codes.

## EP-09: Privileged action actor verification

1. Replace caller-trusted `userId` pattern with server-resolved actor.
2. Validate actor role and resource ownership.
3. Add negative tests for forged identity parameters.

## EP-10: Forgot/reset password flow

1. Add forgot password page and server action.
2. Add reset password page with token validation.
3. Use existing `password_reset_token` + expiry fields.
4. Add email templates and expiration handling.

## EP-11: OAuth flow

1. Add provider configuration and callback routes.
2. Link OAuth identities to user records.
3. Handle first-time signup vs existing account link.
4. Add role-aware post-login redirection.

## EP-12: Universal login field fix

1. Replace `checkprofile_completed` with `profile_completed` in universal login action.
2. Add regression tests for candidate redirect behavior.

## EP-13: RLS completion + tightening

1. Add policies for missing tables (`job_invitations`, logs).
2. Replace permissive insert policies with actor-scoped checks.
3. Validate all candidate/employer/MIS flows under RLS-enabled environment.

## EP-14: Storage policy completion

1. Define policies per active bucket and actor type.
2. Ensure bucket/object path conventions support ownership checks.
3. Test upload/read/delete for each role-path combination.

## EP-15: Request-completion logging

1. Implement middleware/handler integration to record final status and duration.
2. Keep correlation between request start and completion record.
3. Validate log accuracy with integration tests.

## 5. Dependencies and Sequencing Rules

1. EP-07 and EP-09 must be completed before enabling new job/application writes in production.
2. EP-13 and EP-14 must be completed before final go-live sign-off.
3. EP-04 should land before EP-02 jobs UI completion.
4. EP-05 should land before candidate/employer applications UIs are finalized.
5. EP-10/EP-11 should land before candidate settings is finalized.

## 6. Test Plan

1. Unit tests:
- Auth redirects, validations, permission guards, lifecycle transitions.

2. Integration tests:
- API authz on upload/delete/verification.
- Jobs lifecycle endpoints.
- Applications workflow endpoints.
- RLS policy-sensitive endpoints.

3. End-to-end tests:
- Candidate: login -> browse jobs -> apply -> track status.
- Employer: login -> create/publish job -> review applications.
- MIS: review reports and core admin routes.

## 7. Definition of Done

A feature is done only when:

1. UI and API implementation are complete.
2. Role/ownership authorization is enforced server-side.
3. RLS/storage policy behavior is validated.
4. Unit + integration + E2E tests pass.
5. Logging/observability entries are emitted for key actions.
6. Product owner signs off in staging.

## 8. Final Release Checklist

1. All missing routes/pages from navigation exist and are functional.
2. Placeholder pages are replaced with production implementations.
3. Jobs/applications/reports workflows are fully operational.
4. Upload/delete/verification endpoints are protected.
5. Password reset and OAuth flows are operational.
6. RLS and storage policies cover all active tables/buckets.
7. API completion logging includes accurate status and duration.



start implementations of sprint 2. in there no need to implement job section. it will implement later. continue with other features.