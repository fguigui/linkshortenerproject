---
name: database-drizzle
description: "Use when: designing database schema, writing queries, managing migrations, or working with Drizzle ORM. Define schemas in db/schema.ts, use type-safe queries, handle relations properly."
---

# Database & Drizzle ORM Standards

## Technology Stack

- **Database**: PostgreSQL (local)
- **ORM**: Drizzle ORM ^0.45.1
- **Migrations**: Drizzle Kit
- **Schema Location**: `db/schema.ts`

## Schema Definition

All database tables are defined in `db/schema.ts`:

```typescript
// db/schema.ts
import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  url: text('url').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  clicks: integer('clicks').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`current_timestamp`),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`current_timestamp`),
});

// Type inference from schema
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
```

## Type Inference

**Always infer types from Drizzle schema**:

```typescript
// ✅ Good - Inferred types are type-safe
export type Link = typeof links.$inferSelect;      // Full row type
export type NewLink = typeof links.$inferInsert;   // Insert type

function createLink(data: NewLink) {
  return db.insert(links).values(data);
}

// ❌ Bad - Manual types that can drift
type Link = {
  id: string;
  slug: string;
  url: string;
  createdAt: Date;
};
```

## Database Connection

```typescript
// db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
});

export const db = drizzle(pool);
```

Use imported `db` instance for all queries.

## Query Patterns

### SELECT Queries

```typescript
// Get single record
const link = await db.query.links.findFirst({
  where: eq(links.slug, 'example'),
});

// Get multiple records
const activeLinks = await db.query.links.findMany({
  where: eq(links.isActive, true),
  limit: 10,
  offset: 0,
});

// With complex WHERE
const expired = await db.query.links.findMany({
  where: and(
    isNull(links.expiresAt),
    lt(links.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  ),
});
```

### INSERT Queries

```typescript
// Single insert
const newLink = await db
  .insert(links)
  .values({
    slug: 'my-link',
    url: 'https://example.com',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })
  .returning();

// Batch insert
const multiple = await db
  .insert(links)
  .values([
    { slug: 'link1', url: 'https://example.com' },
    { slug: 'link2', url: 'https://example.org' },
  ])
  .returning();
```

### UPDATE Queries

```typescript
// Update single record
const updated = await db
  .update(links)
  .set({
    clicks: links.clicks + 1,
    updatedAt: new Date(),
  })
  .where(eq(links.id, linkId))
  .returning();

// Conditional update
const result = await db
  .update(links)
  .set({ isActive: false })
  .where(and(
    eq(links.isActive, true),
    lt(links.expiresAt, new Date())
  ))
  .returning();
```

### DELETE Queries

```typescript
// Delete single
await db.delete(links).where(eq(links.id, linkId));

// Delete multiple
await db
  .delete(links)
  .where(isNull(links.expiresAt));
```

## Relations and Joins

When adding relations between tables:

```typescript
// db/schema.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').notNull().default(sql`current_timestamp`),
});

export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  url: text('url').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('created_at').notNull().default(sql`current_timestamp`),
});

export const linksRelations = relations(links, ({ one }) => ({
  user: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
}));
```

Query with relations:

```typescript
const linkWithUser = await db.query.links.findFirst({
  where: eq(links.slug, 'example'),
  with: {
    user: true,
  },
});
```

## Migrations

### Generate Migration

```bash
npm run drizzle:generate
```

Creates migration files in `drizzle/` folder.

### Apply Migration

```bash
npm run drizzle:push
```

Always test migrations in a fresh branch environment before production.

## Performance Optimization

### Indexes

Define indexes for frequently queried columns:

```typescript
export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  url: text('url').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
  slugIdx: index('slug_idx').on(table.slug),
}));
```

### Query Optimization

```typescript
// ❌ Bad - N+1 problem
const links = await db.query.links.findMany();
const withUsers = await Promise.all(
  links.map(l => db.query.users.findFirst({ where: eq(users.id, l.userId) }))
);

// ✅ Good - Single query with relations
const links = await db.query.links.findMany({
  with: { user: true },
});
```

## Transactions

```typescript
import { db } from '@/db';

const result = await db.transaction(async (tx) => {
  // All queries in this callback use the same transaction
  const newLink = await tx
    .insert(links)
    .values({ slug: 'unique', url: 'https://example.com' })
    .returning();

  await tx
    .update(users)
    .set({ linkCount: users.linkCount + 1 })
    .where(eq(users.id, userId));

  return newLink;
});
```

## Testing Considerations

- Use a separate test database (set `TEST_DATABASE_URL`)
- Clean up test data after each test
- Use transactions to rollback changes
- Mock database calls for unit tests
