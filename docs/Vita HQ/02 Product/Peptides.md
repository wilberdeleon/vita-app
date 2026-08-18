# Peptides

**What is this?** Vita's optional peptide/medication tracking flow (canonical module name: `peptides`). Explicitly **optional** — most users will never open it, and that's by design.

**Why does it exist?** The Product Bible names GLP-1 users and peptide trackers among Vita's users. For them, dose tracking is a real, underserved need — and serving it well signals that Vita meets people where their health journey actually is, without cluttering everyone else's experience.

---

## Current state (verified in repo, Sprint 0 — mock data)

Built in Slice 0.7 under `src/app/(vita)/peptides/`:

- **Summary** (`index.tsx`) — log overview
- **Add** (`add.tsx`) — dose logging
- **Examples** (`examples.tsx`) — reference examples
- Feature module `src/features/peptides/` (types, mock, api boundary)
- Domain color: **purple `#7C3AED`** — shared with Atlas per the approved UI reference
- Stack screens above the tabs; not in the dock

## Target state

**Sprint 5 — Water & Peptides** ([[Roadmap]]). *Corrects the earlier note here that Peptides had no sprint anywhere — true under the 2026-07-09 plan, resolved by the 2026-08-17 restructure ([[Open Questions]] #11, closed).*

Sprint 2 preserves the existing Peptide log but **deliberately does not extend it**; the real work is Sprint 5.

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
- **Purple is shared with Atlas.** Fine while peptides is a quiet flow; **revisit before Sprint 5** — this direction makes Peptides substantially less quiet ([[Color System]]).
- **Health-data sensitivity:** medication data is among the most sensitive data Vita will hold. Storage, encryption, and disclosure posture must be decided before live data ships ([[Supabase & Database]]).
- **Catalog sourcing and legal boundary** — [[Open Questions]] #17, owner: founders, **before** Sprint 5 implementation.

**Related:** [[Product Overview]] · [[Settings]] · [[Future Features]]
