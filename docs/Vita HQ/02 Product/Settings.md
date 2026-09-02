# Settings

**What is this?** Vita's profile and preferences area (canonical module name: `settings`). Part of the primary navigation per founder direction.

**Why does it exist?** Health is personal — Settings is where users control their experience and their data. Trust ([[Core Principles]] #5) is largely won or lost here.

---

## Current state (verified in repo, Sprint 4 slice 4.1 — real, awaiting founder device review)

`src/app/(vita)/settings/index.tsx`, opened from the header gear (not the dock). Built as a shell in Slice 0.9; made real in **Sprint 4 slice 4.1**.

**Every visible row now has real functionality behind it.** The screen shows Appearance (persisted), Units (a real destination), the existing Tools entry, and the app version. Four rows were **removed rather than filled in** — Profile, Notifications, Privacy & Data and Sign Out — because none had an implementation and each drew a navigation chevron that went nowhere. The founder ruling was explicit: a nonfunctional row is removed for now, and building a profile system, an auth session, or a notifications surface to justify a row would let a screen's layout drive the roadmap. Each returns when the feature behind it is real.

The Units row previously read `Imperial (lb, oz)` — a claim VITA has never been able to honour (there are no pounds or mass ounces anywhere in the app) and one that **contradicted the real volume preference** Water stores. It is now a screen that reads and writes `vita:v1:water:prefs` directly.

Appearance previously worked for a session and was discarded on every relaunch. It now persists under `vita:v1:settings:prefs`.

*`src/features/settings/` now exists and holds the route-level test suite. It has no components — Settings composes shared primitives only. (The earlier note that the directory existed but was empty was stale; it did not exist at all.)*

## Navigation placement (resolved, 2026-07-09)

Settings' placement is **permanently locked**: top-right corner icon, present on every screen, not a dock tab ([[Navigation & Floating Dock]], [[Decision Log]]). This was the last open piece of the 2026-07-06 five-item navigation decision — it's now fully settled.

## Target state

**Sprint 4 — Settings + Tools & Reference** ([[Roadmap]]) — **the current sprint**, opened 2026-09-01 immediately after [[Water]] + [[Peptides]]. *Moved forward by the founder roadmap reorder of 2026-09-01 (it was Sprint 7, behind both Journey sprints and [[Atlas]]); the 2026-08-17 restructure had already given Settings its first sprint anywhere, closing [[Open Questions]] #11.*

**The sprint is broader than "Settings".** The founder-approved identity is **Settings + Tools & Reference** — not "Settings & Miscellaneous", "Utilities", or "the Tools sprint". Settings is one of three things it owns.

**Why it moved.** Journey / Weight is expected to be one of VITA's more complex feature areas. Organising the utility/settings architecture first, building out the Tools that already exist, and establishing the reference/navigation structure means Journey is approached with cleaner app architecture and a more focused scope. **Journey is deferred to Sprint 5, not cancelled.**

**Sprint 4 is open.** Its planning and architecture audit was founder-reviewed and approved on 2026-09-01 and an eight-slice sequence authorized; **slice 4.1 — Settings Foundation is implemented and awaiting founder device review.** Two scope rulings bind the rest of this page: the [[Food & Product Scanner]]'s **scoring is not authorized** (no VITA Score without an approved methodology), and the [[Research Library]] ships as **architecture without content** while [[Open Questions]] #17 stays open. Slice detail lives in the repo's `docs/06-Slice-Tracker.md` → Sprint 4.

### 1 — Settings

**Delivered.** Slice 4.1 built the foundation (see Current state above) and slice 4.2 added the **Tools & Reference** entry row. Settings is now feature-complete for this sprint unless a later slice adds a preference; what remains under the Sprint 4 umbrella is Tools, Reference and BMI, none of which live *in* Settings.

Core Settings screen structure · preferences and settings organisation (profile, notifications, preferences, units, appearance, privacy) · clean navigation · visual consistency with the established design system · completion of the existing Settings placeholders. Placement is unchanged and still locked: top-right corner icon, never the dock.

**[[Water]]'s preferences live here without moving — done in slice 4.1.** Water owns its goal and unit preference under `vita:v1:water:prefs`; Settings → Units reads and writes that same source, through the same `useWater().setUnit` call the Water goal screen makes, rather than creating a second one that can disagree with it ([[Open Questions]] #16, closed 2026-08-21). **No Water storage was migrated.**

### 2 — Tools

**Tools left Settings' route tree in slice 4.2.** They now live at a top-level `/tools`, with the hub titled **Tools & Reference**; Settings keeps the entry row and remains the discovery path, but no longer owns the tools' identity. The founders' model, made literal in the routes: Settings owns preferences, Tools owns utilities, Reference owns reading material.

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

**Settings → Tools & Reference** as the primary path — **implemented in slice 4.2**, at `/tools`. A future [[Dashboard]]/Home shortcut into Tools is a **saved product idea only, if product design supports it** — exact placement is deliberately undecided, **no Dashboard card is authorised**, and the founders deferred it again at Sprint 4 authorization.

## Future ideas

- ~~Appearance controls for the Light/Dark theme system~~ — shipped, and **persistent** as of slice 4.1
- Data export and deletion — trust features worth shipping before anyone asks
- Apple Health permissions once integration lands ([[Future Features]])
- **Reminder delivery.** Sprint 3 persists reminder preferences and a reminder time on a peptide routine, but **OS notification delivery is not implemented** — a test asserts no notification dependency exists. Future work: scheduled routine notifications, Taken / Skipped actions from a notification, and delivery on the configured schedule days. Unscheduled; not automatically Sprint 4 scope. See [[Peptides]].

## Dependencies

- Real [[Authentication]] — **the Profile and Sign Out rows were removed in slice 4.1** rather than kept as mock surfaces; they return when auth is real
- ~~A theme toggle control depends on the semantic token / Design System work landing first~~ — both landed; the control shipped in Sprint 1 and persists as of slice 4.1

## Open questions

- What units/preferences matter for V1? (Weight units at minimum — journey charts depend on it.)

**Related:** [[Product Overview]] · [[Authentication]] · [[Navigation & Floating Dock]]
