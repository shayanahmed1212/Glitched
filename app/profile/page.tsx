import Link from 'next/link';
import { getCurrentProfile } from '@/lib/db';
import ProfileForm from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="kicker text-gold">Player card</p>
        <Link
          href={`/student/${profile.id}`}
          className="kicker text-paper/70 transition-colors hover:text-gold"
        >
          View public profile {'>>'}
        </Link>
      </div>

      <h1 className="mt-3 font-display text-5xl italic sm:text-6xl">Your Profile</h1>
      <p className="mb-8 mt-3 max-w-prose text-[15px] leading-relaxed text-paper/70">
        Everything below is yours. It is exactly what the board sees when they tap your name.
      </p>

      <ProfileForm profile={profile} />
    </div>
  );
}
