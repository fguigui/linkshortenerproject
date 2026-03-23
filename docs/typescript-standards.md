---
name: typescript-standards
description: "Use when: defining types, using interfaces, working with generics, or implementing type-safe functions. Enforce strict type checking, avoid `any`, use discriminated unions."
---

# TypeScript Standards

## Strict Mode - Always Enabled

All TypeScript files use strict mode. The `tsconfig.json` enforces:
- `strict: true`
- `noImplicitAny: true`
- `noUncheckedIndexedAccess: true`
- `strictNullChecks: true`

## No `any` Types

❌ **Never use `any`** - it defeats type safety.

```typescript
// ❌ Bad
function process(data: any) {
  return data.id;
}

// ✅ Good
function process(data: Record<string, unknown>) {
  return (data as { id: string }).id;
}
```

## Type Definitions

### Use `type` for Data Structures

```typescript
// ✅ Good - Use `type` for data structures
type Link = {
  id: string;
  slug: string;
  url: string;
  createdAt: Date;
  expiresAt: Date | null;
};

type CreateLinkInput = Omit<Link, 'id' | 'createdAt'>;
```

### Use `interface` for Objects (Rarely)

Only use `interface` when you need declaration merging, which is rare:

```typescript
// ✅ Good - Only when extending is needed
interface HttpResponse {
  status: number;
  body: string;
}

interface JsonResponse extends HttpResponse {
  contentType: 'application/json';
}
```

## Union Types and Discriminated Unions

```typescript
// ✅ Good - Discriminated union
type Result<T> = 
  | { ok: true; data: T }
  | { ok: false; error: string };

function handleResult<T>(result: Result<T>) {
  if (result.ok) {
    console.log(result.data); // T
  } else {
    console.log(result.error); // string
  }
}
```

## Function Types

```typescript
// ✅ Good - Arrow function type
type ValidationFn = (input: string) => boolean;

// ✅ Good - Detailed function signature
type FetchLink = (id: string) => Promise<Link | null>;

// ✅ Good - Function with generics
type Transform<T, U> = (input: T) => U;
```

## Generic Types

```typescript
// ✅ Good - Generic with constraint
type ApiResponse<T extends Record<string, unknown>> = {
  ok: boolean;
  data: T | null;
  error?: string;
};

// Usage
type UserResponse = ApiResponse<{ id: string; name: string }>;
```

## Nullable Types - Be Explicit

```typescript
// ✅ Good - Explicit null handling
type User = {
  id: string;
  name: string;
  bio: string | null;           // Can be null
  email: string;                // Cannot be null
};

// ✅ Good - Optional vs nullable
type UserInput = {
  name?: string;                // Optional (undefined)
  bio: string | null;           // Can be null
};
```

## Error Types

```typescript
// ✅ Good - Custom error type
type AppError = {
  code: 'NOT_FOUND' | 'INVALID_INPUT' | 'SERVER_ERROR';
  message: string;
  statusCode: number;
};

// ✅ Good - Using as const for literal types
const ERRORS = {
  LINK_NOT_FOUND: { code: 'NOT_FOUND', statusCode: 404 },
  INVALID_URL: { code: 'INVALID_INPUT', statusCode: 400 },
} as const;
```

## Common Patterns

### Page Props

```typescript
// lib/types.ts
import type { Metadata } from 'next';

export type PageProps<P = Record<string, unknown>> = {
  params: Promise<P>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// app/links/[id]/page.tsx
import type { PageProps } from '@/lib/types';

export const generateMetadata = async ({ params }: PageProps<{ id: string }>): Promise<Metadata> => {
  const { id } = await params;
  return { title: `Link: ${id}` };
};
```

### Database Model to API Response

```typescript
// types/models.ts
type LinkModel = {
  id: string;
  slug: string;
  url: string;
  createdAt: Date;
  expiresAt: Date | null;
};

type LinkResponse = Omit<LinkModel, 'createdAt' | 'expiresAt'> & {
  createdAt: string;                // ISO string
  expiresAt: string | null;         // ISO string or null
};

function toResponse(model: LinkModel): LinkResponse {
  return {
    id: model.id,
    slug: model.slug,
    url: model.url,
    createdAt: model.createdAt.toISOString(),
    expiresAt: model.expiresAt?.toISOString() ?? null,
  };
}
```

### Request/Response Types

```typescript
// types/api.ts
type CreateLinkRequest = {
  url: string;
  slug?: string;
  expiresIn?: number;             // seconds
};

type CreateLinkResponse = {
  ok: true;
  data: LinkResponse;
} | {
  ok: false;
  error: string;
};
```

## Type Imports

Always use `type` imports for types:

```typescript
// ✅ Good
import type { Link, User } from '@/db/schema';
import { getLinks } from '@/db';

// ❌ Bad - Default import for a type
import { Link } from '@/db/schema';
```

## Utility Types

Use TypeScript utility types to avoid repetition:

```typescript
// ✅ Good - Reuse existing types
type CreateInput = Omit<Link, 'id' | 'createdAt'>;
type UpdateInput = Partial<CreateInput>;
type LinkWithoutSecret = Omit<Link, 'apiKey'>;

// ✅ Good - Construct from other types
type RequiredFields<T> = {
  [K in keyof T]-?: T[K];
};
```

## Enums - Use String Unions Instead

```typescript
// ❌ Bad - Enums add runtime overhead
enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// ✅ Good - String union
type Status = 'ACTIVE' | 'INACTIVE';

const isActive = (status: Status) => status === 'ACTIVE';
```

## Type Guard Functions

```typescript
// ✅ Good - Type guard
function isLink(obj: unknown): obj is Link {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'slug' in obj &&
    'url' in obj
  );
}

// Usage
const maybeLink: unknown = getLink();
if (isLink(maybeLink)) {
  console.log(maybeLink.slug); // Narrowed type
}
```

## Const Assertions for Literal Types

```typescript
// ✅ Good - Literal types from const
const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  LINKS: '/links',
} as const;

type Route = typeof ROUTES[keyof typeof ROUTES];
```
