import Link from 'next/link';
import { listStudents } from '@/lib/db';
import { VIBES, type Profile } from '@/lib/types';
import PlayerName from '@/components/PlayerName';

// A designed mosaic, not a grid. On lg (6 cols) rows sum to 6:
// 4+2, 3+3, 2+2+2, 6 — so no two rows are the same shape.
// Size drives how much of the person we let through: lg cards lead
// with their own words, sm cards are compact portrait tiles.
const GRID: { span: string; size: 'lg' | 'md' | 'sm' }[] = [
  { span: 'lg:col-span-4', size: 'lg' },
  { span: 'lg:col-span-2', size: 'sm' },
  { span: 'lg:col-span-3', size: 'md' },
  { span: 'lg:col-span-3', size: 'md' },
  { span: 'lg:col-span-2', size: 'sm' },
  { span: 'lg:col-span-2', size: 'sm' },
  { span: 'lg:col-span-2', size: 'sm' },
  { span: 'lg:col-span-6', size: 'lg' },
];

// Students all read the same; only the desk gets a badge so it
// actually means something when it appears.
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

function Portrait({ s, className }: { s: Profile; className: string }) {
  return (
    <div className={`portrait ${className}`}>
      {s.avatar_url ? (
        <img src={s.avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(s.full_name)
      )}
    </div>
  );
}

function VibeChip({ vibe }: { vibe: { label: string; color: string } }) {
  return (
    <span className="badge" style={{ borderColor: vibe.color, color: vibe.color }}>
      {vibe.label}
    </span>
  );
}

function CampusLine({ s }: { s: Profile }) {
  return (
    <span className="meta">
      {s.campus}
      {s.grade_level ? (
        <>
          {' '}
          <span className="text-paper/50">·</span> {s.grade_level}
        </>
      ) : null}
    </span>
  );
}

function Loadout({ subjects }: { subjects: string[] }) {
  if (subjects.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {subjects.map((sub) => (
        <span key={sub} className="chip">
          {sub}
        </span>
      ))}
    </div>
  );
}

// Magazine issue line: their number in the run, then the class they
// picked — pixel face, in their own colour, over every card.
function IssueLine({ n, mc, color }: { n: number; mc: string; color: string }) {
  return (
    <p className="kicker" style={{ color }}>
      NO.{String(n).padStart(2, '0')} <span className="text-paper/50">·</span> {mc}
    </p>
  );
}

function MetaRow({
  s,
  vibe,
}: {
  s: Profile;
  vibe: { label: string; color: string };
}) {
  const staff = STAFF_BADGE[s.role];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <VibeChip vibe={vibe} />
      <CampusLine s={s} />
      {staff && <span className={`badge ${staff.cls}`}>{staff.label}</span>}
    </div>
  );
}

function StudentCard({
  s,
  size,
  span,
  n,
}: {
  s: Profile;
  size: string;
  span: string;
  n: number;
}) {
  const vibe = VIBES[s.vibe ?? 'highscore'];
  const style = { '--mc': vibe.color } as React.CSSProperties;

  if (size === 'lg') {
    // Statement card — their words are the point.
    return (
      <Link href={`/student/${s.id}`} className={`card mc-card flex flex-col p-6 sm:p-7 ${span}`} style={style}>
        <IssueLine n={n} mc={vibe.mc} color={vibe.color} />

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
          <Portrait
            s={s}
            className="slot h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl lg:h-28 lg:w-28 lg:text-4xl"
          />
          <div className="min-w-0 flex-1">
            <PlayerName
              name={s.full_name}
              vibe={s.vibe}
              className="text-2xl sm:text-3xl lg:text-4xl"
            />
            <div className="mt-3">
              <MetaRow s={s} vibe={vibe} />
            </div>
          </div>
        </div>

        {s.bio && (
          <>
            <hr className="hairline my-5" />
            <p className="dropcap font-display text-xl italic leading-snug text-paper sm:text-2xl">
              {s.bio}
            </p>
          </>
        )}

        {s.subjects.length > 0 && (
          <div className="mt-auto pt-6">
            <p className="kicker mb-2 text-paper/60">Subjects</p>
            <Loadout subjects={s.subjects} />
          </div>
        )}
      </Link>
    );
  }

  if (size === 'md') {
    // Roster card — face, name in its own voice, a few lines of them.
    return (
      <Link href={`/student/${s.id}`} className={`card mc-card flex flex-col p-5 ${span}`} style={style}>
        <IssueLine n={n} mc={vibe.mc} color={vibe.color} />

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start">
          <Portrait s={s} className="slot h-16 w-16 text-xl" />
          <div className="min-w-0 flex-1">
            <PlayerName
              name={s.full_name}
              vibe={s.vibe}
              className="text-xl sm:text-2xl"
            />
            <div className="mt-2.5">
              <MetaRow s={s} vibe={vibe} />
            </div>
          </div>
        </div>

        {s.bio && (
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-paper/75">{s.bio}</p>
        )}

        {s.subjects.length > 0 && (
          <div className="mt-auto pt-4">
            <Loadout subjects={s.subjects} />
          </div>
        )}
      </Link>
    );
  }

  // Compact tile — face, name, loadout. No bio.
  return (
    <Link href={`/student/${s.id}`} className={`card mc-card flex flex-col p-5 ${span}`} style={style}>
      <IssueLine n={n} mc={vibe.mc} color={vibe.color} />
      <Portrait s={s} className="slot mt-3 h-20 w-20 text-2xl" />
      <PlayerName name={s.full_name} vibe={s.vibe} className="mt-4 text-xl" />
      <div className="mt-2.5">
        <MetaRow s={s} vibe={vibe} />
      </div>

      {s.subjects.length > 0 && (
        <div className="mt-auto pt-4">
          <Loadout subjects={s.subjects} />
        </div>
      )}
    </Link>
  );
}

export default async function DiscoverPage() {
  const list = await listStudents();

  return (
    <div className="py-8">
      <div className="mx-auto max-w-6xl">
        <p className="kicker mb-3 text-gold">Character select</p>
        <h1 className="mb-8 font-display text-6xl italic">Discover</h1>
      </div>

      {list.length === 0 ? (
        <p className="empty mx-auto max-w-6xl">No approved profiles yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {list.map((s, i) => {
            const g = GRID[i % GRID.length];
            return (
              <StudentCard key={s.id} s={s} size={g.size} span={g.span} n={i + 1} />
            );
          })}
        </div>
      )}
    </div>
  );
}
