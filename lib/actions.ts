'use server';

import {
  decideAccount as decideAccountInStore,
  decidePost as decidePostInStore,
  findStudent,
  getCurrentProfile as readCurrentProfile,
  hideComment,
  insertComment,
  insertPost,
  listPendingAccounts as readPendingAccounts,
  listPendingPosts,
  listPostComments as readPostComments,
  listPostReactions as readPostReactions,
  listStudents as readStudents,
  patchPost,
  patchProfile as patchProfileInStore,
  removePost,
  setReaction as setReactionInStore,
  signUpAccount as signUpAccountInStore,
} from './db';
import type { Comment, Post, Profile, ProfilePatch, Reaction, ReactionKey } from './types';

export type { ProfilePatch };

// ---------------------------------------------------------------------------
// The only way client components are allowed to touch the store.
//
// These run on the server, so they mutate data/db.json directly instead of a
// copy of the module that the browser bundled for itself. Names match the old
// lib/data.ts functions so the call sites barely change.
// ---------------------------------------------------------------------------

// ----------------------------- posts ---------------------------------------

export async function submitPost(input: {
  type: Post['type'];
  title: string;
  body: string;
  media_urls: string[];
  tags: string[];
}): Promise<Post> {
  return insertPost(input);
}

export async function getPendingPosts(): Promise<Post[]> {
  return listPendingPosts();
}

export async function updatePost(
  id: string,
  patch: Partial<Pick<Post, 'title' | 'body' | 'tags'>>,
): Promise<void> {
  patchPost(id, patch);
}

export async function decidePost(
  id: string,
  status: 'approved' | 'rejected',
  newTitle?: string,
): Promise<void> {
  decidePostInStore(id, status, newTitle);
}

export async function deletePost(id: string): Promise<void> {
  removePost(id);
}

// ----------------------------- reactions -----------------------------------

export async function getPostReactions(postId: string): Promise<Reaction[]> {
  return readPostReactions(postId);
}

export async function reactToPost(postId: string, type: ReactionKey): Promise<void> {
  setReactionInStore(postId, type);
}

// ----------------------------- comments ------------------------------------

export async function getPostComments(postId: string): Promise<Comment[]> {
  return readPostComments(postId);
}

export async function addComment(postId: string, body: string): Promise<Comment> {
  return insertComment(postId, body);
}

export async function reportComment(commentId: string): Promise<void> {
  hideComment(commentId);
}

// ----------------------------- profiles ------------------------------------

export async function getStudents(): Promise<Profile[]> {
  return readStudents();
}

export async function getStudent(id: string): Promise<Profile | null> {
  return findStudent(id);
}

export async function getCurrentProfile(): Promise<Profile> {
  return readCurrentProfile();
}

export async function getPendingAccounts(): Promise<Profile[]> {
  return readPendingAccounts();
}

export async function updateProfile(patch: ProfilePatch): Promise<void> {
  patchProfileInStore(patch);
}

export async function signUpAccount(input: {
  full_name: string;
  campus: string;
  grade_level: string;
}): Promise<void> {
  signUpAccountInStore(input);
}

export async function decideAccount(
  id: string,
  status: 'approved' | 'rejected',
): Promise<void> {
  decideAccountInStore(id, status);
}
