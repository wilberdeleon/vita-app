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

# Slice 5.4 — Peptides Home — ✅ LOCKED (founder-approved on device 2026-09-07)

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
**Frozen:** `usePeptides()` and its `today` / `needsSetup` / `active` / `inactive` grouping, `markTaken`, `markSkipped`, `clearRoutineDay`, `restoreRoutineDay`. This is a regrouping of what the hook already returns — and it stayed that way: **zero changes under `src/lib/peptides/`**.

**Patterns 5.4 added:**

- **A feature's motif should come from its own domain, not from a decoration budget.** Water is a vessel because hydration is a continuous quantity; Peptides is discrete events with a state each, so its identity is the state mark the domain already defined in 3.9. When a feature does not need a hero illustration, the content is the hero. 5.5 and 5.6 should look for the equivalent before reaching for an image.
- **One action, one name.** Two controls doing the same thing under the same label are redundant to read and ambiguous to hear. Pick the platform-conventional position and stop.
- **A spoken label may spell out what the eye reads as an abbreviation.** `1 mg` is correct on screen; VoiceOver says "em gee". Presentation-only, and it belongs in the feature, not in a frozen domain.
- **A `__DEV__` preview over an in-memory repository** renders the real production screen in states real data cannot reach, without seeding anything. Cheaper and safer than fixtures, and it is what let Dark, Light and Dynamic Type be checked across twelve states.
- **`flex` on `PressableScale` still does not reach its parent row.** Hit a fifth time, worked around with a wrapper again. **5.7 should fix the primitive.**

---

# Slice 5.5 — Routine + Injection Sites — ✅ LOCKED (founder-approved on device 2026-09-07, with 5.5A–5.5D)

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

**Patterns 5.5 added:**

- **A disclosure earns its collapse with a summary line.** `Preparation · 10 mg vial · 2 mL` answers the question without opening anything; a section collapsed with nothing to summarise is just hidden. 5.6 should apply the same test before folding anything away.
- **Context defaults differ; the form does not.** One `SetupForm`, one set of fields, and a `mode` that changes only what opens. Duplicating a form for "new" and "edit" is how the two drift apart.
- **Extend the shared primitive, never fork it.** `BodyMap` took an optional `markers` prop; passed nothing it behaves exactly as before, which is why the site picker needed no change at all. A `RoutineBodyMap` would have been two figures to keep in sync.
- **Group markers by place, not by event.** Two logs at one site are one marker reading `2`. Stacking is unreadable and untappable, and offsetting puts a marker outside the thing it describes.
- **A drawing is not an accessible interface.** Anything a body map, chart or figure says must also exist as text that a screen reader can reach and a person can scan. Not a fallback — an equal.
- **Narrowing a default view is not removing history.** The weekly map answers the common question; the all-time list stays, disclosed. Ask what the old view answered before replacing it.
- **`InputAccessoryView` must be rendered inside the Modal that raises the keyboard.** A bar on the screen behind a sheet never appears above the sheet's own keyboard.
- **Dynamic Type is platform behaviour, not a second design.** One layout per screen; no large-text variants; no `allowFontScaling={false}`; no VITA text-size setting. Large-text screenshots are QA, not implementations.
- **`flex` on `PressableScale` still does not reach its parent row.** Hit a **sixth** time, and this one shipped a visible defect — a section header that rendered as a bare chevron. **5.7 should fix the primitive.**

**Patterns 5.5A added:**

- **A rail is structure, not progress.** A line joining status nodes must be one weight end to end. The moment it fills, stops at today, or changes colour, it has become a completion bar and the screen is scoring the user.
- **Mark "today" with something that cannot be a state.** A ring around a node fails wherever there is no node to encircle — it becomes the only circle in the cell and reads as a status. An underline cannot.
- **An unscheduled day and an unanswered day must not share a treatment.** *No response* means the routine asked; a day the schedule never covered asked nothing. Drawing anything at all for the second is a claim. This is the rule that makes as-needed routines correct.
- **One function per fact, shared by every view of it.** `markForDay` decides a day's state for both the week strip and the month grid, so they cannot disagree. Two views computing the same thing independently is how they drift.
- **Count only what has happened.** A scheduled day still to come belongs on the calendar and not in the summary — counting the rest of the month turns a plan into an accusation.
- **Stop navigating where knowledge stops.** The provider holds a bounded window; rendering months before it would draw unanswered days nobody failed to answer. A disabled arrow with a line of copy is more honest than an empty grid.
- **A fixed-size node crops its own glyph at accessibility text sizes.** Scale the container with `fontScale` rather than reaching for `allowFontScaling={false}`.

**Patterns 5.5B added:**

- **A warm window is a loading decision, not a retention one.** Before designing around "we only have 60 days", check what storage actually holds. Here every day was on disk and only the read was bounded — the ceiling was self-imposed.
- **Range reads, not bigger windows.** `getDaysInRange(start, end)` costs one month per month viewed. Growing the provider's window would have made app start slower for everyone to serve one screen.
- **Read through the provider, cache in the screen.** The provider stays the only path to storage so the injected seam holds; the cache lives with the screen that knows when it is stale and dies with it. A cache in the provider would need invalidating by every write in the app.
- **Failed and empty are different states.** Rendering a failed read as "nothing here" is a claim about the user's data. Say the read failed, and offer a retry.
- **Two letters only where one is ambiguous.** `T` and `S` each name two days. In a positional grid that is fine; on a chip standing alone it is not. Keep the compact form compact, and always speak the full word.
- **Selection beats navigation for a calendar.** Sending every tap to another screen means the calendar can only be looked at or left. Selecting keeps the context and makes the detail a second, deliberate step.
- **Three states on one cell must stay three.** Today, selected and status each need their own treatment — an underline, a ring and a node — or they collapse into one ambiguous decoration.

**Patterns 5.5C added:**

- **A shared behaviour that each screen has to opt into is not shared.** The Done bar had a shared component and a shared id, and was still missing from eleven inputs — because using it took two coordinated steps and forgetting either failed silently. It is behaviour now, not a component: `NumericField` carries its own accessory, one per field with its own generated id, and no screen renders one. If a rule has been broken three times in three slices, fix the primitive rather than the third screen.
- **A source-scanning test is the right shape for "nobody may do X".** Render tests only cover the screens someone thought to write a test for, and the failure here is a field nobody remembered. Scanning `src/` for `keyboardType="decimal-pad"` outside the primitive catches the case that has not been written yet.
- **`InputAccessoryView` is matched within the presented hierarchy.** A bar registered by the route beneath a modal never appears above the modal's keyboard. Making the field self-sufficient removes the question instead of answering it per screen.
- **The order of a form is part of its argument.** New setup and editing are different jobs — one is a sequence, the other is a visit — so they present the same fields in different orders. Extract the sections and order them by mode; do not fork the fields, the validation or the emit path.
- **Give the ordinary case a name, not an escape hatch.** "Skip preparation" framed a complete situation as an omission. "Already prepared" names what is true for someone handed a prepared pen, and reads as a peer of the other answer rather than as opting out.
- **Answering a question must not write an answer.** Choosing *Already prepared* stores nothing and clears what was typed before it. A value the form has stopped showing is a value the user cannot correct — inferring or retaining one is how invisible data gets saved.
- **A disclosure needs a summary or it is a filing cabinet.** The calculator collapsed cleanly because `1 mg = 20 units` answers what most people opened it for. Built from the same reference the table uses, so the closed and open states cannot disagree.
- **Use the reviewed field you already have.** The peptide descriptor is the catalog's existing `category`, audited across all 96 entries before a line was written. Authoring new content would have meant a new review surface for something the data already said.
- **A per-day mark multiplies.** One hollow node per future day reads as *scheduled ahead*; three routines' worth reads as a wall of failure. A treatment that is legible for one routine is not automatically legible for several — check the aggregate before shipping it.
- **Never flatten a day that holds several answers.** Two taken and one skipped is three facts. Picking a dominant state, blending the colours, or drawing a proportion all invent a summary the data does not support; draw one mark per event and let selection show the detail.
- **Delete the helper the new one replaced.** `earliestKnownMonth` bounded navigation in 5.5A and nothing since. Dead code that looks like live logic is how a fixed bug comes back.

**Patterns 5.5D added:**

- **A gesture inside a scroll view has to earn the touch, in the capture phase.** A `Pressable` becomes the responder the moment a finger lands, so a parent can only take it back on the way down — `onMoveShouldSetPanResponderCapture`, never the bubbling variant. Claim only past a distance *and* a direction ratio, then refuse termination so a scroll cannot reclaim it mid-drag.
- **One gesture is one step.** Never turn velocity or distance into a count. A flick that skips four weeks leaves someone somewhere they did not choose, and the precise control already exists next to it.
- **Extract gesture arithmetic from the responder.** `PanResponder` handlers are only reachable through RN's negotiation and a synthetic touch history; a test that drives them tests the framework. Put "should I claim", "how far do I follow", "what does a release mean" in a pure module and test that. Same split as `dragLayout.ts`.
- **A swipe is never the only way.** Add the gesture, keep the buttons, and expose `adjustable` with increment/decrement so VoiceOver can step the same value.
- **Put derived arithmetic after its input, not before it.** The calculator sat above the amount it converted, which meant meeting a conversion table before saying what you wanted converted. Order a form by the order the questions are answered in.
- **A default value in the position of an answer reads as a suggestion.** With no amount entered, falling back to `1 mg = …` would have looked like VITA proposing 1 mg. Say what is missing instead.
- **Do not render a section in order to explain it cannot help.** No vial means no concentration means no calculator — absence is cleaner than an apology, and it makes the "already prepared" path free of it without a second rule.
- **Highlight the user's own row; never invent neighbours around it.** Marking their amount in a fixed, deterministic ladder is context. Generating amounts *near* theirs would be proposing doses.
- **`Your routine`, never `Recommended`.** The label says whose number it is. The moment it grades the number, the tracker has become an advisor.
- **A test anchored to "today" is a test that fails one day in seven.** `TODAY - 1` fell into the previous week every Monday. Anchor fixtures to the window under test, not to the clock.

**Patterns 5.6B added:**

- **Before drawing a chart, look for the asset the feature already owns.** Fuel's food artwork existed, was carefully reasoned, and was being used at 36pt inside rows while a generic ring led the screen. The identity object was already in the codebase.
- **Build the object, render it, then judge it.** The composition bar was implemented and deleted after one device screenshot: VITA's macro tokens are green/amber/red, and three of them side by side is a traffic light. Optional features are worth building to find out — and worth removing when the answer is no.
- **A colour set that is fine individually can judge collectively.** Green, amber and red as separate macro dots say nothing; contiguous, they rank.
- **An empty state is a state, not an apology.** A resting object plus one line beats a wall of zeroes, which is a scoreboard for a game nobody has played.
- **Only show what exists.** Four meal rows saying *No foods logged* is a list of things the user has not done. An empty slot is the absence of information.
- **One action per task.** Fuel had a filled CTA, a second CTA beside it, and four inline adds — all starting the same flow at the same weight.
- **A feature screen is not a small Home.** Cross-domain tiles inside one feature are how a screen becomes a template; the overview surface already exists and is locked.
- **Fixture timestamps must be built in local time.** A hand-written `T08:15:00.000Z` renders as 1:15 AM anywhere west of London, which looks like a sorting bug in a screenshot and is not one.
- **Delete the components the redesign orphaned, in the same slice.** Five Fuel components died with the old screen; leaving them is how a codebase acquires two answers to the same question.

**Patterns 5.6B.1 added:**

- **Minimalism can remove the structure people navigate by.** Hiding empty meal slots made an untouched day lose its shape entirely. The fix was not to restore the weight but to keep the slots at one line each — the problem was never their presence.
- **One goal, one owner.** A feature that offers to set another feature's goal must call that feature's own writer. Two water goals would disagree by Tuesday, and no amount of syncing fixes a second source of truth.
- **A declined offer is an answer worth storing.** Configuration is derived from the goals themselves; the only thing that cannot be derived is "I saw it and I don't want it". One boolean, and the invitation stops returning.
- **Reordering is not customization.** Home lets widgets be resized and hidden because it is many domains; Fuel is one workflow with a hierarchy that should be right by default. Ship the ordering, not the page builder.
- **A drag and its accessible fallback must share one helper.** Move-up buttons that compute a step differently from the gesture are two features that will drift.
- **A 1-D drag needs no geometry engine.** Measured heights and a midpoint rule are enough; Home's rectangles and candidate layouts are a grid's problem.
- **Watch for the duplicate a correction creates.** Restoring the meal rows made the meal shortcut chips redundant — the second correction is often inside the first.

**Patterns 5.6B.2 added:**

- **"Clean" is not "empty", and "interesting" is not "leading".** Two consecutive corrections in opposite directions landed on the same rule: show useful information with strong hierarchy. The most distinctive object on a screen is not automatically the one that should open it.
- **Extend the record, do not add a second key.** 5.6B.1 stored a bare array; 5.6B.2 needed order, visibility and sizes. Reading the old array as `{ order }` is a two-line normalizer and keeps every arrangement a user already made. A `vita:v1:fuel:layout:v2` would have silently reset them.
- **A normalizer is the place to enforce a product invariant.** "Nutrition and Meals cannot be hidden" is not just a missing button: a hand-edited or future record that hides them is repaired on read, so no code path can produce a Fuel that does not log food.
- **A lone square must still be a square.** A single square section rendered into a full-width row *is* the wide module — the layout the rules forbid. It keeps its column and the other half stays empty; a hole is not information, but a stretched widget is a lie.
- **A fixed footprint must be a floor, never a ceiling.** Pinning `minHeight` *and* `maxHeight` clipped `fl oz` off `24.3 fl oz` at accessibility sizes. Information scales without limit; ornament does not. Equal heights come from the row stretching its children, not from both being capped.
- **An edit mode should show the list it is editing.** Arrange mode lays the paired squares out one per row, because a vertical drag cannot distinguish two sections at the same height and the order being changed has to be the order on screen.
- **Move up must step over what the user cannot see.** With a section hidden, swapping with it in the full order looks like a dead button. Reorder over the visible sequence and re-seat the hidden ones.
- **Share the vocabulary, not necessarily the code.** Fuel's customization reads like Home's on purpose and duplicates none of `modules.ts`: Home has no concept of an unhideable module, and adding one would have meant editing a locked feature to save a hundred lines.

**Patterns 5.6B.3 added:**

- **Two screens showing one feature will diverge unless one component draws it.** Not "similar components kept in sync" — one component, one derivation, one footprint. Home said `4 scheduled · 4 today` and Fuel said `None logged` about the same day, and neither was wrong given the selector it was built on.
- **Put the copy rules in the domain, not in the component.** `compactWaterView` and `compactPeptidesView` are where the wording is decided and tested; the shared components take a view model and cannot word anything.
- **Assert the sharing, not the pixels.** The regression test mounts both routes over the same storage and compares the `view` props, locating the module *by component type* — so a screen that goes back to drawing its own fails immediately.
- **Reach for the feature's own object before a generic one.** Water had a vessel; both compact modules were drawing a ring.
- **Stroke widths authored in viewBox units vanish when the drawing shrinks.** At 38pt a 1.5-unit edge renders under half a pixel and a bottle reads as a slab. State strokes in points and convert.
- **A changed default must not overwrite a made choice.** The two are only distinguishable if the record says which it is: a stored `hidden: []` is an answer, an absent `hidden` is silence. Reset is the deliberate way back to the new default.
- **A fixed footprint is not the cause of clipping — an undersized one is.** 5.6B.2 removed the ceiling; the real fix was adopting the larger shared height, which also made the two screens identical.
- **Green is never neutral.** A green progress rail under protein says *good*, which is a verdict, and it is the same reading that got the composition bar deleted a slice earlier.
- **Reserve space, never draw an empty track.** Carbs and fat hold the height of protein's rail so the columns end level; drawing the track would imply a target they must never have.

**Patterns 5.6B.4 added:**

- **A headline figure must name what it measures.** `1,340` meant consumed on Fuel and `660 cal left` meant remaining on Home. Neither was wrong; together they were ambiguous. `Calories consumed` under the number costs one line and removes the question.
- **Same information at two sizes, one derivation.** `calorieSummary` produces Fuel's three lines and Home's one. A compact surface may render less; it may not compute its own version of the same fact.
- **Name the states, don't re-derive them.** `'under' | 'met' | 'over'` exists because "exactly at goal" and "under by zero" are the same arithmetic and different sentences — `0 left` is arithmetic, `Goal reached` is English.
- **Colour that identifies is not colour that judges — but only if it is kept apart.** Macro accents and meal accents share no hex on purpose, and a test enforces it; the moment one is reused for the other, a meal row starts looking like it is grading the food in it.
- **Green cannot be a category colour in a nutrition app.** It says *good* before it says anything else. Amber is the whole of VITA's "worth noticing" vocabulary; red stays reserved for errors.
- **`lineHeight` does not scale with Dynamic Type.** RN scales `fontSize` and leaves `lineHeight` in points, so a fixed one is a ceiling the text grows through and lands on whatever is below. Express it as a ratio.
- **A single word in a too-narrow box is clipped, not wrapped.** `numberOfLines={2}` does not save `Breakfast` from becoming `Br`. Let the *row* wrap between its parts, and never let a secondary summary hold `flex: 1` against the subject.

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
