'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  id: string;
};

export function DeleteButton({ id }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      console.error('Failed to delete card');
      return;
    }
    startTransition(() => router.refresh());
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      style={{
        padding: '0.35rem 0.75rem',
        borderRadius: '999px',
        border: '1px solid #f87171',
        background: '#fee2e2',
        color: '#b91c1c',
        cursor: 'pointer',
      }}
    >
      {isPending ? 'Removing…' : 'Remove'}
    </button>
  );
}
