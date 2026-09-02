# Sprint 4 — Settings + Tools & Reference
# Planning & Architecture Audit

**Status: ✅ FOUNDER-REVIEWED AND APPROVED — 2026-09-01**

*This document was written as a planning draft and is preserved as authored. The founders reviewed it, approved the sprint direction and the proposed 4.x sequence, and ruled on the decisions in §S; those rulings and the slice statuses now live in `docs/06-Slice-Tracker.md` → Sprint 4, which is the single source of truth for what is built. **Slice 4.6 was explicitly not committed** — it is reassessed after 4.5.*

*Nothing in `src/` was modified to produce this document.*

*Implementation status: §F (Settings scope) shipped in slice 4.1. §E's route recommendation — promoting Tools to a top-level `/tools` — was approved and shipped in slice 4.2, along with §D's one-screen two-section hub. §S.2, §S.3 and §S.4 are answered; §S.7 (Research Library vs Open Question #17) is still open and gates slice 4.5.*

| | |
|---|---|
| Prepared | 2026-09-01 |
| Repository | `/Users/wilber/vita-app` |
| Branch | `sprint-4-settings-tools-reference` (cut from `main`, identical to it) |
| HEAD | `8b8ec8d` — "docs: finalize Sprint 3 post-merge status" |
| Working tree | Clean |
| Baseline | `npx tsc --noEmit` clean · `npm test` 1093 passing / 40 suites |
| Preceded by | Sprint 3 — Water + Peptides, merged `2bac43b`, closed |

---

# A. Executive Recommendation

**Sprint 4 should be three things, in this order: fix Settings so it stops lying, give Tools & Reference a home that is honestly separate from Settings, and ship BMI as the proof that the home is worth opening.**

Everything else is negotiable. That sentence is the sprint.

Three findings drive the recommendation, and the third is the one that changes the plan most.

**1. Settings is not "a shell awaiting features." It is a screen that makes five false promises.** Of its eight rows, five render a navigation chevron and have no `onPress`. One of them, Units, states `"Imperial (lb, oz)"` — a preference VITA does not have, in units VITA does not use anywhere, contradicting a real unit preference that *does* exist and is stored under `vita:v1:water:prefs`. Version reads `"0.1.0 (Sprint 0)"` three sprints later. Sign Out is styled in the destructive red and calls a mock that does nothing. And the one preference that genuinely works — Appearance — **is not persisted**: `ThemeProvider` holds the mode in `useState('system')` with no storage, so every relaunch discards the user's choice. Settings is not empty. It is wrong, and it is the screen the Product doc names as where trust is won or lost.

**2. Tools does not belong under `/settings/`, and the route path is where that should be fixed.** The founder's §22 concern is already real in the codebase: the Peptide Calculator's route is literally `/settings/tools/peptide-calculator`. It is not a setting. Recommendation: promote to a top-level `/tools` route. Settings keeps the entry row — it stays the discovery path, exactly as the Product doc directs — but the address stops asserting that a calculator is a preference. Cost is genuinely small (3 `router.push` call sites, 2 test import paths). This is the one route change proposed, and it is narrow by design.

**3. The Food Scanner is roughly 70% built already, and nobody's planning documents say so.** `src/app/(vita)/fuel/scan.tsx` is a real, working camera barcode scanner shipped in Sprint 2 — permissions across all three states, torch, a synchronous scan lock, abort handling, GTIN normalization, and a sequential provider chain with **independent barcode identity re-verification**. `expo-camera@17.0.10` is already a dependency. The Innovation Lab note is right that "the difficulty is the score, not the scanning" — but it understates how much is done. What is missing from the data layer is small and precise: the Open Food Facts adapter requests seven fields and **does not request `ingredients_text`, `additives_tags`, `nova_group`, `nutriscore_grade`, `nutrient_levels`, or `allergens_tags`** — all available from the same endpoint, in the same request, at zero extra network cost.

That reframes the Food Scanner question. It is no longer "build a scanner." It is "extend one field list, model the result, and then decide what a score means." The first half is a cheap, low-risk slice that makes **Fuel** better whether or not a score ever ships. The second half is the genuinely hard, founder-gated part.

**So the recommendation is a split.** Sprint 4 takes the data half. The scoring half becomes its own sprint. Details in §H and §N.

**On Research Library:** its blocker is not engineering. It is Open Question #17, which is unresolved, and which the Sprint 3 closeout already recorded as a release gate over content that is *already shipping*. Sprint 4 should build the container and author nothing until #17 resolves. §I.

**Minimum Sprint 4 success, stated plainly:** every row in Settings does what it appears to do, Appearance survives a relaunch, Tools & Reference is a real destination with its own address, and BMI Calculator ships. That is a complete, coherent, shippable sprint even if the scanner and the library both slip.

---

# B. Existing Settings Audit

## B.1 Route and entry

Single route: [`src/app/(vita)/settings/index.tsx`](src/app/(vita)/settings/index.tsx) — 75 lines, no feature directory behind it. `src/features/settings/` **does not exist** (the Product doc's claim that it "exists but is empty" is stale).

Reached only from `ScreenHeader`'s gear, which is passed `settings` on exactly four screens — the four dock tabs (`dashboard`, `fuel`, `journey`, `atlas`). Stacked screens use `back` instead and have no gear. Placement matches the locked decision: top-right, never the dock.

Navigation is `router.push` onto the `(vita)` Stack, so Settings appears above the tabs without the dock. Back behavior is the platform default. Correct and unremarkable.

## B.2 Row-by-row inventory

| # | Row | Wired? | Verdict |
|---|---|---|---|
| 1 | **Profile** — `user.firstName` / `user.email` | ✗ chevron, no `onPress` | **Dead.** Renders mock auth data (`Wilber` / `wilber@vita.app` from `AuthProvider`'s `MOCK_USER`). Blocked on real auth. |
| 2 | **Notifications** | ✗ chevron, no `onPress` | **Dead.** No notification infrastructure exists — `expo-notifications` is not a dependency. |
| 3 | **Units** — subtitle `"Imperial (lb, oz)"` | ✗ chevron, no `onPress` | **Dead *and* false.** See B.3. |
| 4 | **Appearance** + `SegmentedTabs` | ✓ real, wired to `ThemeProvider` | **Works, but does not persist.** See B.4. |
| 5 | **Tools** → `/settings/tools` | ✓ real | Works. Placement is the §22 problem. |
| 6 | **Privacy & Data** | ✗ chevron, no `onPress` | **Dead.** No export/delete/reset exists. |
| 7 | **Version** — `"0.1.0 (Sprint 0)"` | n/a, static string | **Stale.** `package.json` says `1.0.0`; three sprints have shipped since. Hardcoded, not read from `expo-constants`. |
| 8 | **Sign Out** — `palette.fat` red | ✓ calls `signOut()` | **No-op.** `AuthProvider.signOut` is `async () => {}`. A destructive-styled control that silently does nothing. |

**Five of eight rows render a chevron with no destination.** `ListRow` passes `disabled={!onPress}` to `PressableScale`, so they are correctly non-interactive — but the chevron is drawn unconditionally from the `chevron` prop. The row *looks* tappable and is not. This is the junk-drawer failure mode the founder wants avoided, and it is already present, in its worst form: not clutter, but clutter that promises.

## B.3 The Units row is the most serious defect

`subtitle="Imperial (lb, oz)"` is wrong three times over:

1. **VITA has no pounds and no ounces-as-mass anywhere.** No weight unit model exists in `src/lib/`. `MassUnit` in the peptide model is `'mg' | 'mcg'` and describes a dose, not a body.
2. **It contradicts a real, persisted preference.** Water genuinely owns a `VolumeUnit` (`'ml' | 'l' | 'floz' | 'cup'`, defaulting to `floz`) stored at `vita:v1:water:prefs`. A user who set Water to millilitres sees Settings assert "Imperial" at them.
3. **It is a *fluid* ounce in Water, not a mass ounce.** The label conflates two different units that happen to share a word.

This is not a placeholder awaiting content. It is a factual claim about the user's configuration that is false at the moment it renders.

## B.4 Appearance works and does not survive a relaunch

[`src/theme/ThemeProvider.tsx:55`](src/theme/ThemeProvider.tsx:55):

```
const [mode, setMode] = useState<ThemeMode>('system');
```

No AsyncStorage read, no write, no hydration. The `Appearance.addChangeListener` wiring for `system` mode is correct and live, and light/dark switching genuinely works app-wide with no restart — that part is good. But the *choice* is session-local. A user who picks Dark gets Dark until they close the app.

This matters more than a typical missing-persistence bug because Appearance is currently **the only functioning preference in Settings**, and the sprint whose name begins with "Settings" is the right place to fix it. It is also the natural first consumer of the preference store §K proposes.

## B.5 Visual and theme conformance

Good, and worth stating plainly so the sprint does not "fix" what is not broken. Settings composes only shared primitives — `Screen`, `ScreenHeader`, `SectionHeader`, `ListRow`, `SegmentedTabs` — and owns exactly one style rule (a −8px pull on the Appearance picker). Every color reaches it through `useTheme().surfaces`, so Light/Dark is correct by construction. No hardcoded surface colors. No spacing overrides. The visual language is already right.

**The one deliberate exception is documented and correct:** the Appearance `SegmentedTabs` passes no `activeColor`, taking the neutral structural fill, because brand ink disappears against a near-black track. Leave it.

## B.6 What should stay, move, and go

| Item | Disposition |
|---|---|
| Appearance | **Stay** — and gain persistence |
| Version / About | **Stay** — and become real, from `expo-constants` |
| Units | **Stay as a section, rebuilt** — a real screen, delegating to Water's existing store (§K) |
| Tools entry row | **Stay as the entry point, move as a destination** — row remains in Settings, target becomes `/tools` |
| Profile | **Keep the row, remove the chevron** until auth is real — or drop it for the sprint |
| Notifications | **Remove for Sprint 4.** No infrastructure, no scope, and a dead row is worse than an absent one |
| Privacy & Data | **Decision needed** — see §S.5. Reset-data is genuinely buildable; export and delete are not, without a backend |
| Sign Out | **Remove for Sprint 4.** A destructive-red no-op on a single-user mock-auth app is pure liability |

---

# C. Existing Tools Audit

## C.1 Peptide Calculator — [`/settings/tools/peptide-calculator`](src/app/(vita)/settings/tools/peptide-calculator.tsx)

Built in slice 3.6, corrected by the 3.10 audit and 3.10A. **In good shape. Do not rebuild it.**

- **Domain logic is shared, not duplicated.** The screen owns only the two vial fields; the conversion, its validation, and its copy all come from `features/peptides/components/UnitConversion`, the same component `SetupForm` renders. There is exactly one calculator implementation in the app. This was a deliberate 3.10 fix and it held.
- **MG-only vial** (founder ruling, 3.10A) — the mg/mcg toggle was removed because a mis-selected unit produces a coherent-looking table wrong by 1000×. **Custom Amount keeps its mg/mcg choice**, correctly, because that is the amount being converted rather than the vial.
- **Nothing persists.** Component state only, dies with the screen. This is a recorded product stance, not an oversight — and it is the precedent BMI should follow (§G.4).
- Theme-correct throughout `useTheme().surfaces`; `Screen keyboardAware`; one `NumericKeyboardAccessory` serving every field; per-field validation that treats `"1."` as invalid rather than silently zero.
- Test coverage: `features/peptides/__tests__/UnitConversion.test.tsx` renders the real route component and asserts the Tools row navigates to it.

**Sprint 4 work: none required.** Only the route address changes if §E is approved.

## C.2 Injection Sites — [`/settings/tools/injection-sites`](src/app/(vita)/settings/tools/injection-sites.tsx)

Built across slices 3.8–3.8C. **Also in good shape.**

- **Read-only by design.** Tapping a zone records nothing; it filters history. The file's own header states it never recommends a site, never shows a "next" site, and never color-codes zones as good or bad. That boundary is deliberate and must survive any polish.
- Reads `usePeptideContext()` and aggregates **across every peptide**, resolving names from the compiled catalog so history survives a setup going inactive.
- `BodyMap` (front/back via `SegmentedTabs`) plus an accessible list fallback — each history row is one accessible node reading as a sentence rather than three disconnected stops.
- Covered by two route-level suites: `PeptideLogging.test.tsx` and `PeptideRoutines.test.tsx` both import the real route component.

**Sprint 4 work: none structural.** It is a Tool and a lens onto Peptides data simultaneously, which is fine — see §42/§O.

## C.3 Do the two tools share a pattern? Should a "Tool Detail shell" exist?

**They share screen chrome, and that chrome already exists. A `ToolScreen` wrapper should not be built.**

Both open `Screen` → `ScreenHeader title back` → content composed of `SectionHeader` + `Card`/`NumericField`. That is the app-wide stacked-screen pattern, not a Tools-specific one — Water's goal screen and Peptides' setup screens use the identical opening.

Below the header they diverge completely and correctly: one is a keyboard-aware numeric form, the other an interactive SVG figure with a filtered history list. A shared shell abstracting over those two would capture `<Screen><ScreenHeader/></Screen>` and nothing else — a wrapper whose entire body is two existing components. That is a duplicate component family, which CLAUDE.md rule 4 exists to prevent.

**What *is* worth extracting is the row, not the screen** — see §L.

## C.4 Does Settings expose Tools cleanly?

Partly. The row is well-written (icon, title, honest subtitle, `accessibilityHint`) and sits under its own `SectionHeader`. But:

- The section header reads **"Tools"** and the row inside it also reads **"Tools"** — a header labelling a single row of the same name is noise.
- Neither says "Reference," so the founder-approved sprint identity is nowhere in the UI.
- The subtitle, "Peptide calculator and other utilities," is vague where it could name the second tool.

## C.5 The Tools hub itself — [`/settings/tools`](src/app/(vita)/settings/tools/index.tsx)

One section, "Peptides," with two rows. Its header comment states the governing rule explicitly and correctly:

> **Built to grow, not padded to look full.** … Nothing is listed before it works — a dead button is worse than a short list.

**That rule is binding on Sprint 4** and settles §9's "should unfinished tools appear at all" question: no. No "Coming Later" badges, no disabled rows for the scanner or the library. It is also, notably, a rule Settings itself currently violates five times over.

---

# D. Recommended Information Architecture

## D.1 The distinction to make visible

- **Settings** — things you *change*. Preferences that alter how VITA behaves.
- **Tools** — things you *use*. Interactive utilities that compute or reveal something and then get out of the way.
- **Reference** — things you *read*. Static educational material.

Settings is the entry point for all three. It is the home of only the first.

## D.2 Recommended Settings IA

```
Settings
├─ PREFERENCES
│   ├─ Appearance        Light / Dark / System      [inline SegmentedTabs, persisted]
│   └─ Units             →  /settings/units
├─ TOOLS & REFERENCE
│   └─ Tools & Reference →  /tools
├─ DATA                                              [scope decision — §S.5]
│   └─ Reset Data        →  destructive confirm
└─ ABOUT
    ├─ Version           1.0.0 (build 12)            [real, from expo-constants]
    └─ About VITA        →  /settings/about          [stretch]
```

Four sections, every row live. Profile, Notifications, Privacy & Data and Sign Out are **removed for Sprint 4** and return when the features behind them exist. Removing four dead rows and adding one working screen makes Settings shorter *and* more capable — which is the correct shape for an anti-junk-drawer sprint.

## D.3 Recommended Tools & Reference IA

**One screen, two sections. Not two nested screens.**

```
Tools & Reference                                    /tools
├─ TOOLS
│   ├─ 🧮  Peptide Calculator   Convert vial and water into syringe units
│   ├─ 🧍  Injection Sites      Where you recorded each administration
│   └─ ⚖️  BMI Calculator       Height and weight to BMI and its range
└─ REFERENCE
    └─ 📚  Research Library     Storage, handling, and reconstitution basics
```

This directly answers §6. The founder-approved label **"Tools & Reference" is a screen title, not a route segment.** `SectionHeader` — already used exactly this way in Settings and in the Tools hub — carries the Tools/Reference distinction at zero navigational cost.

Depth comparison, counting from the gear:

| Structure | Taps to Calculator | Verdict |
|---|---|---|
| Today: `Settings → Tools → Calculator` | 3 | Works, but the address lies |
| Literal reading of §6: `Settings → Tools & Reference → Tools → Calculator` | 4 | **Rejected — too deep** |
| **Recommended: `Settings → Tools & Reference → Calculator`** | **3** | Same depth, honest address, both labels visible |

The recommended structure is no deeper than today's, exposes the approved label, and makes the Tools/Reference distinction visible on first open.

**Research Library then nests one level further** (`/tools/reference/[slug]`), which is correct: an article list *is* a genuine hierarchy, unlike an artificial "Tools" grouping screen holding one section.

---

# E. Navigation Recommendation

## E.1 Current route map (verified)

```
src/app/
├─ _layout.tsx                          root
├─ index.tsx                            auth gate
├─ (auth)/sign-in
└─ (vita)/_layout.tsx                   Stack, headerShown: false
    ├─ (tabs)/_layout.tsx               Tabs + FloatingDock
    │   ├─ dashboard  ├─ fuel  ├─ journey  └─ atlas
    ├─ fuel/          add · search · scan · manual · recent · favorites · log
    │                 food/[id] · entry/[id]
    ├─ water/         index · add · goal · entry/[id]
    ├─ peptides/      index · catalog · custom · catalog/[id]
    │                 log/[id] · routine/[id] · setup/[id](+log,history)
    └─ settings/      index
        └─ tools/     index · peptide-calculator · injection-sites
```

**Observations.**
- Consistent and healthy overall. One `Stack`, `headerShown: false` everywhere, `ScreenHeader` as the universal in-content header. No duplicate wrappers, no competing header systems.
- Everything is `push`. There are **no modal presentations anywhere**, including `fuel/scan`, which is full-bleed camera and behaves like one. Consistent, if conservative. Not a Sprint 4 problem.
- Naming is consistent (`kebab-case` files, `[id]` params, plural domains).
- **One genuine inconsistency:** `water/` and `peptides/` have an `index.tsx` and are entered from Home/quick actions; `fuel/` does not — Fuel is a tab, and `fuel/*` is only its sub-flows. That is correct, not a defect, and it is downstream of Open Question #4, which is a founder question and out of Sprint 4 scope.

## E.2 The one proposed change

**Move `settings/tools/*` → `tools/*` under `(vita)`.**

```
(vita)/
├─ settings/
│   ├─ index.tsx                        row: "Tools & Reference" → /tools
│   └─ units.tsx                        new
└─ tools/
    ├─ index.tsx                        "Tools & Reference"      [moved]
    ├─ peptide-calculator.tsx                                    [moved, unchanged]
    ├─ injection-sites.tsx                                       [moved, unchanged]
    ├─ bmi.tsx                                                   [new]
    └─ reference/
        ├─ index.tsx                                             [new, gated]
        └─ [slug].tsx                                            [new, gated]
```

**Why.** §22 asks for a hierarchy that makes "a calculator is not a preference" obvious. The strongest available statement of that is the address itself. `/settings/tools/peptide-calculator` says the calculator is a child of Settings; `/tools/peptide-calculator` says it is not.

**Cost (measured, not estimated).** Three `router.push` call sites, two test-file import paths, and `git mv` on three files whose contents are otherwise unchanged. It fits inside slice 4.2. It is narrow, not a broad route refactor.

**Why not a route group `(tools)`.** Groups exist to share a layout without appearing in the URL. There is no shared layout to give and the segment is wanted in the URL. A plain directory is correct.

**Why not a dock tab.** The dock is locked at four. The existing hub comment already reasons this out — Tools is "a drawer of utilities, not a fifth destination."

**This move requires founder approval** and is called out in §S.2. If declined, everything else in this plan still works unchanged at `/settings/tools`; only the address stays imperfect.

## E.3 Resulting user flow

```
Any tab → ⚙ gear → Settings → "Tools & Reference" → Tools & Reference
                                                       ├→ Peptide Calculator
                                                       ├→ Injection Sites
                                                       ├→ BMI Calculator
                                                       └→ Research Library → article
```

Back navigation is the platform default at every step. No modals introduced.

---

# F. Settings Scope — What Actually Gets Built

Stated concretely, per §53.

## ✅ In scope

| Area | Work |
|---|---|
| **Appearance persistence** | `ThemeProvider` hydrates from and writes to a preference store. Loading is handled without a light-mode flash before hydration. |
| **Units screen** (`/settings/units`) | Real screen. Water volume (delegating to `vita:v1:water:prefs` — **not** a second copy). Body weight (lb/kg) and height (ft-in/cm) for BMI. |
| **Dead-row removal** | Profile, Notifications, Privacy & Data, Sign Out removed. Or Profile retained without a chevron, if the founder prefers — §S.4. |
| **Version** | Real, from `expo-constants` (`expoConfig.version` + `ios.buildNumber`). |
| **Tools entry** | Row retitled "Tools & Reference"; redundant same-name section header dropped. |
| **Preference store** | One AsyncStorage-backed store under the existing `singletonKey` helper. §K. |

## 🤔 Founder decision — Data section

Reset Data is genuinely buildable in Sprint 4: every store is AsyncStorage under one `vita:v1:` prefix, and `allKeys` already exists in `lib/daily/storage.ts`. Export and Delete-account are not — neither has a destination without a backend. Recommendation: **Reset Data only, or nothing.** §S.5.

## ❌ Out of scope

Profile/account editing (blocked on real auth) · notification delivery (no `expo-notifications`, and the Product doc says explicitly it is "not automatically Sprint 4 scope") · data export · account deletion · Supabase · theme system redesign (it works; only persistence is missing).

---

# G. BMI Calculator — Plan

## G.1 UX

A single screen, `/tools/bmi`, following the Peptide Calculator's shape closely enough to feel like a sibling.

```
←            BMI Calculator

Enter your height and weight to see your BMI.
Nothing here is saved.

HEIGHT
[ 5 ] ft  [ 10 ] in            (⇄ cm)

WEIGHT
[ 178 ] lb                     (⇄ kg)

┌──────────────────────────────────────┐
│               25.5                   │
│            Overweight                │
│                                      │
│  ├──────┼────────┼────────┼──────┤   │
│  Under  Normal   Over    Obese       │
│  <18.5  18.5–25  25–30    30+        │
│              ▲                       │
└──────────────────────────────────────┘

BMI is a general screening measure based on height and
weight alone. It does not account for muscle mass, body
composition, age, or sex.
```

**Units.** Both systems supported. Default **imperial** — consistent with Water's `DEFAULT_VOLUME_UNIT = 'floz'` and its recorded "US-English V1" founder decision. Height as feet + inches (two fields) or centimetres (one); weight as lb or kg. Switching units **converts what is already entered** rather than clearing it.

**Tone — the part that matters most.** The Innovation Lab note is right that this is where a BMI feature goes wrong. Rules:
- The category is stated as **what the index says**, never as a verdict. "Overweight" is a band name on a standard chart, and the screen must read that way.
- **No congratulation, no warning, no advice.** No "great job," no "consider speaking with…", no target weight, no delta-to-normal.
- **No emoji, no smiley/frowny gradient, no red-to-green ramp.**
- One factual limitation note. **One** — not a disclaimer wall (§44).

## G.2 Domain model — `src/lib/bmi/`

Follows the established `model/ + data/ + state/` layout that Water and Peptides use.

```ts
// model/types.ts
export type HeightUnit = 'cm' | 'ftin';
export type WeightUnit = 'kg' | 'lb';

/** Canonical: centimetres. Conversion only at the edges. */
export type Height = { cm: number };
/** Canonical: kilograms. */
export type Weight = { kg: number };

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export type BmiResult = {
  value: number;          // one decimal for display, unrounded in storage
  category: BmiCategory;
  /** Position 0–1 on the rendered scale, for the marker. */
  scalePosition: number;
};
```

**Canonical units are metric** — for the same reason Water canonicalizes millilitres: BMI is *defined* as kg/m², so metric is the unit the arithmetic is already in. Imperial conversion happens at input and display only. **Never convert a rounded display value back into storage** — the Water rule, and it applies identically here.

```ts
// model/bmi.ts
export const KG_PER_LB = 0.45359237;   // exact by definition
export const CM_PER_IN = 2.54;         // exact by definition
export const IN_PER_FT = 12;

export function calculateBmi(height: Height, weight: Weight): number;
export function categorize(bmi: number): BmiCategory;
export function parseHeight(...): Height | null;   // null, never NaN
export function parseWeight(...): Weight | null;
```

Both conversion constants are **exact by international definition**, not approximations — worth pinning in a test, exactly as `ML_PER_FLOZ` is.

**Category boundaries** are the standard WHO adult ranges: `<18.5` · `18.5–24.9` · `25.0–29.9` · `≥30.0`. These are cited, not invented. Boundary handling must be explicit and tested — 25.0 is Overweight, not Normal.

**Validation** returns `null` rather than `NaN`, matching `parseAmount` in both Water and Peptides, so a failed parse can never be mistaken for zero.

## G.3 Explicit non-goals

- **No adult/child distinction.** Pediatric BMI requires age- and sex-specific percentile charts and is a different feature. The screen is for adults; if that needs stating, it is one clause in the limitation note.
- **No health-risk interpretation**, no ideal-weight range, no calorie implication.
- **No history, no chart, no trend.** That is Journey. §41.

## G.4 Persistence — the recommendation

**Persist the unit preference. Do not persist the values.**

| | Persisted? | Where | Why |
|---|---|---|---|
| Height/weight unit choice | ✅ Yes | app preference store | It is a *preference* — how you read numbers. Shared with Settings → Units. |
| Entered height | ❌ No | — | It is a *measurement*. Journey will own body metrics (Sprint 5). |
| Entered weight | ❌ No | — | Same. |
| BMI result | ❌ No | — | Derived; storing it creates a second thing that can disagree. |
| BMI history | ❌ No | — | **This is Journey.** §41. |

This line — *VITA remembers how you like to read numbers, never what your numbers were* — is clean, explains itself in one sentence, matches the Peptide Calculator's recorded "nothing is persisted" posture, and is precisely what keeps BMI from becoming a shadow Journey.

**The cost is honest and should be stated:** a returning user re-types their height. That is the correct trade for Sprint 4 — Journey owns stored height and latest weight from Sprint 5, and building a body-metrics store now would constrain a model that has not been designed. Re-entry for one sprint is cheaper than a migration and a duplicate source of truth.

## G.5 Visual design

**A horizontal spectrum with a marker.** Rejected alternatives: a dial or gauge (reads as a rating), a silhouette (§12 explicitly forbids stigmatizing body-shape visualization), and a colour ramp from green to red (encodes judgement in colour).

Specification:
- A single horizontal track, four labelled bands, boundaries at 18.5 / 25 / 30, with the numeric boundaries printed under the band names.
- The active band is distinguished by **fill weight and a label, not by hue.** Every band uses the same neutral family; the current one is emphasized.
- The marker is a clear vertical indicator with the BMI value above it.
- **Colour is never the only signal** (§36): the value, the category name, and the marker position all state the same fact independently. A colour-blind user and a screen-reader user each get the complete answer.
- Track ends are clamped — BMI 12 and BMI 60 both render on-scale rather than off the edge.
- Renders correctly in Light and Dark via `useTheme().surfaces`; no hardcoded backgrounds.

Built with `react-native-svg` (already a dependency, already used by `BodyMap`, `ProgressRing`, and `LineChart`) or plain flex-boxed `View`s. Prefer flex — the shape is rectangles, and it avoids an SVG dependency for something CSS-shaped.

## G.6 Accessibility

- Every input has an `accessibilityLabel` naming its unit ("Height in feet", "Weight in pounds") — the pattern the Peptide Calculator already uses.
- The result block is **one accessible node**: *"BMI 25.5. Overweight. Standard range 25 to 30."* — not three disconnected stops, matching the Injection Sites history rows.
- The scale graphic is `accessibilityElementsHidden` — it is a visual restatement of the text above it, and announcing four bands adds nothing.
- Unit toggles are `SegmentedTabs`, which already handles selected state and group labelling.
- `Screen keyboardAware` and one `NumericKeyboardAccessory`, as the Peptide Calculator does.

## G.7 Future Journey integration — the seam

The seam is `calculateBmi(height: Height, weight: Weight)`, a pure function over canonical units that **does not care where its arguments came from**. Sprint 5 supplies them from stored Journey data; Sprint 4 supplies them from two text fields. No coupling, no interface to design in advance, and no Journey import anywhere in `src/lib/bmi/`.

That is the whole abstraction. Anything more elaborate would be designing against a data model that does not exist.

---

# H. Food / Product Scanner — Plan

## H.1 What already exists (the central finding)

| Capability | Status | Location |
|---|---|---|
| Camera barcode scanning | ✅ **Shipped, working** | `app/(vita)/fuel/scan.tsx` |
| `expo-camera` dependency | ✅ Installed, `~17.0.10` | `package.json` |
| Camera permission — all 3 states | ✅ Undetermined / granted / blocked→Settings | `scan.tsx:161–196` |
| Torch, scan lock, abort handling | ✅ Ref-based lock, `AbortController` | `scan.tsx:71–74` |
| GTIN normalize + check-digit trace | ✅ | `lib/nutrition/providers/gtin.ts` |
| Barcode → product lookup | ✅ Sequential chain, OFF first | `providers/registry.ts:124` |
| **Barcode identity re-verification** | ✅ Rejects mismatched responses | `openFoodFacts.ts:266–277` |
| not-found vs error, with distinct recovery | ✅ | `scan.tsx:200–223` |
| Manual + search fallback | ✅ | `scan.tsx:216–217` |
| Nutrition per 100g + label serving | ✅ | `openFoodFacts.ts:79–132` |
| **Ingredients text** | ❌ **Not requested** | — |
| **Additives (`additives_tags`)** | ❌ **Not requested** | — |
| **NOVA processing group** | ❌ **Not requested** | — |
| **Nutri-Score** | ❌ **Not requested** | — |
| **Allergens** | ❌ **Not requested** | — |
| Evaluation / score | ❌ Does not exist | — |
| Explanation UI | ❌ Does not exist | — |

The scanning half is done, at production quality, with a subtle correctness guarantee (independent barcode re-verification) that most implementations lack.

## H.2 Data source — Open Food Facts can support this

The gap is a **field list**, not a provider. [`openFoodFacts.ts:49–57`](src/lib/nutrition/providers/openFoodFacts.ts:49) currently requests:

```
code, product_name, brands, image_front_small_url,
nutriments, serving_size, serving_quantity
```

The same `/api/v2/product/{gtin}.json` endpoint also serves, in the same request:

| Field | Gives |
|---|---|
| `ingredients_text` / `ingredients_text_en` | Full ingredient list |
| `ingredients_n`, `ingredients` | Structured ingredient array |
| `additives_tags` | E-numbers, tagged |
| `nova_group` | Processing level, 1–4 |
| `nutriscore_grade`, `nutriscore_score` | Nutri-Score A–E |
| `ecoscore_grade` | Environmental score |
| `nutrient_levels` | OFF's own low/moderate/high on fat, saturates, sugars, salt |
| `allergens_tags`, `traces_tags` | Allergens |
| `completeness` | **0–1 record-completeness signal** |

**Zero additional network cost. Zero new provider. Zero API key.** The Sprint 2 constraints — free providers only, no keys — hold completely.

`completeness` is worth calling out: the current adapter hardcodes `dataQuality: 70` with a comment saying "OFF exposes no per-record verification signal we can map onto this." **It does** — `completeness` is exactly that. A small, independently valuable correction to Fuel's search ranking.

**Licensing, unchanged and binding:** OFF data is ODbL, images CC-BY-SA. **Attribution is required wherever this data is shown** — which includes any evaluation surface built on it. The required custom `User-Agent` is already implemented, and the provider correctly reports itself unconfigured rather than sending a fake identifier when `EXPO_PUBLIC_OFF_CONTACT` is unset.

**Known gaps:** coverage is strong for packaged/branded goods and thin for fresh, regional, and store-brand products; per-record completeness varies widely; NOVA and Nutri-Score are themselves absent on many records. A scoring UI must handle "we do not know" as a **first-class result**, not an error.

## H.3 Architecture — one pipeline, two surfaces

**The single most important architectural ruling here: do not build a second Open Food Facts integration.**

```
                      ┌────────────────────────┐
                      │  lib/nutrition/        │
                      │  providers/            │   ← one adapter, extended
                      │  openFoodFacts.ts      │
                      └───────────┬────────────┘
                                  │  VitaFood + ProductInsight
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
         ┌────────────────────┐      ┌────────────────────┐
         │ Fuel               │      │ Tools              │
         │ scan → Food Detail │      │ scan → Product View │
         │ → log to a meal    │      │ → evaluation, no log│
         └────────────────────┘      └────────────────────┘
```

The new data becomes an **optional `ProductInsight` block on `VitaFood`**, populated by the product endpoint (barcode lookup) and absent from search results, exactly as `serving_size` already is. Nothing existing breaks; every consumer that ignores the field is unaffected.

**Answering §40 directly:**
- *Can a scanned product open Food Detail?* It already does — that is the current Fuel flow.
- *Can it be logged to Fuel?* Yes, unchanged.
- *Should scanning be reachable from Fuel as well as Tools?* **Yes, and it must stay in Fuel.** Removing it from the logging flow to make it a Tool would be a regression.
- *Utility or part of logging?* **Both, from one pipeline.** The camera screen and the provider layer are shared; only the destination after resolution differs, and that is already parameterized — `scan.tsx` carries a `meal` and a `from=scan` marker through every exit.
- *Recommendation:* the Tools entry is a **different destination for the same scanner**, not a second scanner.

## H.4 Scoring methodology — the real blocker

Per §15, all three options, assessed against what the repo can actually support.

### Option A — Surface existing third-party signals (Nutri-Score, NOVA, nutrient levels)

| | |
|---|---|
| **UX benefit** | Moderate. Recognized in Europe, largely unknown in the US. Nutri-Score's A–E is instantly legible; NOVA 1–4 needs explaining. |
| **Complexity** | **Low.** Field list + display. Days, not weeks. |
| **Data availability** | Nutri-Score/NOVA are absent on a meaningful share of US records. Many scans return "not rated." |
| **Explainability** | **Excellent, and it is not VITA's claim to defend.** "Open Food Facts rates this B" is attributable and sourced. |
| **Scientific/product risk** | **Lowest.** VITA reports, it does not assert. |
| **Legal/content review** | **Minimal** — attribution is already required by ODbL regardless. |

### Option B — A transparent VITA evaluation

| | |
|---|---|
| **UX benefit** | Highest — one branded answer, tuned to VITA's audience, available whenever the underlying nutrients are. |
| **Complexity** | **Very high.** Not the arithmetic — the *justification*. Every weight is a defensible product claim. |
| **Data availability** | Better than A: builds on raw nutrients, which are present far more often than Nutri-Score. |
| **Explainability** | Good if built for it from the start; the per-factor breakdown must be the primary output, not a footnote. |
| **Scientific/product risk** | **Highest.** A score is a claim about a product. It invites disputes from users and, at scale, from manufacturers. |
| **Legal/content review** | **Significant.** Needs a published, versioned methodology and review before public release. |

### Option C — Hybrid: VITA's evaluation, with third-party signals shown alongside

| | |
|---|---|
| **UX benefit** | Highest — one answer plus corroboration. |
| **Complexity** | Highest. Both, plus reconciling disagreement between them. |
| **Explainability** | Best *when they agree*. **Actively confusing when they disagree** — and they will. |
| **Risk** | Inherits Option B's, plus the burden of explaining a conflict. |

### Recommendation

**Sprint 4 builds the data layer and ships Option A. Option B becomes its own sprint, gated on a founder-approved written methodology.**

Reasoning: the Innovation Lab note already says the scoring methodology "does not exist and is the real blocker," and it is right. But that blocker sits entirely on the *evaluation*, not on the *data* — and the data extension is cheap, independently valuable to Fuel, and a strict prerequisite for Option B whichever way the founders eventually rule. Building it now costs little and buys the option.

**Do not invent a "VITA Score" inside Sprint 4.** §15 says founder approval is required before implementing a scoring methodology, and the honest engineering read agrees: a score shipped without a written, reviewed methodology is a claim VITA cannot defend the first time a user disagrees with it.

## H.5 Naming

Not renaming anything in code. For the founder's consideration only:

| Name | Note |
|---|---|
| **Scan** | Verb, short, matches the existing `fuel/scan` route. Vague on its own. |
| **Product Check** | "Check" implies looking something up, not grading it — **the safest** while methodology is unsettled. |
| **Food Check** | Same, but forecloses the non-food products the "product" half eventually implies. |
| **VITA Score** / **Food Score** | Strongest as a brand, and **the highest-commitment name.** A thing called a Score must have a defensible methodology on day one. |

**Recommendation: pick a "Check"-family name if Option A ships first**, and reserve a Score name for whenever an approved methodology exists. The name should not promise more than the methodology delivers.

## H.6 Permissions, privacy, offline and error states

**Privacy — already correct, and worth preserving explicitly.** The existing scanner: never stores an image, never writes the barcode to storage, keeps no scan history, and holds camera access only while the screen is mounted. The permission copy already states purpose plainly — *"VITA uses the camera to read food barcodes so you can log packaged foods without typing."*

**Recommendations (§39):** keep every one of those properties. **No scan history in Sprint 4** — it is the only part of scanning that would introduce data retention, it has no demonstrated user need, and once it exists it needs its own privacy story and delete control. Future work at most.

**States to design:**

| State | Handling |
|---|---|
| Camera permission undetermined | Explain purpose, then request. ✅ exists |
| Permission denied, re-askable | Re-request. ✅ exists |
| Permission blocked | Deep-link to iOS Settings. ✅ exists |
| Scanning / looking up | Scrim + spinner, handler detached. ✅ exists |
| Barcode not found | Manual-entry offer. ✅ exists |
| Lookup error (network) | Retry offer, distinct from not-found. ✅ exists |
| Offline | Currently surfaces as generic error. **Improve** — name the cause. |
| **Product found, insufficient data to evaluate** | ❌ **New, and the important one.** Show what is known; say plainly that there is not enough information to evaluate. Never fabricate. |
| **Product found, no third-party rating** | ❌ **New.** "Not rated by Open Food Facts" — an honest absence, not a failure. |
| No manual-barcode entry path | ❌ Missing. Search-by-name exists; typing a barcode does not. Minor. |

## H.7 Complexity verdict

**Recommendation: Option B from §50 — initial architecture in Sprint 4, full implementation later.**

Concretely: **the data layer lands in Sprint 4 as a stretch slice (4.6); the evaluation and its UX become Sprint 4.5 or a later sprint, gated on an approved methodology.**

Because the scanner already exists, this is not a hedge — it is a genuinely separable, genuinely valuable piece of work. The data slice makes Fuel better on its own (real ingredient lists, allergens, and a working `completeness` signal for search ranking) whether or not a score ever ships.

---

# I. Research Library — Plan

## I.1 The blocker is not engineering

**Open Question #17 is unresolved.** The Sprint 3 closeout recorded it as a **release gate**: the 96 catalog entries and their research content are engineering-authored and have never had medical, content, or legal review. The Innovation Lab note marks Research Library **🔴 Blocked** for the same reason.

A Research Library makes that gate larger, not smaller. **No reference content should be authored in Sprint 4 until #17 resolves.**

The container can be built. The content cannot.

## I.2 Overlap with the 96-entry catalog — verified, and it is zero

Searched every definition file for storage, handling, reconstitution, and refrigeration guidance. **Three incidental matches, none of them reference content**: one mention that an oral compound needs no refrigeration, and two mechanism titles reading "Handling energy from food."

The catalog covers *what a compound is* — identity, classification, `compoundType`, `evidenceLevel`, research areas, claims, mechanisms, development status, targets, sources. It says **nothing** about how to store one, what reconstitution means, or how stability works.

**The proposed Research Library is entirely additive.** No duplication risk on today's content.

## I.3 The rule that prevents future duplication

**Compound-specific facts live in the catalog. General procedural knowledge lives in the Library. Neither repeats the other.**

Applied to §20's questions:

- *Should storage guidance be general rather than repeated 96 times?* **Yes, emphatically.** "What bacteriostatic water is" is one article, not 96 paragraphs. Repeating it 96 times means reviewing it 96 times, and 96 chances to drift.
- *Are there compound-specific storage differences?* Yes — lyophilized versus solution, and cold-chain-dependent products differ genuinely. **The right shape is a general article plus, later, an optional per-definition exception field** on `PeptideResearchInfo`, populated only where a compound genuinely differs and only after review. Not Sprint 4.
- *Should Research Library link into peptide detail?* **Yes** — via `relatedPeptides` on an article, resolved against the catalog.
- *Should peptide detail link out to reference articles?* **Yes, and this is the higher-value direction** — a user reading about Semaglutide is exactly the person who wants "Storage & Handling." One `SectionHeader` + `ListRow` block at the foot of the detail screen. Cheap.
- *Shared search with the catalog?* **No.** Separate. §M.5 — merged search over compounds and articles produces a result list with two incomparable kinds of row, and the catalog's search is already tuned for names and aliases.

## I.4 Content storage strategy (§33)

**Recommendation: static local TypeScript, exactly as the peptide catalog is.**

| Option | Verdict |
|---|---|
| **Static local TypeScript** | ✅ **Recommended.** Offline by default · type-safe · **testable** · versioned in git · reviewable as a diff |
| Markdown assets | ❌ Needs a renderer dependency, loses type safety, and content tests would parse strings |
| Remote content | ❌ Needs a backend, breaks offline, and puts unreviewed content one deploy away from users |

The decisive argument is **testability**. Sprint 3's content tests — no dosing language, no recommendation phrasing, no guarantees, every time-sensitive claim dated and sourced — are build-failing and were the mechanism that kept careful writing from drifting. Those tests exist because the content is typed TypeScript. Markdown or remote content would forfeit that protection on the most safety-sensitive content in the product.

Remote content is a later option and does not need designing now.

## I.5 Content metadata model (§34)

```ts
export type ReferenceArticle = {
  id: string;                    // 'reference:storage-handling'
  slug: string;                  // URL segment
  category: ReferenceCategory;
  title: string;
  summary: string;               // one or two lines, for the list row
  sections: ReferenceSection[];
  /** Carried forward from Sprint 3 — mandatory on time-sensitive content. */
  lastUpdated: string;           // 'July 2026'
  sources?: ResearchReference[]; // REUSED from the peptide model
  status: 'published' | 'draft'; // draft never renders in production
  relatedPeptides?: string[];    // catalog definition ids
};
```

**`ResearchReference` is reused, not redefined** — the same type the catalog uses, carrying the same rule: pointers into PubMed / ClinicalTrials.gov / Drugs@FDA, **never hand-written citations**. A hand-written PMID that turns out to be the wrong paper is worse than no citation.

`status: 'draft'` is the mechanism that lets structure ship while #17 is open — the container exists, articles can be drafted in-repo, and nothing unreviewed reaches a user.

## I.6 Proposed taxonomy (illustrative, needs founder + review sign-off)

```
Research Library
├─ Getting Started          What this library is, and is not
├─ Storage & Handling       Lyophilized vs reconstituted, temperature, light, travel
├─ Reconstitution Basics    What it means, what bacteriostatic water is, the arithmetic
│                           → links to the Peptide Calculator
├─ Stability & Shelf Life   General principles, what shortens it
├─ Research & Approval      Reading development status; approved vs investigational
└─ Glossary                 Peptide, protein, small molecule, agonist, half-life…
```

**Glossary is the safest possible first article** and the strongest candidate to ship first: definitional, non-prescriptive, and it directly serves the existing catalog, whose pages already use `compoundType` and `evidenceLevel` terminology a general reader will not know.

**Reconstitution Basics is the highest-value** and pairs naturally with the Peptide Calculator — the one place in the app where a user is already doing that arithmetic.

## I.7 Safety boundary (§19) and disclaimer strategy (§44)

**The binding boundary, unchanged:** VITA helps users understand, calculate, organise and track information they enter. It does not become a treatment recommendation engine. No dose ranges, no protocols, no cycle lengths, no "typical" amounts — in any article, in any phrasing, under any heading.

**Disclaimer pattern — three tiers, no walls:**

1. **Library level, once.** One short paragraph on the Research Library index. Educational reference; not medical advice; VITA does not recommend compounds, doses, or protocols.
2. **Article level, structural rather than prose.** `lastUpdated` and `sources` rendered as metadata in the footer. That *is* the disclosure — it says what the content is and where it came from without a paragraph of defensive text.
3. **Claim level, inline qualifiers.** The Sprint 3 pattern: "Clinical studies have reported…", "Animal research has suggested…" — qualification attached to the individual claim, never laundered into a page badge.

**No article opens with a wall of CYA text.** The Injection Sites screen is the model to follow — one quiet line, once, at the foot: *"For tracking and anatomical reference only."*

**Automated content tests are non-negotiable**, extending the Sprint 3 suite to the new content: no dosing language, no recommendation phrasing, no guarantees, `lastUpdated` present on every article, every source a database pointer, `relatedPeptides` resolving to real catalog ids.

## I.8 Placement recommendation (§51)

**Architecture + Glossary only. Content ships when review allows.**

Concretely: build the model, the route, the list, the article renderer, and the content tests. Author **Glossary** — the lowest-risk article in the set — and route it through whatever review #17 establishes. Everything else stays `status: 'draft'`.

If #17 does not resolve during Sprint 4, the sprint ships the container with one article, or with none, and neither outcome blocks anything else. **Engineering workload here is genuinely small; content-review workload is the whole cost, and it is not engineering's to spend.**

---

# J. Dashboard Discoverability (§23, §52)

**Recommendation: not Sprint 4. Revisit at Sprint 8, and only if a real problem is observed.**

Three reasons.

1. **Home is already dense.** Six stacked sections — HomeHeader, HomeSummaryCard, JourneyCard, MacrosCard, Health Metrics, Today's Meals. A seventh entry point competes with all of them for a surface the founders have twice asked to leave alone.
2. **The problem is not yet proven to exist.** The Innovation Lab note says it correctly: *"Build the Tools destination first, then evaluate whether discoverability is actually a problem before designing a solution to it."* Sprint 4 is the sprint that creates the thing whose discoverability is in question. Solving discoverability in the same sprint means solving it before anyone has tried to discover it.
3. **Home is the visual source of truth, not a launcher.** That standing rule is the whole reason the dock is locked at four.

**Classification: future recommendation, evaluated at Sprint 8 with real usage behind it.** If it does eventually happen, the most defensible form is contextual — surfacing the Peptide Calculator to someone with an active routine and nothing to anyone else — because that earns the space rather than claiming it.

---

# K. Unit & Preference Architecture (§24, §25)

## K.1 What exists today

| Domain | Unit type | Persisted? | Key |
|---|---|---|---|
| Water | `VolumeUnit` (`ml`/`l`/`floz`/`cup`) | ✅ Yes | `vita:v1:water:prefs` |
| Peptides | `MassUnit` (`mg`/`mcg`) | Per setup, not a preference | within setups |
| Nutrition | grams / kcal, fixed | n/a | — |
| Journey | `lb`, hardcoded in fixture | ❌ mock only | — |
| **Body weight** | ❌ **does not exist** | | |
| **Height** | ❌ **does not exist** | | |
| Appearance | `ThemeMode` | ❌ **No — the bug in B.4** | — |

**There is no app-wide preference store.** Water built its own, correctly, under the shared `singletonKey` helper.

## K.2 Recommendation — a shared store that does not seize what already works

Create `src/lib/preferences/` holding **app-level preferences only**:

```ts
export type AppPreferences = {
  themeMode: ThemeMode;      // fixes B.4
  weightUnit: WeightUnit;    // 'lb' | 'kg'   — BMI, and Journey later
  heightUnit: HeightUnit;    // 'ftin' | 'cm' — BMI
};
```

Stored at `vita:v1:settings:prefs`, via the existing `singletonKey('settings', 'prefs')`. One repository interface, one AsyncStorage implementation, matching `WaterRepository`'s shape exactly — async throughout, so a networked implementation is later a drop-in.

**Water's volume unit stays exactly where it is.** This is not a preference; it is the closed ruling on Open Question #16 (resolved 2026-08-21, shipped in slice 3.3): *Settings reads and writes that same source rather than creating a second one that can disagree with it.*

So Settings → Units renders two groups from two stores:

```
UNITS
  Water          [ fl oz | cups | mL | L ]    → vita:v1:water:prefs   (Water's store)
  Body weight    [ lb | kg ]                  → vita:v1:settings:prefs (new)
  Height         [ ft/in | cm ]               → vita:v1:settings:prefs (new)
```

Two stores behind one screen is the correct outcome, not a compromise. The alternative — migrating Water's key into a combined store — is a migration over data already on users' devices, to fix nothing a user can perceive, against an explicit founder ruling.

## K.3 Why not per-domain units for BMI

Because BMI needs weight, Journey (Sprint 5) will need weight, and a user who sets pounds in one place and finds kilograms in the other has been failed by the architecture. **Body weight is the first genuinely cross-domain unit in VITA**, which is exactly what justifies a shared store now — and equally why the store should hold *only* what is genuinely cross-cutting. Peptide `MassUnit` stays per-setup; a vial is not a body.

## K.4 Note

`WaterRepository`'s header says *"Settings in Sprint 7 will read and write this same source."* Sprint 7 is now Atlas. A one-line comment correction, when slice 4.1 touches that area.

---

# L. Visual System (§21)

## L.1 What is already coherent

Genuinely good, and the sprint should extend it rather than reinvent it. `ListRow` is used identically in Settings, the Tools hub, Fuel, Water, and Peptides — same 36px `IconBadge` in a 10%-alpha tint of its own color, same `bodyMedium` title, `caption` subtitle, trailing value + chevron, same card radius, border, and shadow. `SectionHeader` is uppercase micro type with 0.8 letter-spacing everywhere. Every screen opens `Screen` → `ScreenHeader`. Colour reaches everything through `useTheme().surfaces`.

## L.2 Icon-colour convention — the one real inconsistency

`ListRow` defaults `iconColor` to `palette.primary` (Fuel orange). Settings' rows therefore render **orange badges on a Settings screen**, while the Tools hub explicitly passes `palette.peptide` for both of its rows.

The result: Settings' Appearance icon is Fuel orange for no reason, and the two current Tools are purple because they happen to be peptide tools — which will not generalize when BMI and a scanner arrive.

**Recommended convention:**

| Context | Icon colour | Rationale |
|---|---|---|
| Settings preference rows | Neutral — `surfaces.textSecondary` | Preferences belong to no domain |
| Tool row, domain-owned | That domain's colour | Peptide Calculator + Injection Sites → `palette.peptide`; a food scanner → `palette.primary` |
| Tool row, domain-neutral | Neutral, or a single Tools accent | BMI belongs to no domain |
| Reference rows | Neutral | Reference is cross-cutting |

This needs one optional prop or one convention note — **not a new component.**

## L.3 Recommended reusable patterns

| Need | Recommendation |
|---|---|
| Settings rows | **`ListRow` unchanged.** Already correct. |
| Tool rows | **`ListRow` unchanged**, with the icon-colour convention above. |
| Reference rows | **`ListRow` unchanged** — title + summary maps exactly onto title + subtitle. |
| Tool detail screens | **No shell.** `Screen` + `ScreenHeader` already is the shell. §C.3. |
| Section grouping | **`SectionHeader` unchanged** — this is what carries Tools vs Reference. |
| BMI scale | **One new component**, `features/tools/components/BmiScale`. Genuinely novel; nothing existing renders a banded spectrum. |
| Settings inline control | **`SegmentedTabs` unchanged** — the Appearance pattern extends directly to the unit toggles. |

**One new component in the entire sprint.** That is the correct number, and it is the measure of how well the existing system holds.

## L.4 Light/Dark (§37)

Audited: **no theme defects found in Settings or either Tool.** Every color is read through `useTheme().surfaces` or is a deliberately theme-invariant brand/domain token. No hardcoded surface values. No early cleanup items required.

Two rules for new surfaces: (1) `BmiScale` must derive its track and band fills from `surfaces`, never from fixed hexes — a track that works on cream will vanish on near-black; (2) any new `SegmentedTabs` in Settings follows the Appearance precedent and passes **no `activeColor`**.

---

# M. Risks — Ranked Register

| # | Risk | Sev | Like | Mitigation | Blocks |
|---|---|---|---|---|---|
| **1** | **Scope overrun.** Seven candidate areas, two of them (scanner, library) individually sprint-sized. | **High** | **High** | Adopt the §N classification. Cut scanner scoring and library content *now*, at planning, not in week three. | **Planning — needs the §N ruling before slice 1** |
| **2** | **Research Library content ships without medical/legal review.** #17 is unresolved and already a release gate on *existing* content. | **High** | Medium | Container only. `status: 'draft'` gates rendering. Content tests extended. Author only Glossary, only if reviewed. | **Implementation — 4.5 cannot author content until #17 resolves** |
| **3** | **A food score becomes a claim VITA cannot defend.** An unmethodical score invites user and, at scale, manufacturer dispute. | **High** | Medium | Do not build one in Sprint 4. Option A only. Written, approved, versioned methodology before any Option B work. | **Implementation — blocks scoring, not the data layer** |
| **4** | **Settings' dead rows survive the sprint.** The junk drawer the founder wants avoided is already here; a sprint that adds Tools without removing them makes it worse. | **High** | Low | Slice 4.1 removes them explicitly. Founder ruling on Profile / Privacy / Sign Out — §S.4, §S.5. | Planning — needs a founder ruling |
| **5** | **Theme persistence introduces a launch flash.** A naive async hydrate renders light-mode first, then snaps. | Medium | **High** | Hold initial render until the preference resolves, or default to `system` (already correct at first launch) and swap only on a real stored value. Device-verify in both themes. | No |
| **6** | **OFF data completeness disappoints.** Ingredients and NOVA are missing on many US records; a scanner that half-works reads as broken. | Medium | **High** | Use `completeness`. Design "not enough information" as a first-class state. Set expectations in copy. | No — but it constrains the eventual scoring UX |
| **7** | **Water's unit preference gets duplicated** into a combined store, violating the #16 ruling and creating two sources that can disagree. | Medium | Medium | §K.2 is explicit: Settings delegates to `vita:v1:water:prefs`. A test should assert Settings writes that key, not a copy. | No |
| **8** | **BMI drifts into Journey.** "Just remember the last weight" becomes weight history becomes a chart. | Medium | Medium | §G.4's line is binding: preferences persist, measurements do not. | No |
| **9** | **Route move breaks deep links or tests.** | Low | Low | 3 push sites, 2 test imports, all statically known. Typecheck + suite catch it immediately. | No |
| **10** | **Duplicated OFF integration** — a Tools scanner built parallel to Fuel's. | Medium | Low | §H.3 is explicit: one adapter, one pipeline, two destinations. | No |
| **11** | **Camera in Expo Go / production.** | Low | Low | **Already proven** — `expo-camera` ships in SDK 54 and the scanner is device-verified from Sprint 2. Listed only to close it out. | No |
| **12** | **BMI tone reads as judgement.** | Medium | Low | §G.1 and §G.5 rules. Founder review of the exact copy before approval. | No |
| **13** | **Sprint-3 lesson repeated: helper tests without route coverage.** | Medium | Medium | §Q mandates route-level tests per slice, following `WaterRoutes.test.tsx`. | No |

**Two risks block planning and need founder rulings before slice 4.1 opens: #1 (scope) and #4 (dead rows).** #2 and #3 block specific late slices, not the sprint.

---

# N. Scope Classification

| Feature | Class | Reasoning |
|---|---|---|
| **Settings foundation + IA** | 🟢 **MUST** | The sprint is named for it, and it is currently wrong rather than merely incomplete |
| **Theme persistence** | 🟢 **MUST** | The only working preference does not survive relaunch |
| **Preference store + Units screen** | 🟢 **MUST** | BMI depends on it; the false "Imperial (lb, oz)" row depends on it |
| **Dead-row removal** | 🟢 **MUST** | Directly the §22 mandate |
| **Real version info** | 🟢 **MUST** | Trivial, and currently wrong |
| **Tools & Reference hub** | 🟢 **MUST** | The sprint's second named half |
| **Route move to `/tools`** | 🟢 **MUST** (pending §S.2) | Cheap, and the clearest statement of the Settings/Tools distinction |
| **BMI Calculator** | 🟢 **MUST** | The only genuinely new user-facing feature that is unblocked, well-understood, and low-risk. It is what makes the sprint feel like a sprint. |
| **Existing Tools polish** | 🟡 **SHOULD** | Both are in good shape; work is discoverability and the icon convention, not rebuilding |
| **Research Library architecture** | 🟡 **SHOULD** | Container is small and unblocked; content is not |
| **Research Library — Glossary** | 🟠 **STRETCH** | Only if #17 resolves and review capacity exists |
| **Product data layer (OFF fields + `ProductInsight`)** | 🟠 **STRETCH** | Cheap, independently valuable to Fuel, prerequisite for any future scoring |
| **Research Library — remaining articles** | 🔴 **DEFER** | Blocked on #17 and review capacity |
| **Food scanner evaluation + UX** | 🔴 **DEFER** | Needs an approved methodology; own sprint |
| **Dashboard Tools shortcut** | 🔴 **DEFER** | Sprint 8 at the earliest, if ever — §J |
| **Notification delivery** | 🔴 **DEFER** | No infrastructure; Product doc says not automatically Sprint 4 |
| **Profile / account editing** | 🔴 **DEFER** | Blocked on real auth |
| **Data export / account deletion** | 🔴 **DEFER** | No backend destination |
| **Supabase** | 🔴 **DEFER** | Explicitly out of scope |

---

# O. Proposed Slice Plan

**All slices are DRAFT and require founder approval.** Each follows the Build Handbook's ten-step lifecycle.

---

## Slice 4.1 — Settings Foundation & Preference Store

**Purpose.** Make every row in Settings do what it appears to do, and give the app its first real preference store.

**Touches.** `src/lib/preferences/` (new: `model/types.ts`, `data/PreferencesRepository.ts`, `data/asyncStorageRepository.ts`, `data/keys.ts`, `state/usePreferences.ts`) · `src/theme/ThemeProvider.tsx` · `src/app/(vita)/settings/index.tsx`

**Data.** New singleton `vita:v1:settings:prefs` holding `{ themeMode, weightUnit, heightUnit }`. **No migration** — absent key resolves to documented defaults. **Water's key is not touched.**

**Dependencies.** None. First slice.

**Acceptance.**
- Appearance choice survives a full app restart, in all three modes.
- `system` mode still tracks live OS appearance changes with no restart.
- No light-mode flash on launch when Dark is stored.
- Version reads real values from `expo-constants`.
- Profile, Notifications, Privacy & Data and Sign Out resolved per the §S.4/§S.5 rulings — **no row renders a chevron without a destination.**
- Typecheck clean; suite green; new repository tests pass.

**Risks.** #5 (launch flash) · #4 (rulings needed first).

**Out of scope.** The Units *screen* (4.2) · Tools changes (4.3) · anything visual beyond removing rows.

---

## Slice 4.2 — Units Screen

**Purpose.** Replace the false `"Imperial (lb, oz)"` row with a real screen, delegating to Water's existing store rather than duplicating it.

**Touches.** `src/app/(vita)/settings/units.tsx` (new) · `settings/index.tsx` (row → route) · `src/lib/preferences/`

**Data.** Reads/writes **both** stores: `vita:v1:water:prefs` (Water's repository, unchanged) and `vita:v1:settings:prefs`.

**Dependencies.** 4.1.

**Acceptance.**
- Water unit changed here is reflected on the Water screen, on Home's water tile, and in Fuel's Hydration module — **one source of truth, provably**.
- A test asserts Settings writes `vita:v1:water:prefs` and **does not** create a parallel key.
- Body-weight and height preferences persist and are read by BMI in 4.4.
- Light/Dark correct; every control has an accessibility label.

**Risks.** #7 (duplicating Water's preference).

**Out of scope.** Any unit VITA does not use. No energy-unit preference (kJ) — nothing requests it.

---

## Slice 4.3 — Tools & Reference Hub

**Purpose.** Give Tools its own address and its own identity, with the Tools/Reference distinction visible.

**Touches.** `git mv` of three files `settings/tools/*` → `tools/*` · `settings/index.tsx` (row retitled, target updated) · `tools/index.tsx` (title "Tools & Reference", section headers) · 2 test import paths

**Data.** None.

**Dependencies.** 4.1. Requires the §S.2 ruling.

**Acceptance.**
- `/tools` renders with a TOOLS section; REFERENCE appears only once something real sits in it (the hub's own "nothing is listed before it works" rule).
- Both existing tools work identically at their new addresses — **no behavioural change**.
- Existing route tests pass with only import paths edited.
- Back navigation from a tool returns to the hub; from the hub, to Settings.
- Icon-colour convention (§L.2) applied.

**Risks.** #9 (low).

**Out of scope.** Rebuilding either tool. New tools. Any Dashboard entry point.

---

## Slice 4.4 — BMI Calculator

**Purpose.** The sprint's new user-facing feature, and the proof that Tools is worth opening.

**Touches.** `src/lib/bmi/` (new: `model/types.ts`, `model/bmi.ts`, `index.ts`) · `src/app/(vita)/tools/bmi.tsx` (new) · `src/features/tools/components/BmiScale.tsx` (new) · `tools/index.tsx` (row)

**Data.** **None persisted.** Unit preferences are read from 4.1's store; values are component state.

**Dependencies.** 4.1 (units), 4.2 (unit UI), 4.3 (hub).

**Acceptance.**
- Correct BMI for known imperial and metric pairs, verified against published values.
- Boundary behaviour explicit and tested: 18.5, 25.0, 30.0 fall on the documented side.
- Conversion constants exact (`0.45359237`, `2.54`) and pinned by test.
- Unit switch **converts** existing input rather than clearing it.
- Invalid input returns `null`, never `NaN`, and never renders as zero.
- Scale marker clamps at both ends (BMI 12 and BMI 60 both render on-scale).
- Result is one accessible node reading as a sentence.
- **Category never rendered by colour alone.**
- **Copy contains no advice, no congratulation, no warning, no target weight.**
- Light/Dark correct.

**Risks.** #8 (Journey drift) · #12 (tone).

**Out of scope.** Persistence of values · history · charts · Journey integration · pediatric BMI · body-fat or ideal-weight estimation.

---

## Slice 4.5 — Research Library Foundation *(conditional on §S.7)*

**Purpose.** Build the container. Author nothing that has not been reviewed.

**Touches.** `src/lib/reference/` (new: model, content, index) · `src/app/(vita)/tools/reference/index.tsx` + `[slug].tsx` (new) · `src/lib/reference/__tests__/content.test.ts` (new) · `tools/index.tsx` (REFERENCE section)

**Data.** Static compiled TypeScript. Nothing persisted. Nothing fetched.

**Dependencies.** 4.3. **Gated on Open Question #17 for any content at all.**

**Acceptance.**
- Model, routes, list and article renderer complete and typed.
- `status: 'draft'` articles never render in a production build.
- Content tests extend the Sprint 3 suite: **no dosing language, no recommendation phrasing, no guarantees**; `lastUpdated` present; every source a database pointer; `relatedPeptides` resolve to real catalog ids.
- **Zero duplication with the 96 catalog entries** — asserted by test where feasible.
- If #17 resolves: Glossary ships, reviewed. If not: the container ships with no published article, and the REFERENCE section does not appear.
- One concise library-level notice. **No per-article disclaimer walls.**

**Risks.** #2 — highest content risk in the sprint.

**Out of scope.** Any dose or protocol content, in any form · compound-specific storage exceptions · search · remote content · peptide-detail cross-links (4.7).

---

## Slice 4.6 — Product Data Layer *(stretch)*

**Purpose.** Extend the Open Food Facts adapter to carry the information a future evaluation needs — and that Fuel benefits from today.

**Touches.** `src/lib/nutrition/providers/openFoodFacts.ts` (field list + mapping) · `src/lib/nutrition/model/types.ts` (`ProductInsight`, optional on `VitaFood`) · `src/app/(vita)/fuel/food/[id].tsx` (display ingredients/allergens) · provider tests

**Data.** No new storage. No new provider. **No API key.** The existing cache carries the richer record automatically.

**Dependencies.** None on other 4.x slices — genuinely independent, which is what makes it a safe stretch.

**Acceptance.**
- Ingredients, additives, NOVA, Nutri-Score, nutrient levels and allergens parsed when present, **absent-not-zero when missing** (the adapter's existing rule).
- `dataQuality` derived from the real `completeness` field, replacing the hardcoded `70`.
- Existing barcode identity re-verification **unchanged and still passing**.
- Search results unaffected (the extra fields come from the product endpoint only).
- **ODbL attribution rendered wherever the new data is shown.**
- **No score, no evaluation, no rating computed by VITA.**

**Risks.** #6 (completeness) · #10 (mitigated by construction — one adapter).

**Out of scope.** **Any scoring or evaluation.** Any Tools scanner entry point. Scan history. New providers.

---

## Slice 4.7 — Integration & Polish

**Purpose.** Make the pieces feel like one product.

**Touches.** `tools/index.tsx` · `peptides/catalog/[id].tsx` (reference cross-links, if 4.5 published anything) · `settings/index.tsx` · minor copy across new surfaces

**Dependencies.** 4.1–4.6.

**Acceptance.**
- Consistent iconography, spacing and copy across every Settings and Tools surface.
- Peptide detail links to relevant reference articles **only where they exist** — no dead links.
- Reconstitution Basics links to the Peptide Calculator, if published.
- Every new surface verified in Light and Dark on a real device.
- No orphan routes; no unreachable screens.

**Out of scope.** New features. Dashboard entry points.

---

## Slice 4.8 — Sprint Audit

**Purpose.** The Sprint 3 closeout pattern, which found nine defects.

**Covers.** Full route sweep · placeholder re-audit — **zero rows with a chevron and no destination** · theme audit of every new surface · accessibility pass · `npx tsc --noEmit` and `--noUnusedLocals --noUnusedParameters` clean · full suite green · `npx expo export --platform ios` succeeds · device QA per §R · docs updated per the Documentation Rules · findings to `docs/07-Audit-Log.md`.

---

### Sequencing

```
4.1 Settings Foundation ──┬── 4.2 Units ──┐
                          │               ├── 4.4 BMI ──┐
                          └── 4.3 Hub ────┴── 4.5 Reference ─┤── 4.7 Polish ── 4.8 Audit
                                                             │
                              4.6 Product Data (independent) ┘
```

4.6 has no dependency on any other slice and can be dropped wholesale without disturbing the sequence — which is precisely what makes it the right stretch item.

---

# P. Sprint 4 MVP — The Completion Threshold

**Sprint 4 is complete when 4.1 through 4.4 and 4.7–4.8 are founder-approved.**

Stated as user-visible outcomes:

1. **Every row in Settings does what it appears to do.** No chevron without a destination.
2. **Appearance survives a relaunch.**
3. **Units is a real screen**, and changing the water unit there changes it on the Water screen, on Home, and in Fuel — one source of truth.
4. **Tools & Reference is a real destination** with its own address, holding the two existing tools plus BMI, with the Tools/Reference distinction visible.
5. **BMI Calculator works**, in both unit systems, with a clear neutral visual scale, saving nothing.
6. **Version information is real.**

**That is a complete, coherent, shippable sprint with the Research Library and the Food Scanner both absent.** Neither is load-bearing for it.

The founder asked for a practical answer rather than "everything depends," so: **if only one thing ships beyond the Settings cleanup, it should be BMI.** It is unblocked, low-risk, well-understood, and it is what turns Tools from a peptide drawer into a destination.

---

# Q. Test Strategy

**The Sprint 3 lesson, carried forward: pure helper tests are not enough.** `WaterRoutes.test.tsx` renders real route components against real state, and `UnitConversion.test.tsx` imports the actual calculator route. That is the standard.

| Slice | Domain | Repository | Route-level | Interaction | Device QA |
|---|---|---|---|---|---|
| **4.1** | Preference defaults, validation of values read back from storage | Round-trip, absent key → defaults, corrupt JSON → defaults | Settings renders; **no row has a chevron without an `onPress`** | Appearance change → theme changes → persists across a remount | Restart in each mode; live OS appearance change |
| **4.2** | — | Water key **not** duplicated | Units screen renders both groups | Change unit → Water/Home/Fuel all reflect it | Verify across all three screens |
| **4.3** | — | — | `/tools` renders; both tools render at new paths | Every row navigates to the right route | Back-navigation at each level |
| **4.4** | **Heaviest.** Known BMI pairs both systems · boundaries 18.5/25/30 · exact constants · `null` not `NaN` · scale clamping | — | BMI screen renders; result appears | Type height + weight → value, category, marker · switch units → converts, does not clear | Both themes; real keyboard; VoiceOver on the result node |
| **4.5** | Article integrity · **content tests: no dosing, no recommendation, no guarantee language** · `lastUpdated` present · sources are DB pointers · `relatedPeptides` resolve | — | List renders; `draft` never renders | Article opens and scrolls | Both themes; VoiceOver |
| **4.6** | Field parsing · absent-not-zero · `completeness` → `dataQuality` | — | Food Detail renders new fields when present and omits them cleanly when absent | — | Scan a real product; scan one with sparse data |

**Suite-wide gates each slice:** `npx tsc --noEmit` clean · `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` clean · full suite green (baseline **1093 / 40 suites**) · `npx expo export --platform ios` succeeds.

---

# R. Real-Device QA Plan

Founder testing is **Expo Go on a real iPhone**. Simulator screenshots are not acceptance — and per the standing limitation, the simulator can be deep-linked and screenshotted but not tap-driven.

| # | Scenario | Pass condition |
|---|---|---|
| 1 | Set Appearance to Dark → force-quit → relaunch | Opens in Dark |
| 2 | Set System → change iOS appearance while VITA is foregrounded | Theme follows immediately, no restart, no navigation reset |
| 3 | Launch with Dark stored | **No light-mode flash** |
| 4 | Settings → tap every row | Every row navigates or is visibly non-interactive; **nothing looks tappable and isn't** |
| 5 | Units → change water unit → Water screen, Home tile, Fuel Hydration | All three show the new unit; **no logged amount changes value** |
| 6 | Settings → Tools & Reference | Correct title; TOOLS section; rows correct |
| 7 | Tools → Peptide Calculator → enter a vial and volume | Conversion table identical to pre-sprint behaviour |
| 8 | Tools → Injection Sites → tap zones, switch front/back | Identical to pre-sprint behaviour |
| 9 | BMI: 5'10" / 178 lb | ≈ 25.5, Overweight, marker just past the 25 boundary |
| 10 | BMI: switch to metric mid-entry | Converts to ≈178 cm / ≈80.7 kg; **value does not clear**; BMI unchanged |
| 11 | BMI: empty, partial (`5'`), and nonsense (`abc`) input | No result, no crash, no `NaN`, no zero |
| 12 | BMI: extreme values (BMI ≈12, ≈60) | Marker clamps on-scale |
| 13 | BMI in Dark | Scale bands and marker legible; nothing invisible |
| 14 | VoiceOver on the BMI result | Reads as one sentence with value, category, and range |
| 15 | Reference (if published) → open an article | Renders; sources and `lastUpdated` visible; **no disclaimer wall** |
| 16 | Peptide detail → reference link (if published) | Opens the right article; back returns correctly |
| 17 | Scan a real barcode (regression) | **Unchanged** from Sprint 2 behaviour |
| 18 | Scan a sparse-data product (4.6) | Shows what is known; says plainly what is not; **invents nothing** |
| 19 | Airplane mode → open BMI, Calculator, Injection Sites, Reference | **All fully functional offline** |
| 20 | Airplane mode → scan | Honest offline message, not a generic failure |
| 21 | Deny camera, then re-open the scanner | Correct blocked state with a working Settings deep link |
| 22 | Full navigation sweep, every new route, back at each level | No dead ends, no stuck screens, no missing back |

Scenarios **19 and 5** are the ones most likely to surface a real defect: the first proves the offline claim in §38, and the second proves the single-source-of-truth claim in §K.

---

# S. Decisions Needed From The Founders

**These block or shape implementation. None should be assumed.**

### S.1 — Overall scope 🔴 blocks slice 1
Do you accept the §N classification — specifically, that **the Food Scanner's evaluation and most of the Research Library's content leave Sprint 4**, and that Sprint 4 is Settings + Tools & Reference + BMI?
*Recommendation: yes. It is a complete, coherent sprint, and the two items removed are each sprint-sized on their own.*

### S.2 — Route move 🔴 blocks slice 4.3
Approve moving `settings/tools/*` → `tools/*`, keeping Settings as the entry point?
*Recommendation: yes. Three call sites and two test imports, and it is the clearest possible statement that a calculator is not a preference.*

### S.3 — Screen title
Confirm the Tools destination is titled **"Tools & Reference"** with TOOLS and REFERENCE as sections on one screen, rather than as separate nested screens.
*Recommendation: yes — same depth as today, and it exposes the approved label.*

### S.4 — The dead rows 🔴 blocks slice 4.1
For each, choose: **remove for Sprint 4** · keep without a chevron · build it.
- **Profile** — mock auth data, no destination. *Recommendation: keep the row, remove the chevron, or remove entirely.*
- **Notifications** — no infrastructure. *Recommendation: remove.*
- **Sign Out** — destructive-red no-op. *Recommendation: remove.*

### S.5 — Privacy & Data 🟡 shapes slice 4.1
Reset Data is buildable in Sprint 4 (all storage is under one `vita:v1:` prefix and `allKeys` already exists). Export and account deletion are not, without a backend.
Choose: **Reset Data only** · nothing this sprint · something else.
*Recommendation: Reset Data only, behind a clear destructive confirmation — or nothing. A Privacy section holding one dead row would repeat the exact problem this sprint exists to fix.*

### S.6 — BMI persistence
Confirm: **unit preference persists; entered height and weight do not.**
*Recommendation: confirm. It matches the Peptide Calculator's recorded posture and is what keeps BMI from becoming a shadow Journey.*

### S.7 — Research Library and Open Question #17 🔴 blocks slice 4.5 content
#17 remains unresolved and is already a release gate on the 96 catalog entries **that are shipping today**.
Choose: (a) container only, no content · (b) container + Glossary, subject to review · (c) defer the whole slice · (d) resolve #17 now, with a named reviewer and cadence.
*Recommendation: (b) if a reviewer exists; (a) otherwise. Do not author content into an unresolved review gate.*

### S.8 — Food scanner placement
Confirm **§50 Option B**: data-layer architecture in Sprint 4 as a stretch, evaluation and scoring in a later dedicated sprint.
*Recommendation: confirm. The scanner already exists; the data extension is cheap and helps Fuel regardless; the score is the part that needs a methodology you can defend.*

### S.9 — Scoring methodology direction
Not needed to start Sprint 4, but needed before any scoring work: **Option A (surface Nutri-Score/NOVA), B (a VITA evaluation), or C (hybrid)?**
*Recommendation: A first. It is attributable, low-risk, and it is what you would show alongside B anyway.*

### S.10 — Naming
Any code renaming is deferred. When a scanner Tool surfaces, what is it called?
*Recommendation: a "Check"-family name while methodology is unsettled; reserve a "Score" name for an approved methodology.*

### S.11 — Dashboard shortcut
Confirm **no Dashboard entry point in Sprint 4**, revisited at Sprint 8.
*Recommendation: confirm.*

### S.12 — Default units
Confirm **imperial defaults** (lb, ft/in) for BMI, consistent with Water's US-English V1 decision.
*Recommendation: confirm.*

---

# T. Documentation Changes

Made by this planning pass — **documentation only, no source changes**:

| File | Change |
|---|---|
| `docs/Sprint-4-Planning-Audit.md` | **New.** This document. Marked DRAFT / PENDING FOUNDER APPROVAL. |
| `docs/04-Master-Roadmap.md` | Pointer to this audit; Sprint 3 status row corrected to ✅ (it read 🟡 Current while the page's own Current Stage section said Complete). |
| `docs/Vita HQ/00 HQ/Current Sprint.md` | Pointer to this audit; Sprint 4 noted as planned-not-authorized. |

**Deliberately not changed.** No Innovation Lab statuses (a planning audit is not a founder decision) · no Open Questions closed (#17 remains open; #4 untouched) · no Decision Log entries (nothing has been decided) · no Slice Tracker rows (no slice has started) · no Changelog entry (nothing shipped) · `docs/Vita HQ/02 Product/Settings.md` left alone until the founders rule on §S.

**Findings that belong in `docs/07-Audit-Log.md` once reviewed** — recorded here rather than filed, since this is planning and not a slice audit:

| # | Finding | Severity |
|---|---|---|
| 1 | Theme mode is not persisted (`ThemeProvider.tsx:55`) | **High** — the only working preference in Settings |
| 2 | Settings Units row asserts `"Imperial (lb, oz)"`, a preference that does not exist, contradicting `vita:v1:water:prefs` | **High** — a false statement about the user's configuration |
| 3 | Five of eight Settings rows render a chevron with no destination | Medium |
| 4 | Version hardcoded `"0.1.0 (Sprint 0)"`; `package.json` says `1.0.0` | Low |
| 5 | Sign Out is destructive-styled and calls a no-op mock | Medium |
| 6 | `openFoodFacts.ts` hardcodes `dataQuality: 70` and comments that no per-record signal exists — OFF's `completeness` field is exactly that signal | Low |
| 7 | `WaterRepository` header says Settings arrives in "Sprint 7"; Settings is Sprint 4 | Trivial |
| 8 | `docs/Vita HQ/02 Product/Settings.md` says `src/features/settings/` exists; it does not | Trivial |
| 9 | Master Roadmap sprint table shows Sprint 3 as 🟡 Current while the same page says Complete | Trivial — corrected in this pass |

**None of these was fixed.** Per §57, they are reported rather than quietly repaired. None blocks planning; #1 and #2 should be early Sprint 4 work, and both are already inside slice 4.1.

---

# U. Commit / Branch State

| | |
|---|---|
| Branch | `sprint-4-settings-tools-reference` |
| Base | `main` @ `8b8ec8d` |
| Commit | One docs-only commit: `docs(sprint-4): plan settings tools and reference architecture` |
| Source changes | **None.** No file under `src/` modified. |
| Merged to `main` | **No** |
| Implementation started | **No** |
| Next step | Founder review of this document, then the §S rulings, then authorization of slice 4.1 |

**Sprint 4 implementation does not begin until the founders review and approve this plan.**
