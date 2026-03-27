---
name: server-actions-validation
description: "Use when: adding input validation to server actions, typing server action parameters, enforcing auth checks, or calling data helper functions. Applies to all actions.ts files."
applyTo: "**/actions.ts"
---

# Server Action Validation & Data Layer

## Rules

- NEVER use `FormData` as a parameter type. Use explicit TypeScript types for every parameter.
- ALL inputs MUST be validated with Zod before any auth check or database operation.
- Auth check (`auth()` from Clerk) MUST come after Zod validation, before any database call.
- NEVER use Drizzle queries directly in `actions.ts`. ALL database operations MUST go through helper functions in `/data`.

## Action Pattern

```typescript
// actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { updateLinkUrl, deleteLink } from '@/data/links';

const UpdateLinkSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
});

export async function updateLinkAction(id: string, url: string) {
  const parsed = UpdateLinkSchema.safeParse({ id, url });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { userId } = await auth();
  if (!userId) throw new Error('You must be logged in');

  await updateLinkUrl(parsed.data.id, userId, parsed.data.url);
  revalidatePath('/dashboard');
}
```

## Data Helper Pattern

```typescript
// data/links.ts  — wraps Drizzle queries, called by actions
export async function updateLinkUrl(id: string, userId: string, url: string) {
  await db.update(links).set({ url, updatedAt: new Date() })
    .where(and(eq(links.id, id), eq(links.userId, userId)));
}
```

## Order of Operations in Every Action

1. Zod `safeParse` → throw on invalid input
2. `auth()` → throw if no `userId`
3. Call `/data` helper with validated values
4. `revalidatePath()` if mutation affects a page
