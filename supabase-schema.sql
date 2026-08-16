-- Reference Room access model. Run once in the Supabase SQL editor.
-- Existing references are preserved and moved into Pranjal's shared room.
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  kind text not null check (kind in ('shared', 'personal')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'contributor')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists invitation_codes (
  id uuid primary key default uuid_generate_v4(),
  token_hash text unique,
  kind text not null check (kind in ('contributor', 'personal')),
  workspace_id uuid references workspaces(id) on delete cascade,
  invited_email text,
  display_name text not null default '',
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '14 days'),
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table resources add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
alter table resources add column if not exists added_by_name text not null default '';
alter table resources add column if not exists contribution_note text not null default '';

do $$
declare
  inferred_owner uuid;
  shared_workspace uuid;
begin
  if exists (select 1 from resources where workspace_id is null) then
    select created_by into inferred_owner from resources
    where created_by is not null group by created_by order by count(*) desc limit 1;
    if inferred_owner is null then
      raise exception 'Could not infer the owner from existing resources.';
    end if;
    insert into profiles (id, display_name) values (inferred_owner, 'Pranjal')
      on conflict (id) do nothing;
    select id into shared_workspace from workspaces
      where kind = 'shared' and owner_id = inferred_owner limit 1;
    if shared_workspace is null then
      insert into workspaces (name, kind, owner_id)
      values ('The Reference Room', 'shared', inferred_owner)
      returning id into shared_workspace;
    end if;
    insert into workspace_members (workspace_id, user_id, role)
      values (shared_workspace, inferred_owner, 'owner')
      on conflict (workspace_id, user_id) do update set role = 'owner';
    update resources set workspace_id = shared_workspace,
      added_by_name = case when added_by_name = '' then 'Pranjal' else added_by_name end
      where workspace_id is null;
  end if;
end $$;

alter table resources alter column workspace_id set not null;

create or replace function is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from workspace_members
    where workspace_id = target_workspace and user_id = (select auth.uid()));
$$;

create or replace function workspace_role(target_workspace uuid)
returns text language sql stable security definer set search_path = public as $$
  select role from workspace_members
    where workspace_id = target_workspace and user_id = (select auth.uid()) limit 1;
$$;

alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table resources enable row level security;
alter table favorites enable row level security;
alter table invitation_codes enable row level security;

drop policy if exists "Authenticated users can read resources" on resources;
drop policy if exists "Authenticated users can insert resources" on resources;
drop policy if exists "Creators can update their own resources" on resources;
drop policy if exists "Creators can delete their own resources" on resources;
drop policy if exists "Members read resources" on resources;
drop policy if exists "Members add resources" on resources;
drop policy if exists "Owners update resources" on resources;
drop policy if exists "Owners delete resources" on resources;

create policy "Members read resources" on resources for select to authenticated
  using (is_workspace_member(workspace_id));
create policy "Members add resources" on resources for insert to authenticated
  with check (is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy "Owners update resources" on resources for update to authenticated
  using (workspace_role(workspace_id) = 'owner')
  with check (workspace_role(workspace_id) = 'owner');
create policy "Owners delete resources" on resources for delete to authenticated
  using (workspace_role(workspace_id) = 'owner');

drop policy if exists "Users read their profile" on profiles;
drop policy if exists "Users update their profile" on profiles;
drop policy if exists "Members read workspaces" on workspaces;
drop policy if exists "Members read memberships" on workspace_members;
create policy "Users read their profile" on profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "Users update their profile" on profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Members read workspaces" on workspaces for select to authenticated
  using (is_workspace_member(id));
create policy "Members read memberships" on workspace_members for select to authenticated
  using (user_id = (select auth.uid()) or workspace_role(workspace_id) = 'owner');

drop policy if exists "Users manage their own favorites" on favorites;
create policy "Users manage their own favorites" on favorites for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create index if not exists resources_workspace_id_idx on resources(workspace_id);
create index if not exists workspace_members_user_id_idx on workspace_members(user_id);
