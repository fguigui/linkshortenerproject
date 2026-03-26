'use server';

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createLink } from '@/data/links';

export async function createLinkAction(url: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('You must be logged in to create a link');
  }

  await createLink(userId, url);
  redirect('/dashboard?created=true');
}
