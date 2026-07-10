# Codex Review Checklist

**What is this?** The audit checklist for Codex — Vita's Code Auditor & Quality Engineer — used at step 5 of every slice ([[Claude Workflow]]).

**Why does it exist?** The Build Handbook mandates audits before major approvals but doesn't enumerate what to check. This checklist makes audits consistent and complete. Findings go to the repo **Audit Log** (`docs/07-Audit-Log.md`) as: Issue · Reason · Recommendation · Decision · Status.

*Audits improve the product — they never criticize the builder.*

---

## 1 — Architecture compliance ([[Architecture]])

- [ ] No feature imports another feature; shared code promoted correctly
- [ ] `src/components/ui/` free of business logic
- [ ] Routes thin — logic lives in `src/features/`
- [ ] One home per concern (Supabase client, tokens, migrations)
- [ ] Canonical feature names used throughout

## 2 — Product compliance ([[Product Philosophy]])

- [ ] Passes the five VITA Promise questions
- [ ] No guilt mechanics anywhere
- [ ] Matches the slice's approved objective and scope — nothing snuck in

## 3 — Design compliance ([[Design Bible]])

- [ ] Tokens and primitives only; no invented styling
- [ ] Domain colors used per the [[Color System]] hierarchy; structural components neutral
- [ ] Typography/spacing from the scales; `DOCK_CLEARANCE` respected
- [ ] Motion within the current baseline (nothing advanced before that sprint's own Polish slice — see [[Motion & Animation]])

## 4 — Code quality ([[Development Standards]])

- [ ] TypeScript strict; no unexplained `any`
- [ ] Mock data only via `api.ts` boundaries
- [ ] No secrets in git; env handling correct
- [ ] Expo APIs match SDK 54 (check versioned docs, not memory)
- [ ] Accessibility roles/labels on interactive elements

## 5 — Verification

- [ ] Runs in the iOS Simulator / Expo Go without errors or warnings
- [ ] Every new/changed screen actually visited
- [ ] Documentation updated (repo docs + affected HQ pages)

## Current state

The repo Audit Log has **no recorded audits yet** (verified 2026-07-06) — Sprint 0 slices went to founder review without formal Codex entries. Recommendation: begin logging audits with the next slice.

**Related:** [[Claude Workflow]] · [[Development Standards]] · [[Current Sprint]]
