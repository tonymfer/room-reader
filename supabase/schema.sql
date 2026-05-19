create table if not exists public.room_reader_rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  topic text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.room_reader_audience_cards (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.room_reader_rooms(id) on delete cascade,
  name text not null,
  role text not null,
  lens jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.room_reader_rooms enable row level security;
alter table public.room_reader_audience_cards enable row level security;

create policy "room_reader_rooms_public_read"
on public.room_reader_rooms
for select
using (true);

create policy "room_reader_rooms_public_insert"
on public.room_reader_rooms
for insert
with check (true);

create policy "room_reader_audience_cards_public_read"
on public.room_reader_audience_cards
for select
using (true);

create policy "room_reader_audience_cards_public_insert"
on public.room_reader_audience_cards
for insert
with check (true);
