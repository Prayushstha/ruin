# ruin — Idea & Game Design

A "game night" app for friend groups: log in, join a room, play rounds of two AI party games back to back, watch a shared leaderboard climb. This doc covers the actual game logic, not the tech stack (see README.md for that).

## Core Concept

One room, one group of friends, a session that can mix rounds of both games. The AI's job in both games is the same underlying trick: it's fed real, lightweight data about the players (their texting style, their own answers to questions) and asked to either *imitate* a player or *generate trivia about* the players. The fun comes from how convincingly or unconvincingly it pulls that off.

## Player Profile (shared by both games)

Collected once at onboarding, reusable everywhere:

- **Style traits** — capitalization habits (lowercase only / normal / ALL CAPS sometimes), emoji frequency (none / occasional / heavy), punctuation quirks (no punctuation / overuses "..." / always proper), typical message length (short bursts / paragraphs), a few example phrases they actually say often ("lowkey", "no cap", "fr fr", whatever's real for them).
- **Personality answers** — a handful of "would rather," "most likely to," and quick-fact questions (favorite food, biggest fear, go-to order, last thing they'd admit to). This is the fuel for the trivia game.

Both games read from this same table, so building the onboarding form once powers everything downstream.

## Game 1: Spot the AI

### Round flow

1. **Pick a target** — system randomly selects one real player to be impersonated this round. Track who's been picked before so it rotates evenly across a session rather than the same person every time.
2. **AI generates in character** — the AI gets the target's style profile plus this round's prompt, and writes a response *as* them.
3. **Real players respond** — every player including the target writes their own real response to the same prompt (the target doesn't know they're the one being mimicked).
4. **Responses go anonymous** — all responses (the AI's and everyone's real ones) get shuffled and shown unlabeled, just "Response A," "Response B," etc.
5. **Vote** — everyone except the target votes for which response they think is the AI. (The target sits this vote out since they obviously know their own answer.)
6. **Reveal** — show who wrote what, highlight the AI's response, tally who guessed correctly.

### Round prompts

These need to be personality-revealing, not factual — things like "what's your most controversial food opinion," "describe your ideal Saturday," "what's a hill you'll die on." A simple prompt bank (30–50 written in advance) is enough for v1; AI-generated prompts are a nice-to-have later, not a blocker.

### Scoring (starting point, tune as you playtest)

- +1 point to each player who correctly identifies the AI's response.
- +2 points to the target if the AI fools the majority of voters (nobody catches it).
- 0 points, no penalty, for guessing wrong — keeps it low-stakes and fun rather than punishing.
- Optional: streak bonus for guessing correctly multiple rounds in a row.

### Practical constraints

- **Minimum 4 players** — need a target, the AI, and at least 2 voters for it to be interesting. Below that, disable the game or show a warning.
- **Timers** — give roughly 45 seconds to submit a response, 20–30 seconds to vote. Auto-skip players who don't submit in time rather than blocking the round.
- **Profile quality matters** — thin style profiles make the AI's mimicry weak and easy to spot. Consider letting players refine their profile after seeing how identifiable they were ("people guessed you in 1/3 rounds — want to add more detail?").

### Example system prompt (starting point)

```
You're playing a party game where you must respond to a prompt exactly as
a specific real person would, fully in their texting style. Their profile:
{style_profile}

Respond to this prompt in 1–3 short messages, matching their capitalization,
punctuation, emoji habits, and typical phrases. Stay fully in character.
Do not mention you are an AI or break the bit.

Prompt: {round_prompt}
```

## Game 2: How Well Does AI Know Us

### Round flow

1. **AI generates a question** from the group's profile data — a "most likely to," a "guess who said this," or a two-truths-style question.
2. **Players guess** — pick which friend they think the question is about, or which answer is real.
3. **Reveal** — show the real answer pulled from actual profile data, score points.

### Question types to build toward (start with the first one, add others once it's working)

- **"Most likely to"** — AI picks a trait combination from profiles and frames it as a superlative; players guess who it's about.
- **"Guess who said this"** — take an actual answer someone gave during onboarding (e.g. their "biggest fear" answer) verbatim, show it anonymously, players guess who wrote it.
- **Two truths and an AI lie** — AI invents one plausible-but-fake fact about a player, mixed with two of their real profile answers; others guess which is fake. Needs a guardrail (see below) since the AI is inventing something about a real person.

### Scoring

- +1 point per correct guess.
- Track two fun side-stats across a session: "most predictable" (correctly guessed most often) and "most mysterious" (correctly guessed least) — good for end-of-night bragging rights even without changing the core score.

### Guardrail worth building in early

Because this game generates content framed as being "about" real friends, keep the AI's prompt explicitly instructed to stay lighthearted and avoid inventing anything sensitive, embarrassing, or mean-spirited, especially for the two-truths-and-a-lie format where it's making something up. Easiest fix: tell it directly in the prompt to keep fabricated facts silly/mundane (favorite snack, weird habit) rather than personal.

### Example generation prompt (starting point)

```
Given these player profiles: {profiles_json}

Generate one lighthearted "most likely to" trivia question for a party
game. Keep it fun and harmless, never embarrassing or personal. Return
strict JSON only, no other text:

{ "question": string, "options": [list of player names], "correct_answer": string }
```

## Shared Room State Machine

Both games sit inside the same room lifecycle, which is worth building once rather than per-game:

```
LOBBY → PROFILE_COLLECTION → ROUND_INTRO → 
RESPONSE_OR_QUESTION_PHASE → VOTING_PHASE → REVEAL → 
SCOREBOARD → (next round, or back to LOBBY)
```

The host picks which game runs each round once both exist, so a session can naturally mix Spot the AI and trivia rounds back to back rather than being locked into one game per session.

## Feature Brainstorm / Stretch Ideas

Roughly ordered by how much extra work they add:

- **Difficulty modes for Spot the AI** — "easy" gives the AI a thinner profile (more spottable), "hard" gives it your full style data plus recent message examples.
- **Custom prompt packs** — let players submit their own round prompts ahead of a game night, so prompts feel personal to your specific group rather than generic.
- **Persistent cross-session leaderboard** — track scores across multiple game nights, not just one session, so there's a running rivalry.
- **Post-game recap screen** — funniest fooled-everyone moment, most predictable player, biggest upset vote, shown at the end of a session.
- **Discord-derived profiles** — replace self-reported style questions with profiles built from real message history (this was the original idea from earlier in the build plan — genuinely the best long-term version of Spot the AI, just more setup work).
- **Spectator/larger-group mode** — let more than the active players watch and vote along, useful once the group grows beyond a tight circle.
- **Achievement badges** — "fooled the group 3 times," "never wrong" type unlocks, mostly cosmetic but adds replay incentive.

## Open Questions for the Team to Decide

These are deliberately left as defaults above, not locked in, worth a quick group decision before building:

- Exact point values and whether wrong guesses should ever cost points.
- Minimum/maximum players per room (suggested: 4 minimum, no real max but UI gets cramped past ~10).
- Whether the target in Spot the AI should get to see their own AI impersonation after the round (could be very funny, also could be cut for time).
- How big the starting prompt bank needs to be before round-repetition feels stale.
