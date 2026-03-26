---
name: quick-reference
description: "Quick lookup guide for common tasks and coding patterns across the project. Use when: starting a new feature, looking for code examples, or needing quick answers."
---

# Quick Reference Guide

## Common Tasks

### Creating a New API Endpoint

1. **Create the file**: `app/api/[resource]/route.ts`
2. **Import dependencies**: NextRequest, NextResponse, database
3. **Write handler**: GET, POST, PUT, or DELETE function
4. **Add types**: Create request/response types
5. **Handle errors**: Use try-catch with AppError
6. **Log**: Use logger.info() for important events

**See**: [api-routes.md](./api-routes.md)

### Creating a New React Component

1. **Create file**: `components/[feature]/component-name.tsx`
2. **Define props interface**: Extend HTMLAttributes if applicable
3. **Add dark mode classes**: Always include `dark:` variants
4. **Export component**: Use named export
5. **Use shadcn/ui**: Import from `@/components/ui/*`

**See**: [components-ui.md](./components-ui.md)

### Adding Database Table

1. **Define schema**: Add to `db/schema.ts`
2. **Infer types**: Use `typeof table.$inferSelect`
3. **Create migration**: `npm run drizzle:generate`
4. **Review migration**: Check `drizzle/` folder
5. **Apply migration**: `npm run drizzle:push`

**See**: [database-drizzle.md](./database-drizzle.md)

### Adding Database Query

1. **Use typed queries**: `await db.query.table.findFirst()`
2. **Filter with eq, and, or**: `where: eq(table.column, value)`
3. **Select relations**: Use `with: { relation: true }`
4. **Order results**: Add `orderBy` parameter
5. **Handle errors**: Catch with DatabaseError

**See**: [database-drizzle.md](./database-drizzle.md)

## Code Snippets Reference

### Redirect in Server Component

```typescript
import { redirect } from 'next/navigation';

export default function Page() {
  const item = getItem();
  if (!item) redirect('/not-found');
  return <div>{item.name}</div>;
}
```

### Form with Error Handling

```typescript
'use client';
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);
  try {
    const response = await fetch('/api/links', { method: 'POST', body: ... });
    if (!response.ok) throw new Error('Failed');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error');
  }
};
```

### Styled Component with Dark Mode

```typescript
import { cn } from '@/lib/utils';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-lg border bg-white p-4',
      'dark:border-slate-700 dark:bg-slate-900',
      className,
    )}>
      {children}
    </div>
  );
}
```

### API Error Response

```typescript
export async function GET(request: NextRequest) {
  try {
    // logic
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error('[GET /api/...error', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}
```

### Type-safe API Call from Client

```typescript
'use client';

async function createLink(url: string) {
  const response = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}
```

## Import Paths

```typescript
// Database
import { db } from '@/db';
import { links } from '@/db/schema';
import type { Link } from '@/db/schema';

// Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/common/card';

// Utilities
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { AppError, ValidationError } from '@/lib/errors';

// Types
import type { PageProps } from '@/lib/types';
```

## Environment Variables

Required variables in `.env`:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NODE_ENV` - 'development' or 'production'
- `LOG_LEVEL` - 'DEBUG', 'INFO', 'WARN', 'ERROR' (optional)

## Command Reference

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000

# Database
npm run drizzle:generate # Generate migration
npm run drizzle:push    # Apply migrations

# Linting
npm run lint            # Run ESLint

# Build
npm run build           # Production build
npm run start           # Start production server
```

## Type Naming Conventions

```typescript
type MyFeature = { ... }           // Main entity type
type MyFeatureInput = { ... }      // For form/API input
type MyFeatureResponse = { ... }   // For API response
type MyFeatureWithRelations = { ... }  // Server-side with includes

interface ComponentProps { ... }    // React component props (rare)
type PageProps<P> = { ... }        // Next.js page params (see lib/types)
```

## File Naming

```
components/
  ├── ui/button.tsx              # shadcn/ui or base components
  ├── links/link-card.tsx         # Feature-specific components
  └── common/navbar.tsx           # Shared components

app/
  ├── api/links/route.ts          # API handler (lowercase)
  └── links/[id]/page.tsx         # Page component

db/
  └── schema.ts                   # All tables in one file

lib/
  ├── utils.ts                    # Utility functions
  ├── logger.ts                   # Logging
  └── errors.ts                   # Error classes
```

## Key Principles

1. **Type Safety**: No `any` types. Use strict TypeScript.
2. **Dark Mode**: All UI must support light and dark modes.
3. **Server First**: Use server components by default.
4. **Error Handling**: Always catch and log errors.
5. **Type Inference**: Use `$inferSelect` from Drizzle.
6. **Consistency**: Follow existing code patterns.

## Need More Details?

- **Next.js specifics**: See [nextjs-conventions.md](./nextjs-conventions.md)
- **TypeScript patterns**: See [typescript-standards.md](./typescript-standards.md)
- **Database & ORM**: See [database-drizzle.md](./database-drizzle.md)
- **React & components**: See [components-ui.md](./components-ui.md)
- **API design**: See [api-routes.md](./api-routes.md)
- **Error handling**: See [error-handling.md](./error-handling.md)
- **Authentication**: See [auth-clerk.md](./auth-clerk.md)
