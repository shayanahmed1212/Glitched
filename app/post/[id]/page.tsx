import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReadingProgress from '@/components/ReadingProgress';
import ReactionBar from '@/components/ReactionBar';
import CommentSection from '@/components/CommentSection';
import PostActions from '@/components/PostActions';
import { getCurrentProfile, listPostComments, withCounts } from '@/lib/db';
import { findPost } from '@/lib/db';

export const dynamic = 'force-dynamic';

function dateline(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function minutesToRead(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Standfirst first, the way a magazine sets it: the opening line runs
// as the deck and the story proper starts underneath. A one-block
// story gives up its first full sentence instead, so nothing is ever
// said twice on the page.
function splitStory(text: string) {
  const paras = text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (paras.length > 1) return { deck: paras[0], body: paras.slice(1) };

  const words = (paras[0] ?? '').split(/\s+/).filter(Boolean);
  for (let i = 5; i < words.length - 6; i++) {
    if (/[.!?]$/.test(words[i])) {
      return { deck: words.slice(0, i + 1).join(' '), body: [words.slice(i + 1).join(' ')] };
    }
  }

  return { deck: '', body: paras };
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const found = findPost(params.id);
  if (!found) notFound();
  const post = withCounts(found);

  const comments = await listPostComments(params.id);
  const me = await getCurrentProfile();
  const canEdit =
    post.author_id === me.id || me.role === 'moderator' || me.role === 'super_admin';

  const cover = post.media_urls?.[0];
  const body = post.body ?? '';
  const { deck, body: paragraphs } = splitStory(body);
  const minutes = minutesToRead(body);
  const author = post.profiles?.full_name ?? 'The desk';
  const campus = post.profiles?.campus ?? '';
  const when = dateline(post.created_at);
  const pts = Object.values(post.reaction_counts ?? {}).reduce((sum, n) => sum + n, 0);
  const tags = post.tags ?? [];

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto max-w-2xl pb-10">
        <Link href="/" className="kicker text-paper/70 transition-colors hover:text-gold">
          {'<<'} Front Page
        </Link>

        <PostActions post={post} canEdit={canEdit} />

        {/* section line — category, dateline, effort */}
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="chip">
            {post.type === 'photo' ? 'Photo' : post.type === 'magazine' ? 'Magazine' : 'Opinion'}
          </span>
          <span className="kicker text-paper/70">{when}</span>
          <span className="kicker text-paper/70">{minutes} min read</span>
        </div>

        {/* the didone — the one place we let the type shout */}
        <h1 className="mt-5 font-mag text-4xl font-black leading-[1.04] tracking-[-0.02em] text-paper sm:text-6xl">
          {post.title}
        </h1>

        {deck && (
          <p className="mt-5 font-read text-xl italic leading-[1.5] text-paper/75 sm:text-2xl">
            {deck}
          </p>
        )}

        {/* byline rail */}
        <div className="mt-7 flex flex-wrap items-center gap-3 border-y-2 border-paper/20 py-4">
          <span className="portrait h-10 w-10 text-xs">{initials(author)}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-paper">{author}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-paper/70">
              {campus} <span className="text-paper/50">·</span> {when}{' '}
              <span className="text-paper/50">·</span> {minutes} min read
            </p>
          </div>
          <span className="kicker ml-auto shrink-0 text-gold">
            {String(pts).padStart(2, '0')} PTS
          </span>
        </div>

        {cover && (
          <img
            src={cover}
            alt={post.title}
            className="mt-7 max-h-[30rem] w-full border-2 border-paper/20 object-cover"
          />
        )}

        {paragraphs.length > 0 && (
          <div className="article-body mt-9 space-y-6 font-read text-[1.1875rem] leading-[1.72] text-paper/90">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="mt-9 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="chip">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* ornament — the magazine's full stop */}
        <div className="mt-10 flex items-center gap-4">
          <span className="hairline flex-1" />
          <span className="kicker text-crimson-lt">End of story</span>
          <span className="hairline flex-1" />
        </div>

        <div className="mt-8 border-t-2 border-paper/20 pt-6">
          <ReactionBar postId={post.id} />
        </div>

        <div className="mt-8 border-t-2 border-paper/20 pt-6">
          <CommentSection postId={post.id} initialComments={comments} />
        </div>
      </article>
    </>
  );
}
