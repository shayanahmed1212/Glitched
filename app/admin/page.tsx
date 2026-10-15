import { getCurrentProfile } from '@/lib/db';
import AdminQueue from './AdminQueue';

export default async function AdminPage() {
  const me = await getCurrentProfile();
  if (!['moderator', 'super_admin'].includes(me.role)) {
    return <p className="mx-auto max-w-6xl py-24 text-center text-paper/60">You don&apos;t have moderation access.</p>;
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-6xl">
        <p className="kicker mb-3 text-crimson-lt">Game master</p>
        <h1 className="mb-8 font-display text-5xl italic">Control room</h1>
      </div>
      <AdminQueue isSuperAdmin={me.role === 'super_admin'} />
    </div>
  );
}
