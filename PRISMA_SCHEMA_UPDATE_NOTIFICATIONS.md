# Prisma Schema Update - Notifications Model

**Date:** May 23, 2026  
**Related Migration:** `supabase/migrations/20260523_04_notifications_system.sql`

---

## Summary

Updated `prisma/schema.prisma` to include the `Notification` model that matches the notifications table created in Phase 5. The Prisma schema now accurately reflects the database schema for the realtime notifications system.

---

## Changes Made

### 1. Added Notification Model

```prisma
model Notification {
  id      String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id String  @db.Uuid

  type    String  @db.Text
  title   String  @db.Text
  body    String? @db.Text
  data    Json?
  is_read Boolean @default(false)

  created_at DateTime @default(now()) @db.Timestamptz(6)

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, is_read, created_at(sort: Desc)])
  @@index([user_id, created_at(sort: Desc)])
  @@map("notifications")
}
```

### 2. Updated User Model

Added the `notifications` relation to the `User` model:

```prisma
model User {
  // ... existing fields ...
  
  // Relations
  candidate     Candidate?
  employer      Employer?
  mis_user      MisUser?
  notifications Notification[]  // ← NEW
  
  // ... indexes ...
}
```

---

## Field Mapping: SQL → Prisma

| SQL Column | SQL Type | Prisma Field | Prisma Type |
|---|---|---|---|
| `id` | `UUID PRIMARY KEY` | `id` | `String @id @db.Uuid` |
| `user_id` | `UUID NOT NULL` | `user_id` | `String @db.Uuid` |
| `type` | `TEXT NOT NULL` | `type` | `String @db.Text` |
| `title` | `TEXT NOT NULL` | `title` | `String @db.Text` |
| `body` | `TEXT` | `body` | `String? @db.Text` |
| `data` | `JSONB` | `data` | `Json?` |
| `is_read` | `BOOLEAN NOT NULL DEFAULT false` | `is_read` | `Boolean @default(false)` |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT now()` | `created_at` | `DateTime @default(now()) @db.Timestamptz(6)` |

---

## Index Comparison

### SQL Migration Indexes

```sql
-- Partial index for unread notifications
CREATE INDEX IF NOT EXISTS notifications_user_id_unread_idx
  ON public.notifications (user_id, is_read, created_at DESC)
  WHERE is_read = false;

-- Index for all notifications
CREATE INDEX IF NOT EXISTS notifications_user_id_created_at_idx
  ON public.notifications (user_id, created_at DESC);
```

### Prisma Schema Indexes

```prisma
@@index([user_id, is_read, created_at(sort: Desc)])
@@index([user_id, created_at(sort: Desc)])
```

**Note:** Prisma doesn't support partial index WHERE clauses in the schema file. The actual partial index (with `WHERE is_read = false`) was created via the SQL migration and will remain in the database. Prisma's index definition is close enough for client generation purposes and won't conflict with the existing indexes.

---

## Relation & Cascade Behavior

Both SQL migration and Prisma schema implement:

- **Foreign Key:** `user_id` → `users.id`
- **On Delete:** `CASCADE` (deleting a user deletes all their notifications)
- **Relation Name:** `notifications` (User has many Notifications)

---

## RLS Policy

The RLS policy was created via SQL migration:

```sql
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_notifications" 
  ON public.notifications
  FOR ALL 
  USING ((SELECT auth.uid()) = user_id);
```

**Note:** Prisma doesn't have native RLS support in the schema file. RLS policies are managed entirely via SQL migrations and work transparently with the Prisma client when using `service_role` key (which bypasses RLS).

---

## Triggers & Functions

The following were created via SQL migration and are not represented in Prisma schema (this is expected):

### Function
- `notify_user(p_user_id, p_type, p_title, p_body, p_data)` - Helper function to insert notifications

### Triggers
- `trigger_notify_invitation_insert` → `job_invitations`
- `trigger_notify_invitation_update` → `job_invitations`
- `trigger_notify_round_insert` → `interview_rounds`
- `trigger_notify_round_update` → `interview_rounds`
- `trigger_notify_offer_insert` → `job_offers`
- `trigger_notify_offer_update` → `job_offers`

**Note:** Prisma doesn't support defining triggers/functions in the schema. These are managed via SQL migrations and work alongside Prisma operations.

---

## Prisma Client Generation

After updating the schema, the Prisma client was regenerated:

```bash
npx prisma generate
```

**Output:**
```
✔ Generated Prisma Client (7.7.0) to .\src\generated\prisma in 2.55s
```

The Prisma client now includes TypeScript types for the `Notification` model:

```typescript
// Auto-generated types available:
import { Notification } from '@/generated/prisma';

// Prisma client methods:
prisma.notification.findMany()
prisma.notification.create()
prisma.notification.update()
prisma.notification.delete()
// etc.
```

---

## Usage in Code

The Prisma client can now be used to query notifications (though the frontend uses Supabase client via `@supabase/supabase-js` directly for real-time subscriptions):

```typescript
// Using Prisma (server-side, service_role)
import { prisma } from '@/lib/prisma';

const notifications = await prisma.notification.findMany({
  where: { 
    user_id: userId,
    is_read: false 
  },
  orderBy: { created_at: 'desc' },
  take: 50
});

// Using Supabase client (client-side + server-side)
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);
```

**Note:** The frontend uses Supabase client because it supports:
- Realtime subscriptions
- Row Level Security (respects current user's auth.uid())
- Automatic type inference from database schema

Server-side API routes typically use Prisma with the service_role key which bypasses RLS.

---

## Verification Checklist

- [x] Notification model added to Prisma schema
- [x] User relation updated with notifications array
- [x] Field types match SQL migration
- [x] Default values match SQL migration
- [x] Indexes defined (partial index limitation noted)
- [x] Cascade delete behavior matches
- [x] Prisma client regenerated successfully
- [x] No linter errors

---

## Database Schema Consistency

The Prisma schema now accurately represents the notifications table in the database:

| Aspect | SQL Migration | Prisma Schema | Match? |
|---|---|---|---|
| Table Name | `notifications` | `@@map("notifications")` | ✅ |
| Primary Key | `id UUID` | `id String @id @db.Uuid` | ✅ |
| Foreign Key | `user_id → users.id` | `user User @relation()` | ✅ |
| Cascade Delete | `ON DELETE CASCADE` | `onDelete: Cascade` | ✅ |
| Field Types | Match | Match | ✅ |
| Default Values | Match | Match | ✅ |
| Indexes | Match (with partial index note) | Match | ⚠️ * |
| RLS Enabled | Yes | N/A (managed via SQL) | ✅ |
| Triggers | Yes | N/A (managed via SQL) | ✅ |

\* Prisma indexes match, but the partial index WHERE clause is only in SQL (expected limitation)

---

## Important Notes

1. **Prisma Limitations:** Prisma doesn't support:
   - Partial indexes with WHERE clauses
   - RLS policy definitions
   - Trigger definitions
   - Function definitions
   
   These are managed via SQL migrations and work alongside Prisma.

2. **Schema Source of Truth:** For the notifications system:
   - **Table structure:** Defined in both SQL migration and Prisma schema (consistent)
   - **RLS policies:** Defined only in SQL migration
   - **Triggers/Functions:** Defined only in SQL migration
   - **Partial indexes:** Defined only in SQL migration (Prisma has equivalent non-partial indexes)

3. **Frontend vs Backend:**
   - Frontend uses Supabase client for RLS-aware queries + Realtime
   - Backend API routes can use Prisma (bypasses RLS with service_role key)
   - Both access the same database table

---

## Next Steps

No further action required. The Prisma schema is now in sync with the database schema for the notifications table.

For future schema changes:
1. Create SQL migration in `supabase/migrations/`
2. Apply migration to database
3. Update Prisma schema to match
4. Regenerate Prisma client with `npx prisma generate`

---

**Schema Update Complete** ✅
