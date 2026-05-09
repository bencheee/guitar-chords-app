-- Guitar Chords App — Supabase schema
-- Run this in the Supabase SQL editor to create the songs table.

create table if not exists songs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  artist      text not null,
  album       text not null default '',
  year        integer,
  capo        integer not null default 0 check (capo >= 0 and capo <= 9),
  key         text not null default '',
  content     text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on row changes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger songs_updated_at
  before update on songs
  for each row execute function update_updated_at();

-- Enable Row Level Security (open read, open write — no auth required)
alter table songs enable row level security;

create policy "Allow all reads" on songs for select using (true);
create policy "Allow all inserts" on songs for insert with check (true);
create policy "Allow all updates" on songs for update using (true);
create policy "Allow all deletes" on songs for delete using (true);
