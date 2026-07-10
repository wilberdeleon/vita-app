# Open Questions

**What is this?** Unresolved decisions that block or shape upcoming work. Each question names an owner and what resolving it unlocks.

**Why does it exist?** The Build Handbook's rule is "Questions are encouraged. Assumptions are discouraged." This is where questions wait so they don't become assumptions.

---

## Product & design

1. ~~**Dark glass theme vs. current light theme.**~~ **✅ RESOLVED 2026-07-09.** VITA supports both Light Mode and Dark Mode, built on semantic design tokens rather than hardcoded colors. See [[Decision Log]] and [[Design Bible]]. (What remains open is implementation — authoring the actual token values — which is Design System / Sprint 1 work, not a further founder decision.)
2. ~~**Brand palette vs. screen accents.**~~ **Partially resolved 2026-07-09** — the theme model (light + dark, semantic tokens) is decided, which sets the frame for this reconciliation, but the specific mapping of brand palette (ink/sage/cream/paper/gold) and domain colors onto both themes is still a Design System authoring detail. See [[Color System]].
3. ~~**Settings in the dock?**~~ **✅ RESOLVED 2026-07-09.** Settings remains permanently in the top-right corner, not the dock. Dock stays a fixed 4 items. See [[Decision Log]] and [[Navigation & Floating Dock]]. (Settings still has no *sprint* scheduling its actual feature work — see #11, which remains open.)
4. **Where do Water and Peptides live?** The repo Product Bible lists them as core product areas with their own flows (built in Sprint 0), but they are not part of the primary navigation direction. Do they remain stack screens reached from Dashboard/quick actions, fold into Fuel, or something else? *Owner: founders.* **Sharper as of 2026-07-09:** neither has a sprint anywhere in the new [[Roadmap]] either — see #11.
5. **Journey Stages evolution.** The Product Bible says current stages "will be maintained in a separate document as they evolve." The canonical 8 stages live in code ([[Journey Stages]]). Are these final for V1? *Owner: founders.*

## Process & documentation

6. ~~**Slice Tracker inconsistency.**~~ **✅ RESOLVED 2026-07-09.** Repo `docs/06-Slice-Tracker.md` corrected — all Sprint 0 slices (0.1–0.12) now consistently marked ✅ Approved. See [[Decision Log]].
7. **"My Journey → Vita" rename evidence.** The rename is founder-stated; the vita-app repo begins life already named VITA, and the older My Journey repo exists separately. Should HQ archive a short history note for posterity? *Owner: founders (low priority).*
8. **Space theme removal.** Founder-stated as a past decision. No space aesthetic exists in the current repo (only the Atlas dock icon is `planet`). Nothing to remove — recorded in the [[Decision Log]] as historical context. *Consider closed unless founders want the planet icon revisited.*

## Roadmap (new — 2026-07-09)

11. **[[Water]], [[Peptides]], and [[Settings]] have no sprint in the new official roadmap.** All three are existing, already-built (or shell-built) product areas — this isn't a "where do they live" question anymore for Settings (resolved by #3 above), it's "do they have any scheduled path to completion at all." Settings is still the most urgent — its navigation placement is locked, but its actual feature work (profile, notifications, preferences, privacy) has no sprint. *Owner: founders. Unlocks: closing the gap flagged on [[Roadmap]].*
12. **Several new roadmap slices have no backing Innovation Lab idea note:** Restaurant Support (Sprint 3), Oura Integration and WHOOP Integration (Sprint 5), Smart Notifications, Themes & Personalization, and Subscription Experience (Sprint 6). Should these be backfilled as full Lab notes for consistency, or is direct roadmap-only entry acceptable for some categories of work? *Owner: founders/Claude, low urgency.*
13. **Streak System (Sprint 2) vs. the Journey Stages system.** [[Journey Stages]] was explicitly built as "Vita's answer to streaks and guilt mechanics" — the new roadmap's Streak System slice needs a design resolution before Sprint 2 starts: one signal or two, and specifically how it avoids reintroducing the punishment mechanic Stages was designed to avoid. *Owner: founders, before Sprint 2.*

## Engineering (not blocking today)

9. **Supabase project provisioning.** Architecture is in place but no Supabase project is connected (no migrations exist). When a data slice begins: who owns the Supabase org, and which regions/tiers? *Owner: founders + Claude, at first data slice.*
10. **Deferred stack choices.** State management, component library, and testing framework are deliberately per-slice decisions. First likely to surface: testing, once real data logic lands. *Owner: Claude proposes at the relevant slice.*

---

**Resolved questions** move to the [[Decision Log]] with their answer. Don't delete them from history — the log is the record.

**Related:** [[Decision Log]] · [[Project Status]] · [[Innovation Lab]]
