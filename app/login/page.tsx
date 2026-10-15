'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    // Auth is stubbed out until Supabase is wired back in — the app is open to everyone.
    router.push('/');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <p className="kicker mb-3 text-gold">Player 1</p>
      <h1 className="mb-8 font-display text-5xl italic">Log in</h1>
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <input
          type="email"
          placeholder="School email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
        />
        {error && <p className="err">{error}</p>}
        <button type="submit" className="btn btn-gold w-full py-3.5">
          Press start →
        </button>
      </form>
      <p className="note mt-6">
        Credits are free while the build finishes — every screen&apos;s unlocked right now.
      </p>
    </div>
  );
}
