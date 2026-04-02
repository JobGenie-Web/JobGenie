# JobGenie — Database Setup Guide

This guide covers every scenario where you need to configure the database:
setting up a brand-new Supabase project, applying changes after a schema
migration, and updating security policies.

---

## Table of Contents

1. [How the system works](#1-how-the-system-works)
2. [Files you need to know](#2-files-you-need-to-know)
3. [Scenario A — New database from scratch](#3-scenario-a--new-database-from-scratch)
4. [Scenario B — After a Prisma schema change](#4-scenario-b--after-a-prisma-schema-change)
5. [Scenario C — Policy change only (no schema change)](#5-scenario-c--policy-change-only-no-schema-change)
6. [Scenario D — Full reset (wipe and rebuild)](#6-scenario-d--full-reset-and-rebuild-dev-only)
7. [npm script reference](#7-npm-script-reference)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. How the system works

JobGenie uses **two separate systems** to manage the database:

| System | Manages | Tool |
|--------|---------|------|
| **Prisma Migrations** | Tables, columns, enums, foreign keys | `prisma migrate deploy` |
| **SQL Policy Files** | RLS policies, grants, helper functions, storage buckets | `scripts/setup-database.ts` |

> **Why two systems?**  
> Prisma intentionally does not manage Row Level Security. Policies are kept in
> plain SQL files that you own and version-control directly.

The `npm run db:setup` command runs **both** in the correct order.

---

## 2. Files you need to know

```
JobGenie/
├── prisma/
│   └── complete_rls_policies.sql    ← All table RLS policies, GRANTs,
│                                       and helper functions (single source of truth)
├── supabase/
│   └── storage_rls_policies.sql     ← All storage bucket policies
│                                       (profile-images, resume, company-logos, …)
├── scripts/
│   └── setup-database.ts            ← Script that reads and applies both files above
└── .env.local                       ← Your database credentials (never commit this)
```

**When you add a new table via Prisma:**
→ Add its RLS section to `prisma/complete_rls_policies.sql`

**When you add a new storage bucket:**
→ Add its policies to `supabase/storage_rls_policies.sql`

---

## 3. Scenario A — New database from scratch

Use this when you create a new Supabase project or hand the project to
another developer.

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to finish provisioning (about 1–2 minutes).

### Step 2 — Get your credentials

Open the Supabase dashboard for your project and collect these values:

| Value | Location in Dashboard |
|-------|----------------------|
| **Project URL** | Settings → API → Project URL |
| **Anon / Public key** | Settings → API → Project API keys → `anon` |
| **Service role key** | Settings → API → Project API keys → `service_role` |
| **Database URL** | Settings → Database → Connection string → URI |

> **Important:** Use the **direct connection** URI (not the pooler) for the
> `DATABASE_URL` so that Prisma migrations and the setup script can run DDL
> statements.

### Step 3 — Configure environment variables

```bash
# Copy the example env file
cp .env.example .env.local
```

Open `.env.local` and fill in every value:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4 — Install dependencies

```bash
npm install
```

### Step 5 — Run the full setup

```bash
npm run db:setup
```

This single command does the following **in order**:

1. `prisma migrate deploy` — creates all tables, enums, and foreign keys
2. Applies `prisma/complete_rls_policies.sql`:
   - Creates `is_mis_user()`, `is_candidate()`, `is_employer()` helper functions
   - Grants correct permissions to `authenticated` and `anon` roles
   - Enables Row Level Security on all tables
   - Creates all RLS policies for every table
3. Applies `supabase/storage_rls_policies.sql`:
   - Ensures all 5 storage buckets exist with correct settings
   - Creates all 24 storage RLS policies
4. Sends `NOTIFY pgrst, 'reload schema'` to reload PostgREST

### Step 6 — Verify

```bash
npm run dev
```

Open the app in your browser and log in. All features should work without
any 500 errors or permission-denied messages.

---

## 4. Scenario B — After a Prisma schema change

Use this whenever you add a new table, column, or relation via Prisma.

### Step 1 — Make your schema change

Edit `prisma/schema.prisma` as needed.

### Step 2 — Create the Prisma migration

```bash
npx prisma migrate dev --name describe_your_change
```

This generates a new migration file under `prisma/migrations/`.

### Step 3 — Add RLS policies for any new tables

Open `prisma/complete_rls_policies.sql` and add a new section following the
exact same pattern as the existing tables. For example:

```sql
-- -----------------------------------------------------------
-- YOUR_NEW_TABLE
-- -----------------------------------------------------------
DROP POLICY IF EXISTS "..." ON your_new_table;

CREATE POLICY "..."
    ON your_new_table FOR SELECT TO authenticated
    USING (...);
```

> Follow the existing patterns:
> - Use `(SELECT auth.uid())` not `auth.uid()` (performance)
> - Use `public.is_mis_user()`, `public.is_employer()`, `public.is_candidate()` helpers
> - Include both `USING` and `WITH CHECK` on UPDATE policies

Also add the table to the **PART 2 (GRANTs)** and **PART 3 (Enable RLS)**
sections of the same file.

### Step 4 — Deploy the change

```bash
npm run db:setup
```

This deploys the Prisma migration and re-applies all policies safely
(every policy is `DROP IF EXISTS` before `CREATE`, so re-running is safe).

---

## 5. Scenario C — Policy change only (no schema change)

Use this when you only update RLS rules without touching the schema.

### Step 1 — Edit the policy file

- For **table policies**: edit `prisma/complete_rls_policies.sql`
- For **storage policies**: edit `supabase/storage_rls_policies.sql`

### Step 2 — Apply the changes

```bash
npm run db:policies
```

This skips Prisma migrations and only re-applies the SQL policy files.
Because every policy starts with `DROP POLICY IF EXISTS`, this is fully
idempotent — safe to run multiple times.

---

## 6. Scenario D — Full reset and rebuild (dev only)

> **Warning:** This deletes all data. Only use in development.

Use this when you want to completely wipe the database and start fresh.

```bash
npm run db:reset
```

This runs:
1. `prisma migrate reset --force` — drops all tables and re-runs all migrations from scratch
2. `scripts/setup-database.ts` — re-applies all policies

---

## 7. npm script reference

| Command | What it does |
|---------|-------------|
| `npm run db:setup` | Migrate schema + apply all policies (use for new DB or after schema change) |
| `npm run db:policies` | Apply policies only, no migration (use after editing SQL policy files) |
| `npm run db:reset` | **Destructive.** Wipe + remigrate + apply policies (dev only) |
| `npm run db:cleanup` | Delete old log entries based on retention settings |
| `npx prisma db seed` | Same as `db:policies` (Prisma's native seed command) |

---

## 8. Troubleshooting

### `DATABASE_URL is not set`

You have not created `.env.local` or the variable is missing.

```bash
cp .env.example .env.local
# Then fill in DATABASE_URL
```

### `Cannot read file: prisma/complete_rls_policies.sql`

Run the script from the project root:

```bash
cd /path/to/JobGenie
npm run db:setup
```

### `SSL connection required` / connection refused

Make sure `DATABASE_URL` uses the **direct connection** string from Supabase
(not the pooler URL), and that it ends with `?sslmode=require` or that your
connection string already includes SSL.

### `PGRST002` — PostgREST schema cache error after migration

The setup script automatically sends `NOTIFY pgrst, 'reload schema'` at
the end. If you still get `PGRST002` after running `db:setup`, wait
30 seconds and refresh your browser. PostgREST needs a moment to rebuild
its cache.

### Policy changes not taking effect

Re-run the apply command:

```bash
npm run db:policies
```

All policies are `DROP IF EXISTS` + `CREATE`, so re-running is always safe.

### Prisma migration conflict after `db:reset`

If Prisma complains about migration history after a reset, run:

```bash
npx prisma migrate reset --force
# Then re-apply policies
npm run db:policies
```

---

## Quick reference card

```
New Supabase project
└── npm run db:setup

Added a table in schema.prisma
└── npx prisma migrate dev --name your_change
└── add RLS section to prisma/complete_rls_policies.sql
└── npm run db:setup

Changed an RLS rule
└── edit prisma/complete_rls_policies.sql  (or storage_rls_policies.sql)
└── npm run db:policies

Wipe everything (dev only)
└── npm run db:reset
```
