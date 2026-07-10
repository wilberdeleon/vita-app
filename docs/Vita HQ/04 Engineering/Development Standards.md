# Development Standards

**What is this?** The quality bar for all code entering Vita — the standards every slice is held to.

**Why does it exist?** "Quality is a feature" ([[Core Principles]] #11) only means something if it's checkable. This page is what reviews check against.

*Sources: repo CLAUDE.md, Build Handbook, and Technical Documentation (verified). Recommendations are labeled.*

---

## Hard rules (from the repo — violations block approval)

1. Follow the [[Architecture]] rules: feature isolation, logic-free primitives, thin routes, one home per concern.
2. Follow the Design System — currently: **no invented styling**; tokens and primitives only ([[Design Bible]]).
3. Canonical feature names everywhere.
4. Database changes are migrations; secrets never enter git ([[Supabase & Database]]).
5. **Never redesign the product without founder approval.**
6. One slice at a time; when uncertain, **ask before building** — assumptions are discouraged.
7. Update the right document with every change (see the documentation map in [[Claude Workflow]]).
8. Expo code is written against the **versioned SDK 54 docs**, never from memory ([[Tech Stack]]).

## Working standards

- **TypeScript strict mode** — no `any` escape hatches without a comment explaining why.
- Meaningful commit messages; each slice is a coherent commit (the git history reads as the slice history — verified pattern, 13 commits so far).
- Every screen respects `DOCK_CLEARANCE`, safe areas, and accessibility roles/labels ([[UX Principles]] #7).
- Mock data flows only through `api.ts` boundaries — screens never import `mock.ts` directly.

## Verification

- Sprint 0 practice: every screen verified in the iOS Simulator before review (Slice 0.10 was a dedicated verification pass).
- **Testing framework: deliberately not chosen yet.** Recommendation: introduce one at the first slice with real data logic (stage progression, nutrition math) — pure UI came first and tests would have churned.

## Review pipeline

Self-review → **Codex audit** ([[Codex Review Checklist]]) → founder review → approval. Definition of Done in [[Current Sprint]].

**Related:** [[Claude Workflow]] · [[Codex Review Checklist]] · [[Architecture]] · [[Tech Stack]]
