# Sprint 5 — Screen Migration Guide

# Status: 5.1 and 5.2 approved and locked · 5.3 implemented, awaiting device review · 5.4–5.8 not started

This is the map slice 5.1 owed the slices that follow it, so each is mechanical rather than exploratory. **Each remaining slice still requires its own founder authorization.** Sections are updated with what actually happened as they ship, so a later slice reads the outcome rather than only the plan.

The language it applies is `docs/05-Design-System.md` → *The VITA Design Language*. The freeze it respects is `docs/Sprint-5-Planning-Audit.md` §D.

---

## How to read this

For each screen: what generic pattern is there now · what role it should take · which shared primitives apply · what stays deliberately feature-specific · what business logic is frozen.

**The standing rule for every row below: presentation changes, domain does not.** Where a redesign appears to need a domain change, that is a finding to raise, not a licence to refactor.

---

# Slice 5.2 — Water — ✅ IMPLEMENTED 2026-09-03 (awaiting founder device review)

*Outcome recorded below the original plan. Two things went differently and both are worth carrying: `/water/add` was **removed** rather than kept as a fallback, and the provider gained a `boolean` return so a failed write can never raise a success signal — see the Slice Tracker.*


**Files:** `src/app/(vita)/water/index.tsx` · `features/water/components/WaterLevelPanel.tsx` · `WaterLogPanel.tsx` · `WaterWeekStrip.tsx` · `AmountEditor.tsx` · `src/app/(vita)/water/add.tsx`

| Now | Becomes |
|---|---|
| `WaterLevelPanel` — an animated fill inside a `Card` | **Feature visual object.** `WaterVessel`, direct on background, no card |
| Full-width blue `Button` → `/water/add` route | **Neutral primary action** + quick amounts. Custom opens `VitaSheet` |
| `/water/add` — a full route with unit selector, big amount display, chips, text field | **Removed.** The sheet fully replaces it, nothing else linked to it, and a route reachable only by deep link is the dead-row problem. Editing keeps its own route |
| `WaterWeekStrip` in a `Card` | **Panel**, or direct content. Semantics unchanged |
| `WaterLogPanel` in a `Card` + `SectionHeader` | **Panel**, likely progressively disclosed |
| 4 stacked `Card`s, 2 `SectionHeader`s | 1 object + 1 action + 1 disclosed history region |

**Shared:** `WaterVessel` (already built) · `VitaSheet` · `PressableScale` + `vitaHaptic` · surface roles.
**Feature-specific, do not generalise:** the vessel · `WaterWeekStrip`'s relative-volume semantics.
**Frozen:** all of `src/lib/water/` — canonical mL, entered-unit snapshots, goal, rollover, 7-day derivation, `WaterRepository`, `vita:v1:water:*` keys. `AmountEditor` is reused unchanged; its unit-per-entry behaviour is a founder decision.

**Carry forward, do not regress:** no fill renders when no goal is set (the 3.10 audit fix) · the week strip shows volume, never goal attainment · each log row shows the unit the user typed.

**Patterns 5.2 established that the remaining slices should reuse:**

- **A feature's visual object goes direct on the background.** No card around the hero. Dashboard, Peptides and BMI each have a candidate object.
- **The primary action is neutral with a feature-coloured glyph.** Proven on device in both themes.
- **A structural control inside a sheet takes the neutral tone**, not the domain colour — `UnitSelector`'s new `tone` prop is the pattern.
- **Progressive disclosure for a secondary list**: a one-line summary that is useful on its own (`Today's log · 3 drinks`), expanding in place. Directly applicable to Peptides' Active/Inactive and Routine's details.
- **Never signal success before the write lands.** If another feature's provider cannot report persistence, that is a finding, not a reason to fire the haptic anyway.
- **`flex` belongs on a wrapper around `PressableScale`**, never on it. Hit three times now; 5.7 should fix the primitive.

---

# Slice 5.3 — Dashboard — ✅ IMPLEMENTED 2026-09-03 (awaiting founder device review)

*Outcome: the fixture removal was larger than planned — six of fourteen displayed values were invented, which deleted `mock.ts`, `api.ts`, `types.ts` and nine components. `GlassSurface` on Home went 6 → 0. See the Slice Tracker.*


**Files:** `src/app/(vita)/(tabs)/dashboard.tsx` · `features/dashboard/components/*` · `features/dashboard/mock.ts`

| Now | Becomes |
|---|---|
| `HomeHeader` with `HEADLINE` + `SUPPORTING_LINE` at 34px/800 | Greeting kept. **Both slogan constants deleted.** Replaced by real day state — date, what is outstanding |
| 5 `GlassSurface` cards stacked | Mixed module sizes; glass returns to a **rare** role |
| `QuickStatsRow` — 5 tiles, 4 of them fixtures | **Fixtures removed** (§W.3). Nothing fabricated to fill a module |
| `HomeSummaryCard` — 2 of 4 pillars fixtures | Rebuilt on real state only |
| `MealRow` ×4, no chevron | Utility rows, or folded into a Fuel module |
| No action affordance above the fold | **Action-first.** Direct actions on the modules that have real state |
| Tools unreachable from Home | A **Tools destination/module** — not a launcher, no layout authorized yet (§W.4) |

**Shared:** surface roles · `PressableScale` + haptics · the neutral primary action.
**Feature-specific:** each domain's own module treatment — Home is where features are *recognisable*, so they should not share one module shape.
**Frozen:** `useDailyNutrition`, `useWaterToday`, `usePeptideSummary` and everything behind them. Home derives; it never computes its own totals.

**Watch:** `DASHBOARD_FIXTURE` also supplies `firstName` and `journey`. Removing fixtures means deciding what Home says when a domain has no feature yet — the honest answer is *nothing*, not a placeholder.

**Resolved:** `firstName` moved to `useAuth()`, the app's identity boundary, rather than being deleted — it is the one displayed value that is about the user rather than about their data, and it becomes real when Supabase auth lands. Journey was omitted entirely.

**Patterns 5.3 established for the slices that follow:**

- **One shape per domain.** Water is a ring, Peptides a tally, Fuel a bar. Two features that behave differently must not read as the same module in two colours — 5.4 should give Peptides Home its own shape rather than borrowing one.
- **A summary screen inherits the source feature's wording rules in full.** Peptides on Home carries Sprint 3's *scheduled not due*, *unanswered stays unanswered*, *nothing is scored* without softening. 5.4 and 5.5 must not relax them either.
- **Home surfaces actions; features own them.** `/water?add=1` — a param the feature reads once as initial state — is the pattern for opening a feature ready to act, without duplicating its flow.
- **`flex` on `PressableScale` still does not work.** Hit a third time. **5.7 should fix the primitive.**
- **Open finding for 5.7:** `FloatingDock` gives the active Home tab `palette.ink`, invisible on the near-black dark background and fine in Light.

---

# Slice 5.4 — Peptides Home

**File:** `src/app/(vita)/peptides/index.tsx` · `features/peptides/components/TodayRoutineCard.tsx`

| Now | Becomes |
|---|---|
| 4 `SectionHeader`s in identical grey | Two structural divisions at most |
| Today, Needs setup, Active, Inactive — three of them visually identical `Card` panels | **Today becomes the hero region.** The rest is one disclosed "Your routines" region |
| `TodayRoutineCard` is the same `Card` as the lists below it | Elevated — the only actionable surface should be the most prominent |
| Needs setup — a header + card + row for usually one item | **Inline notice** |
| Inactive at peer weight | Collapsed by default |

**Shared:** surface roles · disclosure · haptics on Taken.
**Feature-specific:** the Taken/Skipped control pair — **both outlined, neither pre-selected**, because a filled Taken read as *already taken*. That is a safety decision, not a style one. Keep *"Scheduled today"*, never *"due"*.
**Frozen:** `usePeptides()` and its `today` / `needsSetup` / `active` / `inactive` grouping, `markTaken`, `markSkipped`, `clearRoutineDay`, `restoreRoutineDay`. This is a regrouping of what the hook already returns.

---

# Slice 5.5 — Routine + Injection Sites

**Files:** `src/app/(vita)/peptides/routine/[id].tsx` · `features/peptides/components/{TakenSheet,RoutineDaySheet,RoutineDayStrip,SiteSelector,BodyMap,LogRow}.tsx` · `src/app/(vita)/tools/injection-sites.tsx`

| Now | Becomes |
|---|---|
| 5 `Card`s, 6 `SectionHeader`s, Today ≈ one fifth of the screen | **Immediate action dominates.** Name, amount, today's state, Taken/Skipped above the fold |
| Routine details — a card + header + 4 rows | **Disclosed** |
| Preparation — a whole card + header for one vial line | **Disclosed**, merged with details |
| Actions — Edit / Pause / Remove as a peer card | **Administrative, visually quietest** |
| Week strip in a card | Kept; presentation only |
| `TakenSheet`, `RoutineDaySheet` — hand-rolled `Modal`s | Converge onto `VitaSheet` (may slip to 5.7) |
| `SiteSelector` opens a `Modal` **inside** `TakenSheet`'s `Modal` | Layered mode rather than a nested modal |
| `BodyMap` — selection only | **+ one optional `markers` prop and one layer** for rotation |

**Rotation (§W.8):** the **Injection Sites Tool** becomes the richest historical/rotation view (all-peptide, which is how rotation is actually practised). Routine may reuse a smaller contextual weekly version later. **One body representation, never duplicated.**

Needed and not yet present: a range selector over site history — something like `sitesForRange(logs, from, to)` beside the existing `entriesWithSites` / `entriesAtSite`. A new *selector* is acceptable; changing `InjectionSiteSnapshot` is not.

**Hard boundary, carried from the existing code:** *"the easiest place in this whole feature to accidentally imply a recommendation."* **No "next site", no rest timers, no good/bad colour scale, no unused-site highlighting, no peptide colour-coding.** It reports where you went; it never suggests where to go.

**Accessibility:** markers must not add tappable elements over `BodyMap`'s hit-area partition — that partition fixed a real bug where tapping Left Abdomen selected Center Abdomen. Each marked zone's spoken label carries its own count and dates, and the rotation view ships a plain list equivalent.

**Frozen:** `lib/peptides/model/{sites,routine,logs,schedule,dose,units}.ts`, the log snapshot shape, `BodyMap`'s zone geometry and `HIT_AREAS` partition.

---

# Slice 5.6 — Tools

**Files:** `src/app/(vita)/tools/index.tsx` · `peptide-calculator.tsx` · `injection-sites.tsx`

| Now | Becomes |
|---|---|
| Hub: 3 rows' worth of chrome for 2 items | Utility rows, lighter |
| Injection Sites: 4 stacked `Card`s | Panels + the body map as the feature object |
| Calculator | Presentation only |

**Frozen — behaviour is not reopened:** `/tools` route identity · the hub's two-section structure · calculator math · the Injection Sites boundary text and Site Reference content · the icon-colour convention (*a tool's icon colour tracks the domain it serves; a tool belonging to no domain takes neutral* — this already answers BMI) · **no "Coming Soon" rows**.

Lowest-risk migration in the sprint: the logic behind these screens is inert.

---

# Slice 5.8 — BMI

**New.** No existing screen to migrate. Full plan survives in `docs/Sprint-4-Planning-Audit.md` §G (UX, `src/lib/bmi/` domain model, non-goals, persistence, visual design, accessibility, the Journey seam).

Built in the new language from the start — that is why it was deferred. It is the best test of whether the language works for a **feature it did not come from**: a result, a category scale, and a premium visual representation is the "visual object instead of a summary card" case.

Constraints unchanged: height · weight · result · category range · **no BMI history that shadows Journey** · Journey integration deferred to Sprint 6, which owns stored height and latest weight. Icon takes the **neutral** treatment — BMI belongs to no domain.

Extension point is already documented at `src/lib/preferences/model/types.ts` and now names slice 5.8.

---

# Cross-cutting cleanup for 5.7

- Reduce-motion gaps: `Toast`, `FuelQuickActions`.
- Converge `TakenSheet`, `RoutineDaySheet`, `CategorySelector`, `SiteSelector` onto `VitaSheet` — **converge, not rewrite**; their contents are founder-approved.
- `MetricTile`'s bare `Pressable` + `opacity: 0.8` is a second press language; consolidate onto `PressableScale`.
- `ListRow` carries its own border and shadow, so a list of rows reads as a stack of cards — needs a flat in-panel variant once a screen needs it.
- `SectionHeader` variants, if screens have demonstrated the need by then.
- **Remove the identity prototype and its `__DEV__` Settings row** (slice 5.9 at the latest).

---

# What 5.1 deliberately did not do

No production screen was redesigned. `Card`'s 23 call sites, `SectionHeader`'s 28 and `ScreenHeader`'s 31 are untouched — migration happens in the slice that redesigns the screen, never in bulk. The only production files 5.1 touched are listed in `docs/06-Slice-Tracker.md` → slice 5.1.
