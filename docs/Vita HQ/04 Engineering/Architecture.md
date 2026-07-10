# Architecture

**What is this?** How the Vita codebase is structured and the rules that keep it that way.

**Why does it exist?** The architecture was founder-approved at scaffolding time (Slice 0.1) and is enforced on every slice. Violating it is a review-blocking issue.

*Source of truth: repo `docs/09-Technical-Documentation.md` + direct code inspection (verified 2026-07-06). This page summarizes; the repo doc governs.*

---

## Repository layout

```
vita-app/
├── docs/                  governing documents (00–10)
├── src/
│   ├── app/               Expo Router routes ONLY — thin screens
│   ├── features/<name>/   one module per canonical area
│   │                      (dashboard, fuel, journey, water,
│   │                       peptides, atlas, settings + auth)
│   ├── components/ui/     Design System primitives — zero business logic
│   ├── components/shell/  floating dock, VITA mark, app frame
│   ├── theme/             design tokens + ThemeProvider
│   └── lib/               cross-cutting infra (supabase client, utils)
├── supabase/              migrations + edge functions (empty today)
├── assets/                icon, splash, images (generated)
└── scripts/               brand asset generation
```

## The four architecture rules (non-negotiable)

1. **Features never import from each other.** Shared code is promoted to `src/lib/`, `src/theme/`, or `src/components/`.
2. **`src/components/ui/` contains zero business logic.** Primitives know nothing about features.
3. **Routes stay thin.** Logic lives in `src/features/`; `src/app/` screens compose feature modules.
4. **One home per concern.** Supabase client only in `src/lib/supabase/`; tokens only in `src/theme/`; every schema change is a migration file.

## The feature module pattern

Each feature exposes the same shape:

- `types.ts` — domain types
- `mock.ts` — realistic fixtures
- `api.ts` — **the data boundary**: today it serves fixtures; later sprints swap fixture bodies for Supabase queries *without touching screens*
- `components/` — feature-specific UI

This mock-first boundary is the load-bearing idea of Sprint 0: the whole app works end-to-end visually while the backend arrives later. `isSupabaseConfigured()` ([[Supabase & Database]]) is the designed switch point.

## Canonical names

`dashboard` · `fuel` · `journey` · `water` · `peptides` · `atlas` · `settings` — everywhere in code and docs. UI labels may differ (dashboard shows "Home").

## Target state

The architecture is designed to hold through V1 unchanged: sprints fill in `api.ts` bodies, migrations, and edge functions rather than restructuring. State management remains a deliberate per-slice decision — nothing global is pre-committed.

**Related:** [[Tech Stack]] · [[Supabase & Database]] · [[Development Standards]] · [[Component Library]]
