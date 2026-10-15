import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';
import PlayerName from '@/components/PlayerName';
import { findStudent, getCurrentProfile, withCounts } from '@/lib/db';
import { listPostsByAuthor } from '@/lib/db';
import { VIBES, type Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STAFF_BADGE: Partial<Record<Profile['role'], { label: string; cls: string }>> = {
  moderator: { label: 'Moderator', cls: 'badge-mod' },
  super_admin: { label: 'Super admin', cls: 'badge-admin' },
};

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function ChipRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="kicker mb-2.5 text-paper/60">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="chip">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function SocialRow({ handles }: { handles: Record<string, string> }) {
  const entries = Object.entries(handles).filter(([, v]) => v && v.trim());
  if (entries.length === 0) return null;
  return (
    <div>
      <p className="kicker mb-2.5 text-paper/60">Find them</p>
      <ul className="divide-y divide-paper/10 border-y border-paper/10">
        {entries.map(([platform, handle]) => (
          <li key={platform} className="flex items-baseline justify-between gap-4 py-2.5">
            <span className="kicker shrink-0 text-paper/60">{platform}</span>
            <span className="min-w-0 truncate font-mono text-sm text-paper/90">{handle}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const student = await findStudent(params.id);
  if (!student) notFound();

  const me = await getCurrentProfile();
  const isMe = me.id === student.id;
  const vibe = VIBES[student.vibe ?? 'highscore'];
  const staff = STAFF_BADGE[student.role];

  const posts = listPostsByAuthor(student.id).map(withCounts);
  const score = posts.reduce(
    (sum, p) => sum + Object.values(p.reaction_counts ?? {}).reduce((a, n) => a + n, 0),
    0,
  );

  const stats = [
    { n: posts.length, label: posts.length === 1 ? 'post' : 'posts' },
    { n: score, label: score === 1 ? 'point' : 'points' },
    { n: student.subjects.length, label: 'subjects' },
    { n: student.interests.length, label: 'interests' },
  ];

  return (
    <div className="py-8" style={{ '--mc': vibe.color } as React.CSSProperties}>
      {/* The plate sits in a measure — it is prose, not a board — while the
          run below goes full bleed like the front page. */}
      <div className="mx-auto max-w-6xl">
        <Link
          href="/discover"
          className="kicker text-paper/70 transition-colors hover:text-gold"
        >
          {'<<'} Character select
        </Link>
      </div>

      {/* ---- the plate ---- */}
      <article className="card mc-card mx-auto mt-6 max-w-6xl p-6 sm:p-8">
        <p className="kicker" style={{ color: vibe.color }}>
          {vibe.mc} <span className="text-paper/50">·</span>{' '}
          {student.grade_level ?? student.campus}
        </p>

        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="portrait slot h-24 w-24 text-3xl sm:h-32 sm:w-32 sm:text-4xl">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(student.full_name)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <PlayerName
              name={student.full_name}
              vibe={student.vibe}
              className="text-3xl sm:text-5xl"
            />

            {student.motto && (
              <p
                className="mt-3 font-display text-lg italic leading-snug sm:text-2xl"
                style={{ color: vibe.color }}
              >
                {student.motto}
              </p>
            )}

            <p className="meta mt-3">
              {student.campus}
              {student.grade_level ? (
                <>
                  {' '}
                  <span className="text-paper/50">·</span> {student.grade_level}
                </>
              ) : null}
            </p>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="badge" style={{ borderColor: vibe.color, color: vibe.color }}>
                {vibe.label}
              </span>
              {staff && <span className={`badge ${staff.cls}`}>{staff.label}</span>}
              {isMe && (
                <Link href="/profile" className="btn ml-auto py-2">
                  Edit profile
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* stat strip — four numbers on one rule, not four little cards */}
        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t-2 border-paper/15 pt-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="kicker text-paper/60">{s.label}</dt>
              <dd
                className="mt-1.5 font-mag text-3xl font-black leading-none tabular-nums sm:text-4xl"
                style={{ color: vibe.color }}
              >
                {String(s.n).padStart(2, '0')}
              </dd>
            </div>
          ))}
        </dl>

        {(student.bio || student.subjects.length > 0 || student.interests.length > 0 || Object.keys(student.social_handles).length > 0) && (
          <>
            <hr className="hairline my-7" />
            <div className="space-y-6">
              {student.bio && (
                <p className="dropcap max-w-prose font-read text-lg leading-relaxed text-paper/90">
                  {student.bio}
                </p>
              )}
              <div className="grid gap-6 sm:grid-cols-2">
                <ChipRow label="Subjects" items={student.subjects} />
                <ChipRow label="Interests" items={student.interests} />
              </div>
              <SocialRow handles={student.social_handles} />
            </div>
          </>
        )}
      </article>

      {/* ---- their run ---- */}
      <div className="mx-auto mb-5 mt-12 flex max-w-6xl items-baseline justify-between gap-4">
        <p className="kicker text-paper/60">Their run</p>
        <p className="kicker text-paper/60">
          {String(posts.length).padStart(2, '0')} on the board
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="empty mx-auto max-w-6xl">
          Nothing cleared the desk yet. First post could be theirs.
        </p>
      ) : (
        <div className="board">
          <div className="board-grid grid grid-flow-row-dense grid-cols-4 gap-2.5 sm:grid-cols-8 xl:grid-cols-12">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
