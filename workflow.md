# ruin — Session & Room Workflow

How a game night actually flows, from opening the app to the final scoreboard. No accounts, no login, just a name and a room code.

## Identity: name only

There's no auth. Entering the app asks for exactly one thing — a display name. That name plus a generated player ID gets stored in the browser (e.g. `localStorage`) alongside the current room code, so a refresh mid-game reconnects someone as themselves instead of dropping them or creating a duplicate. Identity only exists for the lifetime of a room; nothing persists across different game nights unless you deliberately add that later.

## Full flow, step by step

1. **Name entry** — single field, "what should we call you?" Nothing else.
2. **Host creates a room** — gets a short, speakable room code. Word-pair codes (`MOSS-RAVEN`, `PLUM-FOX`) fit the app's tone better than a sterile numeric PIN, and are nearly as easy to read aloud.
3. **Players join** — enter the code, land in the lobby, appear live in everyone's player list immediately (this is the realtime plumbing both games already depend on).
4. **Lobby wait** — host can optionally import Discord chat here (see below) while people are still trickling in, so it doesn't hold up the room.
5. **Host starts the session** — once a minimum player count is met (suggest 3–4).
6. **Game vote** — before each round, players vote which game to play next: Spot the AI or Quiz Battle. Short timer, majority wins, host breaks ties.
7. **Round plays out** — Spot the AI round (per `idea.md`) or a Quiz Battle sequence (below).
8. **Scoreboard** — after each round, show standings, then loop back to the game vote for another round, or the host ends the session.
9. **Final recap** — closing screen, see brainstorm section for what could live here.

## State machine

```
NAME_ENTRY
  → create → LOBBY (as host)
  → join + code → LOBBY (as player)

LOBBY
  → host: import Discord (optional) → back to LOBBY, profiles enriched
  → host: start → GAME_VOTE

GAME_VOTE → resolves → ROUND (Spot the AI, or Quiz sequence below)

ROUND → SCOREBOARD
  → host: play another round → GAME_VOTE
  → host: end session → FINAL_RECAP
```

## Quiz Battle: one question at a time

Sequential, not all-at-once:

1. Question + options appear for everyone simultaneously.
2. A visible countdown starts (a shrinking bar reads better at a glance than a number).
3. Answers lock when the timer hits zero, or once everyone's answered, whichever's first.
4. Reveal: correct answer, who got it, points awarded.
5. Auto-advance to the next question after a short pause (a "next question in 3…" beat keeps pacing tight without needing the host to manually click through every round).

Worth adding even though it wasn't asked for: a speed bonus, answering correctly faster earns more points, same trick Kahoot uses to keep things tense.

## Discord import, without auth

Since there's no per-player login, the host does this once, manually, as a lobby-time utility, not a login flow:

1. Host exports the group's chat (via DiscordChatExporter or similar, from earlier in this conversation) and uploads the resulting file.
2. The app parses it and detects the distinct Discord usernames who posted.
3. Each joined player gets a quick **"claim your username"** prompt, pick which detected Discord name is theirs from a dropdown. This is opt-in per person, not something the host assigns on their behalf, since it's their message history.
4. Anyone who skips this just falls back to the self-reported style questions from `idea.md`. Import should always be optional, never a blocker to playing.

## Edge cases worth deciding now

- **Host disconnects mid-game** — without a fallback, the whole room stalls. Auto-promote the next-longest-joined player to host if the original host's connection drops.
- **Duplicate names** — two "Alex"s joining the same room needs a check; auto-suffix (`Alex`, `Alex (2)`) is simplest.
- **Late joins after a round's started** — simplest v1 rule: block joining once a round is in progress, let them in at the next lobby/vote window instead of trying to mid-round sync someone in.
- **Minimum players** — gray out "Start" with a visible "need 1 more player" message rather than letting the host hit a confusing error.

## Brainstorm: extra features worth considering

- **QR code as an alternative to typing the room code** — since everyone's usually in the same physical room, scanning a code off the host's screen is faster than typing a word-pair on a phone keyboard.
- **A dedicated "host display mode"** — if the host is on a TV or laptop and everyone else is on their phones, the host's screen could be optimized as a shared display (big room code, live vote tallies, current question) while player phones stay minimal (just the input needed for that moment).
- **End-of-night superlatives** — a closing recap screen with a couple of generated callbacks: "most predictable," "best AI impression," "closest vote of the night." Ties the whole session together rather than just ending on a scoreboard.
- **"Lightning round" host override** — skip the game vote occasionally and let the host just pick directly, useful late in a session when energy's better spent playing than voting.
- **Replay/highlight log** — a lightweight record of the night's funniest moments (closest votes, biggest upsets) that could be shared in the group chat afterward.

## UX principles for this kind of app

This is a phones-out, sitting-in-a-room-together app, not a productivity tool, which changes the usual rules:

Keep interactions tap-first. Almost everything after the name field should be tapping a card or button, not typing, since people are doing this casually while talking to each other.

Always show what other people's screens are doing. "3 of 5 have voted," "waiting on 2 more," live player-joining in the lobby — multiplayer apps feel broken the moment someone can't tell if they're waiting on the system or on a friend.

Make timers impossible to miss. A shrinking bar or a big number, not a small icon in a corner, since urgency is part of what makes these games fun.

Give waiting moments personality instead of a blank spinner. If the AI is "thinking" before a Spot the AI round, a styled typing indicator (matching whatever visual direction you land on) beats a generic loading state.

Minimize the path to playing. Name entry to lobby should be one or two taps, total. Every bit of friction before the first round costs you energy in a group that's there to have fun, not fill out a form.

## Open questions for the team

- Should the game vote happen once for the whole session, or before every single round? (Leaning toward before every round, per your original ask, keeps it democratic and gives variety, but worth confirming since it adds a screen between every round.)
- Manual or auto-advance between quiz questions, host control vs. pure pacing.
- Exact minimum/maximum player counts.
- Word-pair room codes vs. a simpler numeric code, mostly a tone decision.
