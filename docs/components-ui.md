---
name: components-ui
description: "Use when: building React components, using shadcn/ui components, styling with Tailwind CSS, or creating reusable UI elements. Support dark mode, use semantic HTML, follow component composition patterns."
---

# React Components & UI Standards

## Component Structure

### File Organization

```
components/
├── ui/                        # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── links/
│   ├── link-card.tsx          # Feature components
│   ├── link-form.tsx
│   └── link-list.tsx
└── common/
    ├── navbar.tsx
    └── footer.tsx
```

### Component Template

```typescript
// ✅ Good - Typed component with proper structure
import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <div className={`rounded-lg border bg-white p-4 dark:bg-slate-900 ${className || ''}`}>
      <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </div>
  );
}
```

## shadcn/ui Components

Use shadcn/ui for base components. They're already configured in `components/ui/`.

### Import shadcn/ui Components

```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

### Add Missing Components

```bash
npx shadcn-ui@latest add [component-name]
```

Examples:
- `npx shadcn-ui@latest add dialog`
- `npx shadcn-ui@latest add form`
- `npx shadcn-ui@latest add table`

## Tailwind CSS & Styling

### Dark Mode Support - Always Required

Every component must support light and dark modes:

```typescript
// ✅ Good - Dark mode variants
export function LinkCard({ link }: { link: Link }) {
  return (
    <div className="rounded-lg border bg-white p-4 transition-colors dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {link.slug}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {link.url}
      </p>
    </div>
  );
}
```

### Tailwind Class Organization

```typescript
// ✅ Good - Organized class names
<div className={clsx(
  // Layout
  'flex flex-col gap-4',
  // Colors
  'bg-white text-slate-900',
  'dark:bg-slate-900 dark:text-white',
  // Typography
  'text-base font-medium',
  // Spacing
  'p-4',
  // Interaction
  'transition-colors hover:bg-slate-50 dark:hover:bg-slate-800',
  // Responsive
  'sm:flex-row md:gap-6',
  // Conditional
  isLoading && 'opacity-50 cursor-not-allowed',
  className,
)}>
  Content
</div>
```

Import `clsx` from the utils:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Then use it:

```typescript
import { cn } from '@/lib/utils';

<div className={cn('base-class', isActive && 'active-class', customClass)} />
```

## Component Composition Patterns

### Props Interface

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'rounded-lg font-medium transition-colors',
        {
          'px-3 py-1 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-slate-100 text-slate-900 hover:bg-slate-200': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          'opacity-50 cursor-wait': loading,
          'cursor-not-allowed opacity-50': disabled,
        },
        className,
      )}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
```

### Render Props Pattern

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  loading?: boolean;
  empty?: ReactNode;
}

export function List<T extends { id: string }>({
  items,
  renderItem,
  loading,
  empty = 'No items found',
}: ListProps<T>) {
  if (loading) return <div>Loading...</div>;
  if (items.length === 0) return <div>{empty}</div>;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id}>{renderItem(item, i)}</div>
      ))}
    </div>
  );
}
```

### Compound Components

```typescript
// ✅ Good - Compound component pattern
export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border bg-white dark:bg-slate-900">{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: ReactNode }) {
  return <div className="border-b p-4">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: ReactNode }) {
  return <div className="p-4">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: ReactNode }) {
  return <div className="border-t p-4 text-right">{children}</div>;
};

// Usage
<Card>
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>
    <Button>Save</Button>
  </Card.Footer>
</Card>
```

## Client Components - Forms and Interactivity

```typescript
'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LinkFormProps {
  onSubmit: (data: { url: string; slug?: string }) => Promise<void>;
  loading?: boolean;
}

export function LinkForm({ onSubmit, loading = false }: LinkFormProps) {
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit({ url, slug: slug || undefined });
      setUrl('');
      setSlug('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="url" className="block text-sm font-medium">
          URL
        </label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium">
          Short Slug (optional)
        </label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="my-link"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Link'}
      </Button>
    </form>
  );
}
```

## Accessibility Checklist

- [ ] Use semantic HTML (`button`, `input`, `label`, not `div` with onClick)
- [ ] All inputs have associated labels with `htmlFor`
- [ ] Color not the only way to convey information
- [ ] Sufficient contrast ratio (WCAG AA: 4.5:1)
- [ ] Keyboard navigation works (tab, enter)
- [ ] Images have alt text
- [ ] Forms have error messages

## Performance Tips

- Use `React.memo` for components that receive same props frequently
- Lazy load heavy components with `React.lazy()` + `Suspense`
- Avoid creating functions inside component body (move to module level)
- Use server components by default to reduce JS bundle
