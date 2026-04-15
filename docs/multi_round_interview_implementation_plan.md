# Multi-Round Interview & Job Offer — Implementation Plan

## 1. Context & Goals

**Current state (relevant bits):**
- `JobInvitation` (prisma/schema.prisma) is the pipeline record. After candidate accepts (via `src/app/api/candidate/invitations/[id]/respond/route.ts`) and employer confirms (via `src/app/api/employer/invitations/[id]/confirm/route.ts`), the flow **ends**.
- `InterviewRound` (prisma/schema.prisma lines 584-591) model exists as a stub (only `id` + `invitation_id`) — unused.
- No `JobOffer` model exists.
- Emails go through `src/lib/interview-emails.ts`; events via `src/lib/logger.ts`.

**Goal.** After round 1 is confirmed, employer must be able to, *per round*, either:
1. **Advance** the candidate → schedule the next interview round (same flow as round 1: time slots → candidate accepts → employer confirms).
2. **Reject** the candidate → pipeline closes.
3. **Send a job offer** → candidate accepts/declines → pipeline closes.

Different companies run different numbers of rounds; round count must not be capped.

---

## 2. Data Model Changes

### 2.1 Promote `InterviewRound` to the first-class scheduling unit

Shift interview scheduling fields **off** `JobInvitation` and **onto** `InterviewRound`. `JobInvitation` becomes the overall "hiring pipeline" record; each round is a scheduled meeting with its own lifecycle.

**New `InterviewRound` fields:**

```prisma
model InterviewRound {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  invitation_id   String   @db.Uuid
  round_number    Int      // 1, 2, 3, ...
  round_label     String?  // e.g. "Technical", "Culture fit" — optional, employer-supplied

  // ---- Scheduling (moved from JobInvitation) ----
  status          RoundStatus   @default(pending)  // pending|viewed|accepted|declined|expired|confirmed|completed|canceled
  given_time_slots   Json
  alternative_dates  Json?
  selected_time_slot Json?
  interview_mode     InterviewMode?
  interview_confirmed Boolean @default(false)
  confirmed_time      Json?
  meeting_link        String?
  interview_address   String?
  map_link            String?
  confirmed_at        DateTime?

  // ---- Cancellation ----
  round_canceled       Boolean  @default(false)
  canceled_by          CanceledBy?
  cancellation_reason  String?
  canceled_at          DateTime?

  // ---- MIS reschedule (moved) ----
  mis_rescheduled     Boolean @default(false)
  mis_rescheduled_at  DateTime?
  mis_rescheduled_by  String? @db.Uuid
  mis_reschedule_data Json?

  // ---- Outcome (NEW — decision the employer makes after the round) ----
  outcome             RoundOutcome?   // advance|reject|offer|no_decision
  outcome_notes       String?
  outcome_at          DateTime?
  outcome_by          String? @db.Uuid   // employer user id

  sent_at      DateTime  @default(now())
  viewed_at    DateTime?
  responded_at DateTime?

  invitation JobInvitation @relation(fields: [invitation_id], references: [id], onDelete: Cascade)
  offer      JobOffer?

  @@unique([invitation_id, round_number])
  @@index([invitation_id])
  @@map("interview_rounds")
}

enum RoundStatus   { pending viewed accepted declined expired confirmed completed canceled }
enum RoundOutcome  { advance reject offer no_decision }
```

### 2.2 Slim down `JobInvitation` to pipeline metadata

Keep: `id`, `job_id`, `candidate_id`, `employer_id`, `company_id`, industry/designation/message. Add:

```prisma
pipeline_status      PipelineStatus @default(active)   // active|rejected|offered|hired|withdrawn|expired
current_round_number Int @default(1)
closed_at            DateTime?
closed_reason        String?
rounds               InterviewRound[]
offer                JobOffer?
```

Remove the scheduling fields now living on `InterviewRound`.

```prisma
enum PipelineStatus { active rejected offered hired withdrawn expired }
```

### 2.3 New `JobOffer` model

```prisma
model JobOffer {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  invitation_id  String   @unique @db.Uuid
  round_id       String?  @unique @db.Uuid          // round after which offer was made

  job_title      String
  salary_amount  Decimal? @db.Decimal(12,2)
  salary_currency String? @default("LKR")
  salary_period  SalaryPeriod? @default(monthly)    // monthly|annual
  start_date     DateTime?
  expiry_date    DateTime?
  offer_letter_url String?
  description    String?                             // benefits, terms, etc.

  status         OfferStatus @default(pending)       // pending|accepted|declined|withdrawn|expired
  decline_reason String?
  responded_at   DateTime?
  created_by     String  @db.Uuid                    // employer user id
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt

  invitation JobInvitation @relation(fields: [invitation_id], references: [id], onDelete: Cascade)
  round      InterviewRound? @relation(fields: [round_id], references: [id])

  @@map("job_offers")
}

enum OfferStatus  { pending accepted declined withdrawn expired }
enum SalaryPeriod { hourly daily monthly annual }
```

### 2.4 Migration strategy

Because `JobInvitation` has live scheduling data in production:

1. Add `InterviewRound` new columns and `JobOffer` table as **additive** migration.
2. Write a **data-backfill migration**: for every existing `JobInvitation`, create an `InterviewRound` with `round_number=1`, copy scheduling fields over.
3. Second migration: drop the now-migrated columns from `JobInvitation`; add `pipeline_status` / `current_round_number`.
4. Keep the two migrations in separate deploys so rollback is possible.

---

## 3. State Machine

```
Round N (pending)
  → candidate accepts → Round N (accepted)
  → employer confirms → Round N (confirmed)
  → interview happens → Round N (completed) [auto on confirmed_time + N hours, or manual]
  → employer decision:
       ├─ advance  → create Round N+1 (pending); invitation.current_round_number++
       ├─ reject   → invitation.pipeline_status = rejected; closed_at set
       └─ offer    → create JobOffer (pending); invitation.pipeline_status = offered
                      ├─ candidate accepts → invitation.pipeline_status = hired
                      └─ candidate declines → invitation.pipeline_status = rejected (or back to active per policy — decide: **default close**)
```

**Invariants to enforce in DB/logic:**
- Only the latest round can receive an outcome.
- Cannot create Round N+1 unless Round N outcome = `advance`.
- Cannot create an offer unless latest round is `completed` OR `confirmed` (allow "offer after 1 round, no formal completion" — configurable).
- `pipeline_status=active` required for any write.

---

## 4. API Routes

### 4.1 New endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/employer/invitations/[id]/rounds/[roundNumber]/complete` | Mark round completed (optional — can auto-complete on timer) |
| POST | `/api/employer/invitations/[id]/rounds/[roundNumber]/outcome` | Body: `{ outcome: 'advance'\|'reject'\|'offer', notes? }`. For `advance`, also accepts `nextRound: { time_slots, round_label? }` to create Round N+1 in one call. |
| POST | `/api/employer/invitations/[id]/rounds` | Create next round explicitly (time_slots, label). Used if outcome and scheduling are separated. |
| GET | `/api/employer/invitations/[id]/rounds` | List all rounds for an invitation |
| GET | `/api/employer/invitations/[id]/rounds/[roundNumber]` | Round detail |
| POST | `/api/employer/invitations/[id]/offer` | Create offer (closes pipeline to `offered`) |
| PATCH | `/api/employer/invitations/[id]/offer` | Edit/withdraw pending offer |
| GET | `/api/candidate/offers` | List offers for logged-in candidate |
| GET | `/api/candidate/offers/[id]` | Offer detail |
| POST | `/api/candidate/offers/[id]/respond` | Body: `{ action: 'accept'\|'decline', decline_reason? }` |

### 4.2 Refactor existing endpoints

All these currently read/write scheduling fields on `JobInvitation`. Update them to operate on the **latest active `InterviewRound`** of that invitation:

- `src/app/api/candidate/invitations/[id]/respond/route.ts` → writes to round
- `src/app/api/employer/invitations/[id]/confirm/route.ts` → writes to round
- `src/app/api/candidate/invitations/[id]/cancel-interview/route.ts` (both sides) → writes to round
- `src/app/api/mis/interviews/[id]/reschedule/route.ts` → writes to round
- `src/app/api/candidate/invitations/route.ts` / `src/app/api/employer/invitations/route.ts` → hydrate `rounds[]`, surface latest round for list UI

Keep URL shapes identical where possible to avoid client churn; the difference is internal (round lookup by `invitation_id + current_round_number`).

### 4.3 Authorization

- Employer endpoints: same pattern as existing — `employer.company_id` must match `invitation.company_id`.
- Candidate endpoints: `candidate.id === invitation.candidate_id`.
- Offer endpoints: same scoping.

---

## 5. UI Changes

### 5.1 Employer — `/employer/invitations/[id]`

Replace today's two-state right pane with a **Rounds timeline**:

- Vertical stepper: Round 1 → Round 2 → … → (Offer | Rejected)
- Each round card shows: round number, label, status badge, selected slot, mode, meeting link/address, outcome (if decided).
- **Action area** (only on latest round):
  - If `pending`/`accepted` and not confirmed → existing "Confirm interview" form.
  - If `confirmed` and interview time has passed (or button "Mark as completed") → show **Decision panel** with three buttons:
    - **Advance to next round** → opens next-round scheduling form (time slots + optional label) → creates Round N+1 and sends invitation email.
    - **Send offer** → opens offer form (title prefilled, salary, start date, expiry, notes, optional PDF upload) → creates JobOffer.
    - **Reject candidate** → confirmation modal with optional note → closes pipeline.
- Once outcome is recorded, panel becomes read-only.

### 5.2 Candidate — `/candidate/invitations/[id]`

- Same page now renders **all rounds** for this invitation, latest first.
- Latest round: existing accept/decline UI if pending.
- If pipeline_status = `offered`: bold banner "You've received a job offer" → link to offer detail.
- If pipeline_status = `rejected`: read-only closed banner.

### 5.3 Candidate — `/candidate/offers` (new)

- List page: offer cards (company logo, job title, salary, status, deadline).
- Detail page: full offer info + **Accept** / **Decline** actions.
- Wire into dashboard counter `offersReceived` in `src/app/actions/candidate-dashboard-data.ts` (currently reads "completed status" — update to count `JobOffer.status='pending'`).

### 5.4 Employer — candidate list

In `src/app/employer/(dashboard)/candidates/page.tsx`, the "invited" badge should reflect `pipeline_status` and `current_round_number` (e.g. "In Round 2", "Offered", "Hired").

### 5.5 MIS — `/mis/interviews`

- Filters should include `round_number` and `pipeline_status`.
- Stats: add counts by round and offers issued/accepted.

---

## 6. Emails (extend `src/lib/interview-emails.ts`)

New templates:
- `sendNextRoundInvitationEmail` — near-duplicate of `sendInterviewInvitationEmail` with "Round N" framing.
- `sendCandidateRejectedEmail` — polite rejection, optional note.
- `sendOfferIssuedEmail` — to candidate; salary, start date, expiry, CTA to offer page.
- `sendOfferAcceptedEmail` / `sendOfferDeclinedEmail` — to employer.
- `sendOfferWithdrawnEmail` — to candidate.

Reuse the timezone helper `src/lib/user-timezone.ts`.

---

## 7. Event Logging (`src/lib/logger.ts`)

New `action` values for `logBusiness`:
`round_advance`, `round_reject`, `round_completed`, `offer_created`, `offer_accepted`, `offer_declined`, `offer_withdrawn`. Resource type `invitation` or new `offer`.

---

## 8. Implementation Phases

**Phase 1 — Schema + backfill** (1-2 days)
- Write both migrations; run on staging; verify backfill created one Round-1 per existing invitation.

**Phase 2 — Refactor existing flow onto `InterviewRound`** (2-3 days)
- No new features yet; just move reads/writes. Candidate & employer UI keeps working. Ship as a silent refactor.

**Phase 3 — Outcome + next-round creation** (2-3 days)
- Add `/rounds/[n]/outcome` endpoint, "Advance / Reject" buttons, next-round email, employer timeline UI.

**Phase 4 — Job offers** (3-4 days)
- `JobOffer` CRUD, candidate offer list/detail pages, emails, dashboard counts.

**Phase 5 — MIS + polish** (1-2 days)
- Stats, filters, offer visibility in MIS dashboard.

**Phase 6 — QA** (1-2 days)
- End-to-end: 3-round interview → offer → accept. Plus rejection at each step.

---

## 9. Open Decisions (confirm before build)

1. **Round completion trigger** — auto after `confirmed_time + 2h`, or employer-clicked "Mark completed"? Recommend **both** (auto-flag + manual override).
2. **Offer before round completion?** — allow employer to skip rounds and offer directly after any confirmed round? Recommend **yes** (matches "some have only one" case).
3. **Candidate declines offer** — pipeline closes (`rejected`) or reopens to `active` so employer can pick another candidate path? Recommend **close** — simpler, matches industry norm.
4. **Multiple concurrent offers** — one candidate, multiple invitations from different companies → independent. One invitation → one offer (enforced by `@unique` on `invitation_id`).
5. **Withdraw offer** — allowed while `pending`; not after `accepted`.
