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

11. ~~**[[Water]], [[Peptides]], and [[Settings]] have no sprint in the new official roadmap.**~~ **✅ RESOLVED 2026-08-17** by the roadmap restructure: Water and Peptides got a sprint of their own (numbered 5 at the time, **moved to Sprint 3 by the 2026-08-21 founder reorder**, and built there), Settings gets **Sprint 4 — Settings + Tools & Reference** (numbered 7 at the time; moved forward and broadened by the 2026-09-01 founder reorder). See [[Decision Log]] and [[Roadmap]].
12. **Several new roadmap slices have no backing Innovation Lab idea note:** Restaurant Support (now inside Sprint 2 — Fuel), Oura Integration and WHOOP Integration (Health — unscheduled), Smart Notifications, Themes & Personalization, and Subscription Experience (Premium — unscheduled). *Sprint numbers originally cited here were the 2026-07-09 numbering.* Should these be backfilled as full Lab notes for consistency, or is direct roadmap-only entry acceptable for some categories of work? *Owner: founders/Claude, low urgency.*
13. **Streak System (now Sprint 5 — Journey / Weight, per the 2026-09-01 reorder) vs. the Journey Stages system.** [[Journey Stages]] was explicitly built as "Vita's answer to streaks and guilt mechanics" — the Streak System slice needs a design resolution before that slice starts: one signal or two, and specifically how it avoids reintroducing the punishment mechanic Stages was designed to avoid. *Owner: founders, before the Journey / Weight sprint opens.*

## Roadmap (new — 2026-08-17)

14. **⚠️ Health and Premium are no longer scheduled, orphaning five promoted Innovation Lab ideas.** The 2026-08-17 restructure drops both sprints. [[Health Age]], [[Biomarker Age]], [[Apple Health Integration]], [[Apple Home Screen Widgets]], and [[Voice Atlas]] were promoted to 📋 Planned *because* the 2026-07-09 roadmap named them directly; none has a scheduled sprint now. [[Mobile Order Screenshot Import]] is in the same position after being deferred out of Sprint 2's approved scope. Their Lab status has deliberately **not** been reverted — per the Lab's standing rule ideas change status but are never deleted, and reverting them unasked would be inventing a founder decision. Do these get a future sprint, return to 📝 Defined, or stay 📋 Planned pending a post-V1 roadmap? *Owner: founders. See [[Roadmap]] "What changed in the 2026-08-17 restructure."*
15. **Beta-sprint work has no home.** The old Sprint 7 — Beta included Analytics, Crash Reporting, App Store Preparation, and a Final QA & Launch Checklist. Sprint 8 — Final Polish & Animations is narrower and doesn't obviously cover them. Where does release-readiness work land? *Owner: founders, before Sprint 8.*

## Product & design (new — 2026-08-18)

*Sprint numbers in this section updated 2026-08-21 for the roadmap reorder — Water + Peptides is now Sprint 3.*

16. ~~**Who owns the hydration goal — [[Water]] or [[Settings]]?**~~ **✅ RESOLVED 2026-08-21 (founders), shipped 2026-08-23 in Sprint 3 slice 3.3.** Water owns its own goal and unit preference under `vita:v1:water:prefs`; [[Settings]] — now **Sprint 4**, the very next sprint — will read and write that same source rather than creating a second one that can disagree with it. Original question below for the record. — The founder direction for Water requires a **user-defined** daily goal with a unit (cups/oz/mL/L) that persists until changed. Settings is the natural long-term home for that preference, but Settings was **Sprint 7 — after** Water + Peptides, which the 2026-08-21 reorder moved forward to **Sprint 3**. *(The 2026-09-01 reorder has since moved Settings to Sprint 4, immediately after.)* That makes this question live sooner, not later. Does Water own the goal initially and Settings absorb it later, or does Sprint 3 build a minimal preference surface that Sprint 7 then adopts? *Owner: founders/Claude, at Sprint 3 planning.*

17. **⚠️ Peptide catalog: data sourcing, medical content, and legal boundary.** **Partially addressed 2026-08-23 in slice 3.5 — still open for the founders.** Engineering shipped the container and a conservative rule rather than waiting: classification is a typed field asserted only by the compiled catalog, `approved-medication` means an FDA-approved US product exists, and compounds whose US status could not be stated with confidence were **omitted rather than guessed** (Sermorelin, Bremelanotide/PT-141, Thymosin Alpha-1). No educational prose ships; the model has a place for it and it is deliberately empty. **Updated 2026-08-23 by slice 3.5A.** (a) is superseded: the founders directed a substantially larger library, and the catalog is now **71 entries** with human-readable biological categories. (b) is now live rather than deferred — **research summaries ship in the app** as of 3.5A, and all of them are **engineering-authored with no medical or legal review**. **What the founders still owe:** approval of the 71-entry catalog and its research content, who reviews that content, and (c) the exact disclaimer copy and placement, which slice 3.9 needs. Original question below. — The direction calls for a searchable catalog that may include both approved peptide medications and research compounds, each with a short educational description (mechanism, target/receptor, research context). Three things must be answered **before** implementation, not during: (a) where the catalog data and educational content come from, and who reviews them; (b) how approved-vs-investigational status is represented and displayed so research compounds are never presented as approved treatments; (c) the disclaimer's exact copy and placement — unobtrusive, since a giant disclaimer on every screen makes the feature unusable. This sits directly on [[Core Principles]] #5 (trust) and plausibly on regulation. *Owner: founders. **Sprint 3 is now in closeout with this still unresolved**, and the closeout audit recorded it as a release gate: the 96 catalog entries and their research content have never had expert medical or legal review. It also binds any [[Research Library]] work in **Sprint 4 — Settings + Tools & Reference**. No medical claims are authored until this resolves.* See [[Peptides]].

18. **Food illustration asset strategy.** [[Contextual Food Visuals]] needs a decision on where the artwork comes from — a curated icon/illustration library, commissioned lightweight vector assets, small animated illustrations, or provider product images with category fallback — and on the size and maintenance cost of a `Food → Category → illustration` mapping. Unscheduled; no sprint. *Owner: founders, whenever the idea is scoped.*

## Engineering (not blocking today)

9. **Supabase project provisioning.** Architecture is in place but no Supabase project is connected (no migrations exist). When a data slice begins: who owns the Supabase org, and which regions/tiers? *Owner: founders + Claude, at first data slice.*
10. **Deferred stack choices.** State management and component library remain deliberately per-slice decisions. **Testing ✅ RESOLVED 2026-08-22** (Sprint 3, slice 3.1): `jest` + `jest-expo`, dev-only, pinned to SDK 54 — see [[Tech Stack]] and [[Decision Log]]. It surfaced exactly where predicted, once real data logic landed and Sprint 3's dose arithmetic made ad-hoc verification untenable. *Owner: Claude proposes at the relevant slice.*

---

**Resolved questions** move to the [[Decision Log]] with their answer. Don't delete them from history — the log is the record.

**Related:** [[Decision Log]] · [[Project Status]] · [[Innovation Lab]]
