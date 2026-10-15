'use client';

import { useState } from 'react';
import { signUpAccount } from '@/lib/actions';

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', campus: 'H-8', gradeLevel: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    // Profile lands as status='pending' — an admin must approve before it appears in Discover.
    await signUpAccount({ full_name: form.fullName, campus: form.campus, grade_level: form.gradeLevel });

    setStatus('done');
  }

  if (status === 'done') {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="kicker mb-3 text-gold">Continue?</p>
        <h1 className="font-display text-4xl italic">Player ready.</h1>
        <p className="mt-4 text-paper/60">
          A mod has to clear your account before you can post or hit the board. You&apos;ll get an
          email once it&apos;s approved.
        </p>
        <a href="/admin" className="btn btn-gold mt-8">
          Open the desk →
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <p className="kicker mb-3 text-gold">New player</p>
      <h1 className="mb-8 font-display text-5xl italic">Join Glitched</h1>
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <Field label="Full name" required value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
        <Field label="School email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Password" type="password" required value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        <div>
          <label className="label mb-1.5">Campus</label>
          <select
            value={form.campus}
            onChange={(e) => setForm({ ...form, campus: e.target.value })}
            className="field"
          >
            <option>H-8</option>
          </select>
        </div>
        <Field label="Grade / level (e.g. A-Level Year 2)" value={form.gradeLevel} onChange={(v) => setForm({ ...form, gradeLevel: v })} />

        {error && <p className="err">{error}</p>}

        <button type="submit" disabled={status === 'loading'} className="btn btn-gold w-full py-3.5">
          {status === 'loading' ? 'Creating…' : 'Create account →'}
        </button>
      </form>
      <p className="note mt-6">
        New players land in the mod queue (this session only) — open{' '}
        <span className="text-paper/75">/admin</span> to clear one.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field"
      />
    </div>
  );
}
