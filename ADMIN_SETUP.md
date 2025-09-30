# Admin Dashboard Setup Guide

This guide will help you set up and configure the admin dashboard for SubTrackr.

## Overview

The admin dashboard allows designated users with the `admin` role to:
- View system-wide statistics and metrics
- Manage all users and their roles
- View and manage user feedback submissions
- Track and resolve reported issues

## Database Setup

### Step 1: Run the Admin Role Migration

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open and run the file: `supabase-admin-migration.sql`

This script will:
- Create a `profiles` table with role support
- Set up Row Level Security (RLS) policies
- Create auto-profile creation triggers
- Add helper functions for admin checks

### Step 2: Run the Feedback & Issues Tables Migration

1. In the Supabase SQL Editor
2. Open and run the file: `supabase-feedback-issues-tables.sql`

This script will:
- Create `feedback` and `issues` tables
- Set up RLS policies for data access
- Create indexes for better performance
- Add auto-update triggers

### Step 3: Assign Admin Role to Your User

After running both migrations, you need to manually set your first admin user:

```sql
-- Replace with your email address
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Admin Dashboard Routes

Once set up, admin users can access:

- `/admin` - Dashboard overview with statistics
- `/admin/users` - User management (view all users, change roles)
- `/admin/feedback` - View and manage user feedback
- `/admin/issues` - Track and resolve reported issues

## Features

### 1. Admin Overview (`/admin`)
- Total users count
- Total transactions count
- Total transaction amount
- Feedback submissions count
- Issues reported count

### 2. User Management (`/admin/users`)
- View all registered users
- See user roles (user/admin)
- Change user roles via dropdown
- View user join dates

### 3. Feedback Management (`/admin/feedback`)
- View all user feedback submissions
- Filter by status (pending, reviewed, resolved)
- View full feedback details in dialog
- Mark feedback as resolved

### 4. Issue Management (`/admin/issues`)
- View all reported issues
- See issue priority (low, medium, high)
- Track issue status (open, in-progress, resolved)
- View full issue details
- Mark issues as in-progress or resolved

## Access Control

### Admin Protection
- The `AdminProtectedRoute` component checks user role before allowing access
- Non-admin users are automatically redirected to the main dashboard
- Unauthenticated users are redirected to login

### Role-Based UI
- Admin users see an "Admin Panel" button in the main app sidebar
- The button uses a Shield icon and is styled distinctly
- Regular users don't see this button

### Database Security
- All admin-only tables use Row Level Security
- Admin access is checked via the `is_admin()` function
- Users can only see their own data unless they're admins

## Testing the Setup

1. **Verify Database Tables**:
   ```sql
   -- Check if tables exist
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('profiles', 'feedback', 'issues');
   ```

2. **Verify Admin User**:
   ```sql
   -- Check your admin status
   SELECT id, email, role FROM public.profiles
   WHERE email = 'your-email@example.com';
   ```

3. **Test Access**:
   - Log in with your admin account
   - You should see the "Admin Panel" button in the sidebar
   - Click it to access `/admin`
   - Verify all admin pages load correctly

## Troubleshooting

### "Admin Panel" button not showing
- Check if your user has `role = 'admin'` in the profiles table
- Refresh the page after updating the role
- Check browser console for errors

### Can't access admin routes
- Verify the `profiles` table exists and has your user
- Check RLS policies are enabled
- Ensure the admin migration script ran successfully

### Tables not found errors
- Run both migration scripts in order
- Check for SQL errors in the Supabase logs
- Verify table permissions for authenticated users

### Data not loading in admin pages
- Check browser console for API errors
- Verify RLS policies allow admin access
- Test the `is_admin()` function manually

## Security Best Practices

1. **Protect Admin Credentials**: Never share admin login details
2. **Review Roles Regularly**: Audit who has admin access
3. **Monitor Admin Actions**: Check admin activity periodically
4. **Use Strong Passwords**: Require strong passwords for admin accounts
5. **Log Admin Changes**: Consider adding audit logs for admin actions

## Extending the Admin Dashboard

To add new admin features:

1. Create a new page component in `src/pages/admin/`
2. Add the route to `src/router.tsx` under the `/admin` path
3. Add navigation item to `AdminLayout.tsx`
4. Ensure proper RLS policies for any new tables
5. Update this documentation

## Database Schema

### profiles
- `id` (UUID, FK to auth.users)
- `email` (TEXT)
- `full_name` (TEXT)
- `role` (TEXT: 'user' | 'admin')
- `created_at`, `updated_at` (TIMESTAMP)

### feedback
- `id` (UUID)
- `user_id` (UUID, FK to auth.users)
- `name`, `email`, `category`, `message` (TEXT)
- `status` (TEXT: 'pending' | 'reviewed' | 'resolved')
- `created_at`, `updated_at` (TIMESTAMP)

### issues
- `id` (UUID)
- `user_id` (UUID, FK to auth.users)
- `name`, `email`, `issue_type`, `description` (TEXT)
- `status` (TEXT: 'open' | 'in-progress' | 'resolved' | 'closed')
- `priority` (TEXT: 'low' | 'medium' | 'high')
- `created_at`, `updated_at` (TIMESTAMP)

## Support

If you encounter issues with the admin setup:
1. Check the Supabase logs for database errors
2. Verify all migration scripts ran successfully
3. Review the browser console for client-side errors
4. Check that environment variables are set correctly
