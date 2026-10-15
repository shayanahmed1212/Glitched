'use client';

import { useEffect, useState } from 'react';
import {
  decideAccount as persistAccount,
  decidePost as persistPost,
  deletePost as persistDelete,
  getPendingAccounts,
  getPendingPosts,
} from '@/lib/actions';
import type { Post, Profile } from '@/lib/types';

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AdminQueue({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  // Loads on mount so submissions made earlier in this session show up too.
  useEffect(() => {
    let alive = true;
    Promise.all([getPendingPosts(), getPendingAccounts()]).then(([pendingPosts, pendingAccounts]) => {
      if (!alive) return;
      setPosts(pendingPosts);
      setAccounts(pendingAccounts);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function decidePost(id: string, status: 'approved' | 'rejected', newTitle?: string) {
    await persistPost(id, status, newTitle);
    setPosts((list) => list.filter((p) => p.id !== id));
    setEditingId(null);
  }

  async function decideAccount(id: string, status: 'approved' | 'rejected') {
    await persistAccount(id, status);
    setAccounts((list) => list.filter((a) => a.id !== id));
  }

  async function removePost(id: string) {
    await persistDelete(id);
    setPosts((list) => list.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
    setEditingId(null);
  }

  if (loading) return <p className="empty">Loading the queue…</p>;

  return (
    <div className="space-y-12">
      <section>
        <h2 className="kicker mb-4 text-paper/60">
          Pending posts <span className="text-gold">({String(posts.length).padStart(2, '0')})</span>
        </h2>
        <div className="space-y-4">
          {posts.map((post, i) => (
            <div key={post.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="kicker shrink-0 text-gold">
                      #{String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="meta min-w-0 truncate">
                      {post.profiles?.full_name}{' '}
                      <span className="text-paper/50">·</span> {post.profiles?.campus}
                    </p>
                  </div>

                  {editingId === post.id ? (
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="field mt-2 font-display text-lg italic"
                    />
                  ) : (
                    <h3 className="mt-1.5 font-display text-xl italic">{post.title}</h3>
                  )}
                  {post.body && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-paper/70">
                      {post.body}
                    </p>
                  )}
                </div>
                <span className="chip shrink-0">{post.type}</span>
              </div>

              <div className="card-foot mt-4 flex flex-wrap gap-2 pt-4">
                <button
                  onClick={() =>
                    decidePost(post.id, 'approved', editingId === post.id ? draft : undefined)
                  }
                  className="btn btn-gold"
                >
                  Approve
                </button>
                {editingId === post.id ? (
                  <button onClick={() => setEditingId(null)} className="btn">
                    Cancel edit
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(post.id);
                      setDraft(post.title);
                    }}
                    className="btn"
                  >
                    Edit title
                  </button>
                )}
                <button onClick={() => decidePost(post.id, 'rejected')} className="btn btn-crimson">
                  Reject
                </button>
                {confirmDeleteId === post.id ? (
                  <>
                    <button onClick={() => removePost(post.id)} className="btn btn-crimson">
                      Delete for good
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)} className="btn">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(post.id)}
                    className="btn text-crimson-lt"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="empty">Queue is clear.</p>}
        </div>
      </section>

      <section>
        <h2 className="kicker mb-4 text-paper/60">
          Pending accounts <span className="text-gold">({String(accounts.length).padStart(2, '0')})</span>
        </h2>
        <div className="space-y-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="card flex flex-wrap items-center justify-between gap-4 p-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="portrait h-14 w-14 text-lg">{initials(acc.full_name)}</div>
                <div className="min-w-0">
                  <p className="font-display text-xl italic leading-tight">{acc.full_name}</p>
                  <p className="meta mt-0.5">
                    {acc.campus}
                    {acc.grade_level ? (
                      <>
                        {' '}
                        <span className="text-paper/50">·</span> {acc.grade_level}
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => decideAccount(acc.id, 'approved')}
                  className="btn btn-gold"
                >
                  Approve
                </button>
                <button
                  onClick={() => decideAccount(acc.id, 'rejected')}
                  className="btn btn-crimson"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {accounts.length === 0 && <p className="empty">No pending signups.</p>}
        </div>
      </section>

      {isSuperAdmin && (
        <section>
          <h2 className="kicker mb-4 text-paper/60">Manage moderators</h2>
          <p className="text-sm text-paper/70">
            Super-admin only: promote/demote moderators from the Discover page&apos;s profile view
            (role field on <code className="text-gold">profiles</code>).
          </p>
        </section>
      )}
    </div>
  );
}
