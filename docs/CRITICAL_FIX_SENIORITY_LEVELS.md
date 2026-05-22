# CRITICAL FIX: Seniority Levels Relationship Issue

## Problem Identified

There is a **mismatch between the database seniority levels and the application code** that will cause the CSV bulk upload relationships to **fail**.

### Database Current State (OLD):
```sql
1 - 'Junior'
2 - 'Mid'
3 - 'Senior'
```

### Application Expected State (NEW):
```sql
1 - 'Entry Level'
2 - 'Junior'
3 - 'Mid Level'
4 - 'Senior'
5 - 'Lead'
6 - 'Principal'
```

## Impact

Without this fix:
- ❌ CSV bulk uploads for designations will **fail** with "Invalid seniority level" errors
- ❌ Existing designations display incorrect seniority levels
- ❌ Relationships between `job_designations` and `seniority_levels` are broken
- ❌ Users cannot add "Entry Level", "Lead", or "Principal" designations

## Solution

A migration has been created to:
1. Update the `seniority_levels` table with all 6 levels
2. Remap existing `job_designations` to the correct level IDs
3. Ensure backward compatibility with existing data

## How to Apply the Fix

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run this migration script:

```sql
-- Migration: Update Seniority Levels to match application
-- This migration updates the seniority_levels table to include all 6 levels
-- and remaps existing job designations to the new structure

BEGIN;

-- Update existing designations to new level mapping before clearing seniority_levels
-- Old level 1 (Junior) -> New level 2 (Junior)
-- Old level 2 (Mid) -> New level 3 (Mid Level)
-- Old level 3 (Senior) -> New level 4 (Senior)
UPDATE job_designations
SET level_id = CASE 
    WHEN level_id = 1 THEN 2  -- Junior -> Junior
    WHEN level_id = 2 THEN 3  -- Mid -> Mid Level
    WHEN level_id = 3 THEN 4  -- Senior -> Senior
    ELSE level_id
END;

-- Clear existing seniority levels
DELETE FROM seniority_levels;

-- Insert new seniority levels structure
INSERT INTO seniority_levels (level_id, level_name, level_order) VALUES
(1, 'Entry Level', 1),
(2, 'Junior', 2),
(3, 'Mid Level', 3),
(4, 'Senior', 4),
(5, 'Lead', 5),
(6, 'Principal', 6);

COMMIT;
```

### Option 2: Using Supabase CLI

If you have Supabase linked:

```bash
npx supabase db push
```

The migration file is located at:
- `supabase/migrations/20260522_update_seniority_levels.sql`

### Option 3: Using Direct Database Connection

If you have psql or another PostgreSQL client:

```bash
psql -h [your-host] -U [your-user] -d [your-db] -f supabase/migrations/20260522_update_seniority_levels.sql
```

## Verification

After applying the migration, verify it worked:

### 1. Check Seniority Levels

```sql
SELECT * FROM seniority_levels ORDER BY level_id;
```

Expected output:
```
level_id | level_name   | level_order
---------|--------------|-------------
1        | Entry Level  | 1
2        | Junior       | 2
3        | Mid Level    | 3
4        | Senior       | 4
5        | Lead         | 5
6        | Principal    | 6
```

### 2. Check Designation Mappings

```sql
SELECT 
    jd.designation_name,
    i.industry_name,
    sl.level_name
FROM job_designations jd
JOIN industries i ON jd.industry_id = i.industry_id
JOIN seniority_levels sl ON jd.level_id = sl.level_id
ORDER BY jd.designation_id
LIMIT 10;
```

All designations should now show proper seniority level names.

### 3. Test CSV Upload

1. Navigate to `/mis/settings`
2. Go to "Job Designations" tab
3. Download the template
4. Upload a test CSV with various seniority levels
5. Verify all uploads succeed

## CSV Template Format (After Fix)

### Industries CSV
```csv
industry_name
Banking
Finance & Investment
IT / Software Development
```

### Job Designations CSV
```csv
designation_name,industry_name,seniority_level
Entry Level Developer,IT / Software Development,Entry Level
Junior Software Engineer,IT / Software Development,Junior
Mid Level Engineer,IT / Software Development,Mid Level
Senior Software Engineer,IT / Software Development,Senior
Lead Architect,IT / Software Development,Lead
Principal Engineer,IT / Software Development,Principal
```

## Technical Details

### Files Modified/Created

1. **Migration Files:**
   - `prisma/migrations/20260522_update_seniority_levels/migration.sql`
   - `supabase/migrations/20260522_update_seniority_levels.sql`

2. **Existing Implementation (Already Correct):**
   - `src/app/api/mis/master-data/designations/bulk-upload/route.ts` - Maps CSV values to level IDs
   - `src/app/mis/(dashboard)/settings/MasterDataClient.tsx` - Displays all 6 levels

### Level Mapping in Bulk Upload

The bulk upload API correctly maps (case-insensitive):
```typescript
{
  "entry level": 1,
  "junior": 2,
  "mid level": 3,
  "senior": 4,
  "lead": 5,
  "principal": 6
}
```

### Data Migration Map

Existing job designations are automatically remapped:
```
Old DB Level 1 (Junior)   → New Level 2 (Junior)
Old DB Level 2 (Mid)      → New Level 3 (Mid Level)
Old DB Level 3 (Senior)   → New Level 4 (Senior)
```

This ensures no data is lost and all existing designations continue to work.

## Status

- ✅ Migration file created
- ✅ API endpoints support all 6 levels
- ✅ UI displays all 6 levels
- ✅ CSV templates include all 6 levels
- ⏳ **PENDING: Run the migration on your database**

## Next Steps

1. **REQUIRED:** Run the migration using one of the options above
2. **Verify:** Check that seniority levels are correct
3. **Test:** Try uploading a designation CSV
4. **Monitor:** Check for any errors in the console

After running the migration, the CSV bulk upload feature will work correctly with full relationship integrity!
