# Claude Workflow

**What is this?** How Claude — Vita's Primary Engineer — works: the team structure, the slice lifecycle, and the documentation duties that ride along with every change.

**Why does it exist?** The workflow *is* the quality system. Vita is built by a two-founder team with AI staff; discipline in the process substitutes for headcount.

*Source: verified from the repo Build Handbook (`docs/03-Build-Handbook.md`).*

---

## The team

| Who | Role | Owns |
|---|---|---|
| **Wilber De Leon** | Founder | Product vision, UX, feature/brand direction, final approval |
| **Santiago Vazquez** | Co-Founder | Product strategy & development, feature planning, reviews, final approval |
| **Claude** | Primary Software Engineer | Building slices, production code, approved refactors — and maintaining **Vita HQ** (this vault; founder decision 2026-07-06) |
| **ChatGPT** | Creative Director & Product Strategist | Planning, UX strategy, UI direction, copy, consistency |
| **Codex** | Code Auditor & Quality Engineer | Architecture reviews, implementation audits, bug hunting ([[Codex Review Checklist]]) |

Founders hold final approval on everything. Claude never redesigns the product without approval.

## The ten-step slice lifecycle

Every slice, no exceptions:

1. Define the objective
2. Define the scope
3. Build the slice
4. Self-review
5. Audit (Codex)
6. Fix issues
7. Founder review
8. Approval
9. Documentation updates
10. Merge and deploy

**One slice at a time.** Small completed features beat large unfinished systems. A slice is done only when: functionality works, UI matches the Design System, no known critical bugs, docs updated, audit complete, founders approve.

## The sprint session workflow (founders, 2026-07-06)

**Every session is one sprint** unless explicitly stated otherwise. (Roadmap Sprints in the [[Roadmap]] are milestones — one usually spans several session-sprints.)

1. **Start:** read the relevant Vita HQ pages, review the current implementation, confirm the sprint objective, break it into logical slices, and present the slice plan for approval. **No implementation until the first slice is approved.**
2. **During:** slices run sequentially — one clear objective each, reasonably sized, app always left in a working state, committed before the next slice when appropriate. Never multiple unrelated slices at once.
3. **End:** deliver a **Sprint Retrospective** (Completed · Decisions · Challenges · Improvements · Next Sprint), log it in [[Sprint Retrospectives]], then run the HQ checkpoint below. Documentation maintenance is part of finishing a sprint.

## Documentation duties (the "update the right document" map)

**In the repo** (`vita-app/docs/`): product change → Product Bible · workflow change → Build Handbook · design change → Design System · completed work → Changelog · progress → Slice Tracker · findings → Audit Log · ideas → Ideas Parking Lot. Never duplicate across documents.

**In Vita HQ** (documentation policy, founders 2026-07-06): every coding session ends with a silent checkpoint —

> **Did today's work change knowledge?**
> No → do not touch Vita HQ.
> Yes → update only the affected pages. Done.

The checkpoint is codified as non-negotiable rule 8 in the repo's `CLAUDE.md` and in the Build Handbook's Documentation Rules, so it runs every session. What counts as "knowledge":

- **Update HQ when work changes:** product functionality, UI/UX patterns, design system, architecture, database schema, API behavior, Atlas capabilities, roadmap, product decisions, business logic, development workflow, or sprint progress.
- **No update needed for:** small bug fixes, refactoring, styling/formatting/spacing tweaks, dependency updates, internal cleanup, temporary experiments.
- **How:** update only the affected pages — typically [[Project Status]], [[Current Sprint]], the relevant topic page, and [[Decision Log]] if direction changed. Keep updates concise; prefer editing existing notes over creating new pages (check whether the information belongs in an existing document first); never rewrite unrelated documentation. Add a [[Weekly Review]] entry weekly.

## Communication rules

Questions are encouraged; assumptions are discouraged. When uncertain, ask before building. Debate ideas, never people.

**Related:** [[Development Standards]] · [[Codex Review Checklist]] · [[Core Principles]] · [[Current Sprint]]
