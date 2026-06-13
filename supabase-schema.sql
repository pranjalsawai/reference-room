-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Resources table (shared library)
create table if not exists resources (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id) on delete set null,
  url text not null,
  title text not null,
  description text default '',
  cover_image_url text,
  cover_image_override text,
  category text not null,
  notes text default '',
  tags text[] default '{}',
  is_favorite boolean default false
);

-- Favorites are per-user (each user favorites independently)
create table if not exists favorites (
  user_id uuid references auth.users(id) on delete cascade,
  resource_id uuid references resources(id) on delete cascade,
  primary key (user_id, resource_id)
);

-- Row Level Security
alter table resources enable row level security;
alter table favorites enable row level security;

-- Anyone authenticated can read all resources
create policy "Authenticated users can read resources"
  on resources for select
  to authenticated
  using (true);

-- Authenticated users can insert resources
create policy "Authenticated users can insert resources"
  on resources for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Only the creator can update their own resources
create policy "Creators can update their own resources"
  on resources for update
  to authenticated
  using (auth.uid() = created_by);

-- Only the creator can delete their own resources
create policy "Creators can delete their own resources"
  on resources for delete
  to authenticated
  using (auth.uid() = created_by);

-- Favorites: users manage their own
create policy "Users manage their own favorites"
  on favorites for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
