# Sprint 5 — Screen Migration Guide

# Status: 5.1, 5.2 and 5.3 approved and locked · 5.4 next · 5.5–5.10 not started

**⚠️ Amended 2026-09-04.** The founders ruled that **Sprint 5 must apply the identity across every already-built product area before Journey begins.** Two changes to this guide: a **Fuel** section was added (Fuel had none — it was never in Sprint 5), and **Tools** became **Tools + Settings**. Motion, BMI and the founder audit each moved one number. The authoritative structure is `docs/Sprint-5-Planning-Audit.md` §S.3.

**Migration order:**

| Order | Surface | Slice | State |
|---|---|---|---|
| 1 | Water | 5.2 | ✅ Approved and locked |
| 2 | Dashboard | 5.3 | ✅ Approved and locked |
| 3 | Peptides Home | 5.4 | ⬜ **Next** |
| 4 | Routine / Injection Sites | 5.5 | ⬜ Planned |
| 5 | Fuel | 5.6 | ⬜ Planned |
| 6 | Tools / Settings | 5.7 | ⬜ Planned |
| 7 | Shared interaction / motion | 5.8 | ⬜ Planned |
| 8 | BMI | 5.9 | ⬜ Planned |
| 9 | Founder identity audit | 5.10 | ⬜ Planned |

**Journey follows afterward**, in Sprint 6, and inherits this language rather than inventing a new one.

**One product language, not one identical layout.** Every row above adopts the shared language — premium dark foundation, direct-content hierarchy, restrained surfaces, feature colors, purposeful motion, tactile interaction, accessibility, real-data-only presentation. None of them adopts another feature's layout: Water looks like Water, Fuel looks like Fuel. **Dashboard's widget-customization model is Home's own pattern and is not migrated outward.**

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
- **`flex` belongs on a wrapper around `PressableScale`**, never on it. Hit three times now; the motion-unification slice should fix the primitive — **5.8** since the 2026-09-04 amendment, written here as 5.7.

---

# Slice 5.3 — Dashboard — ✅ APPROVED / CLOSED 2026-09-04 · locked through subpasses 5.3A–5.3D

*Founder review approved the data work and rejected the composition. 5.3A kept every fixture removal and rebuilt the shape: eyebrow greeting, three horizontal strips, Quick Tools, Today's Schedule, and a persisted Customize Home. Patterns worth carrying are listed below.*

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
- **`flex` on `PressableScale` still does not work.** Hit a third time. **The motion-unification slice should fix the primitive — 5.8 since the 2026-09-04 amendment.**
- ~~**Open finding for 5.7:** `FloatingDock` active Home tab.~~ **Fixed in 5.3A** — Home's tint resolves through the theme.

**Patterns 5.3B added:**

- **A widget grid beats a fixed composition** when the user's mix of features varies. Order plus span, no stored coordinates — placement can never disagree with what was arranged.
- **Two sizes means two designs.** A square is not a wide one squeezed; a module that has no square design says so by not offering one.
- **Drag without a dependency.** `PanResponder` + `Animated` reorder a uniform-height single-column list fine. Arrows stay as the accessible path, never as a second-class fallback.
- **A shortcut must mean what its label says.** The `Scan` tile pointed at the logging scanner while meaning the future evaluating one — a working button that quietly misrepresents the product is worse than an absent one. Applies to anything 5.6 or 5.8 adds.
- **`__DEV__` previews for states real data cannot reach**, built from local constants — never by seeding real records.

**Patterns 5.3D added:**

- **Live reflow without re-rendering.** Freeze the rendered order for the gesture and *translate* every widget to where the candidate order would put it. Re-rendering a grid mid-drag moves the dragged cell out from under the finger, which is the trap 5.3C avoided by deferring to release.
- **Commit before the settle, never in its completion callback.** When every element already sits at its new position, committing changes nothing on screen — and an interrupted animation can no longer leave the UI and the stored state disagreeing.
- **Put drag arithmetic in pure functions.** It is the only way a gesture gets verified in an environment that cannot perform one. 19 tests here; the component keeps only the gesture and the lift.
- **Require real entry into a slot before proposing a swap** (a fifth of the cell on each edge). Hysteresis falls out for free once the test runs against candidate slots rather than home positions.
- **VITA respects platform text-size settings by default.** No `allowFontScaling={false}`, anywhere. Fixed footprints scale with the text (damped, and still one shared value so a set stays equal), and decorative visuals step aside before text collides.
- **Information scales without limit; ornament may be capped.** `maxFontSizeMultiplier` on a quote or a wordmark is legitimate and must be documented and tested; on anything that states a fact it is not. Truncation is for secondary labels only — a figure wraps.
- **A type bump belongs to the screen that proves it**, not to `theme/tokens.ts`. Home carries its own `TYPE` map; later identity slices adopt the sizes deliberately rather than inheriting them by surprise.
- **Still open for the motion-unification slice (5.8 since the 2026-09-04 amendment):** `FloatingDock` crops its labels at accessibility text sizes, alongside the `PressableScale` flex trap.

**Patterns 5.3C added:**

- **A widget grid needs one geometry, and it is set by the busiest cell.** Per-module heights make a grid breathe with its data; one shared footprint with the quiet modules centring in the space is what holds still. Clamp **both** bounds — `flex: 1` resolves a flex basis of 0 and beats a plain `height`.
- **Two persisted preferences, two keys.** The layout and the Quick Tools order change for different reasons; one record would let either write drop the other's state. `usePersistedPrefs` is the shared hook, and it takes a `useState`-style updater so a gesture handler can stay stable.
- **A shortcut may be a navigation convenience; it may not overstate where it goes.** The Food Scanner reversal kept the claim rule while dropping the omission — the tile ships, and tests assert its wording promises no score, grade or rating.
- **One typographic break is how a quotation stops reading as app copy.** Check what the platform already ships before bundling a face; here `expo-font` was configured with nothing in it.
- **Any colour drawn for dark surfaces must be re-picked for light.** Brand gold on `paper` measures ~1.7:1. Deepen the hue rather than dropping the colour — 5.4 through 5.8 should assume every accent needs a scheme pair.
- **Long press belongs on the innermost pressable, not on an overlay.** RN gives the responder to the deepest view, and an overlay that can receive a hold also eats every tap. `Pressable` suppressing `onPress` after a long press is what stops a hold from also navigating. Blocking overlays are correct only *while* a mode is active.
- **Drop-on-release beats live reflow** where the gesture cannot be tested by hand — one decision from one final position. Measure in window coordinates and re-measure on entering the mode so every rectangle comes from one frame.
- **A gesture-entered mode needs a labelled exit**, and the accessible surface it shortcuts must stay complete. A hold is unreachable with VoiceOver.

**Patterns 5.3A added:**

- **Horizontal strips beat boxes for a summary surface.** Three domains at ~64pt each fit where two boxes did, and the height freed paid for two more sections. 5.4 should reach for a strip before a card.
- **Density comes from more truth, not more padding.** Quick Tools and Today's Schedule filled Home because they are real; nothing was stretched.
- **A section may only aggregate what a domain actually holds.** Today's Schedule carries no times because routines schedule by day — a reminder time is a different concept and putting it in a schedule column would promote it into one. Same discipline applies to anything 5.5 adds.
- **`useDashboardLayout` is the model for a screen-owned UI preference**: its own key, an untrusted-input normaliser, and no coupling to `AppPreferences` (whose `save()` writes the whole record).
- **Reorder with buttons, not drag** — no native dependency, and accessible by construction.
- **Still open for the motion-unification slice (5.8 since the 2026-09-04 amendment):** `flex` handed to `PressableScale` does not reach its parent row. Hit four times now; every call site works around it with a wrapper.

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
| `TakenSheet`, `RoutineDaySheet` — hand-rolled `Modal`s | Converge onto `VitaSheet` (may slip to the motion-unification slice, **5.8**) |
| `SiteSelector` opens a `Modal` **inside** `TakenSheet`'s `Modal` | Layered mode rather than a nested modal |
| `BodyMap` — selection only | **+ one optional `markers` prop and one layer** for rotation |

**Rotation (§W.8):** the **Injection Sites Tool** becomes the richest historical/rotation view (all-peptide, which is how rotation is actually practised). Routine may reuse a smaller contextual weekly version later. **One body representation, never duplicated.**

Needed and not yet present: a range selector over site history — something like `sitesForRange(logs, from, to)` beside the existing `entriesWithSites` / `entriesAtSite`. A new *selector* is acceptable; changing `InjectionSiteSnapshot` is not.

**Hard boundary, carried from the existing code:** *"the easiest place in this whole feature to accidentally imply a recommendation."* **No "next site", no rest timers, no good/bad colour scale, no unused-site highlighting, no peptide colour-coding.** It reports where you went; it never suggests where to go.

**Accessibility:** markers must not add tappable elements over `BodyMap`'s hit-area partition — that partition fixed a real bug where tapping Left Abdomen selected Center Abdomen. Each marked zone's spoken label carries its own count and dates, and the rotation view ships a plain list equivalent.

**Frozen:** `lib/peptides/model/{sites,routine,logs,schedule,dose,units}.ts`, the log snapshot shape, `BodyMap`'s zone geometry and `HIT_AREAS` partition.

---

# Slice 5.6 — Fuel Identity Refresh

**New section, added 2026-09-04.** Fuel was never part of Sprint 5's original plan — Sprint 2 built its functionality and its presentation predates the current identity. This slice brings the existing Fuel screens into the same product family.

**Files:** `src/app/(vita)/fuel/` — `index.tsx` · `log.tsx` · `search.tsx` · `food/[id].tsx` · `scan.tsx` and the surfaces around them · `features/fuel/`

| Now | Becomes |
|---|---|
| The Sprint 2 refinement already moved Fuel's landing to **rows in a panel, not a grid of cards** | Keep that instinct; carry it into the surface-role vocabulary |
| `Card` + `SectionHeader` as the default containment for every region | Surface **roles** — hero, action, status, record, reference |
| Calories and macros as the visual subject by size | One display-size subject per screen, per §L.2 |
| Search results, Food Detail, the log list as peer panels | Hierarchy by role and disclosure |
| Empty meal slots | The shared empty-state treatment |
| Hand-rolled modals in the logging flow | Converge onto `VitaSheet` where the content suits it |

**Shared:** surface roles · typography variants · disclosure · haptics on a successful log · `VitaSheet` · press behaviour · Dynamic Type · Reduce Motion.

**Feature-specific — Fuel should look like Fuel:** the **orange feature identity** · the meal colour language (Breakfast sunrise yellow · Lunch midday orange · Dinner sunset red-orange · Snacks neutral sage) · the three-tier food-visual system and `foodArt.ts` · the calorie ring. **Fuel does not adopt Home's widget-customization model** and is not restyled into Water's or Dashboard's layout.

**Frozen — presentation only, and this is not an architecture rewrite:** `src/lib/nutrition/` in full · the nutrition model and calculated totals · logging · meal editing · the Open Food Facts / USDA provider layer and its attribution · **barcode lookup and the `/fuel/scan` logging flow** · persistence · every existing real behaviour · current calorie and macro semantics, including the `Calories` / `cal` terminology decision.

**The scanner, stated plainly.** `/fuel/scan` is the barcode **lookup and logging** flow. Refreshing its presentation is in scope. **Inventing a product score is not** — no VITA Score exists or is authorized, and the evaluating scanner is a separate deferred feature. The Dashboard `Food Scanner` Quick Tool points at this logging flow and must not be documented as scoring.

**Known carry-in:** `FuelQuickActions` is one of the two outstanding reduce-motion gaps. Fixing it here is welcome; if it is not fixed here it belongs to 5.8.

---

# Slice 5.7 — Tools + Settings

**Broadened 2026-09-04** from *Tools* to *Tools + Settings* — Settings is a built product surface reached the same way, and it was only implied before.

**Files:** `src/app/(vita)/tools/index.tsx` · `peptide-calculator.tsx` · `injection-sites.tsx` · `src/app/(vita)/settings/index.tsx` · `settings/units.tsx`

| Now | Becomes |
|---|---|
| Hub: 3 rows' worth of chrome for 2 items | Utility rows, lighter |
| Injection Sites: 4 stacked `Card`s | Panels + the body map as the feature object |
| Calculator | Presentation only |
| Settings: `ListRow` stacks that each carry their own border and shadow, so a list reads as a stack of cards | A flat in-panel row variant — the `ListRow` finding already recorded for the motion slice |
| Units and Appearance surfaces | The same surface-role vocabulary as every other screen |

**Also frozen for Settings:** current routes · current functionality · **preference persistence** (`vita:v1:settings:prefs` and Water's `vita:v1:water:prefs`) · the honesty rule from slice 4.1 — **no fake rows**; a row that draws a chevron opens something, and a row without a real implementation is not added back to fill space. Settings does **not** acquire a widget-customization model.

**Frozen — behaviour is not reopened:** `/tools` route identity · the hub's two-section structure · calculator math · the Injection Sites boundary text and Site Reference content · the icon-colour convention (*a tool's icon colour tracks the domain it serves; a tool belonging to no domain takes neutral* — this already answers BMI) · **no "Coming Soon" rows**.

Lowest-risk migration in the sprint: the logic behind these screens is inert.

---

# Slice 5.9 — BMI

**New.** No existing screen to migrate. Full plan survives in `docs/Sprint-4-Planning-Audit.md` §G (UX, `src/lib/bmi/` domain model, non-goals, persistence, visual design, accessibility, the Journey seam).

Built in the new language from the start — that is why it was deferred. It is the best test of whether the language works for a **feature it did not come from**: a result, a category scale, and a premium visual representation is the "visual object instead of a summary card" case.

Constraints unchanged: height · weight · result · category range · **no BMI history that shadows Journey** · Journey integration deferred to Sprint 6, which owns stored height and latest weight. Icon takes the **neutral** treatment — BMI belongs to no domain.

Extension point is already documented at `src/lib/preferences/model/types.ts`. **Its comment names slice 5.8 and is now stale** — BMI is slice **5.9** since the 2026-09-04 amendment. That is a source comment and this alignment session is docs-only; correct it in the slice that next touches the file.

**No fake health-insight or recommendation engine.** A BMI figure and its standard category range is what the tool reports; it does not interpret, advise, or coach.

---

# Cross-cutting cleanup for 5.8

- Reduce-motion gaps: `Toast`, `FuelQuickActions`.
- Converge `TakenSheet`, `RoutineDaySheet`, `CategorySelector`, `SiteSelector` onto `VitaSheet` — **converge, not rewrite**; their contents are founder-approved.
- `MetricTile`'s bare `Pressable` + `opacity: 0.8` is a second press language; consolidate onto `PressableScale`.
- `ListRow` carries its own border and shadow, so a list of rows reads as a stack of cards — needs a flat in-panel variant once a screen needs it.
- `SectionHeader` variants, if screens have demonstrated the need by then.
- **Remove the identity prototype and its `__DEV__` Settings row** (slice **5.10** at the latest).
- **Inconsistent numeric keyboard accessory tones** — the accessory's Done label was hardcoded to peptide purple until 5.2A made it neutral; audit the remaining call sites.
- **`FloatingDock` crops its labels at accessibility text sizes** (`Journey` wraps to `Journe/y`) — found on Dashboard, not a Dashboard defect.

---

# What 5.1 deliberately did not do

No production screen was redesigned. `Card`'s 23 call sites, `SectionHeader`'s 28 and `ScreenHeader`'s 31 are untouched — migration happens in the slice that redesigns the screen, never in bulk. The only production files 5.1 touched are listed in `docs/06-Slice-Tracker.md` → slice 5.1.
