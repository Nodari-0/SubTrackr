# Database Fix Guide

## Error: "column 'status' does not exist"

This error occurs because your existing `feedback` table has a different schema than what the admin dashboard expects.

## Solution

Run the updated migration script [supabase-feedback-issues-tables.sql](supabase-feedback-issues-tables.sql) which now includes:

### What It Does

1. **Migrates Existing Feedback Table**:
   - Renames `feedback` column to `message`
   - Adds `name`, `category`, `status`, `updated_at` columns
   - Preserves all existing data

2. **Creates Unified Issues Table**:
   - Creates a single `issues` table instead of separate tables
   - Migrates data from old tables:
     - `bug_reports` → `issues` (type: 'bug')
     - `feature_requests` → `issues` (type: 'feature')
     - `support_requests` → `issues` (type: 'support')
     - `other_issues` → `issues` (type: 'other')

3. **Updates Application Pages**:
   - `GiveFeedBack.tsx` now submits to the new schema
   - `ReportIssue.tsx` now submits to unified `issues` table
   - Both pages work with the admin dashboard

## Step-by-Step Instructions

### 1. Run the Migration

In your Supabase SQL Editor, run:
```sql
-- First, run the admin migration if you haven't
-- (from supabase-admin-migration.sql)

-- Then run the updated feedback/issues migration
-- (from supabase-feedback-issues-tables.sql)
```

The script is **safe to run multiple times** - it checks for existing columns and tables before making changes.

### 2. Verify the Migration

After running, check your tables:

```sql
-- Check feedback table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'feedback';

-- Should show: id, user_id, name, email, category, message, status, created_at, updated_at

-- Check issues table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'issues';

-- Should show: id, user_id, name, email, issue_type, description, status, priority, created_at, updated_at

-- Check data was migrated
SELECT COUNT(*) FROM feedback;
SELECT COUNT(*) FROM issues;
```

### 3. Test the Application

1. **Test Feedback Submission**:
   - Go to `/give-feedback`
   - Submit a test feedback
   - Check admin dashboard at `/admin/feedback`

2. **Test Issue Reporting**:
   - Go to `/report-issue`
   - Submit a test issue
   - Check admin dashboard at `/admin/issues`

## What Changed

### Old Schema (Before Migration)

**feedback table:**
```sql
- feedback TEXT     -- User's feedback message
- email TEXT        -- Optional email
- user_id UUID      -- User who submitted
```

**Multiple issue tables:**
- `bug_reports`
- `feature_requests`
- `support_requests`
- `other_issues`

### New Schema (After Migration)

**feedback table:**
```sql
- id UUID
- user_id UUID
- name TEXT         -- User's name
- email TEXT        -- Email address
- category TEXT     -- general, feature, improvement, praise, other
- message TEXT      -- Feedback message (renamed from 'feedback')
- status TEXT       -- pending, reviewed, resolved
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

**Unified issues table:**
```sql
- id UUID
- user_id UUID
- name TEXT         -- User's name
- email TEXT        -- Email address
- issue_type TEXT   -- bug, feature, support, other
- description TEXT  -- Issue description
- status TEXT       -- open, in-progress, resolved, closed
- priority TEXT     -- low, medium, high
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

## Benefits of New Schema

1. **Better Admin Experience**: Admins can see who submitted what and when
2. **Status Tracking**: Track resolution status for both feedback and issues
3. **Priority Management**: Prioritize issues (low/medium/high)
4. **Unified Issues**: All issue types in one table for easier management
5. **Better Reporting**: Easier to generate reports and statistics

## Rollback (If Needed)

If you need to rollback, the old data is preserved. You can:

```sql
-- Restore feedback table (if needed)
ALTER TABLE public.feedback RENAME COLUMN message TO feedback;
ALTER TABLE public.feedback DROP COLUMN IF EXISTS name;
ALTER TABLE public.feedback DROP COLUMN IF EXISTS category;
ALTER TABLE public.feedback DROP COLUMN IF EXISTS status;
ALTER TABLE public.feedback DROP COLUMN IF EXISTS updated_at;
```

**Note**: Old issue tables are NOT deleted by the migration, so they remain available if needed.

## Troubleshooting

### Still Getting "column does not exist" Error

1. **Clear browser cache** and refresh the page
2. **Check SQL ran successfully** - Look for errors in Supabase logs
3. **Verify column exists**:
   ```sql
   SELECT * FROM information_schema.columns
   WHERE table_name = 'feedback' AND column_name = 'status';
   ```

### Data Migration Issues

If data didn't migrate:
1. Check if old tables exist and have data
2. Manually run the migration section of the SQL script
3. Check Supabase logs for errors

### RLS Policy Errors

If you get permission errors:
```sql
-- Make sure is_admin() function exists
SELECT public.is_admin();

-- Check policies exist
SELECT * FROM pg_policies
WHERE tablename IN ('feedback', 'issues');
```

## Support

If you continue to have issues:
1. Check the Supabase logs for detailed error messages
2. Verify the admin migration ran first (creates `is_admin()` function)
3. Ensure you're logged in as an admin user
4. Check browser console for client-side errors
