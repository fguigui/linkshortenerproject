'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { deleteLink, updateLinkUrl } from '@/data/links';

type ActionResult = { success: true } | { success: false; error: string };

export async function deleteLinkAction(id: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to delete a link',
      };
    }

    await deleteLink(id, userId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { success: false, error: 'Something went wrong' };
  }
}

export async function updateLinkAction(
  id: string,
  url: string,
): Promise<ActionResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to update a link',
      };
    }

    await updateLinkUrl(id, userId, url);
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { success: false, error: 'Something went wrong' };
  }
}
