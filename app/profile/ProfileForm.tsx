'use client';

import { useState } from 'react';
import { updateProfile } from '@/lib/actions';
import { compressAndUpload } from '@/lib/upload';
import { VIBES, type Profile, type VibeKey } from '@/lib/types';
import PlayerName from '@/components/PlayerName';

const ROLE: Record<Profile['role'], { label: string; cls: string }> = {
  student: { label: 'Student', cls: '' },
  moderator: { label: 'Moderator', cls: 'badge-mod' },
  super_admin: { label: 'Super admin', cls: 'badge-admin' },
};

type Handle = { platform: string; handle: string };

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-t-2 border-paper/15 pt-5">
      <p className="kicker text-gold">{title}</p>
      {note && <p className="note mt-1.5">{note}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function ChipEditor({
  label,
  placeholder,
  items,
  onChange,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  function add() {
    const t = draft.trim();
    if (t && !items.includes(t)) onChange([...items, t]);
    setDraft('');
  }

  return (
    <div>
      <label className="label mb-1.5">{label}</label>
      {items.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span key={item} className="chip" data-active="true">
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((x) => x !== item))}
                aria-label={`Remove ${item}`}
                className="ml-1 text-paper/70 transition-colors hover:text-crimson-lt"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="field flex-1"
        />
        <button type="button" onClick={add} className="btn">
          Add
        </button>
      </div>
    </div>
  );
}

function HandleEditor({ handles, onChange }: { handles: Handle[]; onChange: (next: Handle[]) => void }) {
  return (
    <div className="space-y-2.5">
      {handles.map((row, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={row.platform}
            onChange={(e) =>
              onChange(handles.map((h, j) => (j === i ? { ...h, platform: e.target.value } : h)))
            }
            placeholder="Instagram"
            aria-label="Platform"
            className="field w-32 shrink-0"
          />
          <input
            value={row.handle}
            onChange={(e) =>
              onChange(handles.map((h, j) => (j === i ? { ...h, handle: e.target.value } : h)))
            }
            placeholder="@westminster.tea"
            aria-label="Handle"
            className="field min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={() => onChange(handles.filter((_, j) => j !== i))}
            aria-label="Remove row"
            className="btn px-3"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...handles, { platform: '', handle: '' }])}
        className="btn"
      >
        + Add link
      </button>
    </div>
  );
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [campus, setCampus] = useState(profile.campus);
  const [grade, setGrade] = useState(profile.grade_level ?? '');
  const [motto, setMotto] = useState(profile.motto ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [subjects, setSubjects] = useState<string[]>(profile.subjects ?? []);
  const [interests, setInterests] = useState<string[]>(profile.interests ?? []);
  const [handles, setHandles] = useState<Handle[]>(
    Object.entries(profile.social_handles ?? {}).map(([platform, handle]) => ({ platform, handle })),
  );
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [vibe, setVibe] = useState<VibeKey>(profile.vibe ?? 'highscore');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const role = ROLE[profile.role];
  const v = VIBES[vibe];

  function touch() {
    setSaved(false);
  }

  function handleAvatar(file: File | null) {
    if (!file) return;
    touch();
    compressAndUpload(file).then(setAvatarUrl);
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        full_name: fullName.trim() || profile.full_name,
        campus: campus.trim(),
        grade_level: grade.trim() || null,
        motto: motto.trim() || null,
        bio,
        subjects,
        interests,
        social_handles: Object.fromEntries(
          handles
            .filter((h) => h.platform.trim() && h.handle.trim())
            .map((h) => [h.platform.trim(), h.handle.trim()]),
        ),
        avatar_url: avatarUrl,
        vibe,
      });
      setSaved(true);
    } catch (e: any) {
      setError(e.message ?? 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="card mc-card p-6 sm:p-8" style={{ '--mc': v.color } as React.CSSProperties}>
      {/* live plate — everything you type lands here as you type it */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="portrait portrait-hero h-20 w-20 text-2xl sm:h-28 sm:w-28 sm:text-4xl">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(fullName || profile.full_name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="kicker mb-2.5" style={{ color: v.color }}>
            {v.mc}
          </p>
          <PlayerName name={fullName || profile.full_name} vibe={vibe} className="text-3xl sm:text-5xl" />
          {motto.trim() && (
            <p className="mt-2.5 font-display text-lg italic leading-snug sm:text-2xl" style={{ color: v.color }}>
              {motto}
            </p>
          )}
          <p className="meta mt-2">
            {campus || profile.campus}
            {grade.trim() ? (
              <>
                {' '}
                <span className="text-paper/50">·</span> {grade}
              </>
            ) : null}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="badge" style={{ borderColor: v.color, color: v.color }}>
              {v.label}
            </span>
            <span className={`badge ${role.cls}`}>{role.label}</span>
          </div>
        </div>
      </div>

      {/* ---- edit panel ---- */}
      <div className="mt-8 space-y-5">
        <Section title="Look">
          <div>
            <p className="label mb-2">Portrait</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="btn cursor-pointer">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatar(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
              {avatarUrl && (
                <button type="button" onClick={() => { setAvatarUrl(null); touch(); }} className="btn">
                  Remove
                </button>
              )}
              <span className="note">Square crops best.</span>
            </div>
          </div>

          <div>
            <p className="label mb-2">Vibe</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(VIBES) as VibeKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={vibe === k}
                  onClick={() => {
                    setVibe(k);
                    touch();
                  }}
                  className="chip vibe-pick"
                  style={{ '--vibe': VIBES[k].color } as React.CSSProperties}
                >
                  {VIBES[k].label}
                </button>
              ))}
            </div>
            <p className="note mt-1.5">Sets your colour and the voice your name is set in.</p>
          </div>
        </Section>

        <Section title="Identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label mb-1.5">Name</label>
              <input value={fullName} onChange={(e) => { setFullName(e.target.value); touch(); }} className="field" />
            </div>
            <div>
              <label className="label mb-1.5">Campus</label>
              <input value={campus} onChange={(e) => { setCampus(e.target.value); touch(); }} className="field" />
            </div>
          </div>
          <div>
            <label className="label mb-1.5">Year / stream</label>
            <input
              value={grade}
              onChange={(e) => { setGrade(e.target.value); touch(); }}
              placeholder="A-Level Year 2"
              className="field"
            />
          </div>
        </Section>

        <Section title="Words">
          <div>
            <label className="label mb-1.5">Motto</label>
            <input
              value={motto}
              onChange={(e) => { setMotto(e.target.value); touch(); }}
              placeholder="One line. Make it count."
              maxLength={80}
              className="field"
            />
            <p className="note mt-1.5">{80 - motto.length} left</p>
          </div>
          <div>
            <label className="label mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => { setBio(e.target.value); touch(); }}
              rows={4}
              className="field resize-y"
            />
          </div>
        </Section>

        <Section title="Loadout">
          <ChipEditor
            label="Subjects"
            placeholder="Physics"
            items={subjects}
            onChange={(next) => { setSubjects(next); touch(); }}
          />
          <ChipEditor
            label="Interests"
            placeholder="Photography"
            items={interests}
            onChange={(next) => { setInterests(next); touch(); }}
          />
        </Section>

        <Section title="Links" note="Anything you want people to find. Leave a row blank to drop it.">
          <HandleEditor handles={handles} onChange={(next) => { setHandles(next); touch(); }} />
        </Section>

        {error && <p className="err">{error}</p>}

        <div className="border-t-2 border-paper/15 pt-5">
          <button onClick={save} disabled={saving} className="btn btn-gold w-full py-3.5">
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
          </button>
        </div>
      </div>
    </article>
  );
}
