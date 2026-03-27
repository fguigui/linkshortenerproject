'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createLinkAction } from '@/app/dashboard/create/actions';

interface CreateLinkFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function CreateLinkForm({ onCancel, onSuccess }: CreateLinkFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!url) {
      setError('Please enter a URL');
      setLoading(false);
      return;
    }

    const result = await createLinkAction(url);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-white mb-2">
          URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/very/long/url"
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Link'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 border-slate-600 text-white hover:bg-slate-800"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
