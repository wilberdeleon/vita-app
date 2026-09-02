# VITA

**Build a healthier life, one decision at a time.**

VITA is a personal health companion that measures transformation, not just numbers. It helps people become the healthiest version of themselves through small, consistent decisions — without guilt, clutter, or gimmicks.

## Status

Sprint 0 — Visual Foundation: Complete. Sprint 0.1 — Polish: Complete. Sprint 1 — Dashboard/Home: Complete. App-Wide Visual Consistency Pass: Complete. Sprint 2 — Fuel: Complete (merged to `main` 2026-08-21). **Sprint 3 — Water + Peptides: current — feature-complete, final audit/closeout underway (not merged, not closed).**

Remaining roadmap: Sprint 3 — Water + Peptides · **Sprint 4 — Settings + Tools & Reference** · Sprint 5 — Journey / Weight · Sprint 6 — Journey / Photos · Sprint 7 — Atlas · Sprint 8 — Final Polish & Animations.

*Reordered 2026-09-01 by founder decision — Settings + Tools & Reference moves ahead of Journey, because Journey / Weight is expected to be one of VITA's more complex areas and benefits from the utility/settings architecture, the existing Tools, and the reference/navigation structure being organized first. Journey is deferred to Sprint 5, not reduced. Atlas moves to Sprint 7. The earlier 2026-08-21 reorder that put Water + Peptides ahead of Journey still stands. See the [Master Roadmap](docs/04-Master-Roadmap.md).*

**Theming is app-wide.** Light, Dark, and System are supported across every existing screen; System follows the device appearance live. Home/Dashboard is the visual source of truth every other screen follows. Before writing UI, read the [Design System](docs/05-Design-System.md) — in particular, resolve surface and text colors through `useTheme().surfaces`, never from `palette` directly.

## Stack

Expo (React Native) · TypeScript · Expo Router · Supabase · EAS builds

## Getting started

```bash
npm install
cp .env.example .env   # fill in values
npx expo start         # press i for iOS simulator, or scan the QR code with Expo Go
```

## Read the docs first

All product and engineering decisions are governed by the documents in [`docs/`](docs/), starting with the [Vision Lock](docs/01-Vision-Lock.md) and the [Product Bible](docs/02-Product-Bible.md). How we build is defined in the [Build Handbook](docs/03-Build-Handbook.md); implementation details live in the [Technical Documentation](docs/09-Technical-Documentation.md).

## Vita HQ (company knowledge base)

This repository contains both the VITA application source code and **Vita HQ**, the company's shared Obsidian knowledge base — vision, product, design, engineering notes, AI/Atlas strategy, business planning, and the Innovation Lab idea backlog. GitHub is the single source of truth for both.

The vault lives at:

```text
docs/Vita HQ
```

To work on Vita HQ:

1. Clone this repository (see below) and open it in VS Code.
2. Open Obsidian and choose **"Open folder as vault"**.
3. Select `docs/Vita HQ` inside your local clone.
4. Read, edit, or create notes as usual — commit and push through the same repo/VS Code workflow used for the app code.

There is only one Vita HQ vault; do not create a separate copy or a second repository for it.

## Getting started (full clone)

```bash
git clone git@github.com-leonovation:wilberdeleon/vita-app.git
cd vita-app
npm install
cp .env.example .env   # fill in values
npx expo start         # press i for iOS simulator, or scan the QR code with Expo Go
```

Then open the same `vita-app` folder in Obsidian at `docs/Vita HQ` as described above.

## Collaboration rules

- `main` is the integration branch. Normal sprint work happens on a dedicated sprint branch (see `docs/03-Build-Handbook.md` → Branch Policy) and is reviewed — via pull request or explicit founder review — before merging into `main`.
- Always `git pull` before starting work.
- Commit small, logical changes with descriptive messages; push frequently.
- Review Markdown/Obsidian conflicts manually — never blindly accept one side.
- Never force-push, and never overwrite another collaborator's work.
- Communicate before restructuring major documentation (roadmap, sprints, Design Bible) or app architecture.

## Founders

Wilber De Leon · Santiago Vazquez
