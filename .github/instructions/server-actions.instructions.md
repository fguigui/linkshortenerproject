---
name: server-actions
description: "Use when: creating data mutations, form submissions, delete/update/create operations, or any write operation to the database. Server actions are the ONLY way to mutate data in this app."
applyTo: "**/actions.ts"
---

# Server Actions

## Rules

- ALL data mutations (create, update, delete) MUST use server actions. NEVER use API routes for mutations.
- Server action files MUST be named `actions.ts` and colocated in the same directory as the component that calls them.
- Server actions MUST be called from client components only (`'use client'`).
- Every `actions.ts` file MUST start with `'use server'`.

## File Placement

```
app/dashboard/
├── page.tsx              # server component — renders client component
├── actions.ts            # ← colocated with the page that renders LinksTable
└── create/
    ├── page.tsx          # 'use client' — calls createLinkAction directly
    └── actions.ts        # ← colocated with the page that calls it
```

## Return Type

Server actions MUST NOT throw errors. Always return a typed result object:

```typescript
type ActionResult = { success: true } | { success: false; error: string };

export async function deleteLinkAction(id: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'You must be logged in' };

    await deleteLink(id, userId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { success: false, error: 'Something went wrong' };
  }
}
```

## Calling from Client Components

```typescript
// page.tsx or component.tsx
'use client';

import { deleteLinkAction } from './actions'; // relative import from same directory

const result = await deleteLinkAction(id);
if (!result.success) {
  // handle result.error
}
```

## Rules Summary

- `actions.ts` → always `'use server'` at the top
- Caller component → always `'use client'`
- NEVER throw — return `{ success: false, error: string }` instead
- Always check `userId` from `auth()` before any mutation
- Call `revalidatePath()` after mutations that affect displayed data
- Import actions with a relative path (`./actions`), not an alias (`@/app/...`)
