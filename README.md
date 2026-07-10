# VITA

**Build a healthier life, one decision at a time.**

VITA is a personal health companion that measures transformation, not just numbers. It helps people become the healthiest version of themselves through small, consistent decisions — without guilt, clutter, or gimmicks.

## Status

Phase 1 — Foundation (Sprint 0). Repository scaffolded; application shell in progress.

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

- `main` is the shared branch for both code and Vita HQ documentation.
- Always `git pull` before starting work.
- Commit small, logical changes with descriptive messages; push frequently.
- Review Markdown/Obsidian conflicts manually — never blindly accept one side.
- Never force-push, and never overwrite another collaborator's work.
- Communicate before restructuring major documentation (roadmap, sprints, Design Bible) or app architecture.

## Founders

Wilber De Leon · Santiago Vazquez
