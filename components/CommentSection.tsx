'use client';

import { useState } from 'react';
import { addComment, reportComment } from '@/lib/actions';
import type { Comment } from '@/lib/types';

function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [reported, setReported] = useState<string[]>([]);

  async function submit() {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const created = await addComment(postId, body.trim());
      setComments((prev) => [...prev, created]);
      setBody('');
    } finally {
      setSending(false);
    }
  }

  async function report(id: string) {
    if (reported.includes(id)) return;
    setReported((prev) => [...prev, id]);
    try {
      await reportComment(id);
    } catch {
      setReported((prev) => prev.filter((x) => x !== id));
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl italic">Chat log</h2>
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="portrait h-9 w-9 text-xs">{initials(c.profiles?.full_name)}</div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="text-sm font-semibold text-paper">{c.profiles?.full_name}</p>
                  <span className="kicker text-paper/60">{timeOf(c.created_at)}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-paper/75">{c.body}</p>
              </div>

              <button
                onClick={() => report(c.id)}
                disabled={reported.includes(c.id)}
                className={`shrink-0 self-start text-[13px] font-medium transition-colors ${
                  reported.includes(c.id)
                    ? 'text-moss-lt'
                    : 'text-paper/70 hover:text-crimson-lt'
                }`}
              >
                {reported.includes(c.id) ? 'Reported ✓' : 'Report'}
              </button>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="empty">Log empty — drop the first line.</p>}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Drop a line"
          className="field flex-1"
        />
        <button onClick={submit} disabled={sending || !body.trim()} className="btn btn-gold">
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
