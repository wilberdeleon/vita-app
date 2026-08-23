# Peptides

**What is this?** Vita's optional peptide/medication tracking flow (canonical module name: `peptides`). Explicitly **optional** — most users will never open it, and that's by design.

**Why does it exist?** The Product Bible names GLP-1 users and peptide trackers among Vita's users. For them, dose tracking is a real, underserved need — and serving it well signals that Vita meets people where their health journey actually is, without cluttering everyone else's experience.

---

## Current state (verified in repo, Sprint 3 slice 3.5 — real setups)

**Peptides became a real feature on 2026-08-23.** The first two layers of the three-part model are built and persisted: **Peptide Definition** (what the compound is) and **User Peptide Setup** (how this user tracks it). A user can browse or search an **18-entry built-in catalog**, add a **Custom** entry, configure a setup, edit it, deactivate it, and reactivate it — all surviving a restart.

**Classification is conservative.** `approved-medication` is used only where the active ingredient has an FDA-approved product in the United States; everything else is `research-compound`. **Where US status could not be stated with confidence, the compound was omitted rather than guessed at** — Sermorelin, Bremelanotide/PT-141, and Thymosin Alpha-1 — each still addable through Custom, which carries no regulatory claim. Research is labelled factually, **not styled as a warning**, and the distinction is spelled out as a word rather than encoded in colour.

**Entries carry a name, a classification, and a broad compound-class label. Nothing else** — no effects, benefits, mechanisms, protocols, or dosing. **There is no "typical dose" field of any kind**, and schedule labels can never read "due".

**Not feature-complete.** Slice 3.6 (dose calculator), 3.7 (administration logging and history), 3.8 (injection sites), and 3.9 (UX polish, final safety copy, [[Fuel]] integration) all remain. Fuel's Peptides card still runs on a marked temporary shim until 3.9.

Engineering detail: repo `docs/09-Technical-Documentation.md` → "Peptides architecture", and `docs/06-Slice-Tracker.md` → slice 3.5.

## What it was before (Sprint 0 — mock data, superseded)

Built in Slice 0.7 under `src/app/(vita)/peptides/`:

- **Summary** (`index.tsx`) — log overview
- **Add** (`add.tsx`) — dose logging. *Nothing saved: the fields were unbound and the button called `router.back()`. All three screens and the fixture layer were replaced in slice 3.5.*
- **Examples** (`examples.tsx`) — reference examples
- Feature module `src/features/peptides/` (types, mock, api boundary)
- Domain color: **purple `#7C3AED`** — shared with Atlas per the approved UI reference
- Stack screens above the tabs; not in the dock

## Target state

**Sprint 3 — Water + Peptides** ([[Roadmap]]) — **the next sprint after Fuel.** *Moved forward by the founder roadmap reorder of 2026-08-21 (it was Sprint 5, behind both Journey sprints); the 2026-08-17 restructure had already given Peptides its first sprint anywhere, closing [[Open Questions]] #11.* Scope is unchanged by the move — only its position, which means the catalog sourcing and medical-content questions below are now due sooner.

Sprint 2 preserves the existing Peptide log but **deliberately does not extend it**; the real work is Sprint 3. The compact Peptides module on the redesigned [[Fuel]] screen becomes a real entry point and summary backed by that work — Sprint 3 does **not** redesign Fuel.

### Founder direction, 2026-08-18

Peptides should become a **major, genuinely interactive VITA feature** rather than a basic logging form — while staying **informational and tracking-oriented**. Recorded as **planned direction, not finalized specification**: details will change after technical investigation, medical-content review, and legal/compliance review.

The tracker's job is to help users organize: what peptide/product they are tracking · vial amount · reconstitution volume · dose · syringe units · injection site · date/time · history · site rotation.

**Catalog + Custom.** A searchable/selectable peptide catalog with a **Custom** option for anything not listed. The catalog may include both approved peptide medications and research peptides / commonly discussed compounds. **Data sourcing and product/legal boundaries must be defined before implementation** — this is not a detail to settle mid-build.

**Educational information.** Selecting a peptide can show a short description: name, category/class, general mechanism, target/receptor context, high-level purpose or research context (the register the founders have in mind: GLP-1 / GIP / glucagon receptor activity, mitochondrial-related research, growth-hormone-related pathways). **No medical claims are authored in advance.** This content must come from reliable sources and be written carefully at implementation time.

### ⚠️ Safety and medical boundary — non-negotiable

- The feature must clearly distinguish **FDA-approved medications** from **investigational / research compounds** from **general informational content**.
- The app must **never present research compounds as approved treatments.**
- An appropriate disclaimer: informational purposes · not medical advice · consult an appropriate healthcare professional · research compounds may not be approved for human use.
- **Unobtrusive placement.** Do not make the app unusable with a giant disclaimer on every screen — responsible placement is decided during implementation, and the exact copy is reviewed then.
- Rotation guidance is **organizational**, not personalized medical advice. Any claim about injection technique or site selection must be sourced and reviewed.

This sits directly on [[Core Principles]] #5 (trust) — see [[Open Questions]] #17.

### Vial / reconstitution model and the dose calculator

The tracker should understand the relationship between vial amount, reconstitution volume, syringe units, and dose. Example setup: a **10 mg** vial reconstituted with **1 mL** bacteriostatic water.

**Bidirectional:** enter syringe units → see the calculated mg/mcg dose; enter a mg/mcg dose → see the equivalent syringe units. This exists specifically because **many users think in syringe units and do not intuitively do the conversion math.** It must be implemented carefully and transparently, with verified math, internally normalized units (mg · mcg · mL · syringe units — never free-form strings for dose math), and tests. Full proposal: [[Peptide Dose Calculator]].

### Regimen, logging, and history

- **Saved setup** — peptide, vial strength, reconstitution amount, start date, typical dose, schedule where appropriate — so the user never rebuilds the vial math per injection.
- **Fast flow:** Peptides → select active peptide → enter dose/units → select site → log.
- **Injection site** on every log — abdomen, left/right abdomen, thigh, left/right thigh, upper arm, other/custom (exact taxonomy researched at implementation). A **simple** tappable body/model graphic as a visual aid; not a complex 3D model unless later justified. **Site rotation:** remember recent sites, show last used, highlight recently used areas, suggest rotating elsewhere, keep site history. Full proposal: [[Injection Site Tracking]].
- **History** — date, peptide, dose, units, site, notes, with editing. Frequency, consistency, and site-rotation views are possible later; **complex health analytics are not added automatically.**

### Data architecture

Three separate concerns, never one record — mirroring the Food Definition ≠ Food Log Entry separation Sprint 2 established in [[Fuel]]:

| Concern | What it is |
|---|---|
| **Peptide Definition** | What the compound is — catalog entry or user-created Custom |
| **User Peptide Setup** | This user's configuration: vial strength, reconstitution volume, start date, typical dose, schedule |
| **Peptide Log Entry** | One recorded administration: dose, units, site, timestamp, notes |

Engineering detail in repo `docs/09-Technical-Documentation.md` → "Future architecture considerations".

## Future ideas

- Reminders tied to schedules
- Correlating doses with weight/journey trends — sensitive; needs a careful, trust-first design

## Dependencies / open questions

- **Placement:** same question as [[Water]] — core area in the Product Bible, absent from primary navigation ([[Open Questions]] #4).
- **Purple is shared with Atlas.** Fine while peptides is a quiet flow; **revisit before Sprint 3** — this direction makes Peptides substantially less quiet ([[Color System]]).
- **Health-data sensitivity:** medication data is among the most sensitive data Vita will hold. Storage, encryption, and disclosure posture must be decided before live data ships ([[Supabase & Database]]).
- **Catalog sourcing and legal boundary** — [[Open Questions]] #17, owner: founders, **before** Sprint 3 implementation — now the next sprint.

**Related:** [[Product Overview]] · [[Settings]] · [[Future Features]]
