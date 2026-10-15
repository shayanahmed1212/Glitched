import Link from 'next/link';
import type { Post } from '@/lib/types';

// The board never sets two headlines the same way — each card picks its own
// face, so the wall reads as a rack of clippings, not a template.
const FACES = [
  'f-didone',
  'f-sans',
  'f-caps',
  'f-italic',
  'f-fat',
  'f-script',
  'f-pixel',
] as const;

// ---------------------------------------------------------------------------
// Per-card variation.
//
// A wall where every Nth card gets the same face and the same crop reads as a
// template, so each post picks its own treatment by hashing its id. That has
// to be deterministic: Math.random() would give the server and the browser
// different answers and blow up hydration. Same id, same card, every render.
// ---------------------------------------------------------------------------

function hash(id: string): number {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Murmur3 finaliser. FNV's own bits avalanche badly — taking `h % 8`
  // straight off it piled five of these posts onto the same tile. Mixing
  // first spreads them evenly across the kit.
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return (h ^ (h >>> 16)) >>> 0;
}

// Re-mixes the hash with an odd multiplier so the tag decision stays clear of
// the face rotation above.
const slot = (h: number, salt: number) => Math.imul(h, salt) >>> 0;

// The composition. Sixteen tiles are one full cycle, and their column spans
// add up to whole bands at every breakpoint — so the wall tiles the plane
// exactly: no dense-flow improvisation, no holes, and every card edge lands on
// a line shared with its neighbours. That shared line is what makes a mosaic
// read as designed rather than scattered.
//
// The cycle runs three squares, three squares, two landscapes, twice: 16 cards
// across 6 bands. The old cycle carried a two-band portrait, which bought one
// card for the price of two rows — the worst ratio on the board, and the first
// thing to go when the brief is more cards per square foot. A 6-col band
// every third row keeps the rhythm from flattening into a uniform grid.
//
// Below xl it collapses structurally — a clean 2-up on sm and md, a 1-up feed
// on mobile — because a phone board is a stack, not a mosaic.
const SPANS = [
  'col-span-4', // square
  'col-span-4', // square
  'col-span-4', // square
  'col-span-4', // square
  'col-span-4', // square
  'col-span-4', // square
  'col-span-4 xl:col-span-6', // landscape
  'col-span-4 xl:col-span-6', // landscape
  'col-span-4', // square
  'col-span-4', // square
  'col-span-4', // square
  'col-span-4', // square
  'col-span-4', // square
  'col-span-4', // square
  'col-span-4 xl:col-span-6', // landscape
  'col-span-4 xl:col-span-6', // landscape
] as const;

const spanFor = (index: number) => SPANS[((index % SPANS.length) + SPANS.length) % SPANS.length];

// Voices are handed out on a stride, not picked. Seven faces drawn at random
// across twenty-one cards clump — and the hash rotation that was meant to
// break the pattern up also destroyed both guarantees: it produced adjacent
// repeats and left one face with no cards at all, because `h % 7` is not
// uniform across these ids.
//
// Stride 3 is coprime with 7, so it walks every face before repeating and
// never lands twice in a row. The index is the card's position on the board —
// the same thing its shape comes from — so voice and geometry stay locked to
// each other and the order is stable across renders.
const faceFor = (index: number) => FACES[(index * 3) % FACES.length];

// Roughly one card in five drops its tag — a wall where every tile carries a
// chip starts to look like a filter bar.
const tagless = (h: number) => Math.floor((slot(h, 0x85ebca6b) / 0x100000000) * 5) === 0;

// The card's hit area is a separate static <a> sitting directly on the tile,
// so its ::after resolves against the card and covers all of it. That keeps
// the byline free to link to the author's profile without nesting one anchor
// inside another. Anything drawn above it — the byline — only needs z-10.
function Stretch({ post }: { post: Post }) {
  return <Link href={`/post/${post.id}`} aria-label={post.title} className="stretch" />;
}

function Tag({ name }: { name: string }) {
  return <span className="chip">{name}</span>;
}

function Byline({ post, score, className = 'mt-2' }: { post: Post; score: number; className?: string }) {
  if (!post.profiles) return null;
  return (
    <div className={`flex items-baseline justify-between gap-3 ${className}`}>
      <p className="meta min-w-0 truncate">
        <Link
          href={`/student/${post.author_id}`}
          className="relative z-10 decoration-paper/30 underline-offset-4 transition-colors hover:text-gold hover:decoration-gold"
        >
          {post.profiles.full_name}
        </Link>{' '}
        <span className="text-paper/50">·</span> {post.profiles.campus}
      </p>
      <span className="kicker shrink-0 text-gold">{String(score).padStart(2, '0')} PTS</span>
    </div>
  );
}

export default function PostCard({
  post,
  className = '',
  index = 0,
}: {
  post: Post;
  className?: string;
  index?: number;
}) {
  const cover = post.media_urls?.[0];
  const standfirst = (post.body ?? '').split('\n')[0];
  const score = Object.values(post.reaction_counts ?? {}).reduce((sum, n) => sum + n, 0);
  const h = hash(post.id);
  const titleClass = `title ${faceFor(index)} text-paper`;
  // Shape comes from position in the composition, never from the hash — that
  // is what keeps the bands aligned.
  const tile = spanFor(index);

  if (!cover) {
    // Text-led pieces (op-eds, opinion) get a typographic block instead of a photo —
    // a filled placeholder image would undercut the "this is an argument, not a picture" read.
    return (
      <div
        className={`card card-link group relative flex flex-col overflow-hidden p-4 lg:p-5 ${tile} ${className}`}
      >
        <Stretch post={post} />
        <div className="mb-2 flex items-center gap-3">
          <span className="kicker text-crimson-lt">Opinion</span>
          <span className="hairline flex-1" />
          <span className="kicker text-paper/60">No photo</span>
        </div>
        {/* Clamped so a long headline can't push the byline out of a short
            band — the board's density depends on every tile honouring its
            height. */}
        <h3 className={`${titleClass} line-clamp-2`}>{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-paper/70">{standfirst}</p>
        <Byline post={post} score={score} className="mt-auto pt-3" />
      </div>
    );
  }

  return (
    <div
      className={`card card-link group relative block overflow-hidden ${tile} ${className}`}
    >
      <img
        src={cover}
        alt={post.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

      <Stretch post={post} />

      <div className="absolute inset-x-0 bottom-0 p-4">
        {!tagless(h) && post.tags?.[0] && (
          <span className="mb-2 block">
            <Tag name={`#${post.tags[0]}`} />
          </span>
        )}
        <h3 className={`${titleClass} line-clamp-2`}>{post.title}</h3>
        <Byline post={post} score={score} className="mt-2" />
      </div>
    </div>
  );
}
