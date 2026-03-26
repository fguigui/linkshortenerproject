---
name: error-handling
description: "Use when: implementing error handling, logging, debug strategies, handling exceptions, or dealing with error recovery. Create custom error types, log errors properly, handle edge cases gracefully."
---

# Error Handling & Logging Standards

## Error Types

### Custom Error Classes

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, cause?: Error) {
    super('VALIDATION_ERROR', message, 400, cause);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, cause?: Error) {
    super('NOT_FOUND', `${resource} not found`, 404, cause);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, cause?: Error) {
    super('CONFLICT', message, 409, cause);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, cause?: Error) {
    super('DATABASE_ERROR', message, 500, cause);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, cause?: Error) {
    super('INTERNAL_ERROR', message, 500, cause);
  }
}
```

## Try-Catch Patterns

### API Routes

```typescript
// ✅ Good - Comprehensive error handling
import { NextRequest, NextResponse } from 'next/server';
import {
  AppError,
  ValidationError,
  NotFoundError,
} from '@/lib/errors';

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    // Validation
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid ID format');
    }

    // Logic
    const link = await db.query.links.findFirst({
      where: eq(links.id, id),
    });

    if (!link) {
      throw new NotFoundError('Link');
    }

    return NextResponse.json({ ok: true, data: link });
  } catch (error) {
    return handleApiError(error);
  }
}

function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: error.statusCode }
    );
  }

  // Log unexpected errors
  console.error('[Unexpected Error]', error);

  return NextResponse.json(
    { ok: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Server Components

```typescript
// app/links/page.tsx
import { notFound } from 'next/navigation';
import {
  AppError,
  NotFoundError,
} from '@/lib/errors';

export default async function LinksPage() {
  try {
    const links = await db.query.links.findMany();
    return <LinksList links={links} />;
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    console.error('Failed to load links:', error);
    throw error;
  }
}
```

### Client Components

```typescript
// ✅ Good - Client-side error handling
'use client';

import { useState } from 'react';

export function LinkForm({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/links', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to create link');
      }

      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Link creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}
      {/* form fields */}
    </form>
  );
}
```

## Logging

### Logger Utility

```typescript
// lib/logger.ts
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

class Logger {
  private level = LOG_LEVELS[process.env.LOG_LEVEL as keyof typeof LOG_LEVELS] || LOG_LEVELS.INFO;

  debug(message: string, data?: unknown) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  info(message: string, data?: unknown) {
    if (this.level <= LOG_LEVELS.INFO) {
      console.log(`[INFO] ${message}`, data);
    }
  }

  warn(message: string, data?: unknown) {
    if (this.level <= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  error(message: string, error?: unknown) {
    if (this.level <= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, error instanceof Error ? error : String(error));
    }
  }
}

export const logger = new Logger();
```

### Usage Examples

```typescript
// In API routes
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info('Creating link', { url: body.url.substring(0, 50) });

    const result = await createLink(body);
    logger.info('Link created', { id: result.id });

    return NextResponse.json({ ok: true, data: result }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create link', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

// In server components
import { logger } from '@/lib/logger';

export default async function Page() {
  try {
    logger.debug('Loading page data');
    const data = await fetchData();
    logger.info('Page data loaded', { count: data.length });
    return <Content data={data} />;
  } catch (error) {
    logger.error('Failed to load page', error);
    throw error;
  }
}

// In client components
const handleClick = async () => {
  logger.debug('Button clicked');
  try {
    await api.createLink();
    logger.info('Link created');
  } catch (error) {
    logger.error('Failed to create link', error);
  }
};
```

## Handling Database Errors

```typescript
// lib/db-errors.ts
import { DatabaseError } from './errors';

export function handleDrizzleError(error: unknown): never {
  if (error instanceof Error) {
    // Handle unique constraint violation
    if (error.message.includes('unique')) {
      throw new ConflictError('Resource already exists', error);
    }

    // Handle foreign key violation
    if (error.message.includes('foreign key')) {
      throw new ValidationError('Referenced resource does not exist', error);
    }

    // Handle connection errors
    if (error.message.includes('connect') || error.message.includes('timeout')) {
      throw new DatabaseError('Database connection failed', error);
    }
  }

  throw new DatabaseError('Database operation failed', error as Error);
}

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    const result = await db.insert(links).values(data).returning();
    return NextResponse.json({ ok: true, data: result[0] }, { status: 201 });
  } catch (error) {
    try {
      handleDrizzleError(error);
    } catch (appError) {
      return handleApiError(appError);
    }
  }
}
```

## Environment-Specific Error Handling

```typescript
// lib/responses.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export function errorResponse(
  error: AppError | unknown,
  request?: NextRequest,
) {
  const appError = error instanceof AppError
    ? error
    : new InternalServerError('Unknown error', error as Error);

  const response: Record<string, unknown> = {
    ok: false,
    error: appError.message,
    code: appError.code,
  };

  // Include stack trace in development only
  if (isDevelopment && appError.cause) {
    response.cause = appError.cause.message;
    response.stack = appError.cause.stack;
  }

  // Log error with context
  logger.error(`[${request?.method || 'UNKNOWN'}] ${request?.url || 'unknown'} - ${appError.code}`, appError);

  return NextResponse.json(response, { status: appError.statusCode });
}
```

## Error Boundaries (React)

```typescript
// components/error-boundary.tsx
'use client';

import { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, info);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error) || (
          <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
            <h2 className="font-bold">Something went wrong</h2>
            <p className="text-sm">{this.state.error.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## Error Monitoring Checklist

- [ ] All errors are logged with context (method, URL, user ID if applicable)
- [ ] Sensitive data is not logged (passwords, API keys, tokens)
- [ ] Development logging is enabled in dev environment only
- [ ] API errors return consistent format
- [ ] Client shows user-friendly error messages
- [ ] Server logs full error details
- [ ] Error codes are documented and consistent
- [ ] Rate limit errors have appropriate status code (429)
- [ ] Database errors are caught and converted to app errors
