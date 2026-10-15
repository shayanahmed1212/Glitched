'use client';

import { useEffect, useState } from 'react';
import { getPostReactions, reactToPost } from '@/lib/actions';
import { DEMO_USER_ID, REACTIONS, type ReactionKey } from '@/lib/types';

export default function ReactionBar({ postId }: { postId: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<ReactionKey | null>(null);

  useEffect(() => {
    let alive = true;
    getPostReactions(postId).then((rows) => {
      if (!alive) return;
      const tally: Record<string, number> = {};
      rows.forEach((r) => (tally[r.type] = (tally[r.type] ?? 0) + 1));
      setCounts(tally);
      setMine(rows.find((r) => r.user_id === DEMO_USER_ID)?.type ?? null);
    });
    return () => {
      alive = false;
    };
  }, [postId]);

  async function react(type: ReactionKey) {
    const previous = mine;
    setMine(type);
    setCounts((c) => {
      const next = { ...c };
      if (previous) next[previous] = Math.max(0, (next[previous] ?? 0) - 1);
      next[type] = (next[type] ?? 0) + 1;
      return next;
    });
    // switching reactions replaces the old one instead of stacking duplicates
    await reactToPost(postId, type);
  }

  return (
    <div>
      <p className="kicker mb-3 text-paper/60">Emotes</p>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            onClick={() => react(r.key)}
            data-active={mine === r.key}
            className="chip chip-btn py-2.5"
            title={r.label}
            aria-pressed={mine === r.key}
          >
            <span className="text-sm leading-none">{r.emoji}</span>
            <span key={counts[r.key] ?? 0} className="count-tick">
              {String(counts[r.key] ?? 0).padStart(2, '0')}
            </span>
            <span className="hidden sm:inline">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
