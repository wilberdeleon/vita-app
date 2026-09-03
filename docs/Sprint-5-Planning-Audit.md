# Sprint 5 — VITA Identity & Interaction
# Planning & Architecture Audit

# ⚠️ DRAFT / PENDING FOUNDER APPROVAL

**Nothing in this document is approved. No slice is open. No implementation has started or is authorized by this document.** Every recommendation below is a proposal for founder review. Where this audit recommends a design decision, that recommendation is *not* a decision — §W lists what actually needs a ruling.

*Nothing in `src/` was modified to produce this document.*

| | |
|---|---|
| Prepared | 2026-09-02 |
| Repository | `/Users/wilber/vita-app` |
| Branch | `sprint-4-settings-tools-reference` |
| HEAD | `952eee1` — "docs: introduce VITA Identity & Interaction sprint" ✅ verified present |
| Working tree | Clean — no staged, unstaged, or untracked changes |
| Baseline | `npx jest` — **44 suites / 1174 tests passing**, exit 0 |
| Sprint 4 | ✅ Complete (slices 4.1, 4.2, closeout). **5 commits ahead of `main`, not yet merged.** |
| Sprint 5 | ⬜ Not started. **No Sprint 5 branch exists** (local or remote) — see §Y |
| Governing docs | `docs/Sprint-5-Identity-Brief.md` (DRAFT) · `docs/04-Master-Roadmap.md` → Sprint 5 · `docs/05-Design-System.md` · `docs/06-Slice-Tracker.md` |

**Repository state verified.** Branches present: `main`, `sprint-1-dashboard-wilber`, `sprint-2-fuel`, `sprint-3-water-peptides`, `sprint-4-settings-tools-reference`, `visual-consistency-pass`, `docs/future-direction-fuel-water-peptides`. All mirrored on `origin`. HEAD is pushed and identical to `origin/sprint-4-settings-tools-reference`. Sprint 5 implementation has definitively **not** begun: no Sprint 5 branch, no 5.x commits, no Sprint 5 source changes.

---

# A. Executive Recommendation

**Sprint 5 should do three things, in this order: unify the two competing surface systems the app already has, replace container-by-default with a small vocabulary of surface *roles*, and build the missing interaction layer — sheets, haptics, completion — that VITA currently has no shared implementation of at all.**

Three findings drive that, and the third is the one that most changes the draft plan.

**1. VITA does not have one visual language with a card problem. It has two visual languages, and the card problem is what they have in common.** There are two independent surface systems in the codebase. `Card` (opaque `surfaces.card`, `radii.card` 20, 1px border, `shadows.card`) is used in **39 places across 23 files** — every screen except Home. `GlassSurface` (real `expo-blur` BlurView + tint + highlight + `glassShadow`) is used in **6 places**, and five of those six are on the Dashboard; the sixth is the floating dock. So the screen the Design System names as *"the visual source of truth"* is built from a material that **no other screen in the app uses**. Every non-Home screen is therefore not merely generic — it is generic *in a different material from the reference*. This is the single largest structural cause of the sameness complaint, and it is not fixed by writing card rules.

**2. The sameness is produced by three primitives, not by "cards" in general.** `Screen` (35 files) → `ScreenHeader` (31) → `SectionHeader` (28) → `Card` (23) is the skeleton of essentially every screen. `SectionHeader` is the sharpest instrument: it renders one treatment only — 11px uppercase tertiary-grey at 0.8 letterspacing — and one screen (`peptides/catalog/[id].tsx`) stacks **twelve** of them; Routine stacks **six**. Twelve identical grey labels down one screen is not hierarchy, it is a table of contents rendered as texture. Sprint 5's typography work has a more concrete target than "too many screens look alike": **`SectionHeader` currently has exactly one weight, and needs at least three.**

**3. The interaction layer that Sprint 5 is supposed to define does not exist anywhere yet — and that is good news for scope.** There is **no haptics dependency and zero haptic calls** in the entire codebase. There is **no Reanimated**; all motion is RN `Animated` in exactly 5 files. There is **no shared sheet primitive** — instead there are **four hand-rolled `Modal` implementations** in `src/features/peptides/components/`, two of which (`TakenSheet`, `RoutineDaySheet`) duplicate a byte-identical `rgba(0,0,0,0.4)` backdrop and top-radius sheet shell. And `useReducedMotion` exists and is correct, but is honoured by only **2 of the 5** animating components. Sprint 5 is therefore not refactoring an interaction language — it is building the first one. Nothing has to be un-built first.

**The corrective framing for the sprint: VITA's problem is not that it has too many cards. It is that it has containers instead of roles.** Every piece of content currently answers the question "what box am I in?" and none answers "what am I *for*?" — a hero, an action, a status, a record, a reference. Slice 5.1 should deliver that role vocabulary and the interaction layer, and 5.2 onward should apply it. That is a bigger and more useful 5.1 than a token pass, and it is the reason §S recommends inserting one slice before Dashboard rather than starting Dashboard immediately.

**What Sprint 5 should not do:** rebuild any domain. `src/lib/` is 11,400 lines of tested logic behind repository boundaries and it is not the problem. §D freezes it explicitly.

---

# B. Current UI Diagnosis — what specifically creates generic visual sameness

Seven concrete, verified causes. Ranked by contribution.

### B.1 Two surface systems, one of them used only on the reference screen

| System | Implementation | Instances | Where |
|---|---|---|---|
| `Card` / `useCardSurfaceStyle` | opaque `surfaces.card`, `radii.card` (20), 1px `surfaces.border`, `shadows.card`, `padding: spacing.l` | **39** in 23 files | Every screen **except** Home |
| `GlassSurface` | `expo-blur` BlurView + tint + 2pt top highlight + border + `glassShadow` | **6** | Home ×5, floating dock ×1 |

`docs/05-Design-System.md` says *"Visual source of truth: Home/Dashboard."* In code, Home is the one screen nobody can look like without importing a material no one else imports. Water, Peptides, Routine, Tools, Fuel and Journey are all built from the *other* system. This is the deepest cause of "features that behave nothing alike look alike" — they look alike **to each other** while looking unlike the reference.

### B.2 `Card` is the default answer to every containment question

`Card` carries a border **and** a shadow **and** 20pt radius **and** 16pt padding, unconditionally. It is used for: a hero water level, a 7-day bar chart, a log list panel, a routine summary, a nutrition detail table, an actions menu, a peptide info block, a catalog entry. Eight different jobs, one visual weight. Because the surface is free to apply and always looks finished, there is no friction discouraging its use — so nothing on a screen can be *more* important than anything else. This is the founder's "card soup", precisely located.

### B.3 One section header, at one weight, up to twelve times per screen

`SectionHeader` renders `typography.micro` (11px/500) uppercase at `surfaces.textTertiary`, letterspacing 0.8 — one treatment, no variants, no size prop. Counts: `peptides/catalog/[id].tsx` **12** · `peptides/routine/[id].tsx` **6** · `LogForm` **4** · `peptides/index.tsx` **4** · `SetupForm`, `WeightTab`, `OverviewTab`, `PortionEditor`, `settings/index`, `fuel/log` **3** each. When every section boundary is the same quiet grey line, a screen has no shape — only a sequence.

### B.4 The rounded rectangle is the only shape in the system

`radii` offers `card: 20`, `control: 16`, `chip: 12`, `pill: 999`, `glassTile: 20`, `glassRow: 22`, `glassLarge: 24`. Five of seven are the same rounded-rectangle idea at 20–24pt. There is no shape language — no full-bleed, no inset, no bordered-only, no divider-led group. `ProgressRing` (used **once**, in `FuelSummaryCard`) is the only non-rectangular data shape in the entire app, and its own docstring explains exactly why it works: *"The shape is the hierarchy."* That lesson was learned and never generalized.

### B.5 Feature colour is a tint, never a structure

`palette` defines `water`, `peptide`, `primary` (Fuel), `journey`/`success`, `gold`. Where they appear: `Button` fill or `${color}1A` soft fill · `IconBadge` at `${color}1A` circle · `ProgressBar`/`StatBar` fill · `Chip`/`SegmentedTabs` active fill · a small number of accent text colours. They never determine layout, shape, density, or a screen's identity. Water is blue; Peptides is purple; both are otherwise the same screen. Meanwhile `IconBadge` — a tinted circle behind a glyph, at 36pt — is the single most repeated identity gesture in the app, and it is identical everywhere except for hue.

### B.6 Dashboard's hierarchy is analytics-first, and half of it is fixture data

Home renders, top to bottom: greeting block → `HomeSummaryCard` (goals + calories remaining) → `JourneyCard` → `MacrosCard` → Health Metrics (5 tiles) → Today's Meals (4 rows). **There is not a single action affordance above the fold** — nothing logs, adds, or completes anything. Every element is a readout. Worse, `DASHBOARD_FIXTURE` still supplies `firstName`, `journey`, `steps`, `sleep`, `workout`, `streak` and the Movement/Recovery goal pillars: **4 of 5 Health Metric tiles and 2 of 4 goal pillars are fixtures.** So the screen is not only report-shaped, more than half of the report is invented.

### B.7 The two slogan lines are structural, not just copy

`HomeHeader.tsx` hardcodes `const HEADLINE = 'Build with intention.'` at **34px/800** — the largest type on the screen, larger than any real number — and `const SUPPORTING_LINE = 'YOUR DAY, YOUR DIRECTION.'`. The most visually dominant element on VITA's home screen is a slogan that conveys nothing about the user's day. Removing them is two constant deletions; the space they free is the single best opportunity in the sprint.

---

# C. Existing Primitive Audit

Usage measured across `src/app` + `src/features` (excluding the primitive's own file).

| Primitive | Files | Why it works | Where it's overused | Verdict |
|---|---|---|---|---|
| `Screen` | **35** | Correct root: safe area, dock clearance, theme background, keyboard-aware opt-in, `contentGap` | Not overused. `contentGap` is the under-used lever — most screens take the default `spacing.l` and never vary rhythm | **Keep.** Extend with a section-rhythm scale |
| `ScreenHeader` | **31** | One header, all modes (brand/back/close/settings/action). Genuinely good | Not overused | **Keep as-is** |
| `SectionHeader` | **28** | Cheap grouping, accessible, theme-aware | **The primary sameness driver** (§B.3). One weight, up to 12 per screen | **Evolve.** Needs variants — see §L |
| `Card` | **23 files / 39 uses** | Single source of truth for the card surface; `useCardSurfaceStyle` shared with `PressableCard` | **The container-by-default** (§B.2). Border+shadow+radius+padding always on | **Evolve into a `surface` role prop** — do not delete |
| `Button` | **23** | Filled/soft, colour-parameterised, disabled state, press scale | Full-width filled `Button` is used for both "log water" and "add peptide" — no primary/secondary distinction beyond fill | **Evolve.** Needs a defined primary/secondary/tertiary ladder |
| `EmptyState` | **17** | Quiet, non-scolding, correct tone | Fine as-is, but always renders inside a section that has a header, so an empty section costs a header **and** a 24pt-padded block | **Keep;** add a compact inline variant |
| `SegmentedTabs` | **9** | Accessible (`groupLabel`, selected state), theme-aware | Reasonable | **Keep** |
| `ListRow` | **8** | Card-style row with icon badge + chevron | Carries its **own** border + shadow + `radii.card` — so a list of rows is a stack of cards. Contradicts the Design System's own "rows in a panel" finding | **Evolve.** Needs a flat/in-panel variant |
| `Chip` | **8** | Good selection semantics | Fine | **Keep** |
| `GlassSurface` | **6** | Real blur, theme-aware, pressable-when-needed, correct two-layer shadow/clip structure | **Under-used, not overused** — confined to Home + dock (§B.1) | **Decide** — see §W.1 |
| `PressableScale` | **6** | The only press feedback in the app; adds `accessibilityRole="button"` | Spring is `speed:40, bounciness:5`, scale 0.97/0.98 — undocumented, not tokenised, **does not check reduce-motion** | **Evolve into the press primitive** (§M) |
| `ProgressBar` | **5** | Animated, reduce-motion aware, theme-aware track, optional a11y label | Fine | **Keep** |
| `IconBadge` | **5** | Tinted circle + glyph | The most repeated identity gesture, identical everywhere but hue (§B.5) | **Keep, but stop treating it as feature identity** |
| `Section` | **3** | Rhythm grouping | **Badly under-used** — only Dashboard and Fuel use it; every other screen hand-stacks `SectionHeader` + content | **Promote.** Adoption is a 5.1 deliverable |
| `StatBar` | **1** | Label/value/bar column | Single use (`FuelSummaryCard`) | Keep |
| `ProgressRing` | **1** | *"The shape is the hierarchy"* — the app's only non-rectangular data shape | Single use | **Generalize.** The precedent for §L's visual objects |
| `DailyProgressCard` | **1** | Headline + bars | Single use | Keep or absorb |
| `PressableCard` | **0** | — | **Dead code.** Zero call sites | **Report for deletion in 5.1** |
| `Toast` | app-wide | The confirmation surface; Undo replaces confirm dialogs | Animates without checking reduce-motion | **Keep;** fix reduce-motion |
| `FloatingDock` | shell | Glass pill, 4 destinations, correct a11y roles | Fine | **Keep.** Not reopened by Sprint 5 |

**Verified dead code:** `PressableCard` (0 call sites). **Verified single-use:** `ProgressRing`, `StatBar`, `DailyProgressCard`.

---

# D. Business Logic Freeze Map

**These areas should not be modified by any Sprint 5 presentation slice.** A redesign that needs a change here is raising a finding, not exercising a licence.

## D.1 Hard freeze — domain, persistence, repositories

| Area | Files | Why |
|---|---|---|
| **Shared daily foundation** | `src/lib/daily/` (8 files, 555 ln) — `keys.ts`, `dates.ts`, `ids.ts`, `dayStore.ts`, `useDayRollover.ts`, `guards.ts` | Every domain's date/rollover/key correctness. `LogDate` semantics were hard-won in 3.2 |
| **Water domain** | `src/lib/water/` (12 files, 859 ln) — `model/`, `data/`, `state/` | Canonical mL storage, entered-unit snapshots, goal, rollover, 7-day week derivation |
| **Peptides domain** | `src/lib/peptides/` (25 files, **6,901 ln**) — `model/routine.ts`, `logs.ts`, `dose.ts`, `sites.ts`, `schedule.ts`, `units.ts`, `setups.ts`, `data/`, `state/` | Routine day state, log snapshots, dose conversion, the canonical site model |
| **Nutrition domain** | `src/lib/nutrition/` (24 files, 2,916 ln) — providers, search, model, state | Food providers, totals, targets |
| **Preferences** | `src/lib/preferences/` (5 files) | Theme-mode persistence (slice 4.1) |
| **Persistence keys** | `src/lib/daily/keys.ts` (`NAMESPACE = 'vita:v1'`), `water/data/keys.ts`, `peptides/data/keys.ts`, `preferences/data/keys.ts`, `nutrition/data/keys.ts` | **Any change silently orphans real user data.** The peptides log/routine-log prefix disjointness is load-bearing |
| **Repositories** | `WaterRepository`, `PeptideRepository`, `FoodLogRepository`, `PreferencesRepository` + all `asyncStorageRepository` impls | The Supabase seam |
| **Calculator math** | `src/lib/peptides/model/dose.ts`, `units.ts` (`calculateSyringeUnits`, `convertAuthoredAmount`, `toMcg`) | Founder-approved through 3.6E |
| **Food scanner pipeline** | `src/app/(vita)/fuel/scan.tsx` camera/permission/lookup logic, `src/lib/nutrition/providers/` | §17 — explicitly untouched |
| **Peptide catalog content** | `src/lib/peptides/data/definitions/` (7 files, ~3,500 ln) | Content is gated by Open Question #17 |

## D.2 Soft freeze — change only with a recorded finding

- `src/theme/tokens.ts` — 5.1 **may** add tokens (surface roles, motion, elevation). It should not silently redefine `palette` domain hexes, which are a permanent founder decision.
- `src/theme/ThemeProvider.tsx` — the hydration gate and `Appearance` listener are correct; extend the `Theme` type, don't restructure.
- `src/lib/peptides/model/sites.ts` — rotation visualization (§I) should **read** `entriesWithSites` / `entriesAtSite` / `InjectionSiteSnapshot`. A new *selector* helper is acceptable; changing the snapshot shape is not.
- `src/components/ui/Screen.tsx`, `ScreenHeader.tsx` — extend, don't rewrite.

## D.3 The regression tripwire

Baseline is **44 suites / 1174 tests**. Feature test suites that must stay green and unmodified in intent: `src/features/water/__tests__/WaterRoutes.test.tsx`, `src/features/peptides/__tests__/PeptideLogging.test.tsx`, `src/features/settings/__tests__/SettingsRoutes.test.tsx`, `src/features/tools/__tests__/ToolsRoutes.test.tsx`, `src/features/dashboard/__tests__/`, plus all `src/lib/**/__tests__`. **Recommendation: every Sprint 5 slice states its test delta in the Slice Tracker.** A presentation slice that changes a `lib/` test has left its lane.

---

# E. Dashboard Recommendation

## E.1 What is there now (verified)

`src/app/(vita)/(tabs)/dashboard.tsx` composes six blocks. Real data: nutrition (`useDailyNutrition`), water (`useWaterToday`). Fixture data: `firstName`, journey, steps, sleep, workouts, streak, Movement + Recovery pillars.

| Block | Component | Real? | Actionable? |
|---|---|---|---|
| Greeting + slogans | `HomeHeader` | greeting real; slogans hardcoded | no |
| Today's Summary | `HomeSummaryCard` (glass) | 2 of 4 pillars real | no |
| Current Journey | `JourneyCard` (glass) | **fixture** | taps → `/journey` |
| Macros | `MacrosCard` (glass) | real | no |
| Health Metrics | `QuickStatsRow` → 5× `MetricTile` (glass) | **1 of 5 real** (Water) | Water tile only |
| Today's Meals | 4× `MealRow` (glass) | real | **no** — chevron deliberately removed |

**Tools is unreachable from Home.** The only path is Settings → Tools & Reference. **Peptides is unreachable from Home** — it is reachable only via Fuel's tracker tile. **Water is reachable only as a quarter-width metric tile.**

## E.2 Recommendation

**Home should become a day-state screen with a small number of real actions, not a report.**

1. **Delete both slogan constants.** Do not replace with copy. Replace with *state*: date, and a one-line factual summary of what today actually contains (e.g. *"2 routines scheduled · 32 fl oz logged"*), derived from real domains only. Keep the gold time-aware greeting exactly as built (`useGreeting` re-evaluates each minute — good).
2. **Retire or gate every fixture surface.** Steps/sleep/workouts/streak/Movement/Recovery have no feature behind them. Options: remove until a feature exists (recommended), or mark visibly as unavailable. **Do not carry four fake tiles into the new identity** — the redesign would be validating invented data on device.
3. **Adopt a mixed-module composition** (§E.3) rather than a symmetrical grid.
4. **Give Water, Peptides and Tools real presence.** Water and Peptides deserve module-level surfaces with direct actions; Tools deserves a compact utility affordance. *Note the standing rule: "Home is not a launcher." §W.4 asks the founder to resolve this — a direct-action module is not the same thing as a launcher grid, but the boundary needs a ruling.*

## E.3 Three composition systems (proposals — none implemented)

**System 1 — "Today, then domains" (recommended).**
```
Greeting + date + one factual day-state line   [direct on background]
────────────────────────────────────────────────
TODAY            [elevated module, full width]
  what is scheduled/outstanding, with inline actions
  (peptide due → Taken · water short → +Add)
────────────────────────────────────────────────
Water     ▮▮▮▮   Peptides   ▮▮      [two half-width feature modules,
 visual object    due/done          each with its own visual object]
────────────────────────────────────────────────
Fuel                          [horizontal status strip, full width]
  calories remaining + inline log action
────────────────────────────────────────────────
Journey            [wide module, gold — reserved shape for Sprint 6]
────────────────────────────────────────────────
Tools · Calculator · Sites     [compact utility row, low visual weight]
```
Why: the action question is answered above the fold; feature identity is carried by per-feature visual objects at module scale; sizes are deliberately unequal; Journey gets a reserved slot so Sprint 6 does not have to redesign Home.

**System 2 — "Hero + strips".** One large hero module that rotates to whatever most needs attention today (a due dose, then hydration, then fuel), with everything else as thin full-width status strips. Strongest hierarchy, most distinctive; riskiest because "what is most important" becomes a product rule Home has to own, and it can feel unstable day to day.

**System 3 — "Stacked feature bands".** Each domain gets a full-width band with its own internal layout, colour and visual object; no shared module shape at all. Maximum recognizability (recovers the old dashboard's "immediately recognizable destinations"); costs the most vertical space and risks becoming five mini-dashboards.

**Recommendation: System 1.** It delivers action-first and unequal module sizes without inventing a priority engine (System 2) or five bespoke layouts (System 3).

---

# F. Water Recommendation

## F.1 What is there now

`/water` = `WaterLevelPanel` + full-width `Button` → `/water/add` (a **route**, not a sheet) + `WaterWeekStrip` + `WaterLogPanel`. Four `Card`s stacked. Data correctness is high and is frozen.

## F.2 The hydration visual object — and the conflict that must be surfaced

**`WaterLevelPanel` is already a proto-hero-object**, and it already animates. It renders an abstract fill rising behind the numbers: `Animated.Value` → interpolated height `'0%'→'100%'`, 700ms `Easing.out(cubic)`, a 2pt bright surface line, `MINIMUM_VISIBLE_FILL = 0.045`, reduce-motion honoured, and it correctly renders **no fill at all** when no goal is set.

**It deliberately rejected a vessel, and recorded why:**

> *"a bottle, a glass, or eight cup icons all imply a vessel of a fixed size, and VITA's goal is whatever the user chose, in whichever of four units they think in. A level has no implied capacity."*

The founder now wants a premium hydration vessel as the hero. **These are in genuine tension, and the audit will not resolve it by preference.** The reasoning above is sound and is about correctness, not taste. **§W.2 puts this to the founder.** Two ways to honour both:

- **Option A — Abstract vessel (recommended).** A vessel-*shaped* silhouette that is explicitly not a real container: no measurement marks, no cap, no branded bottle form; a tall soft-cornered form whose fill maps to *percentage of your goal*, not to a volume. Keeps the founder's tactile hero; keeps the "no implied capacity" correctness.
- **Option B — Literal vessel.** Requires accepting that the shape implies a capacity it does not have, and a story for goals of 32 fl oz vs 4 L.

## F.3 Implementation technique — recommendation

Ranked by risk. **Recommendation: `react-native-svg` + RN `Animated`, no new dependency.**

| Technique | Verdict |
|---|---|
| **`react-native-svg` (already a dependency, 15.12.1) + RN `Animated`** | ✅ **Recommended.** SVG already renders `ProgressRing` and `BodyMap` on device. A vessel silhouette is a `Path`; the fill is a clipped `Rect` whose height animates; the meniscus is a shallow `Path`. Ripple = a second low-alpha wave path with an animated x-offset. Works in Expo Go, light/dark by token, degrades to a static final state under reduce-motion |
| Masked `View` (current approach, extended) | ✅ Viable, cheapest. Cannot do a curved meniscus or a non-rectangular silhouette. **Note: `BodyMap`'s docstring records that `ClipPath` "was tried first and did not apply on device"** — that is an SVG clip-path caveat to re-verify early (see §U) |
| Reanimated | ❌ **Not justified.** New dependency, Expo SDK 54 pinning risk, for one animation RN `Animated` handles at 700ms |
| Canvas / Skia | ❌ **No.** Not present; heavy; explicitly outside "do not introduce heavy dependencies for visual novelty" |

**Requirements the object must meet:** fill % from `today.progress` · animated rise · optional subtle ripple · a distinct completion state (§N) · blue Water identity · light **and** dark · **decorative and hidden from assistive tech, with every figure it encodes stated in text** (the existing panel already does this correctly — preserve it exactly) · lands on final state under reduce-motion · **renders nothing when no goal is set** (the 3.10 audit fix — do not regress this).

## F.4 Logging interaction

Add Water is currently a full route with `UnitSelector` + big amount display + 4 quick-add chips + `TextField` + submit — a form for a two-second action.

**Recommendation: a bottom sheet, built on the primitive from §M.4, with quick-adds inline on `/water` itself.** Target flow: tap a quick amount **on the Water screen** → logged, vessel rises, light haptic, no navigation at all; tap *Custom* → sheet with the existing `AmountEditor` → log → sheet closes, vessel rises. **`AmountEditor` is reused unchanged** — it is shared with Edit Entry and its unit-per-entry semantics are a founder decision. The `/water/add` route should be **kept** as the deep-link/edit target even once the sheet exists.

## F.5 History

`WaterWeekStrip` is already correct and restrained (relative volume, not goal attainment — a documented data-integrity decision; do not "improve" it into goal-based bars). `WaterLogPanel` already does rows-in-a-panel. **Presentation-only opportunity:** the two `Card`s + two `SectionHeader`s below the hero can become one progressively-disclosed history region. **No data loss and no history simplification** (brief §5).

---

# G. Peptides Home Recommendation

## G.1 Why it feels administrative

`peptides/index.tsx` renders up to four sections — Today, Needs setup, Active, Inactive — plus a trailing Add button. It is already well-built: sections vanish when empty, nothing is scored, and Today is deliberately first. The administrative feel comes from three specific things:

1. **Three of the four sections are visually identical.** Needs setup, Active and Inactive are each `<Card style={panel}>` wrapping hairline-divided `Pressable` rows with the same `rowName`/`rowMeta`/chevron structure. Only the meta text differs. **Three-quarters of the screen is one list rendered three times.**
2. **`TodayRoutineCard` — the only surface that can be acted on — is the same `Card` as the three lists it sits above.** The one actionable thing has no visual privilege beyond position.
3. **`SectionHeader` ×4 in identical grey** flattens Today (urgent) and Inactive (archival) to the same announcement weight.

## G.2 Recommendation

Answer *"what do I need to do today?"* by **weight**, not by ordering:

- **Today becomes the hero region** — direct on background or as the screen's one elevated module, with the peptide name, the amount, and **Taken / Skipped as the screen's most prominent controls**. Keep the existing rule exactly: *both outlined, neither pre-selected* (a filled Taken read as already-taken — a documented near-miss). Keep *"Scheduled today"*, never *"due"*.
- **Completed-today collapses rather than disappearing.** A taken routine should visibly settle into a quiet completed state in place (§N) — not vanish, not stay at full weight.
- **Needs setup becomes an inline notice, not a section.** Usually 0–1 items; a header + card + row for one item is three levels of chrome for one sentence.
- **Active and Inactive merge into one progressively-disclosed "Your routines" region**, with Inactive collapsed by default. Active-but-not-today is reference; Inactive is archive. Neither deserves peer weight with Today.
- **Zero domain change.** `usePeptides()` already returns `today` / `needsSetup` / `active` / `inactive`; this is entirely a presentation regrouping.

---

# H. Routine Recommendation

## H.1 Current hierarchy (verified) — 5 `Card`s, 6 `SectionHeader`s

| Block | Now | Classification |
|---|---|---|
| Name + state | plain text | primary |
| **Today** (Taken/Skipped) | `Card` #1 | **PRIMARY — the daily act** |
| Routine details (Amount/Schedule/Reminder/Started) | `Card` #2 + 4 `SummaryRow`s | secondary → **disclosure** |
| Week strip + prev/next nav | `Card` #3 | secondary |
| Recent history (3 × `LogRow`) | bare stack | secondary |
| View All History / Add Log | inline text links | secondary |
| **Preparation** (one vial line) | `Card` #4 | **disclosure** — a whole card + header for one row |
| **Actions** (Edit / Pause / Remove) | `Card` #5 | **administrative → disclosure** |

Today occupies roughly one-fifth of the screen and is visually indistinguishable from Preparation.

## H.2 Recommendation

**Immediate action must dominate.** Proposed hierarchy:

1. **Primary:** name · routine amount · today's state · **Taken / Skipped** — the screen's clear focal region, and the only thing above the fold.
2. **Secondary:** week strip (keep the real Mon–Sun week and arrow nav — it replaced an unreadable rolling window) · recent history (keep `RECENT_LIMIT = 3`).
3. **Disclosure:** Routine details · Preparation. Two cards and two headers collapse into one expandable "Details" region.
4. **Administrative, visually quietest:** Edit · Pause/Resume · Remove. Keep Remove in `palette.fat` red, keep the `Alert` confirm, and **keep its wording verbatim** — *"Existing log history will be kept"* answers the exact fear that makes people hoard dead routines.

**Preserve exactly:** both actions outlined and unselected; the Change + Undo-toast pattern; `RoutineDayStrip` writing through the same provider operations as the Today card (not a second source of truth).

---

# I. Injection Site / Rotation Recommendation

## I.1 What already exists — the central finding

**Site logging is not new. It is built, shipped, and shared.** Verified:

| Piece | Location | State |
|---|---|---|
| Canonical site model | `lib/peptides/model/sites.ts` (267 ln) — `SITE_KEYS`, `InjectionSiteKey`, `BodyView`, `SITE_LABELS`, `SITE_VIEWS`, `SITE_PICKER_ORDER`, `REGION_DESCRIPTIONS` | ✅ |
| Site snapshot | `InjectionSiteSnapshot { key, label }`, `createSiteSnapshot`, `parseSiteSnapshot`, `LEGACY_REGION_SIDE` migration | ✅ |
| Stored on logs | `PeptideLogEntry.site?` and `PeptideLogDraft.site?` (`model/types.ts`) | ✅ |
| History helpers | `lastRecordedSite`, `entriesWithSites`, `entriesAtSite` | ✅ |
| Fast selector | `SiteSelector.tsx` (390 ln) — list-first, Custom, "View Body Model" | ✅ |
| Body map | `BodyMap.tsx` (342 ln) — SVG figure, 10 zones, non-overlapping hit areas, front/back mirroring, per-zone a11y | ✅ |
| **Already in the Taken flow** | `TakenSheet` → `SiteSelector`, optional, never preselected, with `lastRecordedLabel` as context | ✅ |
| History lens | `/tools/injection-sites` — `BodyMap` + zone history + recent list + reference | ✅ |

**So the founder's "Mark as Taken → optional site selection → confirm" flow already exists end-to-end.** Sprint 5's work here is presentation and one genuinely new capability — not new plumbing.

## I.2 The actual gaps

1. **`BodyMap` has exactly one mode.** Its props are `{ view, selected?, onSelect }` — single-selection only. It cannot show *many* markers, so it cannot show rotation.
2. **No time dimension anywhere.** `entriesAtSite` filters by site; nothing filters by week. There is no `entriesInRange` / weekday grouping helper.
3. **Site selection inside `TakenSheet` is a row you must notice**, reached by opening a nested `Modal` **inside** an already-open `Modal`. It works, but it is the least tactile step in the flow.

## I.3 Rotation visualization — architecture recommendation

**Recommendation: one shared `BodyMap` gaining a marker layer, with rotation living primarily in the Injection Sites tool, and a compact read-only week view embedded in Routine.**

```
lib/peptides/model/sites.ts        (FROZEN — read only)
        │
        ├── NEW: selector, e.g. sitesForRange(logs, from, to)
        │        → per-site: count, weekdays, peptide names, entry ids
        │
components/BodyMap.tsx             ← ONE body representation. Never duplicated.
   props: view · markers? · selected? · onSelect?
        │
        ├── SiteSelector          → selection mode  (markers absent)
        ├── /tools/injection-sites → history mode   (markers = all-time at zone)
        └── RotationView (NEW)     → rotation mode  (markers = one week)
```

`BodyMap` gains **one optional prop** (`markers`) and one new `<G>` layer. Selection behaviour is untouched; existing call sites pass nothing and are unaffected. This is the smallest change that satisfies "evolve, never duplicate."

**Where it lives:** **primarily `/tools/injection-sites`** — the tool already aggregates sites across every peptide, which is how rotation is actually practised, and it is already framed as *"a lens onto history, not a logging surface."* Routine embeds a compact, read-only, single-peptide week view that links to the tool.

**Open design questions to answer inside 5.5** (none resolved here): front/back — a marker on a hidden view needs an indicator or an auto-switch · same site twice in a week — count badge, not stacked dots · multiple peptides — colour by peptide risks a palette VITA hasn't defined; **recommendation: do not colour-code peptides**, use one Peptides purple and name the peptide in the detail · overlap — the abdominal zones are only 19–28 units apart, so markers must be zone-anchored, never free-positioned · tap a marker → the existing `/peptides/log/[id]` route.

**Non-negotiable, carried from the existing code:** *"the easiest place in this whole feature to accidentally imply a recommendation."* Rotation view must have **no** "next site", no rest-timer, no good/bad colour scale, no unused-site highlighting. It reports where you went; it never suggests where to go.

## I.4 Accessibility — mandatory, not optional

`BodyMap` currently gives every zone a `Pressable` with `accessibilityLabel` + selected state, and hides the decorative figure. A marker layer **must not** become visual-only: each marked zone's label must carry its own count and dates (e.g. *"Left thigh, 2 records this week, Tuesday and Friday"*), and the rotation view must ship a **plain list equivalent** — the tool's "Recent Sites" list is already most of it.

---

# J. Tools Recommendation

## J.1 What must not change functionally

Sprint 4 shipped this deliberately and it works. **Freeze the behaviour of:** `/tools` route identity · the Tools & Reference hub and its two-row list · `/tools/peptide-calculator` (math and UX) · `/tools/injection-sites` (the "never tells anyone where to inject" boundary, the one-line footer, the Site Reference content) · the icon-colour convention (*a tool's icon colour tracks the domain it serves; a tool belonging to no domain takes neutral* — this pre-answers BMI) · **no "Coming Soon" rows** — nothing is listed before it works.

## J.2 What Sprint 5 should change

Presentation only, and **last**: the hub is currently three `ListRow`s' worth of chrome for two items, and Injection Sites is four stacked `Card`s. Both should adopt the §L surface roles. The tool screens are the **lowest-risk place to prove the language** because their logic is inert — which is an argument for keeping 5.6 late (validation) but a good candidate for the *first* migration after 5.1.

**Discoverability:** Tools is reachable only via Settings. Home should surface it as a **compact utility affordance** — deliberately low-weight, not a fifth dock destination, and not a launcher grid. **This needs the §W.4 ruling** because it touches the standing "Home is not a launcher" rule.

---

# K. BMI Recommendation

**BMI is still wanted and is not lost.** It has a complete plan already written — `docs/Sprint-4-Planning-Audit.md` §G (UX, `src/lib/bmi/` domain model, non-goals, persistence, visual design, accessibility, the Journey seam) — which survives intact and needs no re-planning.

**Recommendation: BMI becomes its own slice, `5.7`, immediately after Tools integration — not folded into 5.6.**

Reasons: (1) 5.6 is a *migration* slice (existing screens → new language, zero new features); BMI is a **new feature with a new domain module** (`src/lib/bmi/`) and new persistence questions. Mixing them makes 5.6's regression surface unbounded. (2) BMI is the **best possible proof of the new language** — a result, a category scale, and a premium visual representation is exactly the "visual object instead of a summary card" case §L proposes; building it in the new system from scratch is why it was deferred in the first place. (3) It has a real dependency on 5.1 and a real seam into Sprint 6 (Journey/Weight owns stored height + latest weight) that a sub-item of a migration slice would blur.

Constraints, unchanged: height · weight · result · category range · premium visual representation · **no BMI history that shadows Journey** · Journey integration deferred to Sprint 6.

**Housekeeping this creates:** two source comments still name "slice 4.4" as BMI's home — `src/lib/preferences/model/types.ts:61` and `src/app/(vita)/settings/units.tsx:24`. The Slice Tracker already records these as deliberate. Once BMI has a real number, correct them **in that slice**.

---

# L. Visual Language

*Proposals for 5.1. Derived from the screens audited above, not adopted from a taxonomy.*

## L.1 Surfaces — six roles

The rule this replaces: *"content needs containing, therefore `Card`."* The rule proposed: **a surface's treatment is chosen by what the content is for.**

| Role | Treatment | Derived from | Replaces today |
|---|---|---|---|
| **Ground** | No container. Direct on background, hierarchy from type + space alone | Routine's name/state header; Water's error line | `Card`s that hold one line (Routine "Preparation") |
| **Module** | The elevated surface. Radius, subtle separation, generous padding. **Sized unequally** — full/half/wide | `HomeSummaryCard`, `TodayRoutineCard` | Today's `Card` on Home/Peptides/Routine |
| **Panel** | One surface, hairline-divided rows, minimal padding. **The correct answer for any list of peers** | `WaterLogPanel`, Peptides' three lists, `TodayMealsPanel` | `Card style={panel}` used ad-hoc in ≥6 places — should be a named role |
| **Utility tile** | Small, compact, low weight. Deliberately *not* a small Module | `MetricTile` | 4 fake Health Metric tiles |
| **Visual object** | Feature-specific, non-rectangular, carries the feature's colour and state. **The anti-card** | `ProgressRing` (*"the shape is the hierarchy"*), `WaterLevelPanel`'s fill, `BodyMap` | The summary card that states a number a shape could show |
| **Sheet** | Transient, bottom-anchored, backdrop, one task | 4 hand-rolled `Modal`s | See §M.4 |

Plus **Disclosure row** (§L.5) as an interaction pattern rather than a surface.

**Test for a new screen:** if two adjacent surfaces have the same role, one is probably wrong.

## L.2 Hierarchy

Today, importance is signalled by **order and size only**. Add two more signals: **role** (Ground vs Module is a bigger statement than 4pt of padding) and **width** (a half-width module reads as secondary without being shorter — already proven by Fuel's tracker row).

## L.3 Colour rules — proposal

Gold = VITA/Journey/brand · Blue = Water · Purple = Peptides · Orange = Fuel · Green = movement/activity. Unchanged hues; the *rules* are new:

**Feature colour SHOULD carry:** the feature's visual object · progress and fill · completion state · selection state · a single accent per screen (the one thing that matters most) · microinteraction flashes · icon glyphs.

**Feature colour SHOULD NOT:** fill a whole button by default (today `Button` takes `color` and fills it — that is why Water and Peptides look like the same screen in two hues) · tint a whole card or surface · be the only carrier of state (§P) · be used decoratively where nothing is stateful.

**Two rules worth making explicit:** (1) **One dominant feature colour per screen.** (2) **Neutral is the default; colour is earned.** A screen where everything is blue says nothing is important.

## L.4 Typography

**Do not change fonts.** The scale (`display` 32 / `title` 24 / `heading` 17 / `body` 15 / `caption` 13 / `micro` 11) is sound. Two specific problems:

- **`SectionHeader` has one weight and is used up to 12× per screen.** Proposal: three variants — **primary** (a real heading: `heading` weight, primary text, for a screen's one or two structural divisions) · **secondary** (today's `micro` uppercase tertiary) · **inline** (a quiet label inside a Module, no top margin).
- **The largest type in the app is a slogan** (34px/800, `HomeHeader`). After §E.1, the largest type on a screen should always be the number or name the screen is about.

`display` at 32 is currently used only for the Water total and the Add Water amount — that restraint is right and should become an explicit rule: **one `display`-size element per screen, maximum.**

## L.5 Spacing

`spacing` (4/8/12/16/20/24/32) is adequate. The under-used lever is `Screen`'s `contentGap` — Dashboard uses `xxxl`, Fuel `xl`, and **every other screen takes the `l` default**, which is why unrelated blocks sit at the same distance as related ones. Proposal: a **section rhythm** (module-to-module = `xxl`+) distinct from **content rhythm** (within a module = `m`), and adopt `Section` — currently used by only **3 files** — everywhere.

---

# M. Interaction Language

## M.1 Current state (verified)

| | Now |
|---|---|
| Press | `PressableScale` only — spring `speed:40, bounciness:5`, scale 0.97 (0.98 for cards). **6 call sites.** Not reduce-motion aware. `MetricTile` uses a bare `Pressable` with `opacity: 0.8` — **a second, undocumented press language** |
| Success | `Toast` (2600ms plain / 6000ms with Undo). Good, and the Undo-instead-of-confirm pattern should be codified as a rule |
| Selection | `Chip` / `SegmentedTabs` fill swap, no motion |
| Sheets | **4 hand-rolled `Modal`s**, no shared primitive |
| Navigation | expo-router defaults, untouched |
| Progress | `ProgressBar` 650ms cubic-out · `WaterLevelPanel` 700ms cubic-out · `ProgressRing` deliberately static |
| Haptics | **None. Zero.** |
| Reduce motion | Hook exists and is correct; honoured by **2 of 5** animating components |

## M.2 Proposed rules

- **Press.** One primitive, one vocabulary. Scale 0.97 (0.98 for large surfaces), plus opacity only where scale is impossible. Tokenise the spring. **Honour reduce-motion** (fall back to opacity). Eliminate `MetricTile`'s divergent path.
- **Selection.** Instant, no motion, colour + `accessibilityState.selected` (already correct — keep).
- **Completion.** See §N.
- **Success.** Toast stays the default. A *completion* is not a *success message* — a logged water should be confirmed by the object moving, not by a toast **and** an animation **and** a haptic all firing at once. **Pick one primary confirmation per action.**
- **Destructive.** Unchanged: `Alert` confirm for irreversible (Remove routine); Undo toast for reversible (delete entry, clear day). Codify: **reversible → Undo, never a dialog; irreversible → dialog that states what is kept.**
- **Motion budget.** No transition over ~700ms. Nothing animates on mount that could animate on change. **Motion communicates change; if nothing changed, nothing moves.**

## M.3 Haptics — recommendation

`expo-haptics` is **not installed** and nothing calls it. It is the correct dependency (first-party Expo, SDK-54-aligned, no native config in Expo Go).

**Recommendation: add `expo-haptics` in slice 5.1, behind a thin `src/lib/haptics/` wrapper** — so every call site is `vitaHaptic('confirm')` rather than a raw Expo call, giving one place to add a user preference or a global disable later. **This is a new dependency and needs the §W.5 ruling.**

Proposed vocabulary — deliberately four:

| Category | Expo mapping | Fires on |
|---|---|---|
| **Selection** | `selectionAsync()` | quick-add chip, unit switch, site zone, segmented tab |
| **Confirmation** | `impactAsync(Light)` | water logged, dose recorded, entry saved |
| **Completion** | `notificationAsync(Success)` | daily goal reached, day's routines all answered — **rare by design** |
| **Warning** | `notificationAsync(Warning)` | destructive confirm, save failure |

**Rules:** never on scroll, navigation, or render. Never twice for one action. Never as decoration. A haptic accompanies a *state change the user caused*.

## M.4 Bottom sheets — recommendation

**Recommendation: build one small `VitaSheet` primitive on React Native's own `Modal`. Do not add a sheet dependency.**

Evidence: four working sheets already exist on RN `Modal` (`TakenSheet`, `RoutineDaySheet`, `CategorySelector`, `SiteSelector`), two of which share a byte-identical backdrop (`rgba(0,0,0,0.4)`) and sheet shell (`borderTopLeftRadius: radii.card`, `maxHeight: '88%'`, head row with title + close). `CategorySelector`'s own docstring already records the deliberate choice: *"Built from React Native's own Modal rather than a sheet library."* The primitive is extraction, not invention — roughly the shared backdrop + shell + head + scroll body, ~80 lines.

`@gorhom/bottom-sheet` would bring `react-native-reanimated` **and** `react-native-gesture-handler` — two new native dependencies, for gesture-driven snap points nothing in the current flows needs. **Not justified.** *(Reconsider only if drag-to-dismiss with snap points becomes a hard requirement — record as a future decision, not a Sprint 5 one.)*

`VitaSheet` should own: backdrop + dismiss · top radius + safe-area bottom · optional head (title / back / close) · scrollable body · `onRequestClose` (Android back) · reduce-motion-aware presentation. It unblocks Water's quick-add (§F.4) and lets the four existing sheets converge in 5.7 — **converge, not rewrite; their contents are founder-approved.**

**One known constraint to design around:** `SiteSelector` opens a `Modal` **inside** `TakenSheet`'s `Modal`. Nested modals work but are fragile; `VitaSheet` should support a **layered/pushed mode** (which `SiteSelector` already emulates internally with its `list | custom | map` modes) rather than a second `Modal`.

---

# N. Reusable Primitives — what is actually justified

For each: the problem, the screens, and why an existing primitive is insufficient.

| Primitive | Problem it solves | Screens | Why existing is insufficient | Verdict |
|---|---|---|---|---|
| **`VitaSheet`** | 4 duplicated `Modal` shells; Water has no sheet at all | Water quick-add, Taken, RoutineDay, Category, Site | No sheet primitive exists. `Toast` is not a sheet | ✅ **Build (5.1)** |
| **Surface role prop on `Card`** (`ground` / `module` / `panel` / `tile`) | Container-by-default (§B.2); `style={panel}` re-invented ≥6× | All | `Card` has exactly one treatment | ✅ **Build (5.1)** — extend `useCardSurfaceStyle`, don't fork |
| **`SectionHeader` variants** | One weight, up to 12/screen (§B.3) | 28 files | No variant prop | ✅ **Build (5.1)** |
| **Press/haptic layer** (`PressableScale` + `src/lib/haptics/`) | Two press languages; no haptics; reduce-motion unhonoured | All | `PressableScale` has no reduce-motion check and no haptic hook | ✅ **Build (5.1)** |
| **`DisclosureSection`** | Routine has 2 cards + 2 headers of reference detail; Peptides has 2 archival lists; Water has history | Routine, Peptides, Water | Nothing collapsible exists anywhere in the app | ✅ **Build (5.1)** |
| **`BodyMap` `markers` prop** | Rotation cannot be shown (§I.2) | Injection Sites, Routine | Single-selection only | ✅ **Extend (5.5)** — one prop, one layer |
| ~~`FeatureHero`~~ | — | — | Would re-create the sameness problem at hero scale — **see §O** | ❌ **Do not build** |
| ~~`QuickAction`~~ | — | — | `Button` + the press layer covers it. Defer until two screens genuinely need it | ❌ **Defer** |
| ~~`ProgressObject`~~ | — | — | A water vessel and a BMI scale share no geometry. Abstracting them yields a component with a union of props and no shared behaviour | ❌ **Do not build** |

**Six new/extended primitives, five of them in 5.1.** The bar for a seventh should be two independent screens that need it *and* an existing primitive that demonstrably cannot stretch.

## N.1 Completion state — proposal

Completion currently reads as *absence*: `TodayRoutineCard` removes its buttons and shows `✓ Taken · 4:32 PM`; Water's context line switches to `Goal reached`. Correct, but it never *feels* like anything.

Proposal — **the object changes, and one accompanying signal, never three:**

| Event | Visual | Haptic | Text |
|---|---|---|---|
| Water logged | vessel rises (existing 700ms) | Confirmation (light) | total updates |
| Daily hydration goal met | vessel reaches a distinct completed state — a surface treatment change, **not** a burst | Completion | `Goal reached · 64 fl oz` (existing) |
| Dose taken | control settles into a completed state **in place** (not a disappearance) | Confirmation | `✓ Taken · 4:32 PM` (existing) |
| All of today answered | the Today region itself quiets | Completion | factual |

**Explicitly excluded:** confetti · badges · streak celebrations · scores · sounds · anything that reads as reward. VITA has a no-guilt-mechanics rule; its mirror is no-reward-mechanics. Completion should feel like **settling**, not like winning.

## N.2 Empty states — proposal

`EmptyState` is used in **17 files** and is tonally right (quiet, no scolding, no CTA shouting). The problem is structural: it renders with `paddingVertical: xxl` **inside** a section that also has a header, so an empty section costs a header *plus* a 24pt block — three empty sections produce exactly the card-soup texture the sprint is fixing. Peptides' home already has the smarter answer: **sections vanish when empty.**

Proposal: (1) generalize *sections vanish when empty* as a rule wherever a section is genuinely optional; (2) add a **compact inline variant** — one line of tertiary text, no vertical padding block — for empty regions inside a Module; (3) reserve the full `EmptyState` for a screen's *primary* empty condition (no peptides at all, no water logged today). **No motivational filler** — the current copy is already correct and should not be "warmed up."

---

# O. Feature-Specific Elements — what should intentionally NOT be shared

**This section is as important as §N.** Part of the current sameness came from correctly-motivated sharing.

| Element | Belongs to | Never generalize into |
|---|---|---|
| **The hydration vessel** | Water, only | a `HeroCard` / `ProgressObject`. Its geometry, fill semantics and ripple are about liquid. A BMI scale and a dose ring share none of that |
| **`BodyMap`** | Peptides (shared *within* the feature across 3 modes) | a generic "diagram" component |
| **`RoutineDayStrip` / `WaterWeekStrip`** | Peptides / Water respectively | one `WeekStrip`. **Verified different**: `WaterWeekStrip` shows relative volume with no goal semantics (a documented data-integrity decision); `RoutineDayStrip` shows discrete day *marks* and is a control surface. Merging them would force one to adopt the other's semantics |
| **Meal colour language** | Fuel (sunrise→sunset progression) | a general category-colour system |
| **`foodArt` / `foodVisual`** (460 ln) | Fuel | a general illustration system |
| **The Taken/Skipped control pair** | Peptides | a generic two-action row — its "neither pre-selected" rule is domain-specific and safety-motivated |
| **Atlas's orb** | Atlas | anything |

**The rule for 5.1:** a primitive is justified by **shared behaviour**, not by shared silhouette. Two things that are both "a big rounded thing at the top of a screen" are not the same component — and treating them as one is precisely how VITA got here.

---

# P. Accessibility / Reduce Motion

## P.1 What is already good — and must not regress

The codebase's a11y standard is genuinely high, and the redesign is the risk: `ProgressBar` optional `progressbar` role + `accessibilityValue` · `Chip` / `SegmentedTabs` `accessibilityState.selected` + `groupLabel` · `WaterWeekStrip` spells out full weekday + amount (single letters are ambiguous) · `WaterLevelPanel`'s fill is `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` with every figure stated in text · `BodyMap`'s figure is `accessible={false}` with one `Pressable` per zone carrying label + selected state · `PressableScale` adds `accessibilityRole="button"` (a fix recorded in slice 3.6A) · `MetricTile` labels as `"${label}, ${value}"` · Peptides rows spell out the full state.

## P.2 Requirements for every new visual system

1. **Never colour-only.** Completion, selection and due-state must each carry a second signal — text, icon, or shape. Highest risk: `TodayRoutineCard`'s state currently varies **only by colour** (`peptide` / `routineSkipped` / tertiary) — the `✓` and `–` glyphs are what save it. Keep that discipline.
2. **Never animation-only.** Any state reachable only by watching a transition is a defect.
3. **Every visual object needs a text equivalent.** The vessel must be decorative + hidden, with its figures in text (as today). The rotation map needs the §I.4 list equivalent.
4. **Touch targets.** `BodyMap`'s non-overlapping hit-area partition is hard-won (slice 3.8C fixed a bug where tapping Left Abdomen selected Center Abdomen). **Markers must not add new tappable elements over those rectangles.** New compact tiles must keep 44pt or add `hitSlop`.
5. **Dynamic type.** Currently handled ad-hoc (`adjustsFontSizeToFit` + `minimumFontScale={0.6}` on the Water total). Compact modules and utility tiles are where large text will break first — **worth an explicit device check per slice.**

## P.3 Reduce motion — current state and plan

**The app partially respects it.** `useReducedMotion` (subscribing, not one-shot — correct) is honoured by `ProgressBar` and `WaterLevelPanel`, which both land on the final value directly (the right degradation, not a shorter animation). It is **not** honoured by `PressableScale`, `Toast`, or `FuelQuickActions`.

**Plan for Sprint 5:** every new animated component checks it; 5.1's press layer fixes `PressableScale` centrally (which covers 6 call sites at once); `Toast` and `FuelQuickActions` are fixed in 5.7. **Degradation rule, already established in the codebase and worth stating in the Design System: land on the final state directly; never play a shorter version.**

---

# Q. Light / Dark Strategy

**Sprint 5 must not become dark-only.** The theme system is real: `ThemeProvider` resolves System/Light/Dark, tracks live `Appearance` changes, persists to `vita:v1:settings:prefs`, and gates render on hydration to avoid a flash. Every primitive reads `useTheme().surfaces`.

**Light mode is genuinely harder, and the codebase has already been bitten three times — all three are lessons for 5.1:**

1. **`ProgressBar` track:** a pale track on a near-black card read as *100% complete*. Fixed by resolving through `surfaces.track`.
2. **`BodyMap` zones:** *"a zone at 0.11 over a body at 0.14 is a step of about four percent of ink, which survives a design review on a bright screen and disappears on a real one."* Light needed its own separation values **and** a stronger selected purple.
3. **`WaterWeekStrip`:** `palette.waterSoft` was nearly invisible in light and *brighter than today's column* in dark — **inverting the hierarchy in exactly one theme.** Fixed with an alpha of the same hue.

**Rules for every new object:** define **relationships** (fill vs ground vs selected), not values, and give each theme its own numbers — the vessel's fill alpha will not be one number (`WaterLevelPanel` already uses 0.26 dark / 0.16 light) · never use a `*Soft` pastel token on a dark surface · **verify on a real device in both themes** (all three bugs above passed desk review) · `GlassSurface` already carries full light/dark tint/border/highlight/blur sets — if §W.1 extends glass, that structure must be preserved.

---

# R. Risk Register

| # | Risk | Sev | Mitigation |
|---|---|---|---|
| **1** | **Redesigning too many screens at once.** 5.2–5.6 touch every major surface. Historical precedent in this repo: Sprint 1's Dashboard redesign went through "many iterations" and needed a dedicated dead-code cleanup pass | 🔴 | **One screen per slice, device review after each** (§V). No slice opens until the previous is founder-reviewed. 5.6 (Tools) is the deliberate low-risk validation |
| **2** | **Business-logic regression from presentation work.** Water/Peptides are dense, correct, and have subtle documented invariants | 🔴 | §D freeze map. Every slice states its test delta; a presentation slice that changes a `lib/` test has left its lane. 1174-test baseline |
| **3** | **Primitive over-generalization** — the exact mistake that produced today's sameness | 🔴 | §N's justification bar; §O's do-not-share list. **Shared behaviour, not shared silhouette** |
| **4** | **Scope creep into features.** BMI, Reference, scanner and rotation all sit adjacent to redesign work | 🟠 | BMI is its own slice (§K); Reference stays gated by Open Question #17; scanner is frozen (§D.1); rotation is scoped to a marker layer |
| **5** | **Expo Go limitations.** SDK 54 pinned to the App Store Expo Go client so founders can test on real iPhones | 🟠 | No new native modules beyond `expo-haptics` (§W.5). SVG and blur already ship. **Verify `expo-haptics` in Expo Go before 5.3 depends on it** |
| **6** | **Motion performance.** RN `Animated` with `useNativeDriver: false` is required for width/height (`ProgressBar`, `WaterLevelPanel`) and runs on the JS thread | 🟠 | Prefer transform/opacity (native-drivable) for new motion; keep width/height animations rare and short. **Test on the oldest real device available**, not the simulator |
| **7** | **Body-map complexity.** 342 lines with hard-won geometry; hit areas are a non-overlapping partition | 🟠 | Add **one** optional prop and one layer. Do not restructure zones. `hitAreaFor` / `visibleZoneFor` are exported for tests — extend that coverage |
| **8** | **Accessibility regression.** The current standard is high and largely invisible in review | 🟠 | §P.2 as a slice checklist; VoiceOver pass in every device review |
| **9** | **Theme parity.** Three documented light/dark inversions already (§Q) | 🟠 | Both themes on device, every slice. Relationships not values |
| **10** | **Feature-specific visual inconsistency** — five features each becoming its own aesthetic | 🟡 | §L's shared surface roles carry consistency; only the *objects* differ. 5.8 audits it |
| **11** | **The vessel is wrong for VITA.** The founder wants it; the existing code documents a real reason against a literal one (§F.2) | 🟡 | Resolve at §W.2 **before** 5.3. Prototype it early (§U) |
| **12** | **Sprint 4 is unmerged**, so branching from `main` would silently drop it | 🟡 | §Y. Cut Sprint 5 from `952eee1`, or merge Sprint 4 first |
| **13** | **Dashboard fixture data validated on device.** 4 of 5 metric tiles and 2 of 4 pillars are fake; a redesign makes them *look* more credible | 🟡 | §E.2 — resolve fixtures in 5.2, don't carry them forward |

---

# S. Revised Sprint 5 Slice Plan

## S.1 Assessment of the draft order

The draft — 5.1 Design Language → 5.2 Dashboard → 5.3 Water → 5.4 Peptides Home → 5.5 Routine+Sites → 5.6 Tools → 5.7 Motion → 5.8 Review — is **architecturally sound**. Dependencies flow correctly, the riskiest surface (Dashboard) follows the foundation, and review is terminal. Four adjustments:

1. **5.1 is too large as a single slice.** It must deliver surface roles, typography variants, colour rules, a sheet primitive, a press/haptic layer, motion rules, disclosure, *and* a prototype. That is a sprint's worth of foundation in one slice, and it is also the slice whose output everything else depends on. **Split into 5.1 (rules + tokens + prototype, founder-reviewed) and 5.2 (primitives built and one screen migrated).**
2. **Water should come before Dashboard.** Dashboard's composition (§E.3) depends on what a feature module *looks* like, and Water is where the first real visual object gets built. Building Dashboard first means designing Water's module twice — the exact mistake that deferred BMI. **Water → then Dashboard.**
3. **BMI gets its own slice** (§K), after Tools.
4. **Motion should be distributed, then unified.** A pure motion slice at the end tempts every earlier slice to defer polish into it — the "holding pen" failure the Design System explicitly warns against. Each feature slice ships its own motion; the late slice **unifies and fixes gaps** (`PressableScale`, `Toast`, `FuelQuickActions` reduce-motion).

## S.2 Proposed plan — DRAFT, none authorized

| # | Slice | Scope | Depends on |
|---|---|---|---|
| **5.1** | **VITA Design Language — rules & prototype** | Author the Design System's missing sections: surface roles · hierarchy · colour rules · typography variants · spacing rhythm · interaction/motion/haptic rules · completion · disclosure · empty states. Add tokens where needed. **One throwaway coded prototype** (§U) reviewed on device. **No screen migrated.** | — |
| **5.2** | **Foundation primitives** | Build `VitaSheet` · `Card` surface roles · `SectionHeader` variants · press+haptic layer (incl. `PressableScale` reduce-motion fix) · `DisclosureSection`. Add `expo-haptics`. Delete dead `PressableCard`. Fix stale comments (§X.3). **Migrate exactly one screen** as proof — recommend **Tools & Reference hub** (inert logic, low risk) | 5.1 |
| **5.3** | **Interactive Water Experience** | Hydration visual object · quick-add on `/water` · custom via `VitaSheet` · haptics · history disclosure. **Water domain frozen** | 5.2 |
| **5.4** | **Dashboard Identity Redesign** | Remove slogans · resolve fixtures · mixed-module composition · action-first · Tools discoverability (pending §W.4) | 5.3 |
| **5.5** | **Peptides Home Redesign** | Today as hero · completed settles · Needs-setup inline · Active/Inactive disclosure. **Routine state frozen** | 5.2 |
| **5.6** | **Routine + Injection Site Experience** | Routine hierarchy · disclosure for details/preparation/actions · site logging presentation · `BodyMap` `markers` prop · rotation view in Injection Sites | 5.5 |
| **5.7** | **Tools Integration** | Remaining Tools screens to the new language. **Behaviour frozen** (§J.1) | 5.2 |
| **5.8** | **BMI Calculator** | Per Sprint-4 audit §G, built in the new language. New `src/lib/bmi/` | 5.7 |
| **5.9** | **Motion + Microinteraction Unification** | One vocabulary app-wide · fix remaining reduce-motion gaps (`Toast`, `FuelQuickActions`) · converge the 4 existing sheets onto `VitaSheet` · resolve inconsistencies. **Not Sprint 9** | 5.3–5.8 |
| **5.10** | **Founder Review / Identity Audit** | Feature work stops. Full device review, both themes, VoiceOver, reduce-motion. Gate to Sprint 6 | all |

Ten slices vs eight. The additions are a split 5.1 and a promoted BMI — no new scope.

---

# T. Detailed Slice 5.1 Definition

**5.1 must not be a token pass, and must not migrate screens.** It exists so that 5.2 onward can be built confidently and once. Its output is mostly a **document** plus a **throwaway prototype**.

## T.1 Deliverables

**1. `docs/05-Design-System.md` authored — the primary deliverable.** Its own "What this document will define" checklist, filled in:

- **Surface roles** (§L.1) — six roles, each with: definition · when to use · when not to · which screens · code shape.
- **The card decision rule** — a written test a future slice can apply without asking.
- **Hierarchy** — role, width, size, order, in that priority.
- **Typography** — `SectionHeader` variants; the *one `display` per screen* rule; the *largest type is the subject* rule.
- **Colour behaviour** (§L.3) — what feature colour carries and what it must not; one dominant colour per screen; neutral by default.
- **Spacing rhythm** — section vs content gap; `Section` adoption.
- **Interaction rules** (§M.2) — press · selection · completion · success · destructive · motion budget.
- **Haptic vocabulary** (§M.3) — four categories, mapped, with prohibitions.
- **Motion principles** — communicate change, reinforce state, support comprehension; ≤700ms; reduce-motion degradation = land on final state.
- **Sheet behaviour** (§M.4) — when a sheet vs a route vs a toast.
- **Progressive disclosure** (§L.5) — what collapses, what never collapses (never hide the primary action or any safety-relevant text).
- **Completion** (§N.1) and **empty states** (§N.2).
- **Light/dark** (§Q) — relationships not values; the three recorded inversions as worked examples.
- **Accessibility floor** (§P.2) as a per-slice checklist.
- **What is intentionally not shared** (§O) — the discipline that stops this recurring.

**2. Token additions** (`src/theme/tokens.ts`) — only what the rules require: surface-role values, a motion scale (durations + easings + the press spring), elevation levels if roles need more than one shadow. **No domain hue changes. No removals.**

**3. One coded prototype** (§U), on a scratch route, **not merged into a product screen**.

**4. A component migration strategy** — an ordered map from each existing primitive to its new role, listing every call site, so 5.2+ are mechanical rather than exploratory. `PressableCard` is marked for deletion; `MetricTile`'s divergent press path is marked for consolidation.

**5. Findings recorded, not fixed** — the stale comments (§X.3) and `PressableCard`, handed to 5.2.

## T.2 Explicitly NOT in 5.1

No screen redesigned · no primitive rewritten · no dependency added (that is 5.2) · no `lib/` change · no route change · no BMI, Reference, or scanner work.

## T.3 Definition of Done

Design System authored and **founder-approved on device via the prototype** · tokens added, all 1174 tests still green, `tsc --noEmit` clean · prototype reviewed in Light **and** Dark on a real iPhone with reduce-motion both on and off · migration strategy written · §W decisions ruled on · Slice Tracker updated.

---

# U. Prototype Recommendation

**Recommendation: yes — one prototype, in 5.1, on a scratch route, thrown away afterward.**

Rationale: three of the sprint's biggest risks (§R.6 motion performance, §R.9 theme parity, §R.11 the vessel) are **device-only questions**. All three of the light/dark inversions in §Q passed desk review and failed on hardware. A prototype is the cheapest possible way to move those risks to the front.

**What to prototype — one screen containing three things:**

1. **The Water vessel proof-of-concept.** Answers the most contested question (§W.2), the technique question (SVG vs masked view — including re-verifying the `ClipPath`-on-device caveat recorded in `BodyMap`), the perf question, and the light/dark question. **Highest information per hour of any option.**
2. **One Dashboard module in the new surface roles**, beside one in the current `Card` — a direct A/B of "does this actually feel like VITA."
3. **The press + haptic + completion micro-loop** — tap a quick-add, feel the haptic, watch the fill rise, see the completion settle. This is the sprint's thesis in three seconds, and it is the thing a written document cannot convey.

**Lowest-risk way to run it:** a scratch route (e.g. `src/app/(vita)/_proto.tsx`) that imports nothing from `src/lib/` — the vessel is driven by a local slider, not by real water state. It cannot regress a domain because it never touches one. **Deleted at the end of 5.1**, with anything proven promoted deliberately in 5.2/5.3.

---

# V. Founder Review Gates

**Device review is mandatory — Light and Dark, real iPhone, reduce-motion on and off — after every one of these. No two large visual slices may accumulate without a review in between.**

| Gate | After | Question it answers |
|---|---|---|
| **G1** 🔴 | **5.1** (prototype) | Is this VITA? Is the vessel right (§W.2)? Do the surface roles read? **Blocks everything** |
| **G2** | **5.2** (primitives + one migrated screen) | Does the language survive contact with a real screen? |
| **G3** 🔴 | **5.3** (Water) | Does the hero interaction feel premium and not cartoonish? |
| **G4** 🔴 | **5.4** (Dashboard) | Is Home action-first and recognizable? Are fixtures resolved? |
| **G5** | **5.5 + 5.6** (Peptides + Routine) | *"What do I need to do today?"* — answered at a glance? |
| **G6** | **5.7 + 5.8** (Tools + BMI) | Do tools belong to the same product? |
| **G7** 🔴 | **5.10** | *"Would I genuinely want to use this app every day?"* **Gates Sprint 6.** |

G1, G3, G4 and G7 are hard stops. G5 and G6 may pair two slices because both are lower-risk migrations of already-approved behaviour.

---

# W. Decisions Needed From Founder

Concrete rulings. Everything above is a recommendation until these are answered.

### W.1 — The two surface systems 🔴 *blocks 5.1*
Home uses `GlassSurface` (blur); every other screen uses `Card` (opaque). Which becomes the language? **(a)** Glass extends app-wide *(most distinctive; blur cost on every screen; hardest to keep legible in Light)* · **(b)** Glass is retired to the dock only, and one refined opaque system carries the app *(safest, most performant)* · **(c)** Glass becomes a deliberate, rare role — the dock plus one hero surface per screen. **Audit recommends (c).**

### W.2 — The hydration vessel 🔴 *blocks 5.3, should be answered at G1*
`WaterLevelPanel` deliberately rejected a vessel and recorded a correctness reason: a vessel implies a fixed capacity, and VITA's goal is user-chosen across four units (§F.2). **(a)** abstract vessel-shaped object, no measurement marks, fill = % of goal *(recommended)* · **(b)** literal vessel, accepting the implied-capacity issue · **(c)** keep the abstract level, refine it. The prototype is designed to answer this.

### W.3 — Dashboard fixture data 🔴 *blocks 5.4*
4 of 5 Health Metric tiles and 2 of 4 goal pillars are fixtures. **(a)** remove until a real feature exists *(recommended)* · **(b)** keep, visibly marked unavailable · **(c)** keep as-is.

### W.4 — Tools on Home 🟠 *shapes 5.4*
The standing rule is *"Home is not a launcher,"* but Tools is reachable only via Settings and the brief lists compact utility modules. Is a low-weight utility affordance on Home approved, or does the rule stand?

### W.5 — `expo-haptics` 🟠 *blocks the haptic vocabulary*
Approve adding `expo-haptics` (first-party Expo, SDK-54-aligned, no native config, Expo-Go-compatible) behind a `src/lib/haptics/` wrapper? Without it, §M.3 does not happen. **Audit recommends yes.**

### W.6 — Slice plan 🔴 *blocks sprint open*
Approve the §S.2 ten-slice plan — specifically: splitting 5.1 into rules-and-prototype + primitives; **moving Water before Dashboard**; BMI as its own slice; motion distributed then unified.

### W.7 — BMI placement 🟠
Confirm BMI as slice **5.8** (own slice after Tools), per §K.

### W.8 — Rotation visualization scope 🟠 *shapes 5.6*
Confirm: rotation lives primarily in the **Injection Sites tool** (all-peptide), with a compact read-only week view embedded in Routine — and confirm **no peptide colour-coding** and **no "next site" suggestion of any kind**.

### W.9 — Branch strategy 🔴 *blocks any Sprint 5 commit*
See §Y. Sprint 4 is complete but **unmerged** (5 commits ahead of `main`). Merge Sprint 4 to `main` first and cut Sprint 5 from `main`, or cut Sprint 5 directly from `952eee1`?

### W.10 — Prototype 🟠
Approve one throwaway prototype route in 5.1 (§U), deleted at slice end?

---

# X. Documentation Changes

## X.1 Created by this session
- **`docs/Sprint-5-Planning-Audit.md`** — this document. Marked DRAFT / PENDING FOUNDER APPROVAL.

## X.2 To update **after** founder approval — not before
- `docs/06-Slice-Tracker.md` → Sprint 5: replace the draft 8-slice table with the approved plan; record §W rulings. **Sprint 5 stays ⬜ NOT OPENED until a slice is authorized.**
- `docs/05-Design-System.md`: point its Sprint 5 section at this audit. **The document itself is authored by slice 5.1, not by this audit.**
- `docs/Sprint-5-Identity-Brief.md`: add a pointer to this audit. The brief stays as authored — it records founder direction, and this audit is the architecture response to it.
- Vita HQ (`docs/Vita HQ`) — **only if founder decisions change knowledge.** Candidates once §W is ruled on: `00 HQ/Decision Log.md` (W.1, W.2, W.5), `00 HQ/Current Sprint.md`, `00 HQ/Open Questions.md`, `03 Design/Design Bible.md` + `Motion & Animation.md` + `Component Library.md` (after 5.1 authors the system, not now). Per the CLAUDE.md checkpoint: **this planning session alone does not change Vita HQ knowledge**, so Vita HQ is untouched.

## X.3 Findings reported for 5.2, not fixed here (§43)

Stale sprint numbering in source comments. **Not edited** — this audit is docs-only.

| File | Line | Says | Should say |
|---|---|---|---|
| `src/theme/useReducedMotion.ts` | 5 | *"Sprint 8 owns the shared motion vocabulary"* | Sprint 5 establishes the vocabulary; Sprint 9 does the app-wide pass |
| `src/lib/preferences/model/types.ts` | 64 | *"Journey / Weight in Sprint 5"* | Journey / Weight is **Sprint 6** |
| `src/lib/preferences/model/types.ts` | 61 | *"Extension point — Slice 4.4 (BMI)"* | BMI's real slice number (5.8 if §W.7 approved) — already recorded as a known follow-up in the Slice Tracker |
| `src/app/(vita)/settings/units.tsx` | 24 | *"...belong to the BMI calculator in slice 4.4"* | same as above |

Also for 5.2: **`src/components/ui/PressableCard.tsx` has zero call sites** — dead code, recommend deletion.

---

# Y. Commit / Branch State

## Y.1 Verified state

Repository `/Users/wilber/vita-app` · branch `sprint-4-settings-tools-reference` · HEAD `952eee1` (= `origin/sprint-4-settings-tools-reference`) · **working tree clean** · `952eee1` confirmed present · tests **44 suites / 1174 passing**.

**No Sprint 5 branch exists**, locally or on `origin`.

**`main` is at `8b8ec8d`** — Sprint 4's five commits (`aa1c60a`, `87fbf02`, `238d046`, `1de3353`, `952eee1`) are **ahead of `main` and not merged**. `main` has nothing the sprint branch lacks.

## Y.2 Why no branch was created

The Build Handbook's Branch Policy is clear that sprint work lives on a dedicated sprint branch named for the sprint (e.g. `sprint-1-dashboard-wilber`), and Sprint 4's precedent is that the planning audit commits to the sprint branch (`aa1c60a` on `sprint-4-settings-tools-reference`, cut from `main` **before** the audit).

**But the convention is not unambiguous here, because Sprint 4 is unmerged.** A Sprint 5 branch cut from `main` — which is what every prior sprint did — would silently lack all of Sprint 4. That is a real decision with a real consequence, and §45 of the authorization directs me to report rather than guess. **No branch was created.**

## Y.3 Recommended branch strategy — for founder approval (§W.9)

**Recommended:** merge Sprint 4 into `main` first (matching how Sprints 2 and 3 closed — `44eeae6`, `2bac43b`), then cut `sprint-5-identity-interaction` from `main`. This keeps `main` the integration branch, keeps Sprint 5 cut from `main` like every prior sprint, and makes Sprint 4's completed work visible where it belongs.

**Alternative:** cut `sprint-5-identity-interaction` directly from `952eee1` and merge both sprints later. Fewer steps now; leaves `main` two sprints behind.

**Not recommended:** continuing Sprint 5 work on `sprint-4-settings-tools-reference`.

## Y.4 This document's commit

This audit is committed to the current branch — consistent with `952eee1`, the roadmap-alignment commit that introduced Sprint 5 and also landed here.

```
docs(sprint-5): plan identity and interaction architecture
```

**No merge to `main`. No new branch. No source changes.**

## Y.5 Validation (§44)

| Check | Result |
|---|---|
| No source code changed | ✅ `src/` untouched — `git status` shows only this new doc |
| No `package.json` change | ✅ No dependency added |
| Roadmap intact | ✅ `docs/04-Master-Roadmap.md` unmodified; `952eee1` present |
| Sprint 5 still not started | ✅ No branch, no slice opened, no 5.x implementation |
| Tests baseline unchanged | ✅ 44 suites / 1174 passing, exit 0 — same before and after |
| No new branch | ✅ None created |
| No merge to `main` | ✅ None performed |

---

**Prepared 2026-09-02. Awaiting founder review. Slice 5.1 is not started and is not authorized to start.**
