-- ruin: rooms + room_players
-- No auth: identity is a name + localStorage id, so RLS is open by design
-- ("anyone with the room code can play").

-- Mirrors RoomPhase in src/shared/types/room.ts.
create type room_phase as enum (
  'LOBBY',
  'PROFILE_COLLECTION',
  'ROUND_INTRO',
  'RESPONSE_OR_QUESTION_PHASE',
  'VOTING_PHASE',
  'REVEAL',
  'SCOREBOARD'
);

create table rooms (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  host_id    text not null,
  phase      room_phase not null default 'LOBBY',
  created_at timestamptz not null default now()
);

create table room_players (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references rooms(id) on delete cascade,
  player_id    text not null,
  display_name text not null,
  joined_at    timestamptz not null default now(),
  is_connected boolean not null default true,
  unique (room_id, player_id)
);

-- join order drives host promotion when the host drops.
create index room_players_room_joined_idx
  on room_players (room_id, joined_at);

-- Row Level Security: open by design (room code is the access token).

alter table rooms enable row level security;
alter table room_players enable row level security;

create policy "rooms are readable"    on rooms for select using (true);
create policy "rooms are insertable"  on rooms for insert with check (true);
create policy "rooms are updatable"   on rooms for update using (true);

create policy "players are readable"   on room_players for select using (true);
create policy "players are insertable" on room_players for insert with check (true);
create policy "players are updatable"  on room_players for update using (true);
create policy "players are deletable"  on room_players for delete using (true);

-- Realtime: broadcast changes so every client's player list updates live.
alter publication supabase_realtime add table room_players;
alter publication supabase_realtime add table rooms;
