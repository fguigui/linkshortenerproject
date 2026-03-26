import { db } from '@/db/index';
import { links } from '@/db/schema';
import { eq, desc, asc, count, and } from 'drizzle-orm';

export type SortField = 'id' | 'shortCode' | 'url' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function getUserLinks(
  userId: string,
  page: number = 1,
  pageSize: number = 15,
  sortBy: SortField = 'createdAt',
  sortDirection: SortDirection = 'desc'
) {
  const offset = (page - 1) * pageSize;

  const sortColumn = {
    id: links.id,
    shortCode: links.shortCode,
    url: links.url,
    createdAt: links.createdAt,
    updatedAt: links.updatedAt,
  }[sortBy];

  const orderBy = sortDirection === 'asc' ? asc(sortColumn) : desc(sortColumn);

  const totalResult = await db
    .select({ count: count() })
    .from(links)
    .where(eq(links.userId, userId));

  const total = totalResult[0]?.count || 0;

  const result = await db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset);

  return {
    data: result,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function updateLinkUrl(id: string, userId: string, url: string) {
  await db
    .update(links)
    .set({ url, updatedAt: new Date() })
    .where(and(eq(links.id, id), eq(links.userId, userId)));
}

export async function deleteLink(id: string, userId: string) {
  await db
    .delete(links)
    .where(and(eq(links.id, id), eq(links.userId, userId)));
}

export async function createLink(userId: string, url: string) {
  const shortCode = generateShortCode();

  const result = await db
    .insert(links)
    .values({
      userId,
      shortCode,
      url,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result[0];
}
