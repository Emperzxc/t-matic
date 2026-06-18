create extension if not exists "pgcrypto";

do $$ begin
  create type user_role as enum ('super_admin', 'user');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type user_status as enum ('active', 'disabled');
exception
  when duplicate_object then null;
end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role user_role not null default 'user',
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  transcript text not null,
  result jsonb not null,
  total_codes integer not null default 0,
  master_theme_count integer not null default 0,
  superordinate_theme_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists users_role_idx on users(role);
create index if not exists users_status_idx on users(status);
create index if not exists analyses_user_id_idx on analyses(user_id);
create index if not exists analyses_created_at_idx on analyses(created_at desc);
