'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deletePost, updatePost } from '@/lib/actions';
import type { Post } from '@/lib/types';

export default function PostActions({
  post,
  canEdit,
}: {
  post: Post;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'confirm' | 'edit'>('idle');
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body ?? '');
  const [tags, setTags] = useState<string[]>(post.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!canEdit) return null;

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  async function save() {
    setBusy(true);
    setError('');
    try {
      await updatePost(post.id, { title: title.trim(), body, tags });
      setMode('idle');
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? 'Could not save');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError('');
    try {
      await deletePost(post.id);
      router.push('/');
    } catch (e: any) {
      setError(e.message ?? 'Could not delete');
      setBusy(false);
    }
  }

  if (mode === 'edit') {
    return (
      <div className="card mt-6 space-y-5 p-5">
        <p className="kicker text-gold">Edit post</p>

        <div>
          <label className="label mb-1.5">Headline</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field font-display text-xl italic"
          />
        </div>

        <div>
          <label className="label mb-1.5">Story</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="field resize-y"
          />
        </div>

        <div>
          <label className="label mb-1.5">Tags</label>
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="chip" data-active="true">
                #{t}
                <button
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  aria-label={`Remove ${t}`}
                  className="ml-1 text-paper/70 transition-colors hover:text-crimson-lt"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="CampusCrisis"
              className="field flex-1"
            />
            <button onClick={addTag} className="btn">
              Add
            </button>
          </div>
        </div>

        {error && <p className="err">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={save}
            disabled={busy || !title.trim()}
            className="btn btn-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save changes'}
          </button>
          <button onClick={() => setMode('idle')} disabled={busy} className="btn">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
      {error && <p className="err mr-auto">{error}</p>}

      {mode === 'confirm' ? (
        <>
          <button onClick={remove} disabled={busy} className="btn btn-crimson">
            {busy ? 'Deleting…' : 'Yes, delete'}
          </button>
          <button onClick={() => setMode('idle')} disabled={busy} className="btn">
            Keep it
          </button>
        </>
      ) : (
        <>
          <button onClick={() => setMode('edit')} className="btn">
            Edit
          </button>
          <button onClick={() => setMode('confirm')} className="btn btn-crimson">
            Delete
          </button>
        </>
      )}
    </div>
  );
}
