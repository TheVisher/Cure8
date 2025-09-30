'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CardForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title,
        url,
        image: image || undefined,
        notes: notes || undefined,
        tags: tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
      };
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Failed to create card');
      }
      setTitle('');
      setUrl('');
      setImage('');
      setNotes('');
      setTags('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem', maxWidth: 400 }}>
      <input
        required
        placeholder="Title"
        value={title}
        onChange={event => setTitle(event.target.value)}
      />
      <input
        required
        placeholder="URL"
        value={url}
        onChange={event => setUrl(event.target.value)}
      />
      <input
        placeholder="Image URL"
        value={image}
        onChange={event => setImage(event.target.value)}
      />
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={event => setNotes(event.target.value)}
        rows={3}
      />
      <input
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={event => setTags(event.target.value)}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save card'}
      </button>
      {error ? <p style={{ color: 'red' }}>{error}</p> : null}
    </form>
  );
}
