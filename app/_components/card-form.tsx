'use client';

import { FormEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type FormState = {
  title: string;
  url: string;
  image?: string;
  notes?: string;
  tags: string;
};

const initialState: FormState = {
  title: '',
  url: '',
  image: '',
  notes: '',
  tags: '',
};

export function CardForm() {
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tags = state.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: state.title,
        url: state.url,
        image: state.image || undefined,
        notes: state.notes || undefined,
        tags,
      }),
    });

    if (!res.ok) {
      console.error('Failed to create card');
      return;
    }

    setState(initialState);
    startTransition(() => router.refresh());
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', padding: '1rem', background: '#fff', borderRadius: '0.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Add a card</h2>
      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>Title</span>
        <input
          required
          value={state.title}
          onChange={(event) => setState((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="AI research overview"
          style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d0d0d0' }}
        />
      </label>
      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>URL</span>
        <input
          required
          type="url"
          value={state.url}
          onChange={(event) => setState((prev) => ({ ...prev, url: event.target.value }))}
          placeholder="https://example.com"
          style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d0d0d0' }}
        />
      </label>
      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>Image URL (optional)</span>
        <input
          value={state.image}
          onChange={(event) => setState((prev) => ({ ...prev, image: event.target.value }))}
          placeholder="https://example.com/preview.jpg"
          style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d0d0d0' }}
        />
      </label>
      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>Notes</span>
        <textarea
          rows={3}
          value={state.notes}
          onChange={(event) => setState((prev) => ({ ...prev, notes: event.target.value }))}
          placeholder="Short summary..."
          style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d0d0d0', resize: 'vertical' }}
        />
      </label>
      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>Tags (comma separated)</span>
        <input
          value={state.tags}
          onChange={(event) => setState((prev) => ({ ...prev, tags: event.target.value }))}
          placeholder="research, inspiration"
          style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d0d0d0' }}
        />
      </label>
      <button type="submit" disabled={isPending} style={{ padding: '0.65rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
        {isPending ? 'Saving…' : 'Save card'}
      </button>
    </form>
  );
}
