// ── identity vibe ────────────────────────────────────────────────
// A student picks one of these and it becomes their signature on
// Discover — the colour, the lower block edge, the class line in
// their kicker, and which display voice their name is set in.
// Four brand-safe accents, never a new hue.
export type VibeKey = 'chaos' | 'highscore' | 'chill' | 'clean';

export const VIBES: Record<VibeKey, { label: string; color: string; mc: string }> = {
  chaos: { label: 'Chaos', color: '#E8574F', mc: 'Nether' },
  highscore: { label: 'High score', color: '#B98A2E', mc: 'Diamond' },
  chill: { label: 'Chill', color: '#6FA45E', mc: 'Overworld' },
  clean: { label: 'Clean', color: '#F5F3EE', mc: 'The End' },
};

export type Profile = {
  id: string;
  full_name: string;
  campus: string;
  grade_level: string | null;
  subjects: string[];
  interests: string[];
  social_handles: Record<string, string>;
  bio: string | null;
  motto?: string | null;
  avatar_url: string | null;
  role: 'student' | 'moderator' | 'super_admin';
  status: 'pending' | 'approved' | 'rejected';
  vibe?: VibeKey;
};

export type Post = {
  id: string;
  author_id: string;
  type: 'photo' | 'article' | 'magazine';
  title: string;
  body: string | null;
  media_urls: string[];
  tags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  created_at: string;
  profiles?: Pick<Profile, 'full_name' | 'avatar_url' | 'campus'>;
  reaction_counts?: Record<string, number>;
};

export type Comment = {
  id: string;
  post_id: string;
  body: string;
  created_at: string;
  hidden?: boolean;
  profiles?: { full_name: string; avatar_url: string | null };
};

export type ReactionKey = 'fire' | 'shock' | 'valid' | 'wild';

export type Reaction = {
  post_id: string;
  user_id: string;
  type: ReactionKey;
};

// The full editable surface of a profile. Role and status are desk-only —
// nothing a student types can promote them.
export type ProfilePatch = Partial<
  Pick<
    Profile,
    | 'full_name'
    | 'campus'
    | 'grade_level'
    | 'motto'
    | 'bio'
    | 'interests'
    | 'subjects'
    | 'social_handles'
    | 'avatar_url'
    | 'vibe'
  >
>;

export const REACTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
  { key: 'fire', emoji: '🔥', label: 'Hot Take' },
  { key: 'shock', emoji: '😱', label: 'Crisis' },
  { key: 'valid', emoji: '👏', label: 'Valid' },
  { key: 'wild', emoji: '💀', label: 'Wild' },
];

// The signed-in student. Held here rather than in lib/seed.ts because client
// components need it and that module is full of seed data the browser should
// never download.
export const DEMO_USER_ID = 'demo-user';

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  full_name: 'Demo Student',
  campus: 'H-8',
  grade_level: 'A-Level Year 2',
  subjects: ['Mathematics', 'Physics', 'Further Maths'],
  interests: ['Debate', 'Football', 'Photography'],
  social_handles: {},
  bio: 'Proofreader by night, chaos by day. If your headline is wrong I already fixed it in my head.',
  motto: 'Correcting your grammar since Year 7.',
  avatar_url: null,
  role: 'super_admin',
  status: 'approved',
  vibe: 'highscore',
};
