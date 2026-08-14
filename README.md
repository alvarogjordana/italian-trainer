# 🇮🇹 Impara l'italiano — Italian vocabulary trainer

A fast, offline-first web app for learning Italian vocabulary, built for
Spanish/English speakers. Spaced-repetition flashcards, typing practice, verb
conjugation drills, browsing/search with CRUD, progress stats, and JSON
backup — all client-side, no backend, no accounts.

## Access gate

The app sits behind a single shared HTTP Basic Auth password (see
`src/middleware.ts`) to keep it off search engines and random visitors — it is
**not** a real multi-user login, just a lock on the front door. Credentials are
read from environment variables so they never ship in the client bundle:

```bash
cp .env.example .env.local
# then edit .env.local and set:
#   APP_BASIC_AUTH_USER=...
#   APP_BASIC_AUTH_PASSWORD=...
```

In production (Vercel), set `APP_BASIC_AUTH_USER` and
`APP_BASIC_AUTH_PASSWORD` under **Project Settings → Environment Variables**
instead of committing `.env.local`. If these variables are unset, the gate is
disabled and the app is open to anyone with the link.

## Features

- **Review (home)** — SM-2 spaced-repetition queue of due cards. Flip to reveal,
  grade **Again / Hard / Good / Easy**, example sentence on the back.
  Direction configurable: IT→ES, ES→IT, or mixed.
- **Typing** — type the translation with diacritic-insensitive matching and a
  character-level diff on mistakes.
- **Verb drill** — pick a verb + tense, conjugate all six persons, instant
  feedback. Covers the 40 highest-frequency irregular verbs across seven tenses.
- **Browse/search** — filter by type, theme tag, CEFR level, and mastery state.
  Add, edit, and delete your own entries.
- **Stats** — cards due today, current streak, 30-day accuracy, mastery
  breakdown by type, and your 20 weakest words.
- **Data** — export/import everything as JSON (localStorage is fragile, so keep
  backups) and reset progress.
- **Audio** — a speaker button on every Italian word (Web Speech API, `it-IT`).

## UX

- Mobile-first, with a keyboard-driven desktop flow:
  - **Space** — flip card · **1–4** — grade · **Enter** — submit/next ·
    **Esc** — exit session.
- Dark mode by default (toggle in the top bar), high-contrast typography, no
  slow card animations.
- Sessions default to 20 cards with a completion summary.

## Data model

Each entry has `id`, `italian`, `spanish`, `english`, `type`, optional `gender`
(nouns), `plural`, `notes`, `exampleIt`, `exampleEs`, `tags[]`, and `cefr`.
Verbs additionally carry `infinitive`, `isIrregular`, and `conjugations` for
presente, passato prossimo, imperfetto, futuro semplice, condizionale,
congiuntivo presente, and imperativo. Per-card SM-2 progress is tracked with
`easeFactor`, `interval`, `repetitions`, `nextReviewAt`, `lapses`, and
`lastResult`.

The seed corpus lives in `src/data/` (typed TS, no database). User progress and
customisations live in `localStorage`, behind a single storage module
(`src/lib/storage.ts`) so it can be swapped for a real backend later. Everything
read from `localStorage` is validated with Zod (`src/lib/schemas.ts`).

## Tech stack

- Next.js 15 (App Router) · TypeScript (strict, no `any`) · Tailwind CSS
- Zod for runtime validation · Vitest for unit tests
- No backend, no database — deploys to Vercel with zero config.

## Getting started

```bash
cd italian-vocab
npm install
npm run dev
```

Open <http://localhost:3000>. Seed data loads automatically on first run.

### Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the dev server                  |
| `npm run build`     | Production build                      |
| `npm start`         | Serve the production build            |
| `npm test`          | Run the Vitest unit tests             |
| `npm run typecheck` | Type-check with `tsc --noEmit`        |
| `npm run lint`      | Lint with `next lint`                 |

### Tests

The SM-2 scheduler in `src/lib/srs.ts` is written as pure functions and covered
by unit tests in `src/lib/srs.test.ts`:

```bash
npm test
```

## Deploying to Vercel

Import the repo in Vercel and deploy — no configuration or environment variables
are needed. (If this app is in a subdirectory, set the Vercel **Root Directory**
to `italian-vocab`.)

## Project layout

```
src/
  app/            # App Router pages: / (review), /typing, /verbs, /browse, /stats, /data
  components/     # Screen components + shared UI, SpeakerButton, Nav
  data/           # Seed vocabulary (verbs.ts + word batches, combined in seed.ts)
  lib/            # types, srs (+tests), storage, schemas, session, stats, entries, ...
```

## Accuracy

Genders, plurals, and conjugations were curated to be correct — no invented
words. If you spot a mistake, fix it in the relevant file under `src/data/` or
edit the entry in-app (your edit is stored as a local override).
