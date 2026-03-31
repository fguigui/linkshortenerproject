'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { createLink } from '@/data/links';

type ActionResult = { success: true } | { success: false; error: string };

const urlSchema = z
  .string()
  .url({ message: 'Please enter a valid URL' })
  .refine((val) => val.startsWith('http://') || val.startsWith('https://'), {
    message: 'Only http and https URLs are allowed',
  });

export async function createLinkAction(url: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'You must be logged in to create a link' };
    }

    const parsed = urlSchema.safeParse(url);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    await createLink(userId, parsed.data);
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { success: false, error: 'Something went wrong' };
  }
}
