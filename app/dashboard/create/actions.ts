'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { createLink } from '@/data/links';

type ActionResult = { success: true } | { success: false; error: string };

export async function createLinkAction(url: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to create a link',
      };
    }

    await createLink(userId, url);
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { success: false, error: 'Something went wrong' };
  }
}
