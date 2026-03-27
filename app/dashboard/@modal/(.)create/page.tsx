'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreateLinkForm } from '@/components/CreateLinkForm';

export default function CreateLinkModal() {
  const router = useRouter();

  const handleSuccess = () => {
    toast.success('Link created successfully!');
    router.back();
    router.refresh();
  };

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Create New Link</DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter a URL to create a shortened link
          </DialogDescription>
        </DialogHeader>
        <CreateLinkForm onCancel={() => router.back()} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
