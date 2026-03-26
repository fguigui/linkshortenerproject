import { pgTable, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const links = pgTable(
  'links',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: text('user_id').notNull(),
    shortCode: text('short_code').notNull().unique(),
    url: text('url').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`current_timestamp`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`current_timestamp`),
  },
  (table) => [
    index('links_user_id_idx').on(table.userId),
  ]
);

// Type inference from schema
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
