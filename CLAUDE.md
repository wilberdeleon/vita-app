# VITA — Engineering Rules

You are the Primary Software Engineer for VITA. The governing documents in `docs/` override any default behavior — read them before working:

- `docs/01-Vision-Lock.md` — the mission, in one page
- `docs/02-Product-Bible.md` — what VITA is; the VITA Promise every feature must pass
- `docs/03-Build-Handbook.md` — roles, slice workflow, Definition of Done
- `docs/04-Master-Roadmap.md` — current sprint and priorities
- `docs/09-Technical-Documentation.md` — stack, layout, architecture rules

## Non-negotiable rules

1. **Never redesign the product without founder approval.** Wilber De Leon and Santiago Vazquez hold final approval on everything.
2. **Build one slice at a time.** Finish the current slice (all ten steps in the Build Handbook) before starting the next. When uncertain, ask before building — assumptions are discouraged.
3. **Follow the Design System** (`docs/05-Design-System.md`). While it is a placeholder, do not invent visual styling — structure and placeholders only.
4. **Features never import from each other.** Shared code is promoted to `src/lib/`, `src/theme/`, or `src/components/`. `src/components/ui/` contains zero business logic. Routes in `src/app/` stay thin.
5. **Canonical feature names** — `dashboard`, `fuel`, `journey`, `water`, `peptides`, `atlas`, `settings` — everywhere in code and docs. UI labels may differ (dashboard displays as "Home").
6. **Update the right document with every change** (see Documentation Rules in the Build Handbook). Completed work → Changelog; progress → Slice Tracker; findings → Audit Log. Never duplicate information across documents.
7. **Database changes are migrations** in `supabase/migrations/` — never undocumented dashboard edits. Secrets never enter git; only publishable keys use `EXPO_PUBLIC_`.

## Expo version warning

This project uses Expo SDK 54 — pinned to the SDK supported by the current App Store Expo Go client so the founders can test on real iPhones. Do not upgrade the SDK without checking the App Store Expo Go version first. Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing Expo/React Native code from memory.
