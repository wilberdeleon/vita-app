# Supabase & Database

**What is this?** Vita's backend layer — Supabase for auth, database, and storage — and the rules governing it.

**Why does it exist?** The backend is architecture-only today; this page records exactly what exists, what doesn't, and the standards that apply the moment real data arrives.

*Verified 2026-07-06 from `src/lib/supabase/client.ts`, `supabase/`, and `.env.example`.*

---

## Current state — architecture in place, nothing connected

- **Client:** lazy singleton in `src/lib/supabase/client.ts` (the only place a Supabase client may exist). Reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- **The switch:** `isSupabaseConfigured()` returns false while env vars are unset, so features serve mock fixtures through their `api.ts` boundaries ([[Architecture]]). Setting the env vars is the designed first step toward live data.
- **`supabase/migrations/`: empty.** No schema exists anywhere.
- **`supabase/functions/`: empty.** No edge functions.
- **No Supabase project has been provisioned** (or none is documented) — [[Open Questions]] #9.

## Rules (from repo CLAUDE.md / Technical Documentation — non-negotiable)

1. **Every schema change is a numbered migration** in `supabase/migrations/` — never undocumented dashboard edits.
2. **Secrets never enter git.** Only publishable keys use the `EXPO_PUBLIC_` prefix (they ship in the app bundle). Real secrets live server-side in Supabase edge functions.
3. `.env` is git-ignored; `.env.example` documents required variables.

## Target state

Sprint-by-sprint, `api.ts` fixture bodies become Supabase queries: dashboard summaries, food logs, weight entries, photos (storage), water, peptide doses. Auth becomes real ([[Authentication]]).

## Standards to adopt at first migration (recommendations, not yet decided)

- **Row Level Security on every table from day one** — health data demands it.
- Per-user data isolation as the default policy shape.
- Progress photos in Supabase Storage with private buckets + signed URLs.
- Sensitive categories (peptide/medication data) reviewed explicitly before shipping — [[Peptides]].

## Open questions

- Supabase org ownership, project region/tier ([[Open Questions]] #9)
- Data model design — starts with Sprint 1's dashboard needs; no schema draft exists yet
- Offline behavior (log a meal with no signal?) — undecided, affects api.ts design

**Related:** [[Architecture]] · [[Authentication]] · [[Tech Stack]] · [[Development Standards]]
