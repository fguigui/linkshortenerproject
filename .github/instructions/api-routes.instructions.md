---
name: api-routes
description: "Use when: creating REST API endpoints, handling HTTP requests, building API handlers, or working with request/response types. Follow REST conventions, handle errors properly, validate inputs."
---

# API Routes & REST Conventions

## File Structure

```
app/api/
├── links/
│   ├── route.ts           # GET (list), POST (create)
│   └── [id]/
│       └── route.ts       # GET (read), PUT (update), DELETE
├── links/
│   └── [slug]/
│       └── redirect/
│           └── route.ts   # GET (redirect)
└── health/
    └── route.ts           # GET (health check)
```

## HTTP Methods and Status Codes

```
GET    /api/links           → 200 OK, 400 Bad Request, 500 Server Error
GET    /api/links/[id]      → 200 OK, 404 Not Found, 500 Server Error
POST   /api/links           → 201 Created, 400 Bad Request, 409 Conflict, 500 Server Error
PUT    /api/links/[id]      → 200 OK, 400 Bad Request, 404 Not Found, 500 Server Error
DELETE /api/links/[id]      → 204 No Content, 404 Not Found, 500 Server Error
```

## Basic Route Handler

```typescript
// app/api/links/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { links } from '@/db/schema';
import type { Link } from '@/db/schema';

// GET /api/links - List all links
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const allLinks = await db.query.links.findMany({
      limit,
      offset,
      orderBy: (links, { desc }) => desc(links.createdAt),
    });

    return NextResponse.json({
      ok: true,
      data: allLinks,
      pagination: { limit, offset },
    });
  } catch (error) {
    console.error('[GET /api/links]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST /api/links - Create a new link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = body.slug || generateSlug();

    // Insert
    const result = await db
      .insert(links)
      .values({
        url: body.url,
        slug,
        expiresAt: body.expiresIn
          ? new Date(Date.now() + body.expiresIn * 1000)
          : null,
      })
      .returning();

    return NextResponse.json(
      { ok: true, data: result[0] },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { ok: false, error: 'Slug already exists' },
        { status: 409 }
      );
    }
    console.error('[POST /api/links]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

function generateSlug(): string {
  return Math.random().toString(36).substring(2, 8);
}
```

## Dynamic Route with ID Parameter

```typescript
// app/api/links/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { links } from '@/db/schema';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/links/[id] - Get single link
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const link = await db.query.links.findFirst({
      where: eq(links.id, id),
    });

    if (!link) {
      return NextResponse.json(
        { ok: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: link });
  } catch (error) {
    console.error('[GET /api/links/[id]]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch link' },
      { status: 500 }
    );
  }
}

// PUT /api/links/[id] - Update link
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if link exists
    const existing = await db.query.links.findFirst({
      where: eq(links.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    // Update only provided fields
    const updates: Record<string, unknown> = {};
    if (body.url) updates.url = body.url;
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    if (body.expiresAt !== undefined) updates.expiresAt = body.expiresAt;
    updates.updatedAt = new Date();

    if (Object.keys(updates).length === 1) {
      // Only updatedAt - nothing to update
      return NextResponse.json({ ok: true, data: existing });
    }

    const result = await db
      .update(links)
      .set(updates)
      .where(eq(links.id, id))
      .returning();

    return NextResponse.json({ ok: true, data: result[0] });
  } catch (error) {
    console.error('[PUT /api/links/[id]]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update link' },
      { status: 500 }
    );
  }
}

// DELETE /api/links/[id] - Delete link
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const result = await db
      .delete(links)
      .where(eq(links.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('[DELETE /api/links/[id]]', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}
```

## Request Validation

```typescript
// lib/validation.ts
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateSlug(slug: string): boolean {
  // Alphanumeric and hyphens only, 3-50 chars
  return /^[a-z0-9-]{3,50}$/i.test(slug);
}

// In API handler
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!validateUrl(body.url)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid URL format' },
      { status: 400 }
    );
  }

  if (body.slug && !validateSlug(body.slug)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid slug format' },
      { status: 400 }
    );
  }

  // ... rest of handler
}
```

## Response Types

```typescript
// types/api.ts
export type ApiResponse<T> = {
  ok: true;
  data: T;
  pagination?: { limit: number; offset: number };
} | {
  ok: false;
  error: string;
};

// In handler
return NextResponse.json({
  ok: true,
  data: link,
} satisfies ApiResponse<Link>);
```

## Error Handling

```typescript
// lib/api-errors.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const API_ERRORS = {
  INVALID_INPUT: new ApiError('Invalid input', 400),
  NOT_FOUND: new ApiError('Resource not found', 404),
  CONFLICT: new ApiError('Resource already exists', 409),
  SERVER_ERROR: new ApiError('Internal server error', 500),
} as const;

// In handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.url) {
      throw API_ERRORS.INVALID_INPUT;
    }

    // ... rest of logic
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status }
      );
    }
    
    console.error('Unhandled error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Logging

```typescript
// lib/logger.ts
function log(method: string, path: string, data?: unknown) {
  console.log(`[${method}] ${path}`, data ? JSON.stringify(data) : '');
}

// In handler
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    log('GET', `/api/links/${id}`);

    const link = await db.query.links.findFirst({
      where: eq(links.id, id),
    });

    if (!link) {
      log('GET', `/api/links/${id}`, { error: 'not found' });
      return NextResponse.json(
        { ok: false, error: 'Not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: link });
  } catch (error) {
    console.error(`[GET] /api/links/${id}`, error);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
```

## CORS Headers (if needed)

```typescript
// Middleware or route handler
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

## Rate Limiting Consideration

For future rate limiting, use a library like `@upstash/ratelimit`:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

export async function POST(request: NextRequest) {
  const identifier = request.ip || 'anonymous';
  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { ok: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```
