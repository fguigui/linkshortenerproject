'use client';

import { useRouter } from 'next/navigation';
import { CreateLinkForm } from '@/components/CreateLinkForm';

export default function CreateLinkPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Create New Link</h1>
            <p className="text-slate-400">Enter a URL to create a shortened link</p>
          </div>
          <CreateLinkForm
            onCancel={() => router.back()}
            onSuccess={() => router.push('/dashboard?created=true')}
          />
        </div>
      </div>
    </main>
  );
}
