# Settings

**What is this?** Vita's profile and preferences area (canonical module name: `settings`). Part of the primary navigation per founder direction.

**Why does it exist?** Health is personal — Settings is where users control their experience and their data. Trust ([[Core Principles]] #5) is largely won or lost here.

---

## Current state (verified in repo, Sprint 0 — shell only)

Built in Slice 0.9 as a **settings shell**: `src/app/(vita)/settings/index.tsx`, opened from the header gear (not the dock). `src/features/settings/` exists but is empty — no real preference logic yet.

## Navigation placement (resolved, 2026-07-09)

Settings' placement is **permanently locked**: top-right corner icon, present on every screen, not a dock tab ([[Navigation & Floating Dock]], [[Decision Log]]). This was the last open piece of the 2026-07-06 five-item navigation decision — it's now fully settled.

## Target state

**Sprint 4 — Settings + Tools & Reference** ([[Roadmap]]) — **the next sprint after [[Water]] + [[Peptides]].** *Moved forward by the founder roadmap reorder of 2026-09-01 (it was Sprint 7, behind both Journey sprints and [[Atlas]]); the 2026-08-17 restructure had already given Settings its first sprint anywhere, closing [[Open Questions]] #11.*

**The sprint is broader than "Settings".** The founder-approved identity is **Settings + Tools & Reference** — not "Settings & Miscellaneous", "Utilities", or "the Tools sprint". Settings is one of three things it owns.

**Why it moved.** Journey / Weight is expected to be one of VITA's more complex feature areas. Organising the utility/settings architecture first, building out the Tools that already exist, and establishing the reference/navigation structure means Journey is approached with cleaner app architecture and a more focused scope. **Journey is deferred to Sprint 5, not cancelled.**

**Sprint 4 is documented at planning level only. No slices are defined or approved, and no implementation has started.**

### 1 — Settings

Core Settings screen structure · preferences and settings organisation (profile, notifications, preferences, units, appearance, privacy) · clean navigation · visual consistency with the established design system · completion of the existing Settings placeholders. Placement is unchanged and still locked: top-right corner icon, never the dock.

**[[Water]]'s preferences live here without moving.** Water owns its goal and unit preference under `vita:v1:water:prefs`; Settings reads and writes that same source rather than creating a second one that can disagree with it ([[Open Questions]] #16, closed 2026-08-21).

### 2 — Tools

**Already built in Sprint 3 — Sprint 4 organises and expands them, it does not build them from zero:**

- **Peptide Calculator** — bidirectional vial/reconstitution ⇄ syringe-units conversion (slice 3.6), surfaced inline and standalone. [[Peptide Dose Calculator]].
- **Injection Sites and the interactive Body Model** — site taxonomy, tappable body map, accessible list fallback (slices 3.8–3.8C). [[Injection Site Tracking]].

**Planned:**

- **[[BMI Calculator]]** — height input, weight input, calculated BMI, category/range, and a polished visual representation of the scale. *Future opportunity, explicitly not now:* once Journey / Weight exists (Sprint 5), BMI could read the user's stored height and latest weight instead of requiring duplicate entry.
- **[[Food & Product Scanner]] (Food Score)** — a Yuka-style scan-a-product evaluation. A **Sprint 4 candidate, not a guaranteed or trivial feature**, and likely the largest single Tools item; it may need its own slice or planning pass.

### 3 — Reference

A future **[[Research Library]] / Reference** layer, at concept level only: research library structure · peptide and compound reference material · storage and handling · reconstitution basics · stability and general reference · research/development/approval-status reference.

**⚠️ Product boundary — binding.** VITA does **not** casually provide "recommended dosage" or prescriptive protocols for unapproved or research compounds. Dose-range or treatment-style content requires explicit founder authorisation plus appropriate medical, legal and content review. The standing boundary: **VITA helps users understand, calculate, organise and track information they enter; it does not silently become a treatment recommendation engine.** This extends the Sprint 3 safety rules rather than relaxing them — [[Peptides]], [[Open Questions]] #17, and the Sprint 3 release gate on peptide reference content.

### Discoverability

**Settings → Tools & Reference** as the primary path. A future [[Dashboard]]/Home shortcut into Tools is a **saved product idea only, if product design supports it** — exact placement is deliberately undecided and **no Dashboard card is authorised**.

## Future ideas

- Appearance controls for the Light/Dark theme system (now decided — see [[Design Bible]])
- Data export and deletion — trust features worth shipping before anyone asks
- Apple Health permissions once integration lands ([[Future Features]])
- **Reminder delivery.** Sprint 3 persists reminder preferences and a reminder time on a peptide routine, but **OS notification delivery is not implemented** — a test asserts no notification dependency exists. Future work: scheduled routine notifications, Taken / Skipped actions from a notification, and delivery on the configured schedule days. Unscheduled; not automatically Sprint 4 scope. See [[Peptides]].

## Dependencies

- Real [[Authentication]] (profile is mock until then)
- A theme toggle control depends on the semantic token / Design System work landing first

## Open questions

- What units/preferences matter for V1? (Weight units at minimum — journey charts depend on it.)

**Related:** [[Product Overview]] · [[Authentication]] · [[Navigation & Floating Dock]]
