'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitPost } from '@/lib/actions';
import { compressAndUpload } from '@/lib/upload';
import type { Post } from '@/lib/types';

const TYPE_META = {
  photo: { icon: '📷', placeholder: 'Caption', rows: 3 },
  article: { icon: '✒️', placeholder: 'Write your op-ed…', rows: 10 },
  magazine: { icon: '📖', placeholder: 'What happened?', rows: 6 },
} as const;

export default function NewPostPage() {
  const router = useRouter();

  const [type, setType] = useState<Post['type']>('photo');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleFile(f: File | null) {
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      let mediaUrls: string[] = [];
      if (file) {
        const url = await compressAndUpload(file); // compresses to ~150KB before it ever hits R2
        mediaUrls = [url];
      }

      // status is always 'pending' — nothing reaches the feed before the desk approves it
      await submitPost({ type, title, body, media_urls: mediaUrls, tags });

      router.push('/?submitted=1');
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 py-8 md:grid-cols-2">
      {/* ===== Form ===== */}
      <div>
        <p className="kicker text-gold">New game</p>
        <h1 className="mb-6 font-display text-5xl italic">Submit to the Front Page</h1>

        <div className="card space-y-5 p-6">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_META) as Post['type'][]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                data-active={type === t}
                className="chip chip-btn py-2.5"
              >
                {TYPE_META[t].icon} {t}
              </button>
            ))}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Headline"
            className="field font-display text-xl italic"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={TYPE_META[type].placeholder}
            rows={TYPE_META[type].rows}
            className="field resize-y"
          />

          <div>
            <label className="label mb-1.5">Upload photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className="text-sm text-paper/70 file:btn file:mr-3 file:border-0 file:bg-white/10 file:px-3 file:py-1.5"
            />
            <p className="note mt-1.5">
              Compressed to ~150KB automatically — no need to resize first.
            </p>
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

          <button
            onClick={handleSubmit}
            disabled={submitting || !title}
            className="btn btn-gold w-full py-3.5"
          >
            {submitting ? 'Submitting…' : 'Submit for review →'}
          </button>
          <p className="note">
            Your post enters the mod queue and won&apos;t hit the board until it&apos;s cleared.
          </p>
        </div>
      </div>

      {/* ===== Live magazine preview ===== */}
      <div>
        <p className="kicker mb-2 text-paper/60">Preview</p>
        <div className="card relative aspect-cover overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-white/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            {tags[0] && <span className="chip mb-3">#{tags[0]}</span>}
            <h3 className="font-display text-2xl italic leading-tight text-paper">
              {title || 'Your headline'}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
