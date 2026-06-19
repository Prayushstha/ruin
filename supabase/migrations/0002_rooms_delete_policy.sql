-- ruin: add missing rooms DELETE policy.
-- 0001 omitted it; without it a host can't delete their own room under the
-- publishable key (RLS silently no-ops the delete). Matches room_players,
-- which already has all four CRUD policies.
create policy "rooms are deletable" on rooms for delete using (true);
