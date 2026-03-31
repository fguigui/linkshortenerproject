import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { LinksTable } from '@/components/LinksTable';
import { SuccessToast } from '@/components/SuccessToast';
import { getUserLinks, type SortField, type SortDirection } from '@/data/links';

interface SearchParams {
  page?: string;
  sort?: string;
  direction?: string;
  created?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1'));
  const sortBy = (params.sort || 'createdAt') as SortField;
  const sortDirection = (params.direction || 'desc') as SortDirection;

  const {
    data: links,
    total,
    totalPages,
  } = await getUserLinks(userId, page, 20, sortBy, sortDirection);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black py-8 px-4">
      <SuccessToast param="created" message="Link created successfully!" />
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Links</h1>
          <p className="text-slate-400">
            Manage and track your shortened links
          </p>
        </div>

        <div>
          <Link
            href="/dashboard/create"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            + Create New Link
          </Link>
        </div>

        <LinksTable
          initialLinks={links}
          total={total}
          currentPage={page}
          totalPages={totalPages}
          currentSort={sortBy}
          currentSortDirection={sortDirection}
        />
      </div>
    </main>
  );
}
