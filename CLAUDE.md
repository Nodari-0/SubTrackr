# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SubTrackr (internally named "expense-tracker") is a subscription and expense tracking application built with React, TypeScript, Vite, and Supabase. Users can track transactions across multiple wallets, monitor subscriptions, set budget limits by category, and view financial analytics.

## Development Commands

```bash
# Start development server (runs on default Vite port, usually 5173)
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Add Supabase credentials:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Architecture Overview

### Authentication & Authorization
- **AuthContext** ([src/context/AuthContext.tsx](src/context/AuthContext.tsx)) - Global auth state management using Supabase Auth
- Provides `useAuth()` hook with `user`, `session`, `isLoading`, `userRole`, `signUp()`, `signIn()`, `signOut()`
- **ProtectedRoute** component wraps all authenticated routes
- **AdminProtectedRoute** component wraps admin-only routes and checks for `admin` role
- Auth state changes are handled via Supabase's `onAuthStateChange` listener
- User roles are fetched from the `profiles` table and stored in AuthContext

### Routing Structure
The app uses React Router v7 with a nested layout structure:
- `/` - Protected routes wrapped in **RootLayout** (sidebar + navbar)
  - `/` (index) - Dashboard
  - `/categories` - Categories page
  - `/wallets` - Wallets page (shows transactions, subscriptions, limits)
  - `/settings` - User settings
  - `/give-feedback` - Feedback form
  - `/report-issue` - Issue reporting form
- `/auth` - Auth routes wrapped in **AuthLayout**
  - `/auth/login` - Login page
  - `/auth/register` - Registration page
- `/admin` - Admin-only routes wrapped in **AdminLayout** and **AdminProtectedRoute**
  - `/admin` (index) - Admin dashboard overview with statistics
  - `/admin/users` - User management (view all users, change roles)
  - `/admin/feedback` - View and manage user feedback
  - `/admin/issues` - Track and resolve reported issues

### Layout Components
- **RootLayout** - Main app layout with sidebar and navbar navigation
  - Shows "Admin Panel" button for users with admin role
- **AuthLayout** - Authentication pages layout
- **AdminLayout** - Admin panel layout with admin-specific navigation
  - Includes "Back to App" link to return to main application
- All layouts handle their own nested route rendering via `<Outlet />`

### Data Layer
- **Supabase Client** ([src/supabaseClient.ts](src/supabaseClient.ts)) - Singleton Supabase client instance
- Database queries are made directly in components using `supabase.from(table).select/insert/update()`
- User-scoped queries filter by `user_id` from `supabase.auth.getUser()`

### Key Database Tables
Based on component usage:
- `profiles` - User profiles with role support (id, email, full_name, role)
- `transactions` - User transactions (amount, type, description, user_id, created_at)
- `subscriptions` - Recurring subscription tracking
- `categories` - Expense/income categories
- `wallets` - Different financial accounts/wallets
- `limits` - Budget limits by category
- `feedback` - User feedback submissions (name, email, category, message, status)
- `issues` - Reported issues (name, email, issue_type, description, status, priority)

### UI Components
- Built with **Radix UI** primitives (Dialog, Dropdown, Select, Tooltip, etc.)
- Styled with **Tailwind CSS** v4
- Custom components in `src/components/ui/` follow shadcn/ui patterns
- Uses `class-variance-authority` for component variants
- Toast notifications via **Sonner** library

### Path Aliases
TypeScript and Vite are configured with `@/*` alias pointing to `src/*`:
```typescript
import { Button } from "@/components/ui/button"
```

## Important Patterns

### Component Data Flow
Most feature components follow this pattern:
1. Fetch user from `supabase.auth.getUser()`
2. Query Supabase table filtered by `user_id`
3. Show loading skeleton while fetching
4. Render data in a table/list with UI components
5. Provide dialog/modal for creating new records

### Dummy Data Fallback
Components like Transactions insert dummy data for new users to provide a better first-time experience. This happens when a user has no existing records.

### Type Safety
- Project uses TypeScript with strict mode
- Supabase types are inferred from queries (no explicit database type generation)
- User metadata is accessed via `user?.user_metadata as any` (not strictly typed)

## Admin Dashboard

The application includes a full-featured admin dashboard for managing users, feedback, and issues.

### Setup
See [ADMIN_SETUP.md](ADMIN_SETUP.md) for complete setup instructions including:
- Database migration scripts
- Role assignment
- Access control configuration

### Admin Features
- **Overview Dashboard**: System-wide statistics (users, transactions, feedback, issues)
- **User Management**: View all users, assign roles (user/admin)
- **Feedback Management**: Review and resolve user feedback
- **Issue Tracking**: Track and resolve reported issues with priority levels

### Admin Access Control
- Admin routes require `role = 'admin'` in the profiles table
- Row Level Security (RLS) enforces data access at database level
- Admin panel button only visible to users with admin role
- Non-admins redirected if they attempt to access admin routes

## Development Notes

- The project uses Vite's HMR for fast development iteration
- React 19 is used with concurrent features
- Theme support is available via `next-themes` (ThemeContext)
- Icons are from `lucide-react`
- The build process runs TypeScript compilation before Vite build
