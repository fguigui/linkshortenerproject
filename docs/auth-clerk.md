---
name: auth-clerk
description: "Use when: implementing authentication, protecting routes, handling sign in/sign up flows, checking user auth status, or working with user sessions. Clerk is the ONLY auth method allowed in this project."
---

# Authentication with Clerk

## Important: Clerk Only

**Clerk is the ONLY authentication method for this project.** No other auth libraries, OAuth providers, or custom auth implementations are permitted.

## Setup & Environment

### Required Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Middleware Setup

```typescript
// middleware.ts (root of project)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/protected(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

## Protected Routes

### Dashboard Route - Full Protection

The `/dashboard` page **must require authentication**. Users cannot access it without being signed in.

```typescript
// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();

  // Redirect to sign in if not authenticated
  if (!userId) {
    redirect('/');
  }

  return (
    <main>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </main>
  );
}
```

### Sub-routes Under Dashboard

All routes under `/dashboard/*` inherit the protection:

```typescript
// app/dashboard/settings/page.tsx
import { auth } from '@clerk/nextjs/server';

export default async function SettingsPage() {
  const { userId } = await auth();
  
  // userId is guaranteed to be present (middleware protects this route)
  return <div>Settings for {userId}</div>;
}
```

## Homepage Redirect

Users who are **already logged in** and navigate to the homepage (`/`) must be redirected to `/dashboard`.

```typescript
// app/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignInButton } from '@clerk/nextjs';

export default async function HomePage() {
  const { userId } = await auth();

  // Redirect logged-in users to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <main className="flex flex-1 items-center justify-center py-32">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Link Shortener</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Create short, shareable links in seconds.
        </p>
        <SignInButton mode="modal">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Get Started
          </button>
        </SignInButton>
      </div>
    </main>
  );
}
```

## Sign In & Sign Up Modals

**Sign in and sign up must always launch as modals**, not full page redirects.

### Sign In Button

```typescript
import { SignInButton } from '@clerk/nextjs';

export function SignInButton() {
  return (
    <SignInButton mode="modal">
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
        Sign In
      </button>
    </SignInButton>
  );
}
```

### Sign Up Button

```typescript
import { SignUpButton } from '@clerk/nextjs';

export function SignUpButton() {
  return (
    <SignUpButton mode="modal">
      <button className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
        Sign Up
      </button>
    </SignUpButton>
  );
}
```

### In Navigation/Header

```typescript
// components/navbar.tsx
import { auth } from '@clerk/nextjs/server';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export async function Navbar() {
  const { userId } = await auth();

  return (
    <nav className="flex items-center justify-between p-4 border-b dark:border-slate-700">
      <div className="text-xl font-bold">Link Shortener</div>
      
      <div className="flex items-center gap-4">
        {userId ? (
          <>
            <a href="/dashboard" className="text-sm hover:underline">
              Dashboard
            </a>
            <UserButton />
          </>
        ) : (
          <>
            <SignInButton mode="modal">
              <button className="text-sm hover:underline">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                Sign Up
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </nav>
  );
}
```

## Checking Auth Status

### In Server Components

```typescript
// app/some-page/page.tsx
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId, sessionId } = await auth();

  if (!userId) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, user {userId}</div>;
}
```

### In Client Components

```typescript
// ✅ Good - Use useAuth hook
'use client';

import { useAuth } from '@clerk/nextjs';

export function ClientComponent() {
  const { userId, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return <div>You must sign in</div>;
  }

  return <div>Welcome, {userId}</div>;
}
```

## User Information

### Get Full User Object

```typescript
// Server component
import { currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    return <div>Not signed in</div>;
  }

  return (
    <div>
      <p>Email: {user.emailAddresses[0].emailAddress}</p>
      <p>Name: {user.firstName} {user.lastName}</p>
      <img src={user.imageUrl} alt="Profile" />
    </div>
  );
}
```

### Get User in API Routes

```typescript
// app/api/user/profile/route.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const user = await currentUser();

  return NextResponse.json({
    ok: true,
    data: {
      id: user?.id,
      email: user?.emailAddresses[0].emailAddress,
      name: `${user?.firstName} ${user?.lastName}`,
    },
  });
}
```

## Protecting API Routes

```typescript
// app/api/links/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  // Return 401 if not authenticated
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Fetch user-specific data
  const userLinks = await db.query.links.findMany({
    where: eq(links.userId, userId),
  });

  return NextResponse.json({ ok: true, data: userLinks });
}
```

## Database Integration with User IDs

Store `userId` from Clerk in your database:

```typescript
// db/schema.ts
import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: timestamp('created_at').notNull().default(sql`current_timestamp`),
});

export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').notNull().default(sql`current_timestamp`),
});
```

## Webhooks (Optional - Future)

For syncing Clerk user data to your database, use webhooks:

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('svix-signature');

  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let event;
  try {
    event = webhook.verify(body, signature || '') as any;
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { type, data } = event;

  if (type === 'user.created') {
    // Sync new user to database
    await db.insert(users).values({
      id: data.id,
      email: data.email_addresses[0].email_address,
      firstName: data.first_name,
      lastName: data.last_name,
    });
  }

  if (type === 'user.updated') {
    // Update user in database
    await db.update(users).set({
      email: data.email_addresses[0].email_address,
      firstName: data.first_name,
      lastName: data.last_name,
    }).where(eq(users.id, data.id));
  }

  return Response.json({ ok: true });
}
```

## Common Patterns

### Protecting Multiple Routes

```typescript
// app/dashboard/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  return (
    <div className="flex gap-4">
      <aside className="w-64 border-r dark:border-slate-700 p-4">
        <nav className="space-y-2">
          <a href="/dashboard" className="block">Dashboard</a>
          <a href="/dashboard/settings" className="block">Settings</a>
          <a href="/dashboard/links" className="block">My Links</a>
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### Sign Out Button

```typescript
// components/sign-out-button.tsx
'use client';

import { useClerk } from '@clerk/nextjs';

export function SignOutButton() {
  const { signOut } = useClerk();

  return (
    <button
      onClick={() => signOut()}
      className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      Sign Out
    </button>
  );
}
```

## Key Rules

✅ **DO**:
- Use Clerk as the only auth method
- Protect `/dashboard` and all sub-routes
- Redirect logged-in users from homepage to `/dashboard`
- Use modal mode for sign in/sign up
- Store user IDs in database when needed
- Check `userId` in server components first
- Return 401 for unauthenticated API requests

❌ **DON'T**:
- Use alternative auth libraries (NextAuth, Auth0, custom JWT, etc.)
- Allow unauthenticated access to `/dashboard`
- Redirect signed-in users to sign-in page
- Use full-page sign in/sign up (modals only)
- Store sensitive data on the client
- Trust client-side auth checks alone (always verify server-side)

