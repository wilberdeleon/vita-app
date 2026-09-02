# VITA — Sprint 5 Identity Brief

# ⚠️ DRAFT / PENDING SPRINT 5 ARCHITECTURE APPROVAL

**Status: draft. No implementation has started and none is authorized by this document.**

This brief records the founder-approved *direction* for **Sprint 5 — VITA Identity & Interaction**, introduced by the roadmap-alignment session of 2026-09-01. It is the design counterpart to the sprint entry in `docs/04-Master-Roadmap.md`, which remains the authoritative roadmap. Nothing here defines an approved slice. Slices are defined, scoped and approved under the normal slice workflow (`docs/03-Build-Handbook.md`) after a **Sprint 5 architecture audit** and explicit founder authorization — the same gate every prior sprint passed.

---

# 1 — Problem statement

VITA has substantial working functionality. Fuel, Water and Peptides are real, persisted, tested features; Settings and Tools have a clean architecture behind them. **What has not kept pace is the presentation layer.**

Real-device review found that the app has become **visually generic**. Most screens reach for the same pattern:

> dark background → large rounded card → text → icon → another rounded card

The result is that features which *behave* nothing alike end up *looking* alike. Water, Peptides, Fuel and Tools are different kinds of thing doing different kinds of work, and a user moving between them sees variations of one template rather than distinct, recognizable places. Internally this is the "card soup" problem: containers used as the default answer to every piece of content, so nothing on a screen is allowed to be more important than anything else.

This is a presentation and interaction problem, not a functional one. Nothing below asks for a working feature to be rebuilt.

# 2 — Why now, and not after Journey

Journey is expected to be one of VITA's most important and most visually significant areas. Building it before the identity exists would mean:

- **building Journey in a visual language already targeted for replacement**,
- **redesigning a major new feature immediately after implementing it**,
- **accumulating presentation-layer debt** across the rest of the app in the meantime.

The same reasoning already closed Sprint 4 early and deliberately: BMI, the Research Library, the Food Scanner evolution and Dashboard Tools discoverability were deferred because building them before the language existed would mean designing them twice. Sprint 5 is that decision applied to the roadmap rather than to one sprint's tail.

**This is not a product restart.** It is the presentation layer catching up to functionality that is already real.

# 3 — Preserved architecture

Sprint 5 is **primarily presentation and interaction work.** The following are working, tested systems and are **not rebuilt from scratch**:

| Preserved | Notes |
|---|---|
| Settings architecture | Sprint 4, slice 4.1 |
| Appearance persistence | System / Light / Dark, surviving relaunch (`vita:v1:settings:prefs`) |
| Units architecture | The real Units destination, writing through Water's own `vita:v1:water:prefs` |
| `/tools` | Top-level route identity, Sprint 4 slice 4.2 |
| Tools & Reference hub | The destination and its list |
| Peptide Calculator | `/tools/peptide-calculator` — behavior not reopened |
| Injection Sites | `/tools/injection-sites` — behavior not reopened |
| Body Map / injection-site primitives | Slices 3.8–3.8C; **evolved, never duplicated** |
| Navigation foundations | Route architecture, dock, header placement |
| Domain logic | `src/lib/` — nutrition, water, peptides, daily, preferences |
| Utilities | Shared helpers and formatting |
| Persistence | Date-keyed daily storage, versioned keys, rollover |
| Repositories | The repository boundaries Supabase later arrives behind |

**Working domain logic is untouched unless a concrete issue requires the change.** Where a redesign appears to need a domain change, that is a finding to raise, not a licence to refactor.

# 4 — Design principles

## The identity to reach

premium · dark · modern · tactile · interactive · visually recognizable · simple to understand · restrained rather than flashy · mature · useful · personality without becoming childish · purposeful visual feedback · stronger hierarchy · progressive disclosure · feature-specific visual objects · fewer generic full-width cards.

**The core goal, in one line: make VITA feel unmistakably like VITA.**

## What stays

- The black / near-black premium foundation
- VITA branding and the VITA mark
- **Gold as the primary brand color**
- Premium typography
- Mature spacing
- Restrained feature colors
- The product's current maturity

## Feature colors become functional

| Color | Meaning |
|---|---|
| Gold | VITA / Journey / brand |
| Blue | Water |
| Purple / violet | Peptides |
| Orange | Fuel |
| Green | Movement / activity |

They should carry **indicators, interaction states, illustrations, visual objects, progress and motion** — rather than simply recoloring a whole button or a whole card. This refines the permanent domain color hierarchy in `docs/05-Design-System.md`; it does not replace it, and it does not recolor a feature into a different hue.

## The card question

The central craft problem of slice 5.1. The design language must answer:

- **When does content deserve a card?**
- **When does content sit directly on the page?**
- **When does a visual object replace a summary card?**
- **When is information progressively disclosed?**
- How do mixed module sizes work together?
- How are actions surfaced?
- How is completion represented?
- How is secondary information de-emphasized?

Two findings already recorded in `docs/05-Design-System.md` are the starting point, generalized from Fuel to the whole product: **rows in a panel, not a grid of cards**, and **size communicates importance, not availability.**

# 5 — Screen directions

*Founder-approved direction. **Not implementation authorization** — each becomes real only through an approved slice.*

## Dashboard

**Keep:** the time-aware greeting — *Good morning, Wilber* · *Good afternoon, Wilber* · *Good evening, Wilber* · *Good night, Wilber*.

**Remove future reliance on:** *"Build with intention."* and *"Your day, your direction."* Both are generic wellness-marketing filler. **Do not automatically replace them with another slogan.** Prefer useful contextual information: the date · doses due · hydration state · goals remaining · meaningful current-day state.

Dashboard should become **more action-oriented and less analytics-report-like**; visually recognizable; modular without collapsing into a generic symmetrical grid.

- Potential primary modules: Fuel · Water · Peptides · Journey · Tools
- Potential smaller utility modules: Peptide Calculator · Injection Sites · Food Scanner · Reference

**Historical design note.** The founder's older Dashboard concept is **not** the visual target. It did succeed at one thing worth recovering: different destinations were **immediately recognizable**. Sprint 5 should recover that recognizability while keeping VITA's current sophistication. This is explicitly not an instruction to recreate the old grid.

## Water

The existing Water summary and Add Water flow are **functionally correct** but visually form-like and space-heavy.

A premium stylized **VITA hydration vessel** — bottle, cup, or another vessel — may become the hero interaction object:

- a visible fill level mapped to hydration progress
- logging water visibly raises the liquid level
- subtle ripple / splash feedback
- an appropriate haptic
- progress updating with animation
- a non-cartoon visual treatment

Potential logging flow: **tap Add Water → compact bottom sheet or overlay → quick amounts → custom amount → log → the vessel responds → the sheet closes.**

**Preserve Water's correctness exactly as built:** canonical storage · units · goal · entries · persistence · rollover · history.

*Standing caution, carried from the Sprint 3 direction and not overruled: do not assume a literal animated water bottle is automatically right. The vessel is a strong candidate to be designed inside VITA's premium system, not a foregone conclusion.*

**Water history.** The 7-day history remains valuable and may be presented more elegantly — individual daily entries can become compact, secondary, or progressively disclosed rather than permanent large cards. **No data loss, and no history simplification for visual reasons.**

## Peptides home

Peptide tracking works; the presentation currently feels administrative and information-heavy. The redesigned hierarchy should prioritise immediate comprehension of one question:

> **What do I need to do today?**

Peptides Home should more clearly distinguish **due · completed · upcoming · routine management** rather than giving everything equal visual priority. **No business-logic rewrite is implied.**

## Routine

The principle is **immediate action first, administrative detail second.**

A possible top state — *not yet a required literal layout*:

- Peptide name
- Routine amount · Today
- Primary: **Mark as Taken**
- Secondary: **Skip**
- Then progressive disclosure: Routine Details · History · Preparation · Edit Routine

## Injection site logging

When a user marks a peptide as Taken, VITA should explore **optional** injection-site logging:

> Mark as Taken → optional site selection → body map / quick site interaction → confirm

The log can retain date · time · dose · units · injection site. **The existing logging and history architecture is reused, not replaced.**

## Injection rotation visualization

Explore a body visualization showing injection locations over a selected week. For example:

- Monday — right abdomen
- Tuesday — left thigh
- Wednesday — right thigh
- Friday — left abdomen

Markers could live on the body representation, and tapping a marker could open the corresponding log or day detail.

Planning questions, all open: front / back · multiple injections at the same site · multiple peptides · week filtering · historical filtering · marker overlap · accessibility · and where it lives (Routine, History, or Tools).

**An exploration target, not guaranteed final UX.**

## Shared body map

Peptide logging and the standalone Injection Sites tool should share the **same** body-map / injection-site primitive. **Do not create an unrelated duplicate implementation** — the existing `BodyMap` work is inspected and evolved.

## Tools

Tools remain part of VITA. The Sprint 4 foundation — the hub, the Peptide Calculator, Injection Sites — is integrated into the new identity rather than rebuilt. Future candidates: **BMI Calculator** · Food / Product Scanner evolution · Reference.

Tools should eventually be discoverable from Dashboard/Home, not only from Settings. **No Dashboard affordance is authorized here** — the standing rule that Home is not a launcher still applies.

## BMI Calculator

**Still planned. Not cancelled. The founder wants it.** It is deliberately deferred until the Sprint 5 language exists so it is designed in the new VITA system from the beginning.

Direction, unchanged: height · weight · BMI result · category/range · a premium visual representation · **no BMI history that shadows Journey** · future Journey integration where appropriate once Journey / Weight (Sprint 6) owns stored height and latest weight.

## Food Scanner

The existing Fuel scanner and its architecture are **preserved and untouched.** Richer Product Scanner work remains possible. **Sprint 5 is not committed to inventing a VITA Score** — scoring methodology remains a separate founder/product decision. Sprint 5 may redesign how the scanner fits visually into VITA if and when that is authorized.

# 6 — Interaction principles

Sprint 5 defines what a VITA interaction *feels* like. The questions slice 5.1 must answer:

- When does VITA use a card?
- When does content sit directly on the background?
- What module sizes exist?
- How are feature colors used?
- What is a VITA primary action?
- How do secondary actions work?
- How do bottom sheets behave?
- How does a completed state behave?
- How does progressive disclosure work?
- How does VITA use motion?
- How does VITA use haptics?
- What visual objects represent each feature?
- How does VITA avoid over-design?
- **What should a VITA interaction feel like?**

These are foundational sprint questions, not styling preferences. Slice 5.1 is a serious foundational slice, **not a superficial token pass.**

The standing motion rules carry forward unchanged: **motion confirms, never decorates** · respect reduced-motion settings · one vocabulary app-wide.

# 7 — Non-goals

Sprint 5 does **not** become:

- bright cartoon gamification
- random glassmorphism
- gradient overload
- animation for decoration
- a completely different aesthetic
- a total architecture rewrite
- a business-logic rewrite
- a persistence rewrite
- a repository rewrite
- a generic motivational wellness-app redesign

**Product boundary, restated and binding.** VITA does **not** become a peptide dosage recommendation or protocol engine: no recommended research-peptide doses, no treatment protocols, no prescriptive cycles, no individualized dosage recommendations. This is not a gated future feature and not a product direction. Factual reference material — storage, handling, reconstitution concepts, general stability, development / approval status, factual compound information — remains valid, still behind the review gate at Vita HQ `00 HQ/Open Questions.md` #17.

# 8 — Draft slice plan

**⚠️ DRAFT. Not implementation-authorized.** A separate Sprint 5 architecture audit may refine dependency order, slice boundaries, whether BMI deserves its own slice, whether Tools integration moves earlier or later, and whether some motion work belongs inside individual slices.

| # | Slice (draft) | Scope |
|---|---|---|
| **5.1** | **VITA Design Language** | Audit the current app and establish hierarchy · card usage · modules · spacing · typography · color behavior · visual objects · bottom sheets · primary/secondary actions · motion · haptics · completion states · progressive disclosure · reusable primitives |
| **5.2** | **Dashboard Identity Redesign** | Keep the dynamic greeting · remove generic slogan copy · action-oriented Home · recognizable feature modules · Tools discoverability · avoid a generic card rearrangement |
| **5.3** | **Interactive Water Experience** | Hydration visual object · fill state · tactile logging · quick-add sheet/overlay · animation and haptics · history simplification · **preserve the Water data architecture** |
| **5.4** | **Peptides Home Redesign** | Due / completed / upcoming hierarchy · immediate comprehension · reduced administrative feel · **preserve routine and business logic** |
| **5.5** | **Routine + Injection Site Experience** | Simplify routine hierarchy · optional site logging · evolve the shared body map · explore injection rotation visualization |
| **5.6** | **Tools Integration** | Remaining Tools UI under the new design language · BMI here or in a dedicated adjacent slice after design-language approval · Dashboard discoverability · shared injection-site / body-map reuse · Reference presentation where appropriate |
| **5.7** | **Motion + Microinteraction Pass** | A restrained, reusable interaction language: water fill · dose completion · press states · progress changes · sheets · successful logs · transitions · haptics. **Not the final launch-animation sprint** |
| **5.8** | **Founder Review / Identity Audit** | Feature development stops. Real-device review of Dashboard, Water, Peptides, Routine and Tools |

# 9 — Founder-review gate

Slice 5.8 is a stop, not a formality.

**Primary acceptance question:**

> **"Would I genuinely want to use this app every day?"**

The review covers: identity · comprehension · hierarchy · clutter · usability · discoverability · interaction quality · consistency · motion · accessibility · any remaining generic-template patterns.

**Journey does not begin without explicit founder approval at this gate.**

# 10 — Relationship to Sprint 9

**Sprint 5 establishes the interaction vocabulary.** What a press, a completion, a sheet, a progress change and a successful log feel like in VITA.

**Sprint 9 — Final Polish / Motion / Launch Experience performs the final app-wide pass.** Applying that vocabulary consistently everywhere, finishing motion, resolving edge cases, accessibility and performance, and building the launch experience.

**Neither replaces the other.** Sprint 5 does not make Sprint 9 redundant, and Sprint 9 is not where Sprint 5's debt is parked.

---

**Related:** `docs/04-Master-Roadmap.md` → Sprint 5 · `docs/05-Design-System.md` · `docs/06-Slice-Tracker.md` · Vita HQ `01 Vision/Roadmap.md` · `00 HQ/Decision Log.md` · `03 Design/Design Bible.md`
