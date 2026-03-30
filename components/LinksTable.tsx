'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link as LinkIcon, ChevronUp, ChevronDown, Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Link } from '@/db/schema';
import type { SortField, SortDirection } from '@/data/links';
import { deleteLinkAction, updateLinkAction } from '@/app/dashboard/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface SortHeaderProps {
  field: SortField;
  label: string;
  currentSort: SortField;
  currentSortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

function SortHeader({
  field,
  label,
  currentSort,
  currentSortDirection,
  onSort,
}: SortHeaderProps) {
  const isActive = currentSort === field;
  const Icon = isActive && currentSortDirection === 'desc' ? ChevronDown : ChevronUp;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-2 hover:text-blue-400 transition-colors font-semibold"
    >
      {label}
      {isActive && <Icon className="w-4 h-4" />}
    </button>
  );
}

interface LinksTableProps {
  initialLinks: Link[];
  total: number;
  currentPage: number;
  totalPages: number;
  currentSort: SortField;
  currentSortDirection: SortDirection;
}

export function LinksTable({
  initialLinks,
  total,
  currentPage,
  totalPages,
  currentSort,
  currentSortDirection,
}: LinksTableProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    const result = await deleteLinkAction(deletingId);
    if (result.success) {
      toast.success('Link deleted successfully');
    } else {
      toast.error(result.error);
    }
    setDeletingId(null);
    setDeleteLoading(false);
    router.refresh();
  };

  const startEdit = (link: Link) => {
    setEditingId(link.id);
    setEditingUrl(link.url);
    setUrlError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUrlError('');
  };

  const saveEdit = async (id: string) => {
    if (!editingUrl.trim()) { setUrlError('URL is required'); return; }
    try { new URL(editingUrl); } catch { setUrlError('Invalid URL'); return; }
    setUrlError('');
    const result = await updateLinkAction(id, editingUrl);
    if (result.success) {
      toast.success('Link updated successfully');
      setEditingId(null);
      router.refresh();
      return;
    }

    toast.error(result.error);
  };

  const handleSort = (field: SortField) => {
    const newDirection =
      field === currentSort && currentSortDirection === 'desc' ? 'asc' : 'desc';
    const url = `/dashboard?page=1&sort=${field}&direction=${newDirection}`;
    router.push(url);
    router.refresh();
  };

  const handlePageChange = (newPage: number) => {
    const url = `/dashboard?page=${newPage}&sort=${currentSort}&direction=${currentSortDirection}`;
    router.push(url);
    router.refresh();
  };

  const SortHeaderProps = {
    currentSort,
    currentSortDirection,
    onSort: handleSort,
  };

  return (
    <div className="w-full space-y-4">
      {/* Table Container with Fixed Height */}
      <div className="overflow-y-auto rounded-lg border border-slate-700 h-[calc(100vh-420px)]">
        <table className="w-full">
          <thead className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left">
                <SortHeader field="id" label="ID" {...SortHeaderProps} />
              </th>
              <th className="px-6 py-3 text-left">
                <SortHeader field="shortCode" label="Short Code" {...SortHeaderProps} />
              </th>
              <th className="px-6 py-3 text-left">
                <SortHeader field="url" label="URL" {...SortHeaderProps} />
              </th>
              <th className="px-6 py-3 text-left">
                <SortHeader field="createdAt" label="Created" {...SortHeaderProps} />
              </th>
              <th className="px-6 py-3 text-left">
                <SortHeader field="updatedAt" label="Updated" {...SortHeaderProps} />
              </th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialLinks.map((link) => (
              <tr
                key={link.id}
                className="border-b border-slate-700 hover:bg-slate-800 transition-colors"
              >
                <td className="px-6 py-3 text-slate-300 font-mono">{link.id}</td>
                <td className="px-6 py-3">
                  <code className="bg-slate-700 px-2 py-1 rounded text-blue-400 font-mono">
                    {link.shortCode}
                  </code>
                </td>
                <td className="px-6 py-3 max-w-xs text-slate-300">
                  {editingId === link.id ? (
                    <div>
                      <input
                        title="URL"
                        placeholder="https://example.com"
                        className="bg-slate-700 text-blue-400 px-2 py-1 rounded w-full outline-none border border-slate-600 focus:border-blue-400"
                        value={editingUrl}
                        onChange={(e) => setEditingUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(link.id); if (e.key === 'Escape') cancelEdit(); }}
                        autoFocus
                      />
                      {urlError && <p className="text-red-400 text-xs mt-1">{urlError}</p>}
                    </div>
                  ) : (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline truncate block"
                    >
                      {link.url}
                    </a>
                  )}
                </td>
                <td className="px-6 py-3 text-slate-400 text-sm">
                  {new Date(link.createdAt).toLocaleDateString()} {new Date(link.createdAt).toLocaleTimeString()}
                </td>
                <td className="px-6 py-3 text-slate-400 text-sm">
                  {new Date(link.updatedAt).toLocaleDateString()} {new Date(link.updatedAt).toLocaleTimeString()}
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    {editingId === link.id ? (
                      <>
                        <button
                          title="Save"
                          className="text-slate-400 hover:text-green-400 transition-colors"
                          onClick={() => saveEdit(link.id)}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          title="Cancel"
                          className="text-slate-400 hover:text-slate-200 transition-colors"
                          onClick={cancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          title="Edit link"
                          className="text-slate-400 hover:text-blue-400 transition-colors"
                          onClick={() => startEdit(link)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete link"
                          className="text-slate-400 hover:text-red-400 transition-colors"
                          onClick={() => setDeletingId(link.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {initialLinks.length === 0 && (
          <div className="px-6 py-12 text-center">
            <LinkIcon className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">No links yet. Create one to get started!</p>
          </div>
        )}
      </div>

      <Dialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Delete link</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this link? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <button
              onClick={() => setDeletingId(null)}
              disabled={deleteLoading}
              className="px-4 py-2 rounded-lg border border-slate-600 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination Info */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Total: {total} links | Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            ⏮ First
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            ← Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
            .map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded text-white ${
                  currentPage === page
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {page}
              </button>
            ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            Next →
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            Last ⏭
          </button>
        </div>
      )}
    </div>
  );
}
