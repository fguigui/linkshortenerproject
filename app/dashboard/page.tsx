import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();

  // Redirect to sign in if not authenticated
  if (!userId) {
    redirect('/');
  }

  return (
    <main>
      <h1>Dashboard</h1>
    </main>
  );
}
