# Peptides

**What is this?** Vita's optional peptide/medication tracking flow (canonical module name: `peptides`). Explicitly **optional** — most users will never open it, and that's by design.

**Why does it exist?** The Product Bible names GLP-1 users and peptide trackers among Vita's users. For them, dose tracking is a real, underserved need — and serving it well signals that Vita meets people where their health journey actually is, without cluttering everyone else's experience.

---

## Current state (verified in repo, Sprint 3 slice 3.5 — real setups)

**Peptides became a real feature on 2026-08-23.** The first two layers of the three-part model are built and persisted: **Peptide Definition** (what the compound is) and **User Peptide Setup** (how this user tracks it). A user can browse or search an **18-entry built-in catalog**, add a **Custom** entry, configure a setup, edit it, deactivate it, and reactivate it — all surviving a restart.

**Classification is conservative.** `approved-medication` is used only where the active ingredient has an FDA-approved product in the United States; everything else is `research-compound`. **Where US status could not be stated with confidence, the compound was omitted rather than guessed at** — Sermorelin, Bremelanotide/PT-141, and Thymosin Alpha-1 — each still addable through Custom, which carries no regulatory claim. Research is labelled factually, **not styled as a warning**, and the distinction is spelled out as a word rather than encoded in colour.

**Entries carry a name, a classification, and a broad compound-class label. Nothing else** — no effects, benefits, mechanisms, protocols, or dosing. **There is no "typical dose" field of any kind**, and schedule labels can never read "due".

**Slice 3.5A (2026-08-23) expanded the library and added research reference pages.** The catalog went from 18 to **71 entries**. A *compound type* field means VITA can list what people actually track — MK-677, NAD+, 5-Amino-1MQ — **while saying honestly that they are not peptides**. Aliases make brand names and development codes searchable. **Blends are first-class** (GLOW, KLOW, BPC-157 + TB-500, Semax + Selank, CagriSema) with resolvable components and **no asserted amounts**, because vendor formulations vary — the user's own setup owns what's in their vial. *"CLOW" was researched and deliberately not added: no established meaning could be verified.*

Each entry now has a **factual reference page** — About, *Studied for* (never "used for"), Targets, an evidence level, plain-language research status, and sources. Regulatory status is one line among those, not the whole page. Sources are pointers into PubMed, ClinicalTrials.gov and Drugs@FDA rather than hand-written citations.

**Slice 3.5B (2026-08-24) polished the presentation and added a discovery taxonomy.** Detail pages moved from raw-looking output to professional presentation: title casing that leaves technical names (GHK-Cu, hCG, MOTS-c) untouched, *Studied For* and *Targets* as compact informational tags, and blend pages reorganised so the formulation caveat and the evidence caveat each have their own section instead of being restated three times. Compounds now carry **research-area tags** — Weight & Metabolic, Cognitive, Sleep, Growth Hormone, Recovery, Sexual Health, Aesthetics, Mitochondrial, Longevity & Aging, Immune & Inflammation, Endocrine — reached through **one compact category control** rather than a wall of chips. *These are discovery tags, not indications.* A **CJC-1295 without DAC + Ipamorelin** blend was added (72 entries total), and **syringe scale selection was removed from setup** — V1 assumes the ordinary U-100 scale.

**Slice 3.5C (2026-08-24) made the pages readable by someone who isn't a chemist.** Two sections were added. **Research claims** says what a compound is researched or commonly claimed to do, in plain English — and **each claim carries its own evidence label**, because one compound can have solid human trial evidence for one effect and vendor folklore for another, and a single label on the page would blur them together. A weakly supported claim has to say so in words, not just wear a small grey badge. **How it works** explains the pathway rather than naming it: *"Feeling full after a meal"* over *"GLP-1 Receptor"*, not *"GLP-1"* over *"GLP-1 Receptor"*.

**Development status replaced the approved / not-approved binary**, which was true of almost everything in the catalog and told a reader nothing. A compound now shows where it actually sits — *FDA Approved*, *Phase 3 · Late Stage*, *Not in Clinical Development*, *Discontinued* — with a plain summary, an **updated date**, and its own sources. Sermorelin, for example, reads as discontinued because the manufacturer withdrew it commercially in 2008, explicitly **not** an FDA safety action and **not** a rejected application. Where a company has publicly stated a plan, VITA reports the statement — *"Lilly has said it plans to submit retatrutide to the U.S. FDA in Q1 2027"* — and never converts it into a prediction that approval is coming.

**Sections appear only when there is something to say.** A compound with thin research gets a short, honest page rather than empty headings, and blends carry no combined claims at all: adding up what each component does would invent a claim about the blend that no study supports.

**Two things worth knowing as a founder.** First, the **time-sensitive entries need periodic re-checking** — a compound in Phase 3 today may not be in a year, which is why every one of them shows when it was last updated. Second, the risk of a page describing the wrong compound (Semax and Semaglutide are not related despite the similar names) is now **checked automatically on every build** rather than relying on someone noticing.

**Slice 3.5D (2026-08-24) rewrote the words on every page so a normal person can use them.** The problem founder review found was tone: the pages had become so careful about evidence that they forgot to say what a compound is for. A claim that reads *"Animal research has examined whether it affects fat accumulation. There is no meaningful human evidence"* is accurate and useless — the limitation had swallowed the claim.

**The fix is order.** Every page now answers, in this sequence: what is it, what is it claimed to do, how does it work, what has it been studied for, what does it target, how solid is the research, where did this come from. Limitations never lead. The evidence rating moved out of the claim heading and onto a quiet line underneath — *Evidence · Primarily preclinical* — so the claim gets read first and the qualifier second, which is the order a person actually thinks in.

**Nothing was softened.** VITA still never says you should take something, how much, or that it will work for you. What changed is that it is now allowed to say plainly what people research a compound *for* — appetite, weight, blood sugar, memory, sleep, skin, pigmentation, tissue repair — instead of hiding those behind phrases like "metabolic outcomes". The tests that guard this were rewritten to prevent recommendations rather than to prevent explanation.

**All 72 entries were reviewed.** Every overview was rewritten or verified, around 40 claim sections were written or rewritten, and 58 of the 72 compounds now carry plain-English claims. The rest are deliberately short — an obscure compound gets an honest short page rather than padding.

**The two you flagged.** 5-Amino-1MQ now opens on fat metabolism and body composition, and explains NNMT as "an enzyme that helps decide how cells process energy and nutrients" — no search required. Glutathione is now "an antioxidant the body makes for itself, present in nearly every cell", with claims covering antioxidant protection, liver function, cellular balance and skin, and oxidative stress explained rather than named.

**A new automatic check** now fails the build if any page describes a compound's chemistry without ever saying why anyone tracks it. On its first run it found nine pages doing exactly that — and caught that **Pentadeca Arginate had shipped with no description at all**.

**Development status styling stays neutral**, as you confirmed: Discontinued, Phase 3 and FDA Approved all look the same. The words carry the meaning; the colour does not pass judgment.

**⚠️ The research content is engineering-authored and has not had medical or legal review.** See [[Open Questions]] #17.

**Slice 3.6 (2026-08-24) added the dose / unit calculator.** This is the feature that answers the question people actually reach for a phone to work out: *my vial says 10 mg, I added 1 mL of water, and I'm using 2 mg — how many units is that?* VITA answers **20 units**, and shows its working underneath: `10 mg/mL · 2 mg = 0.2 mL = 20 units`.

**The line VITA does not cross.** It converts; it does not choose. The vial and water come from the setup the user saved, the amount comes from the field in front of them, and the arithmetic lives in its own module with no access to anything else — so there is no place for a suggested amount to come from even if someone later wanted to add one. The field is called **Amount Being Used** for that reason: the number is the user's, the conversion is VITA's.

**It reads your setup, and it stays current.** You do not re-enter your vial every time. If you change the water volume and come back, the answer changes with it — nothing is cached. If your setup is missing the vial amount or the water, VITA says so and offers to take you to edit it, rather than assuming a common value and giving you a confident wrong number.

**Nothing is logged.** Using the calculator records nothing — no history, no timestamp, no plan. It is a conversion you do and close. Logging arrives in the next slice.

**No syringe sizes to pick.** As agreed, V1 assumes the ordinary U-100 insulin scale (100 units per mL) and says so quietly next to the result. The 0.3 / 0.5 / 1 mL choice people see on the box is a capacity, not a scale, and does not change the maths.

**If a number looks off, VITA says so plainly and still does the maths.** Entering an amount larger than your whole vial gives you the real answer (120 units) plus one neutral line pointing out it exceeds what your setup records — usually a typo. It is a data check, not a health warning, and VITA offers no opinion on what to do about it.

**Slice 3.6B (2026-08-25) rebuilt where the calculator lives.** The first version made you create and save a tracked peptide before you could reach it — which is backwards, because working out how many units to draw is a question you ask *before* you commit to anything, usually with a vial already in your hand.

**It is now in two places, and they are the same calculator.** Inside a peptide setup it sits directly under the vial fields and **works while you are still filling the form in** — enter 20 mg, 2 mL and 2 mg and it says 20 units, before you have saved a thing. And it stands on its own at **Settings → Tools → Peptide Calculator**, where it needs no peptide, no catalog entry and no setup at all.

**Both surfaces are literally one component**, so the number you get in a setup and the number you get in Tools can never disagree.

**The keyboard problem is fixed.** iOS's number pad has no return key, so there was no obvious way to put it away — which is what made the calculator feel broken. There is now a **Done** button above the pad, and tapping outside a field or dragging the screen also dismisses it.

**What you type into "Amount being used" is never saved.** It belongs to the moment, not to your setup — and the code is built so that saving a setup literally cannot see it, rather than merely being told not to look.

**New Tools section in Settings**, deliberately not a new tab. It is for small utilities you use once and walk away from, and it is where the injection-site tools will go in slice 3.8. There is nothing fake in it in the meantime.

⚠️ **Needs your confirmation on a real iPhone.** Engineering still cannot tap or type on a simulator, so typing is proven by automated tests rather than by hand. That gap is exactly what let the previous version pass its tests and still fail for you, so this is not signed off until you have used it.

## Open polish item — tracking CTA discoverability

**Status: open. Not addressed in 3.6A. Must be resolved in the Peptides final polish pass.**

Founder review (2026-08-25) identified friction on long research-detail pages. On a compound like Tirzepatide, **Track this peptide** sits at the very bottom, after About, Research claims, How it works, Studied for, Targets, Approval status, Research status and Sources. A user who opens the page and wants to start tracking has to scroll past everything first.

The bottom-only CTA is fine on a short page. On an information-heavy one it buries the single action the page exists to enable.

**The requirement:** someone opening a long compound page should understand immediately how to track it, without scrolling to the bottom to find out. **All research content stays** — this is not a trim.

**Patterns worth evaluating** (pick one; do not stack them):
- a primary Track action in or just under the hero/header
- a compact action directly beneath the classification and category line
- a sticky or floating bottom action
- a duplicated top and bottom CTA where the page is genuinely long

**Constraints:** do not clutter the page, do not remove the bottom CTA automatically, and stay inside the existing VITA visual language — no new pattern invented for this.

**Also evaluate state-aware copy** once the tracked state is available to the detail page: `Track this peptide` when untracked, `View setup` (or equivalent) when a setup already exists. Deliberately not implemented in 3.6A — the detail page does not currently read setup state, so this is not the trivial change it looks like.

**Not feature-complete.** Slice 3.7 (administration logging and history), 3.8 (injection sites), and 3.9 (UX polish, final safety copy, [[Fuel]] integration) all remain. Fuel's Peptides card still runs on a marked temporary shim until 3.9.

Engineering detail: repo `docs/09-Technical-Documentation.md` → "Peptides architecture", and `docs/06-Slice-Tracker.md` → slices 3.5 through 3.6.

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
