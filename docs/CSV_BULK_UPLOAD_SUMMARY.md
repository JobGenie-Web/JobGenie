# Master Data CSV Bulk Upload - Implementation Summary

## ✅ Features Implemented

### 1. CSV Template Download & Upload for Industries
- **Download Template**: Generates a CSV file with sample industry data
- **Upload CSV**: Bulk import multiple industries at once
- **Validation**: Ensures industry names are provided and not empty
- **Auto ID Generation**: Automatically assigns sequential industry IDs

### 2. CSV Template Download & Upload for Job Designations
- **Download Template**: Generates a CSV with sample designation data including industry and seniority level
- **Upload CSV**: Bulk import multiple designations with full relationship mapping
- **Validation**: 
  - Ensures all required fields are present
  - Validates industry names against existing industries
  - Validates seniority levels against valid options
  - Provides detailed error messages for each row

### 3. User Interface Enhancements
- Added Download Template and Upload CSV buttons to both Industries and Job Designations tabs
- Loading states during upload
- Success/error toast notifications
- Helpful instructions showing CSV format requirements
- Clean, intuitive layout with action buttons

## 📁 Files Created/Modified

### New API Endpoints
1. `src/app/api/mis/master-data/industries/bulk-upload/route.ts`
   - Handles CSV parsing and bulk industry insertion
   - Validates data integrity
   - Requires super admin access

2. `src/app/api/mis/master-data/designations/bulk-upload/route.ts`
   - Handles CSV parsing for designations
   - Maps industry names to IDs
   - Maps seniority level names to IDs
   - Validates relationships before insertion
   - Requires super admin access

### Updated Files
3. `src/app/mis/(dashboard)/settings/MasterDataClient.tsx`
   - Added papaparse import for CSV generation
   - Added download template functions
   - Added file upload handlers
   - Added UI buttons and file inputs
   - Added upload state management

### Documentation
4. `docs/CSV_BULK_UPLOAD_GUIDE.md`
   - Complete user guide for the CSV upload feature
   - CSV format specifications
   - Validation rules
   - Error handling documentation
   - Best practices

5. `docs/CRITICAL_FIX_SENIORITY_LEVELS.md`
   - Detailed explanation of the seniority level mismatch issue
   - Migration instructions
   - Verification steps

### Migration Files
6. `prisma/migrations/20260522_update_seniority_levels/migration.sql`
7. `supabase/migrations/20260522_update_seniority_levels.sql`
   - Updates seniority_levels table structure
   - Remaps existing job_designations

### Scripts
8. `scripts/update-seniority-levels.ts`
   - Automated migration script
   - Can be run with: `npm run db:update-seniority-levels`

### Package Updates
9. `package.json`
   - Added papaparse and @types/papaparse dependencies
   - Added npm script: `db:update-seniority-levels`

## ⚠️ CRITICAL: Fix Required Before Use

### The Issue
There is a **mismatch between database and application seniority levels**:

**Database Currently Has:**
- 1: Junior
- 2: Mid
- 3: Senior

**Application Expects:**
- 1: Entry Level
- 2: Junior
- 3: Mid Level
- 4: Senior
- 5: Lead
- 6: Principal

### The Impact
Without fixing this:
- ❌ Designation CSV uploads will FAIL
- ❌ Relationships between designations and seniority levels are broken
- ❌ Cannot add Entry Level, Lead, or Principal designations

### The Fix (MUST RUN)

**Option 1: Run the migration script (Easiest)**
```bash
npm run db:update-seniority-levels
```

**Option 2: Use Supabase SQL Editor**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and run the SQL from `supabase/migrations/20260522_update_seniority_levels.sql`

**Option 3: Use Supabase CLI**
```bash
npx supabase db push
```

See `docs/CRITICAL_FIX_SENIORITY_LEVELS.md` for detailed instructions.

## 🎯 How to Use (After Running the Fix)

### Upload Industries

1. Navigate to `/mis/settings`
2. Click on the "Industries" tab
3. Click "Download Template"
4. Fill in the CSV with your industry data:
   ```csv
   industry_name
   Healthcare
   Manufacturing
   Retail
   ```
5. Click "Upload CSV" and select your file
6. Success! View your newly added industries

### Upload Job Designations

1. Navigate to `/mis/settings`  
2. Click on the "Job Designations" tab
3. Click "Download Template"
4. Fill in the CSV with your designation data:
   ```csv
   designation_name,industry_name,seniority_level
   Software Engineer,IT / Software Development,Mid Level
   Senior Accountant,Banking,Senior
   Lead Designer,IT / Software Development,Lead
   ```
5. Make sure the industry names match existing industries exactly
6. Use valid seniority levels: Entry Level, Junior, Mid Level, Senior, Lead, Principal
7. Click "Upload CSV" and select your file
8. Success! View your newly added designations with proper relationships

## 🔐 Security

- Both upload endpoints require authentication
- Only MIS super admins can perform bulk uploads
- Input validation on all data
- Error logging for debugging
- Row Level Security (RLS) enabled on all tables

## ✨ Features

### CSV Parsing
- Uses papaparse library for robust CSV parsing
- Handles various CSV formats
- Case-insensitive header matching
- Automatic whitespace trimming

### Validation
- Required field validation
- Foreign key validation (industry names)
- Enum validation (seniority levels)
- Row-by-row error reporting
- All-or-nothing imports (prevents partial data)

### Error Handling
- Detailed error messages
- Row number references in errors
- Validation errors logged to console
- User-friendly toast notifications

### Relationship Management
- Industry name → Industry ID mapping
- Seniority level name → Level ID mapping
- Foreign key integrity maintained
- Existing data preserved during migration

## 📊 Database Schema

```
industries
├── industry_id (PK)
└── industry_name

seniority_levels
├── level_id (PK)
├── level_name
└── level_order

job_designations
├── designation_id (PK, auto-increment)
├── designation_name
├── industry_id (FK → industries)
└── level_id (FK → seniority_levels)
```

## 🧪 Testing

After running the fix migration, test the feature:

1. **Test Industry Upload**
   - Download template
   - Add 3-5 test industries
   - Upload and verify success

2. **Test Designation Upload**
   - Download template
   - Add designations with various seniority levels
   - Upload and verify relationships display correctly

3. **Test Validation**
   - Try uploading a designation with invalid industry
   - Try uploading with invalid seniority level
   - Verify error messages are clear

4. **Verify Relationships**
   - Check the Job Designations table
   - Ensure industry names display correctly
   - Ensure seniority levels display correctly

## 📝 Next Steps

1. **REQUIRED**: Run the seniority levels migration
2. Verify the migration succeeded
3. Test CSV upload with sample data
4. Import your production data
5. Monitor for any errors

## 🆘 Troubleshooting

### Upload fails with "Industry not found"
- Make sure the industry exists in the Industries table
- Industry name matching is case-insensitive but must match exactly

### Upload fails with "Invalid seniority level"
- Use exactly one of: Entry Level, Junior, Mid Level, Senior, Lead, Principal
- Case-insensitive but spelling must match exactly

### "Unauthorized" error
- Ensure you're logged in as an MIS super admin
- Check your session is valid

### CSV parsing errors
- Ensure CSV has headers
- Use commas as delimiters
- Don't use special characters in CSV

## 📚 Documentation

- User Guide: `docs/CSV_BULK_UPLOAD_GUIDE.md`
- Critical Fix: `docs/CRITICAL_FIX_SENIORITY_LEVELS.md`

---

## Summary

The CSV bulk upload feature is **fully implemented and ready to use** after running the seniority levels migration. The feature provides a powerful way to quickly populate industries and job designations with full relationship integrity, comprehensive validation, and excellent error handling.

**Status**: ✅ Implementation Complete | ⚠️ Migration Required Before Use
