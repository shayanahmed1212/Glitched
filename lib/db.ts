import fs from 'node:fs';
import path from 'node:path';
import type { Comment, Post, Profile, ProfilePatch, Reaction, ReactionKey } from './types';
import { DEMO_PROFILE, SEED_COMMENTS, SEED_POSTS, SEED_REACTIONS, nextId, profiles } from './seed';

// ---------------------------------------------------------------------------
// The whole store, on disk. This is the one place that talks to data/db.json,
// and it is server-only — never import it from a client component. Client code
// goes through the server actions in lib/actions.ts instead.
//
// Posts landed here first; profiles, comments and reactions followed once it
// became clear that a client component importing any of them got its own copy
// of the module, so a reaction fired in the browser never reached the server
// and vanished on refresh. Everything mutable now lives behind one write().
//
// Replacing this with a real database means reimplementing these exports;
// every call site already talks to them by name.
// ---------------------------------------------------------------------------

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

let seq = 0;
const newId = () => `post-${Date.now().toString(36)}-${++seq}`;

type Store = {
  posts: Post[];
  profiles: Profile[];
  comments: Comment[];
  reactions: Reaction[];
};

function write(store: Store) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, DB_PATH); // atomic, so a crash mid-write can't truncate it
}

// An existing db.json may predate the extra collections; seed whichever are
// missing rather than making everyone delete the file to get them back. The
// fallbacks are cloned — returning seed.ts's own arrays would let a mutation
// dirty that module in memory even if the write below then failed.
function read(): Store {
  if (!fs.existsSync(DB_PATH)) {
    const seeded: Store = {
      posts: SEED_POSTS.map((p) => ({ ...p })),
      profiles: profiles.map((p) => ({ ...p })),
      comments: SEED_COMMENTS.map((c) => ({ ...c })),
      reactions: SEED_REACTIONS.map((r) => ({ ...r })),
    };
    write(seeded);
    return seeded;
  }
  const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) as Partial<Store>;
  return {
    posts: Array.isArray(parsed.posts)
      ? parsed.posts
      : SEED_POSTS.map((p) => ({ ...p })),
    profiles: Array.isArray(parsed.profiles)
      ? parsed.profiles
      : profiles.map((p) => ({ ...p })),
    comments: Array.isArray(parsed.comments)
      ? parsed.comments
      : SEED_COMMENTS.map((c) => ({ ...c })),
    reactions: Array.isArray(parsed.reactions)
      ? parsed.reactions
      : SEED_REACTIONS.map((r) => ({ ...r })),
  };
}

const me = (store: Store): Profile =>
  store.profiles.find((p) => p.id === DEMO_PROFILE.id) ?? DEMO_PROFILE;

// ----------------------------- posts ---------------------------------------

export function listApprovedPosts(): Post[] {
  return read()
    .posts.filter((p) => p.status === 'approved')
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function findPost(id: string): Post | null {
  return read().posts.find((p) => p.id === id && p.status !== 'hidden') ?? null;
}

export function listPendingPosts(): Post[] {
  return read()
    .posts.filter((p) => p.status === 'pending')
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function listPostsByAuthor(authorId: string): Post[] {
  return read()
    .posts.filter((p) => p.author_id === authorId && p.status === 'approved')
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function insertPost(input: {
  type: Post['type'];
  title: string;
  body: string;
  media_urls: string[];
  tags: string[];
}): Post {
  const store = read();
  const author = me(store);
  const post: Post = {
    id: newId(),
    author_id: author.id,
    ...input,
    status: 'pending',
    created_at: new Date().toISOString(),
    profiles: {
      full_name: author.full_name,
      avatar_url: author.avatar_url,
      campus: author.campus,
    },
  };
  store.posts.unshift(post);
  write(store);
  return post;
}

export function patchPost(
  id: string,
  patch: Partial<Pick<Post, 'title' | 'body' | 'tags'>>,
): Post {
  const store = read();
  const post = store.posts.find((p) => p.id === id);
  if (!post) throw new Error('Post not found');
  if (patch.title !== undefined) post.title = patch.title;
  if (patch.body !== undefined) post.body = patch.body;
  if (patch.tags !== undefined) post.tags = patch.tags;
  write(store);
  return post;
}

export function decidePost(
  id: string,
  status: 'approved' | 'rejected',
  newTitle?: string,
): Post {
  const store = read();
  const post = store.posts.find((p) => p.id === id);
  if (!post) throw new Error('Post not found');
  post.status = status;
  if (newTitle) post.title = newTitle;
  write(store);
  return post;
}

export function removePost(id: string): void {
  const store = read();
  const i = store.posts.findIndex((p) => p.id === id);
  if (i === -1) throw new Error('Post not found');
  store.posts.splice(i, 1);
  // Comments and reactions belong to the post; leave them orphaned in a real
  // database and they leak.
  store.comments = store.comments.filter((c) => c.post_id !== id);
  store.reactions = store.reactions.filter((r) => r.post_id !== id);
  write(store);
}

// ----------------------------- reactions -----------------------------------

function tally(store: Store, postId: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of store.reactions) {
    if (r.post_id !== postId) continue;
    out[r.type] = (out[r.type] ?? 0) + 1;
  }
  return out;
}

export function listPostReactions(postId: string): Reaction[] {
  return read().reactions.filter((r) => r.post_id === postId);
}

// One reaction per person per post — picking a second replaces the first.
export function setReaction(postId: string, type: ReactionKey): void {
  const store = read();
  const uid = me(store).id;
  store.reactions = store.reactions.filter(
    (r) => !(r.post_id === postId && r.user_id === uid),
  );
  store.reactions.push({ post_id: postId, user_id: uid, type });
  write(store);
}

export function withCounts(post: Post): Post {
  return { ...post, reaction_counts: tally(read(), post.id) };
}

// ----------------------------- comments ------------------------------------

export function listPostComments(postId: string): Comment[] {
  return read()
    .comments.filter((c) => c.post_id === postId && !c.hidden)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function insertComment(postId: string, body: string): Comment {
  const store = read();
  const author = me(store);
  const comment: Comment = {
    id: nextId('c'),
    post_id: postId,
    body,
    created_at: new Date().toISOString(),
    hidden: false,
    profiles: { full_name: author.full_name, avatar_url: author.avatar_url },
  };
  store.comments.push(comment);
  write(store);
  return comment;
}

export function hideComment(id: string): void {
  const store = read();
  const comment = store.comments.find((c) => c.id === id);
  if (!comment) return; // already gone — nothing for the caller to undo
  comment.hidden = true;
  write(store);
}

// ----------------------------- profiles ------------------------------------

export function listStudents(): Profile[] {
  return read()
    .profiles.filter((p) => p.status === 'approved')
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export function findStudent(id: string): Profile | null {
  const found = read().profiles.find((p) => p.id === id && p.status === 'approved');
  return found ? { ...found } : null;
}

export function getCurrentProfile(): Profile {
  return { ...me(read()) };
}

export function listPendingAccounts(): Profile[] {
  return read().profiles.filter((p) => p.status === 'pending');
}

export function patchProfile(patch: ProfilePatch): void {
  const store = read();
  const target = store.profiles.find((p) => p.id === DEMO_PROFILE.id);
  if (!target) return;
  Object.assign(target, patch);
  // Posts keep a snapshot of the author's name for the byline, so an edit to
  // a display name has to travel through them too.
  for (const post of store.posts) {
    if (post.author_id !== target.id) continue;
    post.profiles = {
      full_name: target.full_name,
      avatar_url: target.avatar_url,
      campus: target.campus,
    };
  }
  write(store);
}

export function signUpAccount(input: {
  full_name: string;
  campus: string;
  grade_level: string;
}): void {
  const store = read();
  store.profiles.push({
    id: nextId('p'),
    full_name: input.full_name,
    campus: input.campus,
    grade_level: input.grade_level || null,
    subjects: [],
    interests: [],
    social_handles: {},
    bio: null,
    avatar_url: null,
    role: 'student',
    status: 'pending',
  });
  write(store);
}

export function decideAccount(id: string, status: 'approved' | 'rejected'): void {
  const store = read();
  const profile = store.profiles.find((p) => p.id === id);
  if (!profile) return;
  profile.status = status;
  write(store);
}
