'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function SuccessToast({ message, param }: { message: string; param: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get(param)) {
      toast.success(message);
      const url = new URL(window.location.href);
      url.searchParams.delete(param);
      router.replace(url.pathname + (url.search || ''));
    }
  }, [searchParams, param, message, router]);

  return null;
}
