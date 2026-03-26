---
name: nextjs-conventions
description: "Use when: creating pages, layouts, API routes, or working with Next.js App Router. Follow App Router conventions, use server components by default, understand the breaking changes in Next.js 16.2.1."
---

# Next.js 16.2.1 Conventions

## Critical - Read Before Coding

Next.js 16.2.1 has breaking changes from earlier versions. **Always check `node_modules/next/dist/docs/` for current API documentation** before implementing anything.

## File Structure and Organization

### Pages and Layouts

```
app/
├── layout.tsx          # Root layout, shared by all pages
├── page.tsx            # Home page (/)
├── api/                # API routes
│   └── [resource]/
│       └── route.ts    # RESTful endpoints
└── [dynamic]/          # Dynamic routes
    └── page.tsx
```

**Rules**:
- All page files must be named `page.tsx`
- All API handlers must be named `route.ts`
- Use `layout.tsx` for shared UI and providers
- Prefer server components; mark client components with `'use client'`

### Import Organization

```typescript
// 1. External libraries
import { ReactNode } from 'react';
import Image from 'next/image';
import { redirect } from 'next/navigation';

// 2. Internal components and utilities
import { Button } from '@/components/ui/button';
import { getDatabase } from '@/db';

// 3. Type definitions
import type { Metadata } from 'next';
```

## Server vs Client Components

### Default to Server Components

```typescript
// ✅ Good - Server component (default)
export default function Page() {
  const data = fetchSync(); // Can use sync operations
  return <div>{data}</div>;
}
```

### Use 'use client' Only When Needed

```typescript
// ✅ Good - Client component (interactivity needed)
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**When to use `'use client'`**:
- State management (useState, useReducer)
- Event handlers (onClick, onChange)
- Hooks (useEffect, useRef, useContext)
- Browser APIs

**Never use `'use client'` for**:
- Server-only functions (database access)
- Sensitive operations (API keys, auth)
- Data fetching (use Server Components instead)

## Metadata and Head Management

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Link Shortener',
  description: 'Create short, shareable links',
  robots: 'index, follow',
};

export default function Page() {
  return <main>Content</main>;
}
```

## Dynamic Routes

```typescript
// app/links/[id]/page.tsx
import type { PageProps } from '@/types';

interface LinkPageProps extends PageProps {
  params: Promise<{ id: string }>;
}

export default async function LinkPage({ params }: LinkPageProps) {
  const { id } = await params; // Await params in Next.js 15+
  // ... implementation
}
```

## API Routes

```typescript
// app/api/links/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // ...
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ... validation and processing
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
```

## Environment Variables

### Load Pattern

```typescript
// lib/env.ts
function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const DATABASE_URL = getEnv('DATABASE_URL');
export const API_SECRET = getEnv('API_SECRET');
```

## Redirects and Rewrites

```typescript
// ✅ Good - Server component redirect
import { redirect } from 'next/navigation';

export default function Page() {
  const link = getLink();
  if (!link) redirect('/not-found');
  return <div>{link.url}</div>;
}
```

## Image Optimization

Always use `next/image` for images:

```typescript
import Image from 'next/image';

export default function Home() {
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width={100}
      height={100}
      priority // Only for above-the-fold images
    />
  );
}
```

## Performance Checklist

- [ ] Use `next/image` for all images
- [ ] Implement proper caching headers in API routes
- [ ] Use server components by default
- [ ] Optimize database queries (see database-drizzle.md)
- [ ] Lazy load non-critical components
- [ ] Monitor Core Web Vitals in production
