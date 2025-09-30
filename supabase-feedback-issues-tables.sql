-- Feedback and Issues Tables Migration Script
-- Run this in your Supabase SQL Editor AFTER running the admin-migration.sql

-- ============================================
-- FEEDBACK TABLE
-- ============================================

-- Check if feedback table exists and has the old schema
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'feedback' AND column_name = 'feedback') THEN
        -- Old schema exists, migrate it
        ALTER TABLE public.feedback RENAME COLUMN feedback TO message;

        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'feedback' AND column_name = 'name') THEN
            ALTER TABLE public.feedback ADD COLUMN name TEXT;
            -- Set default name from email for existing records
            UPDATE public.feedback SET name = COALESCE(email, 'Anonymous');
            ALTER TABLE public.feedback ALTER COLUMN name SET NOT NULL;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'feedback' AND column_name = 'category') THEN
            ALTER TABLE public.feedback ADD COLUMN category TEXT DEFAULT 'general';
            ALTER TABLE public.feedback ALTER COLUMN category SET NOT NULL;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'feedback' AND column_name = 'status') THEN
            ALTER TABLE public.feedback ADD COLUMN status TEXT DEFAULT 'pending';
            ALTER TABLE public.feedback ADD CONSTRAINT feedback_status_check
                CHECK (status IN ('pending', 'reviewed', 'resolved'));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'feedback' AND column_name = 'updated_at') THEN
            ALTER TABLE public.feedback ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    category TEXT DEFAULT 'general' NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ISSUES TABLE (UNIFIED)
-- ============================================

-- Create unified issues table
CREATE TABLE IF NOT EXISTS public.issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate data from old issue tables if they exist
DO $$
BEGIN
    -- Migrate from bug_reports
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bug_reports') THEN
        INSERT INTO public.issues (user_id, name, email, issue_type, description, created_at)
        SELECT
            user_id,
            COALESCE(email, 'Unknown'),
            COALESCE(email, 'no-email@example.com'),
            'bug',
            description,
            COALESCE(created_at, NOW())
        FROM public.bug_reports
        ON CONFLICT DO NOTHING;
    END IF;

    -- Migrate from feature_requests
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_requests') THEN
        INSERT INTO public.issues (user_id, name, email, issue_type, description, created_at)
        SELECT
            user_id,
            COALESCE(email, 'Unknown'),
            COALESCE(email, 'no-email@example.com'),
            'feature',
            description,
            COALESCE(created_at, NOW())
        FROM public.feature_requests
        ON CONFLICT DO NOTHING;
    END IF;

    -- Migrate from support_requests
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_requests') THEN
        INSERT INTO public.issues (user_id, name, email, issue_type, description, created_at)
        SELECT
            user_id,
            COALESCE(email, 'Unknown'),
            COALESCE(email, 'no-email@example.com'),
            'support',
            description,
            COALESCE(created_at, NOW())
        FROM public.support_requests
        ON CONFLICT DO NOTHING;
    END IF;

    -- Migrate from other_issues
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'other_issues') THEN
        INSERT INTO public.issues (user_id, name, email, issue_type, description, created_at)
        SELECT
            user_id,
            COALESCE(email, 'Unknown'),
            COALESCE(email, 'no-email@example.com'),
            'other',
            description,
            COALESCE(created_at, NOW())
        FROM public.other_issues
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can create feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can update all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can create issues" ON public.issues;
DROP POLICY IF EXISTS "Users can view own issues" ON public.issues;
DROP POLICY IF EXISTS "Admins can view all issues" ON public.issues;
DROP POLICY IF EXISTS "Admins can update all issues" ON public.issues;

-- Feedback table policies
CREATE POLICY "Users can create feedback"
    ON public.feedback
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
    ON public.feedback
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
    ON public.feedback
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update all feedback"
    ON public.feedback
    FOR UPDATE
    USING (public.is_admin());

-- Issues table policies
CREATE POLICY "Users can create issues"
    ON public.issues
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own issues"
    ON public.issues
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all issues"
    ON public.issues
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update all issues"
    ON public.issues
    FOR UPDATE
    USING (public.is_admin());

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at_feedback ON public.feedback;
CREATE TRIGGER set_updated_at_feedback
    BEFORE UPDATE ON public.feedback
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_issues ON public.issues;
CREATE TRIGGER set_updated_at_issues
    BEFORE UPDATE ON public.issues
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.feedback TO authenticated;
GRANT ALL ON public.issues TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_issues_user_id ON public.issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON public.issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON public.issues(created_at DESC);

-- Verification queries
SELECT 'Feedback table setup complete' as message;
SELECT 'Issues table setup complete' as message;
SELECT COUNT(*) as feedback_count FROM public.feedback;
SELECT COUNT(*) as issues_count FROM public.issues;
