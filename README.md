# Next.js + tRPC + Supabase Fullstack Skeleton

A production-ready fullstack TypeScript application skeleton featuring end-to-end type safety, authentication, and a complete CRUD example.

## Tech Stack

- **Next.js 14** - React framework with App Router and React Server Components
- **TypeScript** - End-to-end type safety
- **tRPC v11** - Type-safe API layer without code generation
- **Supabase** - PostgreSQL database with authentication
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Powerful data synchronization
- **Zod** - Schema validation

## Features

- ✅ **End-to-end Type Safety** - From database to frontend
- ✅ **Authentication** - Secure auth with Supabase (signup, login, logout)
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **CRUD Example** - Complete notes management system
- ✅ **Row Level Security** - Database-level security policies
- ✅ **Server Components** - Optimal performance with RSC
- ✅ **Dark Mode Support** - Automatic dark mode styling

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/trpc/          # tRPC HTTP handler
│   │   ├── auth/              # Authentication pages
│   │   └── dashboard/         # Protected dashboard pages
│   ├── components/            # React components
│   │   ├── auth/             # Auth-related components
│   │   └── ui/               # Reusable UI components
│   ├── lib/                   # Shared utilities
│   │   ├── supabase/         # Supabase clients
│   │   └── trpc/             # tRPC client setup
│   ├── server/               # Server-side code
│   │   └── api/              # tRPC routers
│   ├── types/                # TypeScript types
│   └── middleware.ts         # Auth middleware
└── supabase/
    └── migrations/           # Database migrations
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great)

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Set Up Database Schema

In your Supabase project dashboard:

1. Go to **SQL Editor**
2. Copy the contents of `supabase/migrations/00001_initial_schema.sql`
3. Run the SQL script

This creates the `notes` table with Row Level Security policies.

### 5. Generate TypeScript Types (Optional)

If you modify the database schema, regenerate types:

```bash
# Install Supabase CLI
npm install -g supabase

# Generate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Authentication Flow

1. **Sign Up**: Navigate to `/auth/signup` to create an account
2. **Login**: Go to `/auth/login` to sign in
3. **Protected Routes**: `/dashboard` routes require authentication
4. **Logout**: Click the logout button in the dashboard

### Notes CRUD Example

The `/dashboard/notes` page demonstrates a complete CRUD implementation:

- **Create**: Add new notes with title and content
- **Read**: View all your notes in a list
- **Delete**: Remove notes you no longer need
- **Type Safety**: Full TypeScript inference from DB to UI

### Adding New Features

#### 1. Create a New tRPC Router

```typescript
// src/server/api/routers/example.ts
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const exampleRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Your logic here
    return []
  }),
})
```

#### 2. Add Router to Root

```typescript
// src/server/api/root.ts
import { exampleRouter } from './routers/example'

export const appRouter = createTRPCRouter({
  notes: notesRouter,
  example: exampleRouter, // Add your router
})
```

#### 3. Use in Components

```typescript
'use client'
import { api } from '@/lib/trpc/client'

export function ExampleComponent() {
  const { data } = api.example.getAll.useQuery()
  // Fully typed!
}
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## Database Schema

### Notes Table

```sql
notes (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  title text NOT NULL,
  content text,
  created_at timestamp,
  updated_at timestamp
)
```

Row Level Security ensures users can only access their own notes.

## Architecture Decisions

### Why tRPC?

- **Type Safety**: Automatic type inference without code generation
- **DX**: Excellent developer experience with autocomplete
- **Performance**: Efficient batching and caching

### Why Supabase?

- **PostgreSQL**: Powerful relational database
- **Auth**: Built-in authentication with multiple providers
- **RLS**: Database-level security
- **Real-time**: Optional real-time subscriptions

### Server Components

- Default to Server Components for better performance
- Use `'use client'` only when needed (forms, interactivity)
- Server-side data fetching with tRPC server caller

## Security

- **Row Level Security**: Enforced at database level
- **Cookie-based Sessions**: Secure, HTTP-only cookies
- **Middleware Protection**: Routes protected before rendering
- **Environment Variables**: Sensitive keys kept server-side

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

Works on any platform supporting Node.js:
- Railway
- Render
- Fly.io
- AWS/GCP/Azure

## Troubleshooting

### "Invalid API key" Error

- Check your `.env.local` file has the correct Supabase credentials
- Ensure you're using `NEXT_PUBLIC_` prefix for client-side variables

### Database Errors

- Verify the migration script ran successfully in Supabase SQL Editor
- Check RLS policies are enabled

### Type Errors

- Run `npm run type-check` to see all TypeScript errors
- Regenerate database types if schema changed

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## License

MIT

---

Built with ❤️ using Next.js, tRPC, and Supabase
