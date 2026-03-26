'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { deleteLink, updateLinkUrl } from '@/data/links';

export async function deleteLinkAction(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('You must be logged in to delete a link');
  }

  await deleteLink(id, userId);
  revalidatePath('/dashboard');
}

export async function updateLinkAction(id: string, url: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('You must be logged in to update a link');
  }

  await updateLinkUrl(id, userId, url);
  revalidatePath('/dashboard');
}
