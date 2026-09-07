# Sprint 5 — Slice 5.6 Fuel Identity Refresh
# Planning & Identity Audit

# ⬜ AWAITING FOUNDER DESIGN DIRECTION

**Nothing in `src/` was modified to produce this document.** It is inspection and planning only. Slice 5.6 requires its own founder authorization before any code is written.

| | |
|---|---|
| Prepared | 2026-09-07 |
| Repository | `/Users/wilber/vita-app` |
| Branch | `sprint-5-identity-interaction` |
| HEAD | `9e16774` — "docs(sprint-5): lock slice 5.5" ✅ verified present |
| Working tree | Clean; local = remote |
| Expo SDK | 57 (`~57.0.20`, React Native 0.86.3) |
| Baseline | `npm test` — **64 suites / 1661 tests passing** · `tsc --noEmit` clean |
| Sprint 5 | 5.1–5.5 ✅ locked · **5.6 next, not started** |
| Fuel size | ~6,990 lines across 9 routes, 16 components, 25 domain files |

---

# A. Executive recommendation

**Fuel's architecture is the strongest in the app and should be left almost entirely alone. Its screen is the weakest, and for two reasons that are not styling.**

The first is a **data-truth defect**. `DEFAULT_TARGETS` — 2,000 kcal, 160 g protein, 214 g carbs, 64 g fat — is hardcoded in `model/types.ts`, and `updateTargets` **has no callers anywhere in `src/`**. There is no goals editor in Settings or anywhere else. So every user, on their first launch, is told they have `2000 Calories remaining`, a `Protein Goal` of 160 g, and `0% of 2000 Calories` — against numbers VITA invented for them. `FuelSummaryCard`'s own docstring claims the bars show "the user's own configured targets", which is not true and cannot currently be made true. This is the same class of defect 5.3 removed from Dashboard and 5.2 settled in Water (*"Your goal is yours to choose. VITA doesn't set one for you."*), and it is squarely what §32 of the 5.6 authorization prohibits. **It must be fixed in 5.6, and it is a product decision before it is a design one — see §AA.1.**

The second is that **the screen's subject is a calorie ring and three macro bars**, which is precisely the generic calorie-counter language §7 and §23 rule out. It is not card soup — Sprint 2 already fixed that, and the meal panel is genuinely good — it is that the most prominent object on Fuel is the least Fuel-specific thing VITA could have drawn.

**The distinctive asset Fuel already owns is its food artwork.** `foodVisual.ts` and `foodArt.ts` are a three-tier resolver — real product image, then a hand-drawn VITA category illustration, then an honest generic — with a conservative classifier and a written rule that *generic is preferable to wrong*. Fourteen drawings exist. Today they are used at 40–64 pt inside rows and avatars. **Nothing else in VITA looks like this, and no competitor's calorie app does either.** The recommendation in §F is to make that artwork the subject of Fuel Home rather than a decoration inside its list rows.

**Third finding: Fuel has no tests at all.** Not one of the 64 suites asserts anything about `lib/nutrition`, `features/fuel`, or any `/fuel/*` route — the provider, both external adapters, dedupe, ranking, the cache, macros, meal slots, favourites and the repository are all uncovered. Two suites merely mount `NutritionProvider` as a wrapper for another feature. This is the largest technical risk in 5.6 and the reason §X front-loads a characterization pass.

---

# B. Current Fuel architecture

## B.1 Routes

| Route | File | Purpose |
|---|---|---|
| `/(tabs)/fuel` | `(tabs)/fuel.tsx` | Fuel Home — the tab |
| `/fuel/add` | `add.tsx` | Chooser: scan · search · recent · favourites · manual |
| `/fuel/search` | `search.tsx` | Multi-provider food search |
| `/fuel/scan` | `scan.tsx` | Barcode scanner (325 lines — the largest route) |
| `/fuel/manual` | `manual.tsx` | Create a custom food |
| `/fuel/food/[id]` | `food/[id].tsx` | Food detail → add to log |
| `/fuel/entry/[id]` | `entry/[id].tsx` | Edit or delete a logged entry |
| `/fuel/log` | `log.tsx` | The full day's log |
| `/fuel/recent` | `recent.tsx` | Recently logged foods |
| `/fuel/favorites` | `favorites.tsx` | Favourited foods |

Every route forwards a `?meal=` parameter, so a meal chosen on Home survives to Food Detail. That is a genuinely good piece of flow design and must be preserved.

## B.2 Components — `features/fuel/`

`FuelSummaryCard` · `FuelQuickActions` · `TodayMealsPanel` · `FuelTrackerCard` · `MealFoodRow` · `LoggedEntryRow` · `FoodRow` · `FoodAvatar` · `FoodArt` · `NutritionSummary` · `NutritionDetailList` · `PortionEditor` · `MealPicker` · `FavoriteButton` · `ScannerFrame` · `WrongProductAction`, plus `foodVisual.ts`, `foodArt.ts`, `mealAccent.ts`. **No dead components** — every one has at least one caller.

## B.3 Domain — `lib/nutrition/`

- **State** — `NutritionProvider` (378 lines, reducer + repository seam), `useDailyNutrition`, `useFoodSearch`, `useRecentFoods`.
- **Model** — `types.ts` (`VitaFood`, `FoodEntry`, `NutritionFacts`, `NutritionTargets`), `nutrition.ts` (`dailyTotals`, `summarizeMeals`), `macros.ts`, `mealSlots.ts`, `foods.ts`, `favorites.ts`, `format.ts`.
- **Data** — `FoodLogRepository` interface + `asyncStorageRepository` (337 lines), `keys.ts`.
- **Providers** — `openFoodFacts.ts`, `usda.ts`, `registry.ts` (fan-out), `gtin.ts`, `http.ts`, `trace.ts`.
- **Search** — `cache.ts`, `dedupe.ts`, `rank.ts`.

## B.4 External integrations

**Both providers are live**, each gated by its own `isConfigured()`: USDA on `EXPO_PUBLIC_USDA_API_KEY`, Open Food Facts on a contact string. Search fans out **in parallel** with per-provider failure isolation — an error is reported only when *every* configured provider fails. Barcode lookup is **sequential**, Open Food Facts first because it is barcode-native and USDA has no barcode endpoint. **USDA is shipped, not deferred** — §15's caution does not apply, and any doc still describing it as future is stale.

## B.5 Dashboard integration

`features/dashboard/components/FuelStrip.tsx` consumes `DailyNutrition` and renders `Math.round(today.nutrition.calories)`. **It is a locked surface (5.3).** Whatever 5.6 does must keep `useDailyNutrition()`'s shape intact, or it changes Home.

---

# C. Functional strengths — preserve

Treat all of the following as **frozen** unless a presentation change genuinely requires touching them:

1. **The repository seam.** `FoodLogRepository` + `asyncStorageRepository`, injected into the provider. Same pattern as Water and Peptides.
2. **The normalized food model.** `VitaFood` is provider-agnostic; screens never know whether a food came from USDA or OFF.
3. **Denormalized log entries.** `name`, `brand`, `imageUrl` and the serving are copied onto the entry at log time, so history renders without resolving anything and a scanned product keeps its image across launches. This is the same "history is a snapshot" rule Peptides settled.
4. **Derived-not-stored totals.** `dailyTotals` recomputes from the entry array every render; there is no second copy to drift.
5. **Meal grouping.** Four canonical slots, `summarizeMeals`, and the `?meal=` parameter threaded through every route.
6. **Parallel search with isolated failure**, dedupe and ranking.
7. **Barcode ordering** — OFF first, sequential, stop at first exact match.
8. **Favourites that survive offline**, storing their own definition where provider terms allow and rebuilding from log history where they do not.
9. **Edit and delete with undo** (`removeEntry` / `restoreEntry`).
10. **`foodVisual` / `foodArt`** — see §A and §F.
11. **Dashboard reactivity** through the shared hook.

**Do not** rewrite the provider layer, change the repository interface, alter `VitaFood`, or touch the search/dedupe/rank pipeline for presentation reasons.

---

# D. Current UX and visual problems, by surface

## D.1 Fuel Home — `(tabs)/fuel.tsx`

- **Invented targets are the loudest thing on the screen.** On an empty day: `2000 Calories remaining` · `0% of 2000 Calories` · `Protein Goal 0 / 160 g`. Every one of those numbers is fiction. §A.
- **The subject is a calorie ring plus three macro bars** — the generic calorie-counter object §7 rules out. Nothing about it is Fuel-specific, let alone VITA-specific.
- **`FuelSummaryCard` is doing four jobs at once**: a ring, a remaining-calories headline, a progress bar, a percentage line and three macro bars, all in one card with `adjustsFontSizeToFit` in four places. Shrinking type to fit is a symptom of too much in one box.
- **Two filled action cards compete.** `FuelQuickActions` renders a solid-orange *Log Food* beside a bordered *Scan Barcode*, both with shadows, both with title + subtitle. Two CTAs plus every meal row's own `+ Add food` plus the meal-tap-to-add behaviour is four ways to start the same task.
- **Hydration and Peptides tiles sit at the bottom of Fuel.** Two `FuelTrackerCard`s for other features, one of which renders `progress={0}` permanently because peptides have no daily target. This is feature bleed: Dashboard is the cross-feature surface, and 5.3 locked it. They dilute Fuel and add two more rounded containers.
- **No empty state.** There is no `isEmpty` branch; a brand-new user gets the full apparatus with zeros in it.
- **Orange is unearned in places** — a fully saturated orange action card is the single largest colour block on the screen, which is the opposite of the Sprint 5 rule that the primary control is neutral and the feature colour is carried by the objects.

## D.2 `TodayMealsPanel` — **the strongest part of Fuel**

Meals are rows in one panel with hairline dividers, expanded when they have entries, each carrying its own `+ Add food`. This is already close to the identity. Minor issues only: it still lives inside a `Card` when the rest of Sprint 5 renders direct on background; empty meals always render, which on an empty day is four rows saying *No foods logged*; and the panel repeats `Today's Meals` as a `SectionHeader` above a card that contains nothing else.

## D.3 `/fuel/add`

A five-row chooser (scan, search, recent, favourites, manual) that is a menu, not an action. Reaching food from Home is: Home → Log Food → Search → type → result → detail → add. That is five screens for the app's most frequent action.

## D.4 `/fuel/search`

A bare `TextField` above a flat result list. No recent-search memory, no per-provider indication, results are undifferentiated rows. The provider diagnostics exist in state but surface only as an error string.

## D.5 `/fuel/scan`

Functionally the most complete screen in Fuel — permission (including the *cannot ask again* branch), scanning, looking-up, not-found and error phases are all handled, and `WrongProductAction` exists for a mislabelled barcode. Visually it is a stock `CameraView` with an `EmptyState` for failures; nothing about it reads as VITA.

## D.6 `/fuel/food/[id]` and `/fuel/entry/[id]`

Reasonable already: avatar, portion editor, nutrition list, one primary action. The top is slightly overstuffed (name in the header *and* an avatar block beneath), and `NutritionDetailList` renders in a `Card` that could be direct.

## D.7 `/fuel/manual.tsx`

**Nine numeric fields** — serving size, calories, protein, carbs, fat, then saturated fat, fibre, sugar and sodium behind a *More nutrition* toggle — plus name, brand and unit. It reads as a database form. The disclosure exists but the first six fields are all visible at once inside a `Card`. (Its numeric keyboards were fixed globally in 5.5C; that part is settled.)

## D.8 `/fuel/log.tsx`

Duplicates Home's summary via `DailyProgressCard` plus the same macro loop, then lists entries. With Home showing meals inline since Sprint 2, this screen's reason to exist is now mostly "the whole day in one flat list".

---

# E. Fuel identity — three concepts

None of these is implemented. Each is assessed against: what data drives it, empty behaviour, how it scales across a day, both themes, distinctiveness, and whether it can stay factual.

## E.1 Concept 1 — **The Day Strip** (a timed band of what you ate)

A horizontal band representing the waking day, with each logged food placed at the time it was actually eaten and drawn with its own `foodVisual` — real product image where one exists, VITA category art otherwise.

- **Data:** `entry.loggedAt` (present on every entry), `entry.meal`, `entry.imageUrl`, `foodVisual(name)`. All real, all already stored.
- **Empty:** a bare band with a single quiet marker at the current time and one line of copy. It reads as *the day hasn't started* rather than as a broken widget.
- **Through the day:** fills left to right; morning-only days are honestly lopsided. A very busy day needs grouping — adjacent items within a meal collapse to one cluster with a count.
- **Themes:** the band is a hairline rail on the background (the same device the Peptides week strip uses, already proven in both themes); the art carries the colour.
- **Distinctive:** high. It is *what and when*, told in VITA's own drawings. No mainstream calorie app does this.
- **Factual:** entirely — it states events, never quality. No target is implied, so no goal is needed for it to work.
- **Risk:** crowding at 12+ items; needs a clear grouping rule and a real accessible equivalent.

## E.2 Concept 2 — **The Composition Bar** (what the day was made of)

One wide horizontal bar, segmented by the share of **energy consumed** contributed by protein, carbs and fat. Not progress toward anything — a description of the day so far.

- **Data:** `dailyTotals` macros converted to calories (4/4/9). Real, derived, no target.
- **Empty:** an outlined empty bar and *Nothing logged yet*.
- **Through the day:** proportions settle as the day fills; early on it swings wildly, which is honest but can look unstable.
- **Themes:** three macro tokens already exist and work in both.
- **Distinctive:** low-to-moderate. A stacked bar is a common form, though *shares of what you ate* rather than *progress to a goal* is genuinely less common.
- **Factual:** yes, and notably it needs **no goal at all** — which makes it the safest answer to the targets problem.
- **Risk:** it is a chart. On its own it is not enough to make Fuel feel like Fuel.

## E.3 Concept 3 — **The Plate** (the day arranged as a meal)

A single circular plate onto which the day's foods are placed as category art, area-weighted by calorie contribution.

- **Data:** same as Concept 1 minus time.
- **Empty:** an empty plate outline — charming, and unmistakably Fuel.
- **Through the day:** fills up; a 15-item day becomes a crowded circle.
- **Themes:** fine.
- **Distinctive:** highest of the three.
- **Factual:** area-by-calories is proportion, not judgement — but a *plate* invites reading as "a balanced meal", which edges toward evaluation. It is also the hardest to lay out well, the hardest to make accessible, and the most likely to read as a gimmick once the novelty passes.
- **Risk:** high effort, high gimmick risk, weak at realistic item counts.

---

# F. Recommended identity — **the Day Strip, with the Composition Bar as its context line**

**Recommend Concept 1 as Fuel's visual object, with a slim Concept 2 bar beneath it as the macro context line.** Not two objects — one object and its caption.

Why:

- It is built from **an asset VITA already owns and no competitor has**. The food artwork is the most distinctive thing in the Fuel codebase and is currently buried at 40 pt inside list rows.
- It answers the question a daily-use page should answer — *what have I eaten today* — rather than *how am I scoring*.
- **It needs no goal to be meaningful**, which dissolves the invented-targets problem instead of restyling it. Calories become a stated total, and a target is layered on only if the user sets one.
- It is factual by construction. A timeline of events cannot grade anyone.
- It parallels the rest of the identity without copying it: Water has a vessel that fills, Peptides has a timeline of discrete states, Fuel gets a timeline of *things*. Same family, different noun.
- The technique is proven — the Peptides week strip already establishes the rail-plus-nodes pattern in both themes and at accessibility text sizes.

**Explicitly rejected:** a calorie ring as the subject, macro donuts, three macro cards, and any treemap. The ring may survive only as a small optional element *if* the user has set a goal — see §H.

---

# G. Recommended Fuel Home hierarchy

1. **Header** — `Fuel`, with the date (as today).
2. **The Day Strip** — the day's foods, in time order. The subject of the screen.
3. **Calories line** — one factual line: total consumed; against a goal only if one exists (§H).
4. **Composition line** — the slim macro-share bar with figures.
5. **Today's meals** — the existing panel, direct on background.
6. **Add food** — one primary action (§J).
7. *(nothing else)*

**Removed from Home:** the Hydration and Peptides tracker tiles. They belong to Dashboard, which already carries them and is locked.

---

# H. Calories and macros

**Calories.** Lead with what is true: `1,240 Calories today`. If — and only if — the user has set a goal, add the second clause: `of 2,000 · 760 left`. With no goal, no ring, no bar, no percentage, and **no invented number**. Over a goal stays factual and amber, never red, never "over budget" — the current `caloriesOver` wording and amber accent are already right and should be kept.

**Macros.** Keep them on Home, but demoted from three bars to **one composition line plus three figures** — `Protein 82 g · Carbs 140 g · Fat 41 g` under the bar. No separate cards, no donut, and no target unless the user set one. Full detail stays in Food Detail and the log.

---

# I. Today's meals

Keep `TodayMealsPanel` substantially as it is — it is the part of Fuel that already works. Changes:

- Render **direct on background** with hairline dividers rather than inside a `Card`, and drop the now-redundant `Today's Meals` section header.
- **Hide empty meal slots once at least one meal has entries**, with one quiet `Add to another meal` affordance; show all four only on a completely empty day, where they are the structure of the day rather than four negative statements.
- Keep: expanded-by-default when logged, per-meal `+ Add food` carrying `?meal=`, meal totals in the row, tap a food to edit.
- Keep `mealAccent` — the sunrise/midday/sunset progression is real Fuel identity and cost nothing.

---

# J. Add Food

**One primary action on Home**, placed after the meals: `Add food`. Neutral, not a filled orange block.

- It opens the existing `/fuel/add` chooser, which should be **reordered by real frequency** — Search first, Scan second, then Recent, Favourites, Manual.
- Per-meal `+ Add food` stays (it carries the meal, which is its whole value).
- **Scan gets one shortcut**, as an icon action in the header rather than a second full-width card.
- That is three entry points with three distinct jobs, not four competing CTAs.

---

# K. Search and Open Food Facts

**Current:** parallel USDA + OFF fan-out, deduped and ranked, per-provider failure isolation, an error only when everything fails, and a session cache. Solid.

**Recommended:** keep the pipeline untouched. Presentationally — show `foodVisual` art on every result row (making search look like the rest of Fuel), show brand and serving as the secondary line, keep results direct on background, and give the idle state the user's **recent foods** rather than a blank screen, since those are already derived and are the most likely thing they want. Surface a quiet line when a provider is unconfigured — that is a setup problem, not a failure, and the registry already distinguishes them.

---

# L. Barcode scanner

**Current:** `expo-camera` `CameraView`, restricted to `upc_a`/`upc_e`/`ean13`/`ean8`; states for permission-undetermined, permission-denied (including *cannot ask again*), scanning, looking-up, not-found and error; `?meal=` carried through every exit; `WrongProductAction` for a mislabelled product.

**Recommended:** a visual refresh only — a VITA-styled reticle (`ScannerFrame` exists), a clear looking-up state over the frozen frame, and not-found / error states that offer *Search instead* and *Enter manually* while keeping the meal. The behaviour is correct and should not be rewritten.

**Explicitly confirmed: no scoring.** No VITA Score, no Yuka-style grade, no health rating, no colour-coded verdict, no "processed" label. The scanner identifies a product, retrieves its nutrition, and logs it. The scoring concept remains deferred and **is not part of 5.6**.

---

# M. Food detail and edit

Recommended order: **name and brand** → serving/portion control → calories and macros for the chosen portion → full nutrition detail (disclosed) → one primary action (`Add to log`, or `Save changes` when editing an entry) → delete only on the entry route. Favourite stays as the header action. Move the food art from a separate avatar block into the header line so the top is one statement rather than two.

---

# N. Manual entry

Group and disclose. **Visible:** name, brand, serving size + unit, calories. **Disclosed as "Macros":** protein, carbs, fat. **Disclosed as "More nutrition":** saturated fat, fibre, sugar, sodium. Render direct on background rather than in a `Card`. Numeric keyboards are already correct via `NumericField` (5.5C) — **do not add any screen-specific keyboard handling**.

---

# O. Empty states

Short, one line each, no decorative cards:

| State | Copy direction |
|---|---|
| No food today | *Nothing logged yet* + the primary Add food action |
| No search results | *No matches for "…"* + Enter manually |
| Scanner: not found | *That barcode isn't in the databases yet* + Search / Enter manually |
| Scanner: no permission | Plain explanation + Open Settings |
| No recent foods | *Foods you log will show up here* |
| No calorie goal | **No empty state at all** — the total is the content; absence of a goal is normal, not missing data |

---

# P. Orange

**Earned:** the Day Strip's rail and its active/today marker · the calorie figure itself · a selected meal or filter · the favourite state · the primary action's *label* where it is a text action.

**Not earned:** full-bleed orange action cards, orange on every number, orange section headers, gradients. Neutral remains the default for primary controls; the feature colour belongs to the objects and states — the rule 5.1 set and 5.5 followed.

---

# Q. Motion and haptics

Restrained, and only where something changed. A logged food **appearing on the Day Strip** is the one moment worth animating — it is the confirmation. Meal expansion stays instant (the disclosure pattern already established). Scanner result may cross-fade. No entrance animations, nothing on mount, everything honouring `useReducedMotion`. **5.8 owns global motion unification** — 5.6 should not invent a vocabulary it will have to undo.

**Haptics:** one `success` on a food being logged, and one on a successful scan-to-log. Nothing else.

---

# R. Dynamic Type

One responsive layout, no large-text variants, no `allowFontScaling={false}`. Likely failure points to fix while touching these screens:

- `FuelSummaryCard` uses `adjustsFontSizeToFit` in four places — shrinking text to preserve a layout is the pattern the Dynamic Type policy replaced.
- `FuelQuickActions` shrinks both title and subtitle to keep two cards side by side.
- Macro rows in a three-column arrangement wrap badly (already noted in the component's own docstring).
- `manual.tsx` uses three-across numeric fields.
- Meal rows and the scanner result need wrapping rather than truncation.
- Any Day Strip node must scale with `fontScale`, exactly as the Peptides month and week nodes now do.

---

# S. Light and dark

Both required. Watch: orange on light backgrounds needs its contrast checked at text sizes; the current stack of shadowed cards becomes white-on-white in light; the Day Strip's rail must be a hairline in both; food artwork must be legible on both grounds.

---

# T. Accessibility

- **The Day Strip needs a full textual equivalent** — the day as a readable list, not only a drawing. This is the §29 rule and the same one `BodyMap` follows.
- Each strip item speaks food, time and meal.
- The composition line speaks as one sentence, not three separate stops.
- Meal rows already announce items and calories; keep that.
- Search results announce name, brand and serving.
- Scanner announces phase changes.
- Portion controls are steppers with proper labels.
- Numeric fields keep their labels and their Done bar.

---

# U. Data and goal boundaries

**Confirmed: this audit invents no nutrition values.** No recommended calories, no recommended macros, no protein target, no deficit, no meal plan, no suggested foods, no diet protocol. The single most important consequence of §A is that **the existing hardcoded 2,000/160/214/64 must stop being presented as the user's goal**. Two acceptable resolutions, both requiring a founder ruling (§AA.1): show no goal until the user sets one, or ship a goals editor and treat a goal as user-authored. **Continuing to display invented targets is not an option.**

---

# V. Test coverage

**Fuel has none.** Verified: of 64 suites, exactly two touch Fuel at all — `DashboardRoute.test.tsx` and `PeptidesHome.test.tsx` — and both only *mount* `NutritionProvider` as a wrapper while asserting other features' behaviour.

| Area | Suites | Tests |
|---|---|---|
| Peptides (feature + domain) | 21 | ~900 |
| Water | 7 | ~180 |
| Dashboard | 5 | ~120 |
| daily / preferences / haptics / UI / settings / tools | 11 | ~130 |
| **Fuel + nutrition** | **0** | **0** |

Uncovered: `NutritionProvider`, `asyncStorageRepository`, `dailyTotals`, `summarizeMeals`, `macros`, `mealSlots`, `favorites`, `foods`, `format`, both provider adapters, `registry` fan-out, `dedupe`, `rank`, `cache`, `gtin`, and all nine routes — including the scanner's six states and every logging, editing and deleting path.

---

# W. Technical risks

1. **No safety net.** Any refactor of Fuel presentation is currently unverifiable. **Mitigation: characterization tests first (§X.1), before any redesign.**
2. **`useDailyNutrition` is shared with locked Dashboard.** Changing its shape changes `FuelStrip`. Treat the hook's contract as frozen; add fields, never remove or rename.
3. **Targets are load-bearing in three places** — `FuelSummaryCard`, `log.tsx` and `dailyTotals` all read them. Removing invented goals is a domain-visible change, not a styling one, and needs its own test coverage.
4. **External data is incomplete by nature.** Open Food Facts products routinely lack macros; `NutritionFacts` fields can be absent. Any new visual must render a food with calories only.
5. **`PressableScale` flex trap** — already worked around in `FuelQuickActions`; any new row layout will meet it again. Carried to 5.8.
6. **`adjustsFontSizeToFit` removal will change layouts** on small screens; expect real reflow work.
7. **Scanner is untestable in Jest** (`expo-camera`, real permissions). Its *state machine* can and should be extracted and tested; the camera view cannot.
8. **Nine numeric fields in `manual.tsx`** were converted to `NumericField` in 5.5C — a redesign must not regress that.
9. **`imageUrl` is remote.** Images can fail or be slow; the art fallback must be the default rendering path, not an error path.
10. **No preview harness for Fuel.** Peptides' `/peptides-preview` is why device QA there is quick; Fuel has nothing equivalent, and the §33–§35 scenario matrices are impractical to check without one.

---

# X. Proposed 5.6 implementation slices

| Slice | Scope |
|---|---|
| **5.6A — Fuel characterization + goal truth** | Test the existing behaviour *before changing it*: provider, repository, totals, meal grouping, dedupe/rank, and route-level logging/edit/delete. Then resolve the invented-targets defect per the founder's §AA.1 ruling. **No visual redesign.** |
| **5.6B — Fuel Home identity** | The Day Strip, the calorie line, the composition line, the meals panel direct on background, removal of the Hydration/Peptides tiles, the single Add food action, empty states. Plus a `/fuel-preview` harness for the §33 scenario matrix. |
| **5.6C — Add food, search and recent** | Chooser reorder, search results with food art, recents as the idle state, empty and error states. |
| **5.6D — Scanner + Food detail + manual entry** | Scanner visual refresh and its state-machine extraction; food detail hierarchy; manual entry grouping and disclosure. |
| **5.6E — Founder polish** | Device review corrections, Dynamic Type and Light/Dark pass. |

**5.6A is not optional and must come first.** Redesigning 6,990 lines with zero tests is how the PT-141 defect this project already recorded happens again.

---

# Y. Files likely to change (listed only — none edited)

**Routes:** `(tabs)/fuel.tsx` · `fuel/add.tsx` · `fuel/search.tsx` · `fuel/scan.tsx` · `fuel/manual.tsx` · `fuel/food/[id].tsx` · `fuel/entry/[id].tsx` · `fuel/log.tsx` · `fuel/recent.tsx` · `fuel/favorites.tsx`
**Components:** `FuelSummaryCard` (likely replaced) · `FuelQuickActions` (likely replaced) · `FuelTrackerCard` (likely removed from Home) · `TodayMealsPanel` · `MealFoodRow` · `FoodRow` · `FoodAvatar` · `NutritionSummary` · `NutritionDetailList` · `PortionEditor` · `ScannerFrame`
**New (expected):** a Day Strip component · a composition line · `features/fuel/dayStrip.ts` selectors · `app/(vita)/fuel-preview.tsx`
**Domain (minimal, goal-truth only):** `model/types.ts` (`DEFAULT_TARGETS`) · `state/NutritionProvider.tsx` · possibly a goals surface in Settings
**Do not touch:** `providers/*` · `search/*` · `data/*` · `foodVisual.ts` · `foodArt.ts` · `features/dashboard/**`

---

# Z. Explicit non-goals for 5.6

VITA Score · any food, meal or product grading · red/yellow/green ratings · diet or calorie recommendations · macro recommendations · meal plans or suggested foods · streaks, adherence or compliance · guilt or "cheat" language · a Fuel architecture rewrite · a new provider integration · Movement · BMI (5.9) · Journey (Sprint 6) · Tools and Settings identity (5.7) · global motion unification (5.8) · any change to the locked Dashboard, Water or Peptides surfaces.

*(USDA is **not** a non-goal by deferral — it is already integrated and live.)*

---

# AA. Founder decisions needed before implementation

1. **Calorie and macro goals — the blocking decision.** Today VITA invents 2,000 / 160 / 214 / 64 and presents them as the user's own. Choose one: **(a)** show no goal until the user sets one, and add a goals editor in Settings — the Water precedent; **(b)** show no goal and ship no editor in 5.6, treating calories as a plain total; or **(c)** keep goals but make them explicitly user-authored on first use. *Recommendation: (a).*
2. **The visual object.** Approve the Day Strip (§F), or choose the Composition Bar or the Plate instead.
3. **Hydration and Peptides tiles on Fuel Home** — confirm removal.
4. **Empty meal slots** — hide once a day has any entry, or always show all four.
5. **`/fuel/log`** — keep as the full-day list, or fold into Home now that meals are inline.
6. **5.6A first.** Confirm that a characterization-test pass precedes any redesign.

---

**No implementation has begun. Slice 5.6 requires separate founder authorization.**
