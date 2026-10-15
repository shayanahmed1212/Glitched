-- Glitched — Supabase schema (v1)
-- Run this in Supabase SQL editor.

create extension if not exists "uuid-ossp";

-- ========== USERS / PROFILES ==========
-- Supabase Auth handles login; this table stores the profile + approval state.
create type user_role as enum ('student', 'moderator', 'super_admin');
create type account_status as enum ('pending', 'approved', 'rejected');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  campus text not null default 'H-8',
  grade_level text,                -- e.g. "A-Level Year 2"
  subjects text[] default '{}',    -- e.g. {"Further Math", "Physics"}
  interests text[] default '{}',
  social_handles jsonb default '{}',
  bio text,
  avatar_url text,
  role user_role not null default 'student',
  status account_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ========== POSTS ==========
create type post_type as enum ('photo', 'article', 'magazine');

-- migration for databases created before magazine existed:
-- alter type post_type add value if not exists 'magazine';
create type post_status as enum ('pending', 'approved', 'rejected', 'hidden');


create table posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles(id) on delete cascade,
  type post_type not null,
  title text not null,
  body text,                       -- article body / caption
  media_urls text[] default '{}', -- R2 object URLs (compressed .webp)
  tags text[] default '{}',        -- open hashtag system
  status post_status not null default 'pending',
  approved_by uuid references profiles(id),
  report_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== REACTIONS ==========
create type reaction_type as enum ('fire', 'shock', 'valid', 'wild'); -- 🔥 😱 👏 💀

create table reactions (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type reaction_type not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id) -- one reaction per user per post; changing it updates the row
);

-- ========== COMMENTS ==========
create table comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  report_count int not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

-- ========== REPORTS (generic, covers posts + comments) ==========
create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  check (num_nonnulls(post_id, comment_id) = 1)
);

-- Auto-hide after N reports (N=5), flip status for admin review instead of deleting.
create or replace function handle_new_report() returns trigger as $$
begin
  if new.post_id is not null then
    update posts set report_count = report_count + 1 where id = new.post_id;
    update posts set status = 'hidden' where id = new.post_id and report_count >= 5 and status = 'approved';
  elsif new.comment_id is not null then
    update comments set report_count = report_count + 1 where id = new.comment_id;
    update comments set hidden = true where id = new.comment_id and report_count >= 5;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_report_created
  after insert on reports
  for each row execute function handle_new_report();

-- Editing an approved post reverts it to pending.
create or replace function handle_post_update() returns trigger as $$
begin
  if old.status = 'approved' and (new.title <> old.title or new.body is distinct from old.body or new.media_urls <> old.media_urls) then
    new.status := 'pending';
    new.approved_by := null;
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger on_post_update
  before update on posts
  for each row execute function handle_post_update();

-- ========== ROW LEVEL SECURITY ==========
alter table profiles enable row level security;
alter table posts enable row level security;
alter table reactions enable row level security;
alter table comments enable row level security;
alter table reports enable row level security;

-- Profiles: everyone approved can read; users manage their own row; admins manage all.
create policy "profiles_select_approved" on profiles for select
  using (status = 'approved' or id = auth.uid());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());
create policy "profiles_insert_own" on profiles for insert
  with check (id = auth.uid());
create policy "profiles_admin_all" on profiles for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('moderator','super_admin')));

-- Posts: approved posts visible to all approved users; author sees their own regardless of status; admins see/manage all.
create policy "posts_select_approved" on posts for select
  using (status = 'approved' or author_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('moderator','super_admin')));
create policy "posts_insert_own" on posts for insert
  with check (author_id = auth.uid());
create policy "posts_update_own_or_admin" on posts for update
  using (author_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('moderator','super_admin')));
create policy "posts_delete_own_or_admin" on posts for delete
  using (author_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('moderator','super_admin')));

-- Reactions & comments: any approved user can read/write on visible posts.
create policy "reactions_all" on reactions for all using (user_id = auth.uid() or true) with check (user_id = auth.uid());
create policy "comments_select" on comments for select using (true);
create policy "comments_insert_own" on comments for insert with check (user_id = auth.uid());
create policy "comments_update_own_or_admin" on comments for update
  using (user_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('moderator','super_admin')));

-- Reports: any approved user can file; only admins can read the queue.
create policy "reports_insert" on reports for insert with check (reporter_id = auth.uid());
create policy "reports_select_admin" on reports for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('moderator','super_admin')));



