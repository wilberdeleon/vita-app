# VITA — Technical Documentation

Single source of truth for implementation details: stack, architecture rules, and how to work in this repository.

---

## Stack (founder-approved, July 2026)

- **Platform:** Native-first — Expo SDK 54 / React Native, managed workflow, EAS builds. TypeScript throughout (strict mode). SDK 54 is pinned to match the current App Store Expo Go client (54.x) so founders can test on real iPhones; upgrade the SDK only when the App Store Expo Go supports it.
- **Navigation:** Expo Router (file-based) in `src/app/`.
- **Backend:** Supabase (auth, database, storage). Schema changes via numbered migrations in `supabase/migrations/`.
- **Deliberately not pre-committed:** state-management library and component library. These are per-slice decisions made when a slice needs them.
- **Testing (decided Sprint 3 slice 3.1, 2026-08-22):** `jest` with the `jest-expo` preset, pinned to the SDK (`jest-expo@~54.0.18`), plus `@types/jest`. **Dev dependencies only** — no native module, nothing in the app bundle, Expo Go unaffected. Config in `jest.config.js`; tests live in co-located `__tests__` folders as `*.test.ts(x)`; run with `npm test`. Chosen over Vitest because it is Expo's own supported preset and leaves component testing available later without a second migration. This closes the deferral the stack notes carried since Sprint 0 and the open finding from the Sprint 2 closeout audit.
- **Tests must be timezone-independent.** Build dates from local components (`new Date(y, m, d)`) and assert with local getters. A test that only passes in one timezone teaches people to ignore the suite. Where a timezone-sensitive property matters — the `new Date('YYYY-MM-DD')` UTC trap — state it as a property (round-trip over many days) rather than as a comparison that happens to fail only at negative offsets.

## Repository layout

- `docs/` — governing documents (numbered 00–10)
- `src/app/` — Expo Router routes only; screens stay thin and compose feature modules
- `src/features/<name>/` — one module per canonical area: `dashboard`, `fuel`, `journey`, `water`, `peptides`, `atlas`, `settings` (+ `auth`)
- `src/components/ui/` — Design System primitives only, no business logic
- `src/components/shell/` — floating dock, headers, app frame
- `src/theme/` — design tokens and theme system
- `src/lib/` — cross-cutting domain and infrastructure shared by more than one feature (Supabase client, `journeyStages`, `daily/`, `nutrition/`, `water/`, `peptides/`)
- `supabase/` — migrations and edge functions
- `assets/` — icon, splash, fonts, images

## Architecture rules

1. **Features never import from each other.** Anything shared is promoted to `src/lib/`, `src/theme/`, or `src/components/`.
2. **`src/components/ui/` contains zero business logic.** Primitives know nothing about features.
3. **Routes stay thin.** Logic lives in `src/features/`, not in `src/app/` screens.
4. **One home per concern.** Supabase client only in `src/lib/supabase/`; tokens only in `src/theme/`; every schema change is a migration file.
5. **Appearance resolves through the theme, never through raw palette surfaces.** Backgrounds, text, and borders come from `useTheme().surfaces`; `palette` supplies theme-invariant values only (brand, domain, macro, semantic colors). Importing `palette.text`/`palette.card`/`palette.background`/`palette.track` into a component pins it to light mode permanently. See [Design System](05-Design-System.md) for the full split and the documented exceptions.

## Shared daily foundation (Sprint 3 slice 3.1)

`src/lib/daily/` holds what every date-keyed feature needs and none of them should own: one local-calendar date model (`dates.ts`), one id scheme (`ids.ts`), one storage namespace and key builder (`keys.ts`), the read-time guards persisted data is validated with (`guards.ts`), the AsyncStorage helpers (`storage.ts`), the day-keyed store (`dayStore.ts`), and the app-lifecycle day rollover (`useDayRollover.ts`).

All of it was written for nutrition in Sprint 2 and promoted unchanged when Water and Peptides needed the same behavior. `src/lib/nutrition` re-exports every moved symbol under its original name, so its public API is unaffected and no screen or feature file changed.

**It is deliberately narrow — there is no shared "entry" type.** A glass of water and a peptide administration have genuinely different shapes, and hiding that behind a type parameter would make both harder to read. Shared infrastructure ends where the domains begin.

**`NutritionRepository` is not built on `dayStore`,** and that is on purpose. It is merged, approved, and holds real user data; rewriting its storage layer to prove a new abstraction would be regression risk with no user-visible gain. Only `NAMESPACE` moved out of `nutrition/data/keys.ts` — every key string it produces is unchanged and is pinned by test, because those keys name data already on users' devices.

## Peptides architecture (Sprint 3 slice 3.5)

`src/lib/peptides/` holds the first two layers of the three-part model:

| Concern | Type | Built |
|---|---|---|
| Peptide Definition | `PeptideDefinition` | slice 3.5 |
| User Peptide Setup | `PeptideSetup` | slice 3.5 |
| Peptide Log Entry | — | slice 3.7 |

A definition carries a name, a classification, and a broad compound-class label — **no dosing, schedule, vial, or history fields**. A setup carries this user's configuration and requires only a `definitionId`; everything else is optional, because a GLP-1 pen user reconstitutes nothing.

**There is no `typicalDose` or equivalent field**, by founder decision. VITA has no basis for knowing an appropriate amount, and a field named that would imply it did. A provider test asserts a serialized setup contains no such word.

**Micrograms are canonical** for mass (an exact power of ten), with the authored `{amount, unit}` pair stored alongside — the same snapshot principle as `FoodEntry.nutrition` and `WaterEntry.enteredAmount`. **Syringes are modelled as `unitsPerMl`, never capacity**: a 0.5 mL syringe marked to 50 units is still U-100, and modelling capacity corrupts every calculation slice 3.6 builds on it.

**Classification is a typed field, asserted only by the compiled catalog.** The repository refuses to read back a stored custom definition claiming any classification other than `custom`, so a hand-edited store cannot relabel a research compound as approved. The catalog itself is compiled code and is deliberately not persisted. See `data/catalog.ts` for the classification rule.

**Three orthogonal fields, deliberately not collapsed (slice 3.5A):**

| Field | Answers |
|---|---|
| `compoundType` | What is it chemically? `peptide` · `protein` · `small-molecule` · `blend` · `other` |
| `classification` | What does a US regulator say? `approved-medication` · `research-compound` · `custom` |
| `research.researchStatus` | The actual detail — foreign approvals, withdrawn approvals, trial stage, compounding status |

Collapsing any two would force a lie somewhere: Sermorelin is a withdrawn US approval, Semax is registered in Russia, MK-677 is not a peptide at all. Each is representable only because the three are separate.

**Blends** carry a `components` list of definition ids. **Vendor-named blends never assert component amounts** — formulations vary between suppliers, and the user's own setup owns what is in their vial. `research.blendCaveat` marks blends whose evidence comes from the components rather than the combination.

**Research areas (slice 3.5B)** are a second discovery dimension, typed and assigned in `data/definitions/researchAreas.ts` — one auditable table rather than inline across six files, because a taxonomy is only useful if it is consistent and consistency cannot be reviewed when scattered. A test asserts every catalog id is tagged exactly once. A compound may carry several areas where several are genuinely true. **These are discovery tags, not indications** — tagging Semax as Cognitive says where its literature sits, not that anyone should take it for anything. Catalog filtering composes as `classification AND researchArea AND query`.

**Display casing (slice 3.5B).** `model/format.ts` title-cases content at render time so definitions stay authored in plain lowercase. The rule is inverted from an ordinary title-caser: **a token already containing a capital is left untouched**, because it is scientifically cased on purpose. That protects GLP-1, hCG, MOTS-c, GHK-Cu, c-Met and NAD+ without an exception list anyone has to maintain. Never run a generic `toTitleCase()` over compound names.

**Syringe scale (slice 3.5B).** Setup no longer asks for it. Users were choosing between U-100/U-50/U-40 when what they see on the box is a *capacity* (0.3 / 0.5 / 1 mL) — a different property. **V1 assumes the ordinary U-100 scale, 100 units per mL**, which the calculator states beside its result. `syringe.unitsPerMl` stays on the model, defaulted to 100, so another scale needs no migration. Units are not a universal volume, and conflating them with capacity is what corrupts syringe arithmetic.

**Research content** lives in `research?: PeptideResearchInfo` on the definition — never in `PeptideSetup`. Identity, reference material, and the user's configuration are three things with three lifetimes. References are **search pointers into PubMed, ClinicalTrials.gov and Drugs@FDA**, not specific citations: a hand-written PMID naming the wrong paper is worse than no citation and undetectable from inside the app. A content test fails the build on recommendation phrasing and on any concrete dosing amount in editorial prose.

**Claims and mechanisms (slice 3.5C).** `research.claims` answers *what a compound is researched or claimed to do*; `research.mechanisms` answers *how*. **`evidenceLevel` lives on each claim, not on the page**, because one compound can have strong human evidence for one effect and vendor folklore for another, and a page-level badge would launder the second into the first. Enforced by test: every claim carries an evidence level; a `limited` claim must also qualify itself in prose; a `preclinical` claim must attribute itself to animal or laboratory work; `approved-use` only appears on `approved-medication`. A mechanism's `target` is a quiet subtitle — `Mechanisms` drops it when it merely repeats the title, and a content test forbids any mechanism title contained in its own target, so a heading can never be the receptor name.

**Development status (slice 3.5C).** `research.developmentStatus` replaces the approved/not-approved binary, which was true of nearly the whole catalog and said nothing useful. It carries a typed `stage` (`approved` · `submitted` · `phase-3` · `phase-2` · `phase-1` · `early-human` · `preclinical` · `not-in-clinical-development` · `discontinued` · `unknown`), a display `label`, a `summary`, an optional `nextMilestone`, `lastUpdated`, and its own `references`. The detail page heading switches to **Approval status** for approved medications.

Three rules are enforced by test rather than convention:

| Rule | Why |
|---|---|
| Every stage in `TIME_SENSITIVE_STAGES` must carry `lastUpdated` **and** references | A phase stated without a date asserts permanent truth about something that moves |
| No predictive approval language | *"Lilly has said it plans to submit…"* is a fact about an announcement; *"approval expected"* is a prediction VITA has no standing to make |
| Approved medications carry no clinical phase, and `stage: 'approved'` is reserved for them | The two vocabularies describe different things |

⚠️ **Time-sensitive pipeline entries are recurring maintenance.** They were researched against current sources rather than authored from model memory, and they go stale. `lastUpdated` is how a reader — and a future maintainer — can tell.

**Content identity is asserted, not reviewed by eye.** Cross-compound contamination (Semax described with Semaglutide's content) is invisible to anyone who does not already know both compounds. `__tests__/claims.test.ts` pins the major identity distinctions and adds a general sweep: no overview may name an unrelated catalog compound, excluding only itself, a blend's own components, and a derivative whose name already contains the parent's. Anything else must explicitly distinguish the two.

**Consumer-language normalization (slice 3.5D).** The content layer has an information order, and it is enforced rather than assumed: **what it is → what it is claimed to do → how it works → what it was studied for → what it targets → how mature the evidence is → sources.** Limitations never lead.

`formatEvidenceContext(level)` in `model/labels.ts` renders the compact form (`Evidence · Primarily preclinical`) shown under each claim. It exists so evidence maturity is a **field**, written once, instead of a caveat sentence each author re-invents inside the prose. `EVIDENCE_LABELS` keeps the longer page-level phrasing; the two are deliberately different registers.

The guardrails in `__tests__/claims.test.ts` were **inverted** in 3.5D. The earlier pair required every `limited` or `preclinical` claim to restate its weakness in prose, which produced defensive copy where the limitation *was* the claim. They now assert the opposite — a claim may not open with what the evidence lacks, and must contain effect vocabulary rather than only describing research activity. Prohibitions on recommendation, guarantee, dosing and hype language are unchanged: **the tests exist to prevent recommendations, not to prevent VITA explaining a compound.**

`__tests__/consumerContent.test.ts` is the systematic floor:

| Check | Why |
|---|---|
| Every entry has an overview, 120–560 characters | Pentadeca Arginate shipped with none; the cap keeps 3.5D from licensing essays |
| The overview must say why the compound is **tracked, researched or used** | A page that lists only chemistry answers nothing |
| Claim titles are not generic, and never a receptor or enzyme name | The technical name belongs in How It Works and Targets — the layers built for it |
| Mechanisms explain their own acronyms | "Inhibits NNMT" is the sentence the founder rejected by name |
| A compound with mechanisms must also have a plain claim | Prevents jargon from becoming the only description |
| Repeated limitation formulas capped at one per page | The page states evidence maturity in three structured places already |

These are floors, not style rules — loose enough that ordinary copy editing does not break the build, strict enough that the failure mode cannot come back. The audit found nine real content gaps on its first run.

**Layering is the design.** Claims are plain language; How It Works keeps the scientific terms *and* explains them; Targets keeps receptor and enzyme names verbatim. Technically interested readers lose nothing, and no single section has to compromise its register.

⚠️ **Research content is engineering-authored and has not had medical or legal review** (Open Question #17).

**Dose calculator (slice 3.6).** `model/dose.ts` is pure arithmetic with no React, no state, and no I/O — the module boundary *is* the product boundary. VITA converts; the user decides, and a function that cannot reach state cannot quietly acquire an opinion about an amount.

```
concentrationMcgPerMl = vialAmountMcg / reconstitutionMl
volumeMl              = amountMcg / concentrationMcgPerMl
syringeUnits          = volumeMl * unitsPerMl
amountMcgFromUnits    = (syringeUnits / unitsPerMl) * concentrationMcgPerMl
```

Both directions share one private `resolveConcentration()`. That is what makes the inverse a real inverse instead of a second formula that agrees by coincidence, and the round-trip is asserted over sixteen vial/amount combinations rather than against restated literals.

`DoseCalculationResult` is a **discriminated union** — `{ ok: true } & DoseCalculation` or `{ ok: false, reason }`. A failure carries no numbers at all, so there is nothing partially valid for a component to render. Nine typed reasons separate *missing* (a blank field on first open, normal) from *invalid* (a negative vial amount, actually wrong). The domain holds no user-facing English; screens map reasons to copy.

**Precision is kept internally and spent once, at the edge.** `formatSyringeUnits`, `formatVolume` and `formatConcentration` in `model/units.ts` are the only places rounding happens, and a test asserts formatting never mutates the value it formats. Rounding inside the arithmetic is how a calculator ends up disagreeing with itself between two screens.

| Quantity | Rule | Why |
|---|---|---|
| Syringe units | Whole when whole, otherwise one decimal | `20 units`, `2.5 units`, `13.3 units` — a syringe cannot be read finer |
| Volume | Up to three decimals, no trailing zeros | `0.025 mL` is a real quantity here; two decimals would flatten it |
| Concentration | The user's own authored vial unit | `10 mg/mL`, not `10000 mcg/mL` |

**V1 assumes U-100 (100 units/mL)** and states it beside every result. `unitsPerMl` remains on `PeptideSetup` rather than being a constant in the formula — units are not a universal volume — so supporting another graduation density is a UI change, not a migration. **Syringe *capacity* is still never collected**: 0.3, 0.5 and 1 mL syringes are all U-100.

The calculator route is `/peptides/setup/[id]/calculator`. It reads vial, water and graduation density from `useResolvedSetup` and **derives concentration every render**, so an edited setup cannot leave a stale figure behind. It **persists nothing** — the amount is component state and dies with the screen; logging an administration is slice 3.7. Without a vial amount or reconstitution volume it renders a neutral incomplete state and **never invents a default**, because a fabricated 10 mg / 1 mL would hand a confident wrong number to someone whose vial is neither.

`doseConsistencyNotes()` compares two numbers the user entered against each other and nothing else. An amount exceeding the vial is arithmetically valid, still calculated, and worth one neutral line because it usually means a typo. There is deliberately no concept of a large, safe, or maximum amount, and none of how to administer a result over 100 units.

**Two calculator surfaces, one component (slice 3.6B).** `model/dose.ts` is unchanged — the arithmetic above is still the only place it lives. What changed is where it surfaces.

| Surface | Route | Vial source |
|---|---|---|
| Inline | inside `SetupForm` | live **draft** text in the form's own fields |
| Standalone | `/settings/tools/peptide-calculator` | the tool's own fields; no peptide required |

`features/peptides/components/DoseCalculatorPanel` is the single component both render. It owns the amount input, validation, error copy, consistency notes and the `DoseResult` block; the hosts supply only `vialAmountMcg`, `reconstitutionMl`, `vialUnit` and `unitsPerMl`. Two calculators would have drifted; one cannot.

**The amount never leaves the panel.** It is deliberately not lifted into either host, which turns "the calculator persists nothing" from a convention into a structural guarantee — `SetupForm.emit()` cannot include a value it has no access to. A test asserts the emitted payload never contains it.

**Inline reads draft state, not persisted state.** The whole point is that a user configuring a peptide for the first time gets an answer before saving. `PeptideSetup` is irrelevant to the calculation; the two text fields above are the input.

**Slice 3.6's `/peptides/setup/[id]/calculator` route is deleted.** Requiring a saved setup to reach a calculator was the design error founder QA exposed. Inline covers the in-context case; Tools covers the standalone one.

**Numeric keyboard.** iOS `decimal-pad` has no return key, which on the calculator meant the keyboard could not be dismissed. `components/ui/NumericField` pairs a decimal-pad `TextField` with `NUMERIC_ACCESSORY_ID`; `NumericKeyboardAccessory` renders the **Done** bar through `InputAccessoryView` — iOS-only and explicitly guarded, since Android's pad has its own dismiss. Render the accessory **once per screen**: it is matched by `nativeID`, so one bar serves every field.

`Screen` gained an **opt-in** `keyboardAware` prop (`keyboardShouldPersistTaps="handled"`, `keyboardDismissMode="interactive"`, extra bottom padding). Opt-in rather than default so no existing screen's behaviour changes — only the three peptide form screens use it.

**Unit-toggle conversion is one shared helper (slice 3.6E).** `convertAuthoredAmount(text, from, to)` in `model/units.ts` restates a typed amount in another unit — `20 mg` → `20000 mcg` — and is used by all three toggles: the vial field inline, the vial field in the standalone tool, and the custom amount. Reinterpreting instead would move a quantity by a factor of a thousand while the digits sat still.

Two invariants it guarantees:

- **Only a complete number is rewritten.** `Number('1.')` is `1`, so parsing alone would turn a half-typed "1.5" into "1000". A `/^\d*\.?\d+$/` test leaves blank and mid-typing text untouched.
- **It runs on an explicit toggle press only**, never in an effect and never while typing, so the field is not rewritten under the cursor.

The **vial** toggle is the one that persists. `SetupForm` emits the converted text together with the new unit, so `vialFrom()` produces an identical canonical `amountMcg` before and after — asserted by test across a switch and a round trip.

**The custom converter** (`UnitConversion`) is optional and ephemeral. Its state is local to the component, which makes "the calculator persists nothing" structural rather than a rule: `SetupForm.emit()` cannot include what it cannot reach. Its unit is seeded from the vial's authored unit once and then independent — the same separation applied between a logged unit and a display preference in Water slice 3.3.

**Casing convention.** Section metadata stays uppercase (`VIAL`, `UNIT CONVERSION`, `PREFERRED UNIT`) via `SectionHeader`; field labels are Title Case. Compound and unit tokens (`mg`, `mcg`, `mL`, `U-100`, `GHK-Cu`, `MOTS-c`) are never re-cased — `formatLabel`'s rule leaves any token already containing a capital exactly as authored.

**No target amount is an input (slice 3.6D).** `unitConversionReference(vial, unit)` derives the whole reference from the vial and the reconstitution volume alone, reusing `resolveConcentration` so the arithmetic still lives in one place. Slices 3.6 through 3.6C each kept a target-amount field and each refined a question that should not have been asked: what the syringe marks are worth is a property of the vial, not of an intention.

The headline scale is chosen, not fixed. One whole authored unit wins whenever the result falls in a readable 1–100 unit band, because "1 mg = 10 units" is the phrasing people carry in their heads; otherwise a ladder supplies the nearest candidate to a mid-barrel reading, so an mcg-authored vial does not headline an unreadable "1 mcg". Rows are the primary amount × `[0.5, 1, 2, 3, 4, 5]`, filtered to what fits on a barrel, with the primary always surviving so the reference is never empty.

**Nothing in the table is a recommendation.** No row is highlighted, ordered by desirability, or labelled typical/standard/starting, and a rendering test sweeps for that vocabulary. The table is a ruler; VITA does not point at a line on it.

`DoseCalculatorPanel` and `DoseResult` are deleted. `calculateSyringeUnits` builds the rows; `calculateAmountFromUnits` remains the tested inverse that keeps the forward arithmetic honest and is deliberately unwired.

**Output is syringe units only (slice 3.6C).** Micrograms are canonical *inside* `model/dose.ts` and never appear as a result. No second mcg figure, no per-unit mass, no units → mass converter in any screen. `calculateAmountFromUnits` remains in the domain — tested, and deliberately unwired — because it is the inverse that keeps the forward arithmetic honest, not a feature.

**Unit switching converts; it never reinterprets.** `changeAmountUnit` rewrites the field through `toMcg`/`fromMcg`, so `2 mg` becomes `2000 mcg` and the syringe result is unchanged. Reinterpreting would move the amount by a factor of a thousand while the digits sat still — the worst failure available on this screen. Two guards: only text matching `/^\d*\.?\d+$/` is rewritten (`Number('1.')` is `1`, so parsing alone would destroy a half-typed "1.5"), and the conversion happens on press rather than in an effect, so there is no feedback loop.

**`preferredDoseUnit` seeds the amount unit once**, via `useState` initial value, and is not read again. Reading it every render meant changing *Preferred unit* elsewhere in the form silently reinterpreted an already-typed amount — the same separation Water established between a logged unit and a display preference in slice 3.3.

**Tools** (`/settings/tools`) is a Settings destination for utilities that stand alone: no tracking, no persistence, no feature ownership. Reached from Settings rather than the dock, and intended to host slice 3.8's injection-site tools. **No placeholder rows** — a dead button is worse than a short list.

**Peptide log entries (slice 3.7).** `PeptideLogEntry` is a **historical snapshot, never a derived view.** Everything needed to render it years from now is copied in at save time: the amount as authored and in canonical micrograms, the local calendar day, the exact instant, and a `calculationSnapshot` of the vial, reconstitution volume, graduation density, and the units and volume they produced.

That is the single most important property in the domain. A setup edited next month must not reach back and change what someone drew last week — so nothing on read is ever recomputed from a setup.

| Concern | Where |
|---|---|
| Snapshot taken | `createLogEntry`, once, from the setup as it stands |
| Edit recomputed | `applyLogChanges`, inside the entry's **own** snapshot |
| Absent snapshot | normal — a pen user has no vial; logging is never blocked |
| Never invented | an entry without a snapshot does not gain one by being edited |

**Persistence is day-partitioned** on the shared `createDayKeyedStore`: `vita:v1:peptides:log:<YYYY-MM-DD>`. Setups stay a whole-collection key because a configuration is not day-keyed; a log grows without limit and the day is the unit read and written together. `parseLogEntry` receives the day it was read from and drops an entry whose own `logDate` contradicts its key, which is what stops a mis-filed record being counted twice.

`PeptideProvider` holds a bounded window (`RECENT_DAYS = 60`) rather than all history, reads older days on demand, and gained a **day rollover** — administrations are day-keyed where setups never were, so "today" must change while the app is open.

**Scheduled ≠ logged.** A schedule comes from `PeptideSetup`; an administration comes from a log entry. Nothing derives one from the other, and there is no adherence, streak, or compliance concept anywhere in the model.

**Dates are local, always.** `logDate` is derived from `loggedAt` via `toLogDate`, never from "today" and never from an ISO string's UTC slice — device QA caught the latter in the edit form, where an evening administration opened showing the next day. `lib/daily` gained `formatClockTime`, `toTimeInput` and `fromDateAndTime`; the last builds an instant from local parts rather than parsing a composed string, avoiding the `new Date('YYYY-MM-DD')` trap.

**Extensible for slice 3.8** with no speculative field: injection sites will add an optional `site` to `PeptideLogEntry`, which is a purely additive change.

**Storage keys:** `vita:v1:peptides:setups`, `vita:v1:peptides:customdefs`. Custom definitions live apart from setups so one compound can back several and survives deleting any of them.

**Orphaned setups** — a setup whose definition no longer resolves — are omitted from the lists, counted, and left untouched in storage. Re-pointing one at another definition is the only genuinely destructive option and is never done.

**Schedules are display and organization only.** No notifications, no adherence scoring, and a language rule enforced by test: labels read *Scheduled today*, never *Due today*, and never describe a day as missed.

## Water architecture (Sprint 3 slice 3.2)

`src/lib/water/` is the single source of truth for hydration. It lives in `src/lib/` because Fuel's Hydration module reads the same state the Water screen does, and features never import each other.

```
WaterEntry[]  →  WaterState  →  derived totals  →  Water screen + Fuel
```

**Millilitres are canonical.** Every stored amount is mL; conversion happens only at the edges, and a rounded display value is never converted back into storage. Constants are exact by definition: 1 US fl oz = 29.5735295625 mL, 1 US cup = 8 fl oz, 1 L = 1000 mL. `floz` and `cup` are explicitly **US customary** — an imperial fluid ounce is 28.4131 mL, so a future non-US locale adds units rather than changing what these mean.

**Every entry stores both representations.** `amountMl` for arithmetic, plus `enteredAmount` + `enteredUnit` as a snapshot of what the user typed — the same principle as `FoodEntry.nutrition`. Changing the display preference must never rewrite what someone recorded.

**The goal is stored as the authored pair**, not as millilitres, so it reads back exactly as set. **There is no default goal**: `null` means not set, and `progress`/`percent`/`remaining` are all honest about it rather than dividing by an invented target. Logging is never gated on a goal existing. Water owns its own preferences under `vita:v1:water:prefs`; Settings (Sprint 7) will read and write that same key rather than creating a second source.

**A display preference and an entry's unit are different things** (founder decision, 2026-08-22). `WaterPreferences.unit` is how Water renders derived values — totals, goal, remaining. An entry's `enteredUnit` is what the user typed for that drink. Logging one bottle in millilitres does not move the preference, and changing the preference never rewrites a stored entry. `setUnit` is called from exactly one place: the explicit unit control on `/water/goal`. Slice 3.2 briefly conflated the two; slice 3.3 separated them, and provider tests pin the separation.

**Storage keys** use the shared helpers: `vita:v1:water:log:<YYYY-MM-DD>` (one per day, via `createDayKeyedStore`), `vita:v1:water:goal`, `vita:v1:water:prefs`.

**Read-time validation** mirrors nutrition's: malformed JSON and non-array payloads read as an empty day; records are dropped rather than repaired; `NaN`, `Infinity`, zero, negative, impossible-date, and wrong-day records are rejected. **Reading never writes** — corrupt data stays on disk untouched instead of being silently rewritten.

`WaterRepository` is the Supabase swap point, with the same all-async shape as `FoodLogRepository`. `WaterProvider` mirrors `NutritionProvider`'s pattern (Context + reducer + shadow refs + optimistic commit + shared day rollover) **without** a generic `TrackerProvider<T>` — the providers look alike because the pattern is right, not because the domains are the same.

**Recent days (slice 3.4).** The provider loads daily totals for the days *before* the current one and exposes them as `history`; today's total is always derived live from `entries`, so a logged drink moves the strip immediately and there is no second copy of today that can disagree with the first. History is loaded once per day change rather than after every write, because past days cannot change while the user is looking at today. `buildWaterWeek` is pure and carries **volume only** — VITA stores one current goal as a preference and never snapshots what it was on a past day, so any historical goal-attainment figure would be an invention. A test asserts the model exposes no goal field at all.

**One source of truth, one direction (slice 3.4).** The Water screen, Fuel's Hydration card, and Home's Water tile and goal pillar all read `useWaterToday()`. No Water fixture data exists anywhere in the app. The dependency runs Water domain → screens; nothing in `src/lib/water` knows Fuel or Home exists.

## Nutrition architecture (Sprint 2)

`src/lib/nutrition/` is the single source of truth for food entries, daily totals, and nutrition targets. It lives in `src/lib/` rather than `features/fuel/` because **both** Fuel and Dashboard consume nutrition, and features never import each other (rule 1 above) — the same promotion `src/lib/journeyStages.ts` received.

```
FoodEntry[]  →  DailyNutritionState  →  pure selectors  →  Fuel + Home
```

- **`model/`** — the provider-independent types (`VitaFood`, `ServingOption`, `NutritionFacts`, `FoodEntry`, `NutritionTargets`), pure calculation functions, log-date helpers, the canonical meal vocabulary, and the macro list. No I/O, no React.
- **`data/`** — `FoodLogRepository` (the interface) and its AsyncStorage implementation. **This is the swap point:** Supabase later arrives as a second implementation, and no screen, hook, or calculation learns where data lives. Everything read back from storage is validated before use; malformed records are dropped rather than repaired, because a guessed value in a food log is worse than a missing one.
- **`state/`** — `NutritionProvider` (Context + `useReducer`, mirroring `ThemeProvider`; no state library) and `useDailyNutrition()`, which derives totals, per-meal groups, and progress on each render. Mounted at the root in `src/app/_layout.tsx`, above the router, because Home and Fuel read the same day.

**Entry nutrition is a snapshot, not a reference.** `FoodEntry.nutrition` is already multiplied by quantity and stored with the entry. Three reasons: history stays truthful when a provider revises a food; deleting a custom food or losing network cannot corrupt past days; and daily totals become a pure sum with no lookups and no loading state on Fuel or Home. The cost is denormalization, which is the right trade for a log.

**Log dates are local, not UTC.** `FoodEntry.logDate` is `YYYY-MM-DD` derived from the device's local calendar, so an 11pm entry counts as that day. `loggedAt` keeps the precise instant separately. `NutritionProvider` re-derives today on `AppState` → `active`, so a backgrounded app rolls over instead of showing yesterday's totals under "Today".

**Storage keys** are namespaced and versioned (`vita:v1:…`), one key per day, so reads and writes stay small regardless of how much history accumulates. See `src/lib/nutrition/data/keys.ts`.

## Food providers (Sprint 2, slice 2.6)

```
USDA adapter    Open Food Facts adapter        ← the only files that know a provider's shape
        └───────────────┴───────────┐
                                    ▼
                          Normalized VitaFood
                                    ▼
                    parallel fan-out → score → dedupe → rank
                                    ▼
                            Search / Food Detail
```

**Adapters** live in `src/lib/nutrition/providers/`. Raw provider payloads never leave them — verified by grep: no `fetch(` outside that directory and no `source === 'usda'` style branching anywhere in `src/app`, `src/features`, or `src/components`.

**USDA FoodData Central** — free, **CC0 public domain**, no commercial restrictions, attribution requested but not required. Key from `api.data.gov`, 1,000 requests/hour.

**Do not add a `dataType` query parameter.** It was measured at **5/10 success** versus **10/10** for the identical query without it — api.data.gov's edge intermittently answers the filtered form with a bare nginx `400`, silently costing USDA results on about half of all searches. Data types are filtered client-side in `toVitaFood` against the `DATA_TYPE_QUALITY` allowlist instead. Nutrients are read by numeric id (names vary by data type) and are always per 100 g, so a label serving is derived by scaling and the 100 g baseline is always offered too. Data types are limited to Foundation, SR Legacy, Branded, and Survey (FNDDS).

**Open Food Facts** — free, no key, **ODbL** data and **CC-BY-SA** images; attribution is required wherever the data is shown. A contact email in the `User-Agent` is mandatory (`EXPO_PUBLIC_OFF_CONTACT`); without it the provider reports itself unconfigured rather than sending an anonymous identifier. Two conversions matter: sodium arrives in **grams** and is stored as mg, and energy is read only from the explicit `energy-kcal` field because the generic `energy` field is kilojoules on most records.

**Search endpoint choice.** Full-text search uses **Search-a-licious** (`search.openfoodfacts.org`), which OFF's current documentation points to. The legacy `cgi/search.pl` returns richer records — it carries `serving_size`/`serving_quantity`, which Search-a-licious does not index at all — but it returned HTTP 503 during verification. Reliability won: OFF search results therefore offer only the honest 100 g baseline. Label servings remain available from the product endpoint, which `lookupBarcode` uses and the barcode slice inherits. **Recommended follow-up:** enrich a food from the product endpoint when the user opens it — one request per opened food, not per result.

**Loggability rule.** A result is only surfaced if calories, protein, carbs, and fat can all be derived. Records missing any of them are dropped rather than shown disabled, because a result you cannot log is noise in a list being scanned fast — and zero-filling would be indistinguishable from a measured zero.

**Deduplication** — three passes, cheapest first: normalized GTIN identity, then brand + normalized name, then near-duplicate generics (token-set similarity ≥ 0.9 **and** calories within 5% **and** both unbranded). The third pass is deliberately the narrowest: collapsing a 12 oz can into a 20 oz bottle would hide a real choice and log the wrong calories.

**GTIN normalization** (`providers/gtin.ts`) pads every barcode to 14 digits, so UPC-A, EAN-13, and leading-zero-stripped numeric forms of the same product compare equal. Any 8–14 digit run is accepted and padded, because a barcode passed through a JSON number loses its leading zero — the exact mismatch the module exists to prevent. Check-digit validation is exposed but deliberately **not** enforced, since real catalogues carry codes that fail it.

**Ranking** is a pure deterministic scoring function with named weights — no learning, and a name tiebreak so identical searches never reorder based on which provider answered first.

Records carry an optional **`dataQuality`** (0–100): a provider-independent trust signal that adapters populate from whatever their source knows, and the only quality input ranking reads. It exists because a flat per-provider score is too coarse — USDA serves laboratory composition data and manufacturer-submitted branded labels from the *same* endpoint, and searching "banana" returned a branded peanut butter spread named "BANANA" ahead of "Bananas, raw". USDA maps FDC data types (Foundation/SR Legacy 95, Survey (FNDDS) 82, Branded 78); Open Food Facts uses a flat 70. Two supporting rules: an exact name match on a branded product whose brand the query never mentioned is worth +15 rather than +45, and a capped (−8 max) per-extra-word penalty acts as a tiebreak without being able to invert a quality tier.

**Failure isolation.** Providers are queried in parallel and settled independently; one failing, timing out (6 s), or being unconfigured degrades the result set but never fails the search. Only an all-providers-failed outcome shows the error state.

**Caching.** Query results are in-memory with a 5-minute TTL (queries are too varied to persist, and search should feel live). Individual foods are persisted with a 30-day TTL under `vita:v1:cache:food:{vitaId}` — this one is load-bearing, because Food Detail resolves a provider food that is not in My Foods. Neither cache bulk-downloads or accumulates a redistributable copy of a provider database; ODbL's share-alike obligation attaches to publishing a derived database, which this is not.

**Key handling.** The USDA key is a rate-limiting identifier rather than a true secret, which is why `EXPO_PUBLIC_` is acceptable for development. USDA does deactivate keys found published publicly, so **a public release should move these calls behind a proxy.**

### Provider roster

**Current providers (development and Sprint 2):**

| Provider | Role | Licence / terms posture |
|---|---|---|
| **USDA FoodData Central** | Generic, foundational, and raw/basic US foods | CC0 public domain — no retention restriction |
| **Open Food Facts** | Packaged and branded products, product images, barcode lookup | ODbL data / CC-BY-SA images — attribution required; retaining individual user-chosen records on-device is ordinary API use |

**Deferred provider:**

| Provider | Intended role | Status |
|---|---|---|
| **FatSecret** | Restaurant and stronger branded food coverage | **Deferred** by founder decision, 2026-08-21 |

**Why FatSecret is deferred.** Its Developer Terms require removing or re-requesting any Content not explicitly *storable indefinitely* within **24 hours**. The indefinitely-storable list is identifiers only — `food_id`, `serving_id`, `food_category_id` and similar — and does **not** include nutrition values, food names, brand names, serving descriptions, or image URLs. VITA persists all of those permanently inside `FoodEntry`, by design: it is what lets Fuel and Home compute totals with no lookup, no async, and no loading state, and what keeps a logged day truthful after a provider revises a food. **The retention rules conflict with permanent `FoodLogEntry` snapshots, and the snapshots win.** Snapshots are not redesigned during Sprint 2.

A second blocker sits under the intended architecture: FatSecret binds OAuth 2.0 tokens to an IP allowlist, and Supabase Edge Functions cannot provide static egress IPs. FatSecret's client secret would still have to stay server-side whenever this is revisited — that part of the plan was sound.

**No workaround was built.** No ID-only favorites, no history re-fetching, no temporary shim, and `fatsecret` remains excluded from every persisted-definition allowlist. Full findings with quotes: `docs/07-Audit-Log.md` (2026-08-21). Launch-gated re-evaluation and the eight open questions: `docs/04-Master-Roadmap.md` → Launch readiness follow-ups.

### Recents and Favorites (slice 2.7)

**Recents are derived, not stored.** The food log already holds the truth, so there is no `recents` key — a parallel list would only be a second thing that can disagree with the first. `useRecentFoods` enumerates log keys, reads the newest 30 days, collapses to one row per `vitaId`, and caps at 25.

**`foodFromEntry()`** rebuilds a loggable `VitaFood` from an entry snapshot alone, which is what lets a recent survive an expired provider cache, a deleted custom food, or being offline. Opening Recents also re-seeds the food cache from history.

**Favorites** are keyed by `vitaId` and persisted at `vita:v1:favorites`, newest first. `PERSISTABLE_SOURCES` gates whether the food *definition* may be retained: USDA (CC0), Open Food Facts (ODbL — retaining individual user-chosen records on-device is ordinary API use; share-alike attaches to publishing a derived database), and custom foods. **FatSecret is excluded** — its caching/storage terms were verified on 2026-08-21 and permit only identifiers to be retained, so the provider is deferred entirely rather than partially accommodated. No ID-only favorite path was built; see Provider roster above. A stored definition is dropped on read if its source is no longer permitted, so a terms change needs no migration.

### Barcode scanning (slice 2.8)

`expo-camera@~17.0.10` (SDK 54-compatible; **no SDK upgrade**). Works in Expo Go — no development build, no Xcode. `app.json` carries the `expo-camera` plugin with a permission string for future dev builds; Expo Go supplies its own.

**Flow:** camera → `onBarcodeScanned` → `normalizeGtin()` → sequential lookup → Food Detail. Scan types are limited to `upc_a`, `upc_e`, `ean13`, `ean8`.

**Scan lock is a `ref`, not state.** The callback fires many times per second while a code is in frame; React batching lets several through before a `useState` flag re-renders, each firing its own lookup and navigation. The handler is also detached during lookup as a second guard. A non-GTIN value is ignored without locking.

**Sequential, not parallel.** A GTIN is an exact identity, so the first trustworthy match ends the search — no reason to spend rate-limited quota on the rest. Open Food Facts first (barcode-native product endpoint, and it carries serving data that Search-a-licious lacks); USDA optional and skipped silently when unconfigured.

**USDA has no barcode endpoint** — a GTIN query is fuzzy full-text, so every candidate is re-verified against its own `gtinUpc` and only an exact match is accepted.

**A barcode is an identifier, never a query.** Both adapters re-normalize the *returned* product's own barcode and accept it only on exact GTIN identity; USDA additionally skips any record without a `gtinUpc` rather than treating it as a near-miss. Showing an unrelated food is worse than admitting nothing was found.

**Route screens under `[id]` must not seed state with `useState` initializers.** `/fuel/food/[id]` and `/fuel/entry/[id]` are single screens: navigating between two ids updates `params` without remounting, so an initializer runs once and never again. This shipped a bug where a scanned barcode displayed an earlier product. Resolve async state together with the id it belongs to, and re-seed derived UI state on an identity change.

**Not-found vs error are distinct**, and must stay so: Open Food Facts answers an unknown barcode with **HTTP 404**, which is a definitive "the database doesn't have this" and maps to not-found. Treating it as an error would send users to retry a lookup that can never succeed instead of offering manual entry.

## Environment & secrets

- Copy `.env.example` to `.env` (git-ignored) and fill in values.
- Only publishable keys use the `EXPO_PUBLIC_` prefix (they ship inside the app bundle). Real secrets live server-side in Supabase edge functions.

## Known mocks (as of Sprint 2, slice 2.8)

Recorded explicitly so a screen showing real data next to a screen showing fixtures is never mistaken for a bug — or for working functionality.

| Area | State |
|---|---|
| Food entries, daily totals, meal grouping, targets | **Real.** Persisted via `src/lib/nutrition`; verified across a full app restart. |
| Food Detail (serving/quantity/meal → log) | **Real**, and provider-agnostic — consumes the normalized model only. |
| Editing a logged entry (serving/quantity/meal) | **Real.** Updates in place; never mutates the food definition. |
| Food Search | **Real.** USDA + Open Food Facts through the provider layer. |
| Recent Foods | **Real.** Derived from logging history — no separate store. |
| Favorites | **Real.** Persisted, keyed by `vitaId`, working across every source. |
| Add Manually, custom foods (My Foods), delete + Undo | **Real.** Persisted. |
| Barcode scanner | **Real camera.** Live detection unverified pending a physical iPhone — the simulator has no camera. |
| **Water Log** | **Mock.** `getWaterToday()` returns a fixed `5 / 8 cups`; "+ Add Water" discards the amount. Tier 3 of Sprint 2. |
| **Peptide Log** | **Mock.** `getPeptideToday()` returns a fixed `1 / 3 logged`; "Save Peptide" discards the entry. Preserved but deliberately not extended in Sprint 2 — deeper work is Sprint 3 (reordered 2026-08-21; was Sprint 5). |
| Home nutrition (calories, macros, meals, nutrition goal) | **Real.** Same engine as Fuel — one source of truth. |
| Home Journey, steps, sleep, workouts, streak, water tile, Water/Movement/Recovery goal pillars | Mock. Domains Sprint 2 does not cover; none competes with nutrition. |

## Sprint 0 implementation notes

- **Navigation shape:** the dock has four tabs (`(vita)/(tabs)/`: dashboard, fuel, journey, atlas). Water, Peptides, the Food Log flow, and Settings are stack screens above the tabs (no dock). Settings opens from the header gear.
- **Mock data:** every feature serves realistic fixtures from `mock.ts` through its `api.ts` boundary. Later sprints swap fixture bodies for Supabase queries without touching screens.
- **Auth:** `features/auth/AuthProvider` reports a mock signed-in user; the gate in `src/app/index.tsx` already routes by session status. Enabling real auth = replacing AuthProvider internals.
- **Charts** are hand-drawn with `react-native-svg` (LineChart, WeightBars in `features/journey`) — no chart library.
- **Barcode scanner** is still a static visual mock as of slice 2.1; camera permission and real scanning ship later in Sprint 2. It is also the one screen deliberately outside the theme system — a full-screen dark camera view that reads correctly in both themes.
- **Theming** (app-wide since the 2026-08-16 visual consistency pass): `ThemeProvider` holds the user's `mode` (light/dark/system) and resolves it to a `scheme`; on `system` it reads `Appearance.getColorScheme()` and subscribes to `Appearance.addChangeListener`, so switching iOS appearance updates the app live with no restart or navigation reset. **`mode` is in-memory `useState` — the preference does not survive a cold restart. Persistence is unimplemented deferred work.**
- **SDK notes:** tab-bar types import from `@react-navigation/bottom-tabs` (on SDK 55+ expo-router vendors react-navigation and they move to `expo-router/tabs`). `expo-status-bar` is not a config plugin on SDK 54 — do not add it to `plugins`. `.npmrc` keeps `legacy-peer-deps=true`.

## Running the app

```bash
npm install
npx expo start        # then press i for the iOS simulator, or scan the QR code with Expo Go
```

Development builds and store builds use EAS (`eas.json` profiles: development, preview, production).

---

## Future architecture considerations (founder direction, 2026-08-18)

**None of this is built, scheduled at the code level, or approved as a specification.** It is recorded here so the constraints are known before the relevant sprint starts, and so nobody re-derives them. Product framing lives in `docs/04-Master-Roadmap.md` (Sprints 2 and 5) and `docs/05-Design-System.md`; this section covers only the architectural implications.

### Food visual classification (Fuel — unscheduled)

Contextual food visuals need a stable answer to "what does this food look like," which provider data does not reliably supply — provider categories are commercial/nutritional taxonomies, not visual ones.

The likely shape is a mapping layer: `Food → Category → VITA illustration`, with a candidate category vocabulary of fruit · vegetable · burger · sandwich · bowl · taco · pizza · breakfast · oatmeal · bakery · drink · coffee · dairy · protein · snack · dessert. **Do not over-engineer this yet** — it is recorded as a consideration, not a design.

Two constraints that do carry over regardless of implementation:

- **Provider independence.** Resolution must degrade cleanly: real product image → VITA category illustration → generic food fallback. No screen may depend on a provider having supplied an image. USDA, Open Food Facts, restaurant providers, and custom foods all have inconsistent coverage, and a custom food has none by definition.
- **Classification belongs with the normalized model, not the adapters.** `VitaFood` is already provider-independent; a visual category is a property of the normalized food, derived once, rather than something each provider adapter invents differently.

### Water (Sprint 3)

**Built in slice 3.2 — see "Water architecture" above for what shipped.** The constraints below were the direction; they are recorded as met.

- The daily goal is **user-defined** with a unit (cups/oz/mL/L) — not a hardcoded 8 cups — and persists until changed. Where the preference is *stored* interacts with Settings (Sprint 7), which lands later; sequencing is an open question, not an assumption to make silently.
- Hydration is **date-aware in the same way food logging already is**: local-calendar day keys, daily rollover on `AppState` → `active`, today's intake separate from history. The `logDate` / `loggedAt` split and the versioned per-day storage keys in `src/lib/nutrition/data/keys.ts` are the working precedent — reuse the pattern rather than inventing a second date model.
- Persistence should sit behind a repository interface like `FoodLogRepository`, so Supabase later arrives as a second implementation without touching screens.

### Peptides (Sprint 3)

**Built in slice 3.5 (definitions and setups) — see "Peptides architecture" above for what shipped.** Log entries, the calculator, and injection sites remain slices 3.7, 3.6, and 3.8. The constraints below were the direction.

**Three separate concerns, not one record** — mirroring the Food Definition ≠ Food Entry separation already established in `src/lib/nutrition`:

| Concern | What it is |
|---|---|
| Peptide Definition | What the compound is — catalog entry or user-created Custom |
| User Peptide Setup | This user's configuration: vial strength, reconstitution volume, start date, typical dose, schedule |
| Peptide Log Entry | One recorded administration: dose, units, injection site, timestamp, notes |

Collapsing these would repeat exactly the mistake the nutrition model avoids: a log entry that mutates when a definition changes, and a definition that cannot be reused across entries.

**Calculator UX direction (recorded slice 3.5B, founder-approved, not implemented).** Vial Amount `10 mg` → Bacteriostatic Water / Reconstitution `1 mL` → **Amount Being Used** `2 mg` → Calculated Syringe Amount `20 units`, with the derivation `10 mg/mL · 2 mg = 0.2 mL = 20 units` and the U-100 assumption stated. The amount **originates from the user**; VITA returns the arithmetic equivalent and never selects it. "Amount to Convert" is acceptable if it reads better in the calculator itself. Never "recommended", "typical", "standard", or "suggested" dose.

**Dose math is safety-adjacent and must be treated as such.** The bidirectional calculator (vial amount + reconstitution volume ⇄ syringe units ⇄ mg/mcg) is the reason this feature exists for users who think in syringe units, so it has to be right and it has to be legible:

- **Normalize units internally.** mg · mcg · mL · syringe units, as typed values — never free-form strings for anything feeding a calculation.
- **Unit tests are a requirement, not a preference,** including rounding behavior and the round-trip property (units → dose → units). The testing-framework decision this used to depend on was made in slice 3.1 — `jest` + `jest-expo`, see the stack notes above — so the calculator slice inherits a working harness rather than choosing one.
- **Show the derivation, not just the answer.** A calculated dose the user cannot sanity-check is worse than no calculator.
- The entry snapshot principle applies here too: a log entry records the dose that was actually administered, and later edits to a vial setup must not silently rewrite history.

**Medical-content boundary.** Educational peptide information and any approved-vs-research distinction are content and compliance concerns, not engineering ones — they must be sourced and reviewed before implementation. Engineering's job is to keep the distinction representable in the data model (approval status is a field, not prose) rather than to author the content. Peptide data is also among the most sensitive VITA will hold; storage and disclosure posture must be settled before live data ships (see Vita HQ `04 Engineering/Supabase & Database.md`).
