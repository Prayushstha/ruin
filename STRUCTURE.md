# ruin — project structure

How the codebase is organized and the rules that keep it that way. Read this
before adding a folder or moving a file — the whole point of the layout is
that anyone on the team can open the project and know where things go.

```
ruin/
├── src/                      frontend (React 19 + Vite + TypeScript)
│   ├── main.tsx              entry point — mounts <App />
│   ├── index.css             global styles + theme tokens (imports Tailwind)
│   ├── vite-env.d.ts         typed env vars (VITE_SUPABASE_URL, …)
│   │
│   ├── app/                  composition root
│   │   └── App.tsx               app shell — providers + feature router live here
│   │
│   ├── features/             feature modules — the meat of the app
│   │   ├── auth/                 login + onboarding entry
│   │   ├── profile/              player style-profile collection (powers both games)
│   │   ├── lobby/                create / join room, waiting room
│   │   ├── game/                 shared room state machine + phase UI
│   │   │   ├── spot-the-ai/          Game 1 from idea.md
│   │   │   └── trivia/               Game 2: "how well does AI know us"
│   │   └── leaderboard/          scoring + end-of-night recap
│   │
│   ├── shared/               cross-cutting, feature-agnostic
│   │   ├── components/           UI primitives (Button, Card, …)
│   │   ├── hooks/                reusable hooks
│   │   ├── lib/                  pure utilities (no React, no I/O)
│   │   └── types/                domain types — Player, Room, GamePhase …
│   │
│   └── api/                  the ONLY layer that talks to the backend
│       ├── client.ts             single Supabase client
│       └── index.ts              public surface (features import from '@/api')
│
└── server/                   backend
    └── supabase/
        ├── migrations/           SQL schema, one file per change
        └── functions/            edge functions (AI calls — keys stay server-side)
```

## Backend: Supabase

One service covers everything the app needs:

| need                | Supabase piece          |
| ------------------- | ----------------------- |
| auth (login)        | Auth                    |
| realtime room state | Realtime (postgres changes / broadcast) |
| persistent data     | Postgres tables         |
| AI calls            | Edge Functions (server-side, keys hidden) |

The frontend talks to it through `src/api` only. Feature code never imports
`@supabase/supabase-js` directly — that keeps the backend swappable and the
API surface in one place.

**Setup:** copy `.env.example` → `.env.local`, fill in `VITE_SUPABASE_URL`
and `VITE_SUPABASE_ANON_KEY` (Supabase dashboard → Project Settings → API).

## The rules

**1. Feature-based, not type-based.**
A feature owns its components, hooks, types, and its slice of the api
together. There is no top-level `components/` grab-bag. If a piece of UI
belongs to one feature, it lives in that feature's folder.

**2. Dependency direction: `app → features → shared → api`.**
- `app` may import anything.
- `features` may import `shared` and `api`, never each other directly. Two
  features that need to share something are telling you it belongs in
  `shared`.
- `shared` imports nothing feature-related. It's the bottom layer.
- `api` is imported by features but knows nothing about features.

**3. Import through `@/`, not relative paths.**
The `@` alias resolves to `src/` (configured in both `vite.config.ts` and
`tsconfig.app.json`). Write `import { Button } from '@/shared/components'`,
not `import { Button } from '../../../shared/components'`. Relative imports
are fine *within* a feature folder.

**4. Each feature exposes a public `index.ts`.**
Other layers import a feature's exports through its barrel, not by reaching
into its internals. This keeps the feature's internal layout free to change.

**5. `src/api` is the backend boundary.**
All network calls go through here. When (if) we move off Supabase, only this
folder changes.

**6. Domain types live in `src/shared/types`.**
`Player`, `Room`, `GamePhase`, scoring — the vocabulary of the whole app.
Imported as `import type { Room } from '@/shared/types'`. When a real backend
schema exists these get promoted to a root `shared/` package both sides
import; until then, one home is enough.

## Mix-and-match JSX / TS

Both `.jsx`/`.js` and `.tsx`/`.ts` files are supported:

- Name a file **`.tsx`/`.ts`** → it's type-checked by `tsc` (strict).
- Name a file **`.jsx`/`.js`** → it builds via Vite but is **not**
  type-checked (Vite's React plugin handles JSX with no React import needed).

So the extension is the switch: want safety, use `.tsx`; want to move fast
on a UI sketch, use `.jsx`. They interop freely.

## Commands

| command             | what it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | start the Vite dev server (HMR)       |
| `npm run build`     | type-check (`tsc -b`) then bundle     |
| `npm run typecheck` | type-check only, no build             |
| `npm run lint`      | ESLint over the whole project         |
| `npm run preview`   | serve the production build locally    |

## Conventions

- Use `const` objects + union types for fixed value sets (see `GamePhase` in
  `src/shared/types/room.ts`), not `enum` — the project uses
  `erasableSyntaxOnly`, which `enum` violates.
- No magic strings for ids/roles. Brand them (see `RoomCode` in
  `room.ts`) so they can't be silently swapped with any string.
- Keep `shared/lib` free of React and free of I/O — pure functions only.
