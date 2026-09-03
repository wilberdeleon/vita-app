# Sprint 5 — VITA Identity & Interaction
# Planning & Architecture Audit

# ✅ FOUNDER-REVIEWED AND APPROVED — 2026-09-02

**The audit is approved and the §W decisions are ruled on.** The rulings are recorded in **§W** and are authoritative; where an earlier section states a *recommendation* that §W has since ruled on, §W wins. The approved slice structure is in **§S.2**.

**No slice is open and no implementation has started.** Approval of this plan is not authorization to build: **slice 5.1 requires its own founder authorization** under the normal slice workflow (`docs/03-Build-Handbook.md`).

*This document was written as a planning draft and is preserved as authored, with the founder rulings added. Nothing in `src/` was modified to produce it.*

| | |
|---|---|
| Prepared | 2026-09-02 |
| Repository | `/Users/wilber/vita-app` |
| Branch | `sprint-4-settings-tools-reference` |
| HEAD | `952eee1` — "docs: introduce VITA Identity & Interaction sprint" ✅ verified present |
| Working tree | Clean — no staged, unstaged, or untracked changes |
| Baseline | `npx jest` — **44 suites / 1174 tests passing**, exit 0 |
| Sprint 4 | ✅ Complete (slices 4.1, 4.2, closeout). **5 commits ahead of `main`, not yet merged.** |
| Sprint 5 | ⬜ Not started. Branch `sprint-5-identity-interaction` created from merged `main` after this audit was approved — see §Y |
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
2. **Retire every fixture surface. ✅ RULED (§W.3)** — *"If real data exists, use real data. If it doesn't, don't fabricate activity just to make a module look populated."* Steps/sleep/workouts/streak/Movement/Recovery have no feature behind them and do not survive the redesign. The founder flagged this as especially load-bearing **before** Home is called action-oriented.
3. **Adopt a mixed-module composition** (§E.3) rather than a symmetrical grid.
4. **Give Water, Peptides and Tools real presence. ✅ RULED (§W.4)** — a meaningful **Tools destination/module** is approved, and **Home must not become a generic app launcher**: not six small icons for every utility. One or two *contextual* shortcuts may follow later. **No specific layout is authorized** — it is designed during slice 5.3.

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

The founder wanted a premium hydration vessel as the hero, and this was a genuine tension — the reasoning above is about correctness, not taste.

**✅ RESOLVED (§W.2): build the vessel, as Option A.** The founder ruled that the concern was legitimate and the proposed resolution is exactly right — **the object represents percentage of the user's chosen goal, not a literal fixed-capacity container.**

- **Option A — Abstract vessel ✅ APPROVED.** A vessel-*shaped* silhouette that is explicitly not a real container: **no ounce or volume markings**, no cap, no branded bottle form; a tall soft-cornered form whose fill maps to *percentage of goal*. 33% of goal reads ~33% full whether the goal is 3 cups, 100 fl oz or 2 L. Keeps the tactile hero; keeps the "no implied capacity" correctness; **preserves the Water math, units, storage, goals and entries exactly.**
- ~~Option B — Literal vessel.~~ Rejected: it would imply a capacity the app does not have.

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

**✅ RULED (§W.8): one shared `BodyMap` gaining a marker layer. The standalone Injection Sites Tool becomes the richest historical / rotation visualization; Routine may reuse a smaller contextual weekly representation later. No duplicate body-map implementation.**

> **Founder: "I would not jam the entire multi-peptide historical explorer into every Routine screen."**

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

**✅ RULED (§W.7): BMI is its own slice — `5.8`, after Tools Integration. Not folded into Tools cleanup.** The audit recommended this and the founder approved it, keeping 5.6 focused on the *existing working* Tools.

Reasons: (1) 5.6 is a *migration* slice (existing screens → new language, zero new features); BMI is a **new feature with a new domain module** (`src/lib/bmi/`) and new persistence questions. Mixing them makes 5.6's regression surface unbounded. (2) BMI is the **best possible proof of the new language** — a result, a category scale, and a premium visual representation is exactly the "visual object instead of a summary card" case §L proposes; building it in the new system from scratch is why it was deferred in the first place. (3) It has a real dependency on 5.1 and a real seam into Sprint 6 (Journey/Weight owns stored height + latest weight) that a sub-item of a migration slice would blur.

Constraints, unchanged: height · weight · result · category range · premium visual representation · **no BMI history that shadows Journey** · Journey integration deferred to Sprint 6.

**Housekeeping this creates:** two source comments still name "slice 4.4" as BMI's home — `src/lib/preferences/model/types.ts:61` and `src/app/(vita)/settings/units.tsx:24`. The Slice Tracker already records these as deliberate. Once BMI has a real number, correct them **in that slice**.

---

# L. Visual Language

*Proposals for 5.1. Derived from the screens audited above, not adopted from a taxonomy.*

## L.1 Surfaces — six roles

The rule this replaces: *"content needs containing, therefore `Card`."* The rule proposed: **a surface's treatment is chosen by what the content is for.**

**✅ Ordered by founder ruling §W.1: Ground is the default.** A container is not the baseline that other roles deviate from — *no container* is. Module, Panel and Sheet each need a reason; **Glass is a rare emphasis / layering / navigation role, never the default container.** Feature-specific visual objects are preferred wherever the activity benefits from its own representation. The binding constraint on 5.1: **do not replace card soup with glass soup.**

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

**✅ APPROVED (§W.5): add `expo-haptics` in slice 5.1, behind a thin `src/lib/haptics/` wrapper** — so every call site is `vitaHaptic('confirm')` rather than a raw Expo call, giving one place to add a user preference or a global disable later. The founder's condition: **a restrained, intentional vocabulary — not a haptic on every tap.**

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

## S.2 ✅ APPROVED SLICE STRUCTURE — founder-ruled 2026-09-02 (§W.6)

**This is the authoritative Sprint 5 slice structure.** It supersedes both the draft plan in `docs/Sprint-5-Identity-Brief.md` §8 and this audit's own earlier ten-slice proposal. **No slice is open; each still requires its own founder authorization to begin.**

| # | Slice | Scope | Depends on |
|---|---|---|---|
| **5.1** | **VITA Design Language + Identity Prototype** | Author the Design System's missing sections: surface roles (per §W.1) · hierarchy · colour rules · typography variants · spacing rhythm · interaction / motion / haptic rules · completion · disclosure · empty states. Add tokens. Build the **minimal** primitives the language requires. Add `expo-haptics` (§W.5). **Small coded identity prototype** — Water visual object + foundational surface/interaction primitives + the motion and haptic behaviour needed to validate the identity (§W.10). **No production screen redesigned.** | — |
| **5.2** | **Interactive Water Experience** | First complete feature in the new language. Hydration visual object (§W.2 — % of goal, no capacity markings) · quick-add on `/water` · custom amount via the sheet primitive · haptics · history disclosure. **Water domain, units, storage, goals and entries frozen** | 5.1 |
| **5.3** | **Dashboard Identity Redesign** | Real data only — **fixtures removed, nothing fabricated** (§W.3) · no generic slogans · action-first composition · mixed module sizes · Tools destination/module, **not a launcher** (§W.4) | 5.2 |
| **5.4** | **Peptides Home Redesign** | Today as hero · completed settles in place · Needs-setup inline · Active/Inactive progressive disclosure. **Routine and log state frozen** | 5.1 |
| **5.5** | **Routine + Injection Site Experience** | Routine hierarchy — immediate action dominant · disclosure for details / preparation / actions · site-logging presentation · **shared `BodyMap` evolution** and rotation visualization (§W.8) | 5.4 |
| **5.6** | **Tools Integration** | Make Sprint 4's **existing working** Tools visually belong to new VITA. **Behaviour frozen** (§J.1). No new tools | 5.1 |
| **5.7** | **Motion + Microinteraction Unification** | Clean up inconsistencies once several real features use the vocabulary · fix remaining reduce-motion gaps (`Toast`, `FuelQuickActions`) · converge the four existing sheets onto the shared primitive. **Not Sprint 9** | 5.2–5.6 |
| **5.8** | **BMI Calculator** | Built from scratch in the new system (§W.7). Per Sprint-4 audit §G: new `src/lib/bmi/`, premium visual representation, **no BMI history that shadows Journey** | 5.6 |
| **5.9** | **Founder Identity Audit** | Feature work stops. Real-device review, both themes, VoiceOver, reduce-motion. **Journey does not begin until this passes.** | all |

**Nine slices.** Versus the draft's eight: Water moves ahead of Dashboard, BMI is promoted out of Tools, and the motion pass moves earlier so it unifies real usage rather than absorbing deferred polish. The audit's proposed separate "foundation primitives" slice is folded back into 5.1 (§W.6).

**Deferred, not cancelled** (§W.11): richer Food Scanner work · Research Library (gated by Open Question #17) · Dashboard Tools discoverability beyond what the redesigned Home intentionally needs.

**Housekeeping reassigned:** the stale source comments and the dead `PressableCard` (§X.3) were listed against the audit's old 5.2. They now belong to **5.1**, except the comment corrections made as branch-creation housekeeping — see §X.3.

---

# T. Detailed Slice 5.1 Definition

**5.1 must not be a token pass, and must not redesign a production screen.** It exists so that 5.2 onward can be built confidently and once.

**Revised by §W.6.** The audit originally proposed splitting 5.1 in two, with primitives in a separate slice; the founder folded them back together. **5.1 therefore delivers three things: the authored rules, the minimal primitives those rules require, and the identity prototype.** The constraint that replaces the split is narrower and clearer: **5.1 builds primitives but redesigns no production screen** (§W.10).

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

**3. The minimal primitives the language requires** (§W.6) — the shared sheet primitive · `Card` surface roles per §W.1 · `SectionHeader` variants · the press + haptic layer (including `PressableScale`'s missing reduce-motion check, which fixes 6 call sites centrally) · `DisclosureSection`. **Minimal is the operative word** — §N's justification bar applies, and a seventh primitive needs two independent screens that need it.

**4. `expo-haptics` added** (§W.5), behind a thin `src/lib/haptics/` wrapper so every call site is one function and a future global disable has one home.

**5. The identity prototype** (§U) — Water visual object + the foundational surface/interaction primitives + the motion and haptic behaviour needed to judge the identity. On a scratch route. **Not a redesigned production screen** (§W.10).

**6. A component migration strategy** — an ordered map from each existing primitive to its new role, listing every call site, so 5.2+ are mechanical rather than exploratory. `PressableCard` is marked for deletion; `MetricTile`'s divergent press path is marked for consolidation.

## T.2 Explicitly NOT in 5.1

**No production screen redesigned** · no `lib/` domain change · no route change (the scratch prototype route excepted, and it is deleted at slice end) · no BMI, Reference, or scanner work · no dependency beyond `expo-haptics`.

## T.3 Definition of Done

Design System authored · primitives built · `expo-haptics` integrated behind the wrapper · **founder-approved on device via the prototype (gate G1)** · all 1174 tests still green, `tsc --noEmit` clean, `expo install --check` clean · prototype reviewed in Light **and** Dark on a real iPhone with reduce-motion both on and off · migration strategy written · scratch prototype route removed · Slice Tracker updated.

---

# U. Prototype — ✅ APPROVED (§W.10)

**One prototype, in 5.1, on a scratch route, thrown away afterward.** The founder approved this and named the focus: the Water visual object, the foundational surface/interaction primitives, and the motion/haptic behaviour needed to validate the identity — **not an entire redesigned screen.**

Rationale: three of the sprint's biggest risks (§R.6 motion performance, §R.9 theme parity, §R.11 the vessel) are **device-only questions**. All three of the light/dark inversions in §Q passed desk review and failed on hardware. A prototype is the cheapest possible way to move those risks to the front.

**What to prototype — one screen containing three things:**

1. **The Water vessel proof-of-concept.** Answers the most contested question (§W.2), the technique question (SVG vs masked view — including re-verifying the `ClipPath`-on-device caveat recorded in `BodyMap`), the perf question, and the light/dark question. **Highest information per hour of any option.**
2. **The surface roles shown side by side** — one block as Ground (direct on background, per §W.1's default), one as a Module, one as Glass — against the equivalent in today's `Card`. A direct A/B of "does this actually feel like VITA", and the fastest way to check the founder's *"don't replace card soup with glass soup"* constraint before it is written into five screens.
3. **The press + haptic + completion micro-loop** — tap a quick-add, feel the haptic, watch the fill rise, see the completion settle. This is the sprint's thesis in three seconds, and it is the thing a written document cannot convey.

**Lowest-risk way to run it:** a scratch route (e.g. `src/app/(vita)/_proto.tsx`) that imports nothing from `src/lib/` — the vessel is driven by a local slider, not by real water state. It cannot regress a domain because it never touches one. **Deleted at the end of 5.1**, with anything proven promoted deliberately in 5.2/5.3.

---

# V. Founder Review Gates

**Device review is mandatory — Light and Dark, real iPhone, reduce-motion on and off — after every one of these. No two large visual slices may accumulate without a review in between.**

*Renumbered to the approved nine-slice structure (§S.2).*

| Gate | After | Question it answers |
|---|---|---|
| **G1** 🔴 | **5.1** — Design Language + prototype | Is this VITA? Is the vessel right (§W.2)? Do the surface roles read, and has "card soup" become "glass soup" (§W.1)? **Blocks everything** |
| **G2** 🔴 | **5.2** — Water | Does the hero interaction feel premium and not cartoonish? Does the language survive contact with a real feature? |
| **G3** 🔴 | **5.3** — Dashboard | Is Home action-first and recognizable? Are the fixtures actually gone (§W.3)? Is Tools a destination and not a launcher (§W.4)? |
| **G4** | **5.4 + 5.5** — Peptides + Routine | *"What do I need to do today?"* — answered at a glance? |
| **G5** | **5.6 + 5.7** — Tools + Motion unification | Do Tools belong to the same product? Is the interaction vocabulary consistent? |
| **G6** | **5.8** — BMI | Does a brand-new feature look native to the new identity? |
| **G7** 🔴 | **5.9** — Founder Identity Audit | *"Would I genuinely want to use this app every day?"* **Gates Sprint 6 / Journey.** |

**G1, G2, G3 and G7 are hard stops.** G2 replaces the old G3 as the first real-feature gate — a direct consequence of moving Water ahead of Dashboard (§W.6), and the reason that reorder is worth the churn: the identity is judged on a finished feature before four more screens commit to it. G4 and G5 may pair two slices because both are migrations of already-approved behaviour.

---

# W. Founder Rulings — ✅ ALL DECIDED 2026-09-02

**These are decisions, not recommendations. Where an earlier section of this audit proposed something different, these rulings override it.**

### W.1 — Surface system ✅ RULED
**No single surface wins globally.** Neither `Card` nor `GlassSurface` becomes the default. The approved hierarchy:

1. **Direct-on-background content is the default.**
2. **Opaque / elevated surfaces** are used when content *genuinely needs grouping* — not as the automatic answer to containment.
3. **`GlassSurface` is a rare emphasis / layering / navigation role**, not the new default container.
4. **Feature-specific visual objects** are preferred where the activity benefits from its own representation.

> **Founder framing, binding on 5.1: "Avoid replacing card soup with glass soup."**

This is close to the audit's recommended option (c), but stronger: it makes *no container at all* the default rather than making a container role the default. §L.1's six roles stand, re-ordered so **Ground** is the default and **Module**, **Panel** and **Sheet** are each justified by a reason, with **Glass** as a deliberate rarity.

### W.2 — Hydration vessel ✅ APPROVED
**Build the vessel.** The audit's §F.2 concern was legitimate and its Option A is the resolution: the object represents **percentage of the user's chosen hydration goal**, not a literal fixed-capacity container.

- **No ounce/volume markings.** No fake physical capacity.
- **No implication that the drawn vessel equals the user's chosen daily goal.**
- Fill maps to **0–100% of goal progress** — 33% of goal reads ~33% full, whether the goal is 3 cups, 100 fl oz or 2 L.
- **All existing Water math, units, storage, goals and entries preserved exactly** (§D freeze stands).

### W.3 — Dashboard fixtures ✅ RULED — option (a)
**Fixture data does not survive the identity redesign.** Use real application state where it exists. Where it does not, **do not invent activity to make a module look populated.** Explicitly load-bearing before Home is called "action-oriented."

### W.4 — Tools on Home ✅ APPROVED as direction, layout not authorized
A meaningful **Tools destination/module** is approved. **Home must not become a generic app launcher** — not six small icons for every utility. One or two *contextual* shortcuts may follow later. **Designed during the Dashboard slice; no specific layout is authorized by this document.**

### W.5 — `expo-haptics` ✅ APPROVED
Approved for Sprint 5 where needed. **Restrained, intentional vocabulary only.**

> **Founder: "Don't vibrate on every tap."**

§M.3's four categories — Selection · Confirmation · Completion · Warning — and its prohibitions (never on scroll, navigation, render; never twice for one action; never decorative) are the standard.

### W.6 — Slice plan ✅ APPROVED, with one revision
The founder approved the audit's substantive changes — **Water before Dashboard**, BMI as its own slice, motion distributed then unified — and **folded the audit's proposed separate "foundation primitives" slice back into 5.1**, which now delivers rules, minimal primitives *and* the prototype together. Result is **nine slices**, not ten. See **§S.2**.

Founder rationale for Water-before-Dashboard, recorded verbatim: *"Water is our best place to prove the new identity because it has a clear visual object and interaction. Once that works, Dashboard can reference that language rather than guessing."*

### W.7 — BMI ✅ APPROVED as its own slice — **5.8**
BMI is no longer part of generic Tools foundation work.

> **Founder: "We specifically delayed it so it could be born in the new identity. Let's actually do that rather than squeezing it into generic Tools cleanup."**

This keeps **5.6 Tools Integration** focused on the *existing working* Tools, and treats BMI as the new feature it is.

### W.8 — Injection rotation ✅ RULED
Build the capability around the **existing shared `BodyMap`**. The standalone **Injection Sites Tool becomes the richest historical / rotation visualization**; **Routine may reuse a smaller contextual weekly representation** later. **Do not create a duplicate body-map implementation.**

> **Founder: "I would not jam the entire multi-peptide historical explorer into every Routine screen."**

The audit's §I.3 constraints stand: no peptide colour-coding, no "next site" suggestion, no rest timers, no good/bad colour scale.

### W.9 — Branch strategy ✅ RULED — audit recommendation adopted
Merge Sprint 4 into `main`, then create `sprint-5-identity-interaction` from the merged state. **Sprint 5 does not start on the old Sprint 4 branch.** Executed — see §Y.

### W.10 — Prototype ✅ APPROVED
Slice 5.1 includes a **small coded identity proof-of-concept**. Preferred focus: the **Water visual object** · **foundational surface / interaction primitives** · the **motion and haptic behaviour needed to validate the identity**.

> **Founder: "Not an entire redesigned screen… That gives us something meaningful to judge on-device before redesigning five screens."**

**Do not redesign a whole production screen during the prototype phase unless separately authorized.**

### W.11 — Deferred work reconfirmed ✅
Still deferred, not cancelled: **richer Food Scanner work** · **Research Library** (still gated by Open Question #17) · **Dashboard Tools discoverability beyond what the redesigned Home intentionally needs.**

---

# X. Documentation Changes

## X.1 Created / updated by the planning sessions
- **`docs/Sprint-5-Planning-Audit.md`** — this document. Written 2026-09-02 (`7743443`), **founder-reviewed and approved the same day**; the §W rulings and the approved §S.2 slice structure were then recorded into it.

## X.2 To update when Sprint 5 actually opens — not before
- `docs/06-Slice-Tracker.md` → Sprint 5: replace the draft 8-slice table with §S.2's approved nine, and record the §W rulings. **Sprint 5 stays ⬜ NOT OPENED until slice 5.1 is separately authorized.**
- `docs/05-Design-System.md`: point its Sprint 5 section at this audit. **The document itself is authored by slice 5.1, not by this audit.**
- `docs/Sprint-5-Identity-Brief.md`: add a pointer to this audit. The brief stays as authored — it records founder direction, and this audit is the architecture response to it. Its §8 draft slice table is superseded by §S.2.
- Vita HQ (`docs/Vita HQ`) — **only where founder decisions change knowledge.** Now genuinely applicable, since §W contains real product decisions: `00 HQ/Decision Log.md` (W.1 surface hierarchy, W.2 vessel-as-percentage, W.3 no fabricated data, W.5 haptics), `00 HQ/Current Sprint.md` (approved slice structure), `03 Design/Design Bible.md` + `Motion & Animation.md` + `Component Library.md` (**after 5.1 authors the system**, not now).

## X.3 Stale source comments (§43) — status

Reported by the audit, **not** fixed by it. Corrected afterwards as comment-only housekeeping on the new Sprint 5 branch, under the founder's branch-creation authorization — zero runtime behaviour change, zero test change.

| File | Said | Now says | Status |
|---|---|---|---|
| `src/theme/useReducedMotion.ts` | *"Sprint 8 owns the shared motion vocabulary"* | Sprint 5 establishes the vocabulary; Sprint 9 does the app-wide pass | ✅ corrected |
| `src/lib/preferences/model/types.ts` | *"Journey / Weight in Sprint 5"* | Journey / Weight is **Sprint 6** | ✅ corrected |
| `src/lib/preferences/model/types.ts` | *"Extension point — Slice 4.4 (BMI)"* | Slice **5.8** | ✅ corrected |
| `src/app/(vita)/settings/units.tsx` | *"...the BMI calculator in slice 4.4"* | Slice **5.8** | ✅ corrected |

**Deferred, deliberately not done:** `src/components/ui/PressableCard.tsx` has **zero call sites** — dead code. **Reported only.** Deleting a component is architecture work, not comment housekeeping, so it belongs to **slice 5.1**'s component migration strategy alongside `MetricTile`'s divergent press path.

---

# Y. Commit / Branch State

## Y.1 Verified state

Repository `/Users/wilber/vita-app` · branch `sprint-4-settings-tools-reference` · HEAD `952eee1` (= `origin/sprint-4-settings-tools-reference`) · **working tree clean** · `952eee1` confirmed present · tests **44 suites / 1174 passing**.

**No Sprint 5 branch exists**, locally or on `origin`.

**`main` is at `8b8ec8d`** — Sprint 4's five commits (`aa1c60a`, `87fbf02`, `238d046`, `1de3353`, `952eee1`) are **ahead of `main` and not merged**. `main` has nothing the sprint branch lacks.

## Y.2 Why the audit created no branch

The Build Handbook's Branch Policy is clear that sprint work lives on a dedicated sprint branch named for the sprint (e.g. `sprint-1-dashboard-wilber`), and Sprint 4's precedent is that the planning audit commits to the sprint branch (`aa1c60a` on `sprint-4-settings-tools-reference`, cut from `main` **before** the audit).

**But the convention was not unambiguous, because Sprint 4 was unmerged.** A Sprint 5 branch cut from `main` — which is what every prior sprint did — would silently have lacked all of Sprint 4. That is a real decision with a real consequence, so the audit reported it rather than guessing, and created no branch.

## Y.3 ✅ RULED (§W.9) and executed — merge, then branch

**Founder ruling: merge Sprint 4 into `main`, then create `sprint-5-identity-interaction` from the merged state. Sprint 5 does not start on the old Sprint 4 branch.** This matches how Sprints 2 and 3 closed (`44eeae6`, `2bac43b`), keeps `main` the integration branch, and makes Sprint 4's completed work visible where it belongs.

Executed in the follow-up session of 2026-09-02, in this order: push the planning audit → record the founder rulings (this commit) → validate Sprint 4 → `git merge --no-ff` into `main` → validate merged `main` → push `main` → create and push `sprint-5-identity-interaction` from merged `main`. **No force push. No squash — full Sprint 4 and planning history preserved.** The Sprint 4 branch is retained, not deleted.

Exact merge commit, branch head and validation results are recorded in `docs/06-Slice-Tracker.md` when Sprint 5 opens.

## Y.4 This document's commits

Written and committed on the Sprint 4 branch — consistent with `952eee1`, the roadmap-alignment commit that introduced Sprint 5 and also landed there.

```
7743443  docs(sprint-5): plan identity and interaction architecture
         docs(sprint-5): record founder rulings and approved slice structure
```

Both are documentation-only. **No source change, no dependency change, and no slice opened by either.**

## Y.5 Validation

**At audit time (§44 of the planning authorization):**

| Check | Result |
|---|---|
| No source code changed | ✅ `src/` untouched |
| No `package.json` change | ✅ No dependency added |
| Roadmap intact | ✅ `docs/04-Master-Roadmap.md` unmodified; `952eee1` present |
| Sprint 5 not started | ✅ No branch, no slice opened, no 5.x implementation |
| Tests baseline unchanged | ✅ 44 suites / 1174 passing, exit 0 |
| No new branch · no merge to `main` | ✅ Neither performed |

**After the merge + branch authorization:** Sprint 4 merged to `main` (`--no-ff`, no conflicts), `main` pushed, `sprint-5-identity-interaction` created from merged `main` and pushed with upstream tracking, stale comments corrected as comment-only housekeeping. **Sprint 5 implementation still has not begun** — no screen redesigned, no feature code added, `PressableCard` deliberately left in place for 5.1.

---

**Audit prepared 2026-09-02 · founder-reviewed and approved 2026-09-02 · rulings recorded in §W · approved slice structure in §S.2.**

**Slice 5.1 is not started and requires its own founder authorization to begin.**
