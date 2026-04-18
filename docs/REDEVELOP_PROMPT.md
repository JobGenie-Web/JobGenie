# JobGenie — Redevelopment & Future Roadmap Prompt

## 1. Overview

This document is a comprehensive prompt and blueprint for redeveloping the JobGenie application located in this workspace. It is intended to be used by engineering teams and AI code-generation agents to rebuild, improve, and extend the product.

Goals:
- Deliver a modern, maintainable, secure, and testable full-stack application.
- Preserve and migrate existing data and Prisma schema, including RLS policies where applicable.
- Improve developer DX, CI/CD, observability, and performance.
- Enable a clear roadmap for additional features post-launch.

Audience: engineering lead, frontend/backend developers, DevOps, QA, and prompt-engineers running code-generation agents.

---

## 2. Current repo notes (context-aware)
- Monorepo root contains a Next.js app with TypeScript (`tsconfig.json`, `next.config.ts`).
- Uses Prisma with migrations and RLS-related SQL files in `prisma/` and `supabase/`.
- `src/` contains server and client code: `app/` routes, `api/` endpoints, `components/`, `lib/`, and `generated/prisma`.
- There are utilities for PDF generation, storage, email, and features like finance/banking, MIS, employer/candidate flows.
- Several action files exist under `src/app/actions/` implying server-side business logic.

Assumptions to validate during discovery:
- Auth provider (Supabase, NextAuth, custom) and session strategy.
- Existing DB engine and hosting (likely Postgres due to Prisma + RLS SQL files).
- Any runtime environment specifics (Vercel, Docker, Azure, etc.).

---

## 3. High-level architecture & tech stack (recommended)
- Frontend: Next.js 14+ (App Router), React 18+, TypeScript, Tailwind CSS / CSS Modules for styles.
- Backend: Next.js server actions / API routes for lightweight endpoints. Use a small Node.js service (if needed) for long-running tasks.
- DB: PostgreSQL with Prisma ORM. Maintain RLS policies; ensure migrations preserved.
- Auth: Supabase Auth or NextAuth with JWTs/session cookies; centralize auth in `src/app/actions/universal-auth.ts`.
- Storage: S3-compatible (or Supabase Storage); keep `lib/storage.ts` interface.
- Email: Use transactional provider (SendGrid/SES) and keep `lib/email.ts` abstraction.
- CI/CD: GitHub Actions for lint/test/build/deploy; Docker for reproducible builds.
- Observability: Sentry for errors, Prometheus/Datadog for metrics, structured logging via `lib/logger.ts`.

---

## 4. Primary objectives for redevelopment
- Modularize code: split features into clear modules (auth, employer, candidate, mis, finance, profile).
- Type safety: fill missing types and improve `types/` coverage.
- Tests: add unit tests (Jest/ts-jest), integration tests, and E2E (Playwright).
- API consistency: standardize request/response shapes, pagination, error handling.
- Security: fix OWASP issues, ensure proper input validation, sanitize file uploads.
- Performance: server-side rendering for public pages, caching for heavy queries, background jobs for long tasks.

---

## 5. MVP feature list (redevelop deliverables)
- Auth: sign-up, login, password reset, profile verification.
- Employer flows: create/update profiles, post jobs, view applicants.
- Candidate flows: profile creation, upload CV, apply to jobs, CV parsing.
- Job search & filters: by industry, designation, location, salary.
- Admin / MIS: basic dashboards for metrics, job counts, user counts, activity logs.
- File handling: secure presigned uploads, deletions.
- Email notifications for key events.
- Prisma migrations applied and database seeded for dev.

Acceptance criteria: for each item include API contract, tests, and UI storybook component or screenshots.

---

## 6. Data & migration plan
- Audit current `prisma/schema.prisma` and migration SQL files under `prisma/migrations`.
- Create migration plan to move production DB (backup first). Preserve RLS policies (files in `prisma/` and `supabase/`).
- Add a `prisma/seed.ts` to create test/dev data.
- Add scripts: `db:migrate`, `db:seed`, `db:reset` in `package.json`.

---

## 7. API & Backend conventions
- Use structured API responses: { success: boolean, data?: T, error?: { code, message } }
- Centralized error handler middleware for API routes and server actions.
- Request validation using Zod schemas; convert to TypeScript types.
- Rate limiting for public endpoints.
- Versioned API pathing for public APIs (e.g., `/api/v1/...`).

---

## 8. Frontend conventions
- Use the Next.js App Router with server components for data-heavy pages and client components for interactive UI.
- Central state via React Context where appropriate; avoid global singletons.
- Keep `components/ui/` for primitives, `components/*` for feature-specific components.
- Component stories using Storybook for complex UI elements.

---

## 9. Testing strategy
- Unit tests: Jest + testing-library/react for components and lib functions.
- Integration tests: test API endpoints against a test DB (Dockerized Postgres) using Jest or Supertest.
- E2E: Playwright for critical flows (sign up, post job, apply).
- CI: run lint, typecheck, unit tests, and E2E on PR merge to main.

---

## 10. CI/CD and deployment
- GitHub Actions workflows:
  - `ci.yml`: lint, typecheck, tests, build.
  - `deploy.yml`: build artifacts, docker image (if using Docker), deploy to hosting provider (Vercel, Azure, AWS ECS).
- Add preview environments per PR.

---

## 11. Security checklist
- Review dependencies for CVEs.
- Ensure input validation + output encoding.
- Ensure secure cookie flags, CSRF protections, and CORS policy.
- Harden file upload to only allow safe types and virus-scan attachments if required.
- Keep RLS policies tested and documented.

---

## 12. Observability & maintenance
- Add Sentry DSN configurable by env.
- Add structured logs (request id, user id) via `lib/logger.ts`.
- Export metrics: request rate, error rate, latencies.

---

## 13. Feature backlog & roadmap (post-launch)
Phase 1 (MVP): core flows (see section 5).

Phase 2 (short-term after launch):
- Advanced job recommendations (ML-powered), matching score in candidate view.
- Rich analytics for employers (opens, applications, source of applicants).
- Improve CV parsing accuracy with domain-specific models; auto-suggest job titles and skills.
- Saved searches and email digests.
- Role-based access control (more granular than RLS), feature flags.

Future features (longer-term):
- Marketplace for freelance/job contracts, payments integration.
- Multi-tenant support for agencies and enterprises.
- Mobile apps (React Native / Expo) with push notifications.
- Integrations: LinkedIn sync, Google Jobs, background-check vendors, payroll providers.
- AI assistant for recruiters (candidate summarization, interview question generator).
- Real-time collaboration for hiring teams with comments and candidate scoring.

---

## 14. Prompts for AI-assisted development (copyable)
Use the following prompts for focused AI generation tasks. Include repo path context and any file snippets where helpful.

- "Refactor: Convert the `src/app/actions/*` server actions to use Zod validation and typed return values. Show changed files and tests." 
- "Implement: Create a `POST /api/v1/jobs` endpoint that validates input with Zod, creates a job in Prisma, and sends an employer confirmation email. Use the project's existing `lib/email.ts` and `lib/logger.ts` abstractions." 
- "Implement: Add Playwright E2E test that signs up a candidate, uploads CV, and applies to a job. Provide test data and DB seed steps." 
- "Audit: Produce a list of all env variables required, and create an `.env.example` with descriptions and default dev values." 
- "Document: Generate an API spec (OpenAPI / Swagger) for all `src/api` endpoints, including request and response schemas." 

Guidelines when using AI: always run tests and typecheck generated code; prefer small PRs; request unit tests along with feature code.

---

## 15. Developer handoff & deliverables
For each completed feature module deliver:
- Implementation code in feature folder under `src/`.
- Unit and integration tests.
- Migration(s) if DB changes needed + `prisma/seed.ts` updates.
- API docs (OpenAPI or Markdown) and acceptance criteria.
- Short how-to-run fragment in `README.md` for the feature.

---

## 16. Timeline & rough estimates (team of 3: 2 devs, 1 QA)
- Discovery & infra setup: 1 week
- Core backend + DB migration: 2–3 weeks
- Frontend rewrite for main flows: 2–3 weeks
- Tests and CI/CD: 1–2 weeks
- Polish + performance/security: 1 week
Total MVP: ~7–10 weeks

---

## 17. Acceptance Criteria checklist (example)
- End-to-end sign-up/login works with tests.
- Employers can create jobs and view applicants (API + UI + E2E).
- Candidate can create profile, upload CV, and apply (API + UI + E2E).
- Prisma migrations applied and seed available.
- CI runs green for build, lint, and tests.

---

## 18. Recommended immediate next steps (developer actions)
1. Run a quick repo audit to confirm runtime assumptions (auth provider, DB connection, hosting).  
2. Create a branch `redev/plan` and add this `REDEVELOP_PROMPT.md` to repo.  
3. Add `package.json` scripts: `db:migrate`, `db:seed`, `test:unit`, `test:e2e`, `lint`.  
4. Start with a small PR: API validation + tests for a single endpoint (e.g., `employer-profiles`).

---

## 19. Contact & collaboration notes
- Use small, reviewable PRs with descriptive titles.  
- Keep tasks atomic and add acceptance tests.  
- Record decisions in `DECISIONS.md` for architecture-changing choices.

---

## 20. Appendix: Example AI prompt to implement a key endpoint
"You are a TypeScript engineer. Implement a `POST /api/v1/jobs` Next.js API route (App Router or API route) that:
- Validates body with Zod (title, description, industryId, designationId, salaryRange).
- Authenticates employer via existing auth utilities.
- Inserts job in Prisma and returns full job object.
- Sends confirmation email using `lib/email.ts`.
- Write unit tests using Jest and an integration test that uses a test DB. Show only changed/new files and tests."


---

_End of prompt blueprint._

---

## New features to develop next (detailed)

Priority: Ordered by impact → effort. Start with High impact / Low-to-medium effort items.

High Priority (implement after MVP):
- AI Match & Recommendations: candidate-job matching score, personalized job recommendations, employer-side candidate suggestions (use a lightweight vector index or ML model + scoring service).
- Saved Searches & Alerts: allow candidates and employers to save queries and receive digest email/SMS updates.
- Advanced CV Parsing & Auto-Suggestions: integrate an improved parsing pipeline that extracts skills, experience, education, and maps to canonical job designations; provide auto-suggested titles/skills during profile editing.
- Interview Scheduling + Calendar Sync: calendar availability, interview time slots, Google/Outlook integration, auto-confirmation emails and reminders.

Medium Priority:
- Employer Analytics & Funnel Tracking: application conversion funnel, source attribution, time-to-hire, exports (CSV/XLSX) and scheduled reports.
- In-app Messaging & Notes: private comments for hiring teams, candidate tagging, basic audit trail.
- Resume Anonymization / Blind Hiring Mode: anonymize candidate identifiers for unbiased screening.
- Role-Based Access & Feature Flags: fine-grained permissions for orgs and feature toggles.

Lower Priority / Future:
- Payments & Job Boosts: paid job promotions, invoices, simple Stripe integration.
- Multi-tenant Agency Mode: agencies can manage multiple clients, tenant isolation, per-tenant billing.
- Candidate Assessments & Code Tests Integration: connect to testing providers or embed lightweight assessments.
- Background Checks & Integrations: connect to background-check providers via pluggable integrations.

Cross-cutting features to deliver alongside the above:
- Localization & Accessibility: i18n support, WCAG accessibility review and fixes.
- Audit Logs & Compliance: robust audit trail for admin actions, data export tools for GDPR/DSAR.
- Notifications Hub: centralize email/SMS/push channels, templating, and opt-in preferences.
- Admin Marketplace / Templates: reusable job-post templates, employer-branding blocks, and onboarding wizards.

Prioritization guidance and acceptance criteria:
- For each feature add: user stories, API contract, data model changes (Prisma), required migrations, wireframes or component mocks, and test plan (unit + integration + E2E).
- Timebox each medium-sized feature to a 1–3 sprint deliverable: break into backend API, frontend UI, tests, migrations, and monitoring.

Quick implementation suggestions for top 3 features:
1. AI Match & Recommendations (Feature #1)
  - MVP: simple scoring service that weights skills, designation match, location, and experience. Return top-N matches with confidence score.
  - Data: create `job_matches` cached table or Redis index for periodic recompute.
  - API: `GET /api/v1/recommendations?candidateId=...` and `GET /api/v1/recommendations?jobId=...`.

2. Saved Searches & Alerts (Feature #2)
  - MVP: saved search records in DB, scheduled worker (cron) for digest emails (daily/weekly), use existing `lib/email.ts`.
  - API: CRUD endpoints for saved searches, subscription settings.

3. Advanced CV Parsing & Auto-Suggestions (Feature #3)
  - MVP: pipeline that runs parsing on upload (server action) and stores parsed JSON in `candidate_profiles.parsed_cv`.
  - Integrations: allow swapping parser model (open-source or third-party) behind an interface.

Metrics to track per feature:
- Usage: feature adoption rate, active users using feature, created items (saved searches, messages, boosts).
- Performance: latency of core APIs, queue/backlog sizes for background jobs.
- Business: conversions (applies per job), time-to-hire, revenue from paid features.

Implementation notes:
- Start each feature as a branch and open a small initial PR that scaffolds DB changes, minimal API contract, and tests.
- Prefer feature flags to safe-rollout new capabilities.

---

_End of additions._
