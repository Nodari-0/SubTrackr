-- Verification Script for Admin Dashboard Migration
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- ============================================
-- 1. CHECK PROFILES TABLE (Admin Roles)
-- ============================================
SELECT
    'Profiles Table' as check_name,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- List all admin users
SELECT
    'Admin Users' as check_name,
    COUNT(*) as admin_count
FROM public.profiles
WHERE role = 'admin';

-- Show admin users (if any)
SELECT email, role, created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================
-- 2. CHECK FEEDBACK TABLE
-- ============================================
SELECT
    'Feedback Table' as check_name,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check feedback columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'feedback'
ORDER BY ordinal_position;

-- Feedback data count
SELECT
    'Feedback Records' as check_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed,
    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
FROM public.feedback;

-- ============================================
-- 3. CHECK ISSUES TABLE
-- ============================================
SELECT
    'Issues Table' as check_name,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'issues')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check issues columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'issues'
ORDER BY ordinal_position;

-- Issues data breakdown
SELECT
    'Issues Records' as check_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN issue_type = 'bug' THEN 1 END) as bugs,
    COUNT(CASE WHEN issue_type = 'feature' THEN 1 END) as features,
    COUNT(CASE WHEN issue_type = 'support' THEN 1 END) as support,
    COUNT(CASE WHEN issue_type = 'other' THEN 1 END) as other
FROM public.issues;

-- Issues by status
SELECT
    status,
    priority,
    COUNT(*) as count
FROM public.issues
GROUP BY status, priority
ORDER BY status, priority;

-- ============================================
-- 4. CHECK ROW LEVEL SECURITY (RLS)
-- ============================================
SELECT
    schemaname,
    tablename,
    CASE
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables
WHERE tablename IN ('profiles', 'feedback', 'issues')
    AND schemaname = 'public';

-- ============================================
-- 5. CHECK POLICIES
-- ============================================
SELECT
    tablename,
    policyname,
    cmd as operation,
    CASE
        WHEN qual IS NOT NULL THEN '✅ HAS USING'
        ELSE 'No USING clause'
    END as using_clause,
    CASE
        WHEN with_check IS NOT NULL THEN '✅ HAS WITH CHECK'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies
WHERE tablename IN ('profiles', 'feedback', 'issues')
ORDER BY tablename, policyname;

-- ============================================
-- 6. CHECK HELPER FUNCTIONS
-- ============================================
SELECT
    'is_admin() function' as check_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'is_admin'
        )
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- ============================================
-- 7. CHECK INDEXES
-- ============================================
SELECT
    tablename,
    indexname,
    '✅ EXISTS' as status
FROM pg_indexes
WHERE tablename IN ('feedback', 'issues')
    AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 8. RECENT DATA SAMPLES
-- ============================================
-- Recent feedback (last 5)
SELECT
    'Recent Feedback' as type,
    name,
    category,
    status,
    created_at
FROM public.feedback
ORDER BY created_at DESC
LIMIT 5;

-- Recent issues (last 5)
SELECT
    'Recent Issues' as type,
    name,
    issue_type,
    priority,
    status,
    created_at
FROM public.issues
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- 9. FINAL SUMMARY
-- ============================================
SELECT
    '📊 MIGRATION SUMMARY' as section,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admin_users,
    (SELECT COUNT(*) FROM public.feedback) as total_feedback,
    (SELECT COUNT(*) FROM public.issues) as total_issues,
    (SELECT COUNT(*) FROM public.issues WHERE status != 'resolved') as open_issues;

-- If you see any issues, check:
-- ✅ All tables exist
-- ✅ RLS is enabled
-- ✅ Policies are created
-- ✅ is_admin() function exists
-- ✅ At least one admin user exists
