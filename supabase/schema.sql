-- CalorieAI — Supabase Schema
-- Запустите этот скрипт в Supabase Dashboard → SQL Editor

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text         not null default '',
  weight        numeric(5,1) not null default 70,
  height        numeric(5,1) not null default 170,
  age           integer      not null default 25,
  water_goal    integer      not null default 2000,
  goal_calories integer      not null default 2000,
  goal_protein  integer      not null default 150,
  goal_fat      integer      not null default 65,
  goal_carbs    integer      not null default 250,
  created_at    timestamptz  not null default now()
);

create table if not exists meals (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  calories    integer     not null default 0,
  protein     numeric(6,1)         default 0,
  fat         numeric(6,1)         default 0,
  carbs       numeric(6,1)         default 0,
  weight_g    integer              default 0,
  description text                 default '',
  eaten_at    timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create table if not exists water_log (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  amount     integer     not null,
  logged_at  timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index if not exists meals_user_eaten    on meals     (user_id, eaten_at desc);
create index if not exists water_user_logged   on water_log (user_id, logged_at desc);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table profiles  enable row level security;
alter table meals     enable row level security;
alter table water_log enable row level security;

-- profiles
create policy "select own profile"  on profiles for select using (auth.uid() = id);
create policy "insert own profile"  on profiles for insert with check (auth.uid() = id);
create policy "update own profile"  on profiles for update using (auth.uid() = id);

-- meals
create policy "select own meals"    on meals for select using (auth.uid() = user_id);
create policy "insert own meals"    on meals for insert with check (auth.uid() = user_id);
create policy "delete own meals"    on meals for delete using (auth.uid() = user_id);

-- water_log
create policy "select own water"    on water_log for select using (auth.uid() = user_id);
create policy "insert own water"    on water_log for insert with check (auth.uid() = user_id);
create policy "delete own water"    on water_log for delete using (auth.uid() = user_id);
