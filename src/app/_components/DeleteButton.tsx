'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await fetch(`/api/cards/${id}`, { method: 'DELETE' });
      router.refresh();
    });
  };

  return (
    <button onClick={handleDelete} disabled={pending}>
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}
