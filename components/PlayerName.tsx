import type { VibeKey } from '@/lib/types';

/* Which display voice a player gets is set by the vibe they pick —
   a magazine gives every spread its own type, and theirs travels
   with them from the player card out to Discover. */
const VOICE_BY_VIBE: Record<VibeKey, string> = {
  chaos: 'pulp',
  highscore: 'cover',
  chill: 'editorial',
  clean: 'stack',
};

export default function PlayerName({
  name,
  vibe,
  className = '',
}: {
  name: string;
  vibe: VibeKey | undefined;
  className?: string;
}) {
  const voice = VOICE_BY_VIBE[vibe ?? 'highscore'];

  if (voice === 'stack') {
    const [first, ...rest] = name.split(' ');
    return (
      <h2 className={`${className} t-stack break-words`}>
        <span className="block">{first}</span>
        {rest.length > 0 && (
          <span className="mt-1 block text-[0.52em] font-medium uppercase leading-none tracking-[0.2em]">
            {rest.join(' ')}
          </span>
        )}
      </h2>
    );
  }

  return <h2 className={`${className} t-${voice} break-words`}>{name}</h2>;
}
