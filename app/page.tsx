import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { listApprovedPosts } from '@/lib/db';
import { withCounts } from '@/lib/db';

export const dynamic = 'force-dynamic';

const ISSUE_NO = 12;

function dateline(iso: string) {
  return new Date(iso)
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    .toUpperCase();
}

export default async function FeedPage({ searchParams }: { searchParams: { submitted?: string } }) {
  const list = listApprovedPosts().map(withCounts);
  const now = list[0]?.created_at ?? new Date().toISOString();

  const notice = searchParams.submitted ? (
    <div className="mb-8 border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-paper/90">
      Logged. Sitting with the mod desk — it hits the board once it&apos;s cleared.
    </div>
  ) : null;

  if (list.length === 0) {
    return (
      <div className="py-24 text-center">
        {notice}
        <p className="kicker text-gold">Insert coin</p>
        <h1 className="mt-3 font-display text-5xl italic text-paper">Press start.</h1>
        <p className="mx-auto mt-3 max-w-md text-paper/60">
          Board&apos;s empty. Drop a photo or an op-ed — claim the top spot once the desk clears it.
        </p>
      </div>
    );
  }

  // Every approved post sits on the board — nothing is peeled off into a
  // separate spread, so the issue count above always matches the tiles below.
  const wall = list;

  return (
    <div>
      {notice}

      {/* The header sits in a measure so the nameplate reads at a sane line
          length; everything below it is deliberately uncapped and runs to the
          viewport edges. */}
      <header className="mx-auto mb-6 max-w-6xl">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="kicker text-gold">
            High score <span className="text-crimson">·</span> Stage {String(ISSUE_NO).padStart(3, '0')}
          </p>
          <p className="kicker text-paper/60">
            {dateline(now)} <span className="text-crimson">·</span> Score {String(list.length).padStart(6, '0')}
          </p>
        </div>

        <hr className="hairline mt-4" />

        {/* nameplate */}
        <h1 className="mt-5 font-mag text-5xl font-black leading-[0.9] tracking-[-0.02em] text-paper sm:text-8xl">
          The Front Page
        </h1>

        <div className="mt-6 flex items-center gap-4">
          <span className="hairline flex-1" />
          <span className="kicker text-crimson-lt">All the tea that&apos;s fit to post</span>
          <span className="hairline flex-1" />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-prose text-[15px] leading-relaxed text-paper/70">
            Everything the office won&apos;t confirm.
          </p>
          <Link href="/post/new" className="btn btn-gold shrink-0">
            Write a post
          </Link>
        </div>
      </header>

      <hr className="hairline mx-auto mb-8 max-w-6xl" />

      <div className="mx-auto mb-5 flex max-w-6xl items-baseline justify-between gap-4">
        <p className="kicker text-paper/60">In this issue</p>
        <p className="kicker text-paper/60">{wall.length} posts</p>
      </div>

      {/* the wall — a full-bleed bento. The band height comes from the grid's
          own column width, and the eight-tile cycle adds up to whole bands, so
          the board locks together with shared edge lines instead of the
          browser improvising around fixed pixel heights. */}
      <div className="board">
        <div className="board-grid grid grid-flow-row-dense grid-cols-4 gap-2.5 sm:grid-cols-8 xl:grid-cols-12">
          {wall.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
