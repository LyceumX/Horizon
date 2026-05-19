create table if not exists planner_profiles (
  id bigint generated always as identity primary key,
  clerk_user_id text not null,
  profile jsonb not null,
  projection jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists planner_profiles_created_at_idx
  on planner_profiles (created_at desc);

create index if not exists planner_profiles_clerk_user_id_idx
  on planner_profiles (clerk_user_id);

create table if not exists user_preferences (
  id bigint generated always as identity primary key,
  clerk_user_id text not null unique,
  language text not null default 'en',
  updated_at timestamptz not null default now()
);

create index if not exists user_preferences_clerk_user_id_idx
  on user_preferences (clerk_user_id);
