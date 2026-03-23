import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const { userId } = await auth();

  // Redirect logged-in users to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <main className="flex items-start justify-start min-h-screen px-8 pt-8">
    </main>
  );
}
