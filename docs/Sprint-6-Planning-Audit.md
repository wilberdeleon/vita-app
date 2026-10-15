# Sprint 6 — Journey / Weight · Planning & Architecture Audit

**Status: characterization ✅ COMPLETE · implementation ⬜ NOT STARTED.**
Branch `sprint-6-journey-weight`, cut from `main` at `6c657fb` — the locked Sprint 5 product.

This document characterizes what Sprint 6 is, what already exists, and what has to be decided before a line of feature code is written. **No product code was written to produce it.**

---

## 1. What the roadmap actually authorizes

Quoted from `docs/04-Master-Roadmap.md` → *Sprint 6 — Journey / Weight*:

> Objective: build the weight half of Vita's emotional core.
>
> Deliverable: a Journey experience that motivates through progress, not just data display — **weight logging, weight history, and the foundational Journey data architecture everything later builds on.**

Three deliverables, then. **Weight logging · weight history · the Journey data architecture.** Everything else named in this audit is either support for those or explicitly deferred.

Two further rulings in the same section matter as much as the deliverable:

> The eight slices written for Journey under the earlier structure (Journey Overview · Journey Timeline · Milestones · Achievements · Streak System · Rewards & Celebrations · Journey Detail Screen · Journey Polish) were authored as one sprint and **have still not been divided between Weight and Photos. That split is a planning task for whenever this sprint opens.**

That split is part of this audit — §12 below.

> **Downstream opportunity:** once weight and height are stored here, the BMI Calculator could read them instead of asking again. **Recorded as an opportunity, not a commitment.**

So **BMI integration is explicitly not authorized for Sprint 6.** §9.

And carried forward from 2026-07-09:

> **⚠️ Design-risk flag (Streak System):** a literal streak that resets to zero on a missed day conflicts with the "Progress over Perfection" principle and the "no guilt mechanics — ever" rule that Journey Stages was explicitly built to satisfy.

---

## 2. The finding that should shape the whole sprint

**The Journey tab already ships, and everything on it is invented.**

`src/features/journey/api.ts` returns `JOURNEY_FIXTURE` unconditionally. On `main` today, opening Journey shows:

| What the user sees | Where it comes from |
|---|---|
| *"Momentum — Week 4 of 24"* | `mock.ts` |
| **185.2 lb** current weight | `mock.ts` |
| *"−2.4 lbs in the last 4 weeks"*, in green | `mock.ts` |
| A descending weight chart, Apr 15 → May 13 | `mock.ts` |
| *"Log weight 5x this week · 5/5 ✓"* | `mock.ts` |
| *"Complete 3 workouts · 2/3"* | `mock.ts` — for a feature that does not exist |
| **"You dropped 2.4 lbs. Keep the momentum."** | `WeightTab.tsx` |

This is not merely stale scaffolding. It breaks **three** rules the rest of VITA now holds:

1. **Real-data-only.** Slice 5.3 removed exactly this kind of fixture from Dashboard and made "nothing is fabricated to populate a module" a standing rule. Journey was outside Sprint 5's scope and kept it.
2. **No moralised weight movement.** The loss is green, the badge is green, and the chart is green. A gain would read as failure by the same logic.
3. **No auto-generated judgment.** *"Keep the momentum."* is encouragement the app invented about a number the user never entered.

It is also drawn in the pre-Sprint-5 language — floating white cards, card soup — which 5.10 would have flagged had Journey been in scope.

**Consequence for sequencing.** The first useful thing Sprint 6 does is not adding a feature. It is making the app stop telling the user a story about themselves that is not true. That is why §12's slice 6.1 is what it is.

---

## 3. Existing Journey architecture

Everything below exists on `main` today.

| Path | Lines | What it is |
|---|---|---|
| `src/app/(vita)/(tabs)/journey.tsx` | 21 | The live tab. `ScreenHeader` + `SegmentedTabs` over three tab bodies |
| `src/features/journey/api.ts` | 15 | The data boundary. Returns the fixture |
| `src/features/journey/mock.ts` | 45 | `JOURNEY_FIXTURE` — the invented data above |
| `src/features/journey/types.ts` | 42 | `JourneyData`, `WeightPoint`, `Milestone`, `WeightStats`, `PhotoEntry` |
| `src/features/journey/components/OverviewTab.tsx` | 124 | Stage card, range selector, comparison chart, milestones |
| `src/features/journey/components/WeightTab.tsx` | 118 | Current weight, delta, bars, comparison, stats |
| `src/features/journey/components/PhotosTab.tsx` | 123 | **Sprint 7 territory** |
| `src/features/journey/components/WeightBars.tsx` | 65 | Bar chart |
| `src/features/journey/components/LineChart.tsx` | 87 | Line chart, `react-native-svg` |
| `src/lib/journeyStages.ts` | 39 | The canonical 8-stage system, founder-approved 2026-07-19 |

**`palette.journey` (`#2E9E5B`) exists** and is already the dock's Journey colour. Note it is **green**, and identical to `palette.protein` / `palette.success`.

**There is no Journey persistence of any kind.** No key, no repository, no store.

**Dashboard has zero Journey references.** No widget exists, and none is authorized — §10.

### The chart question is already answered

`LineChart.tsx` and `WeightBars.tsx` are drawn with **`react-native-svg@15.15.4`, already a dependency**. Water's vessel uses the same library.

**Sprint 6 needs no new charting dependency.** The existing components are fixture-shaped and will need real inputs, empty/sparse-data behaviour and accessibility, but the capability is present. This should not become a dependency conversation.

---

## 4. Weight, height and units today

**Weight is stored nowhere.** The only weight concepts in the codebase are the Journey fixture, the BMI calculator's local component state, and prose in comments. There is no model, no repository, no key.

**Height is stored nowhere**, for the same reason.

**The BMI Calculator is stateless and must stay that way.** Slice 5.9 settled this and the locked contract says so: it takes explicit input, saves nothing, and reads nothing. **It is not a weight source and must not be mutated into one.**

### Unit ownership — the existing principle

`src/lib/preferences/model/types.ts` holds `AppPreferences`, which today contains **only `themeMode`**. The documented rule is that *a unit belonging to a domain stays with that domain* — Water's display unit lives under `vita:v1:water:prefs`, not in app preferences.

The same file already anticipates this sprint. Its extension-point note, corrected in slice 5.10, now reads: BMI did **not** take an app-level body-weight unit because it stores nothing, and *"the extension point still stands for Sprint 6 — Journey / Weight, which does store weight and is the first feature that would make such a preference observable."*

**So there is no canonical body-weight unit preference today, and Sprint 6 is the first feature with standing to create one.** Whether it should is a founder decision — §13, Decision 3.

---

## 5. Proposed weight domain model — characterization only

**Canonical storage in kilograms, display converted.** This mirrors how the BMI calculator already normalizes, and it is the only choice that keeps history stable: a stored entry must not change meaning because someone switched lb↔kg later. Slice 5.9 proved the conversion arithmetic and its exact constants are already in `src/lib/bmi`.

Illustrative shape, **not a specification**:

```
WeightEntry = {
  id:          string   // stable, generated once
  recordedAt:  string   // absolute ISO timestamp
  weightKg:    number   // canonical
  enteredUnit: 'lb' | 'kg'   // what the user actually typed
}
```

`enteredUnit` is worth considering because Water already does the equivalent — it keeps `enteredAmount` and `enteredUnit` alongside the canonical millilitres, so the log can show a drink the way it was entered. The same honesty applies to a weigh-in.

**Date ownership.** Store an absolute timestamp; group by **local calendar day** for display, exactly as `src/lib/daily/keys.ts` and the existing day-keyed domains do. This is already VITA's settled pattern and Sprint 6 should not invent a second one. A timezone move then shifts which day an old entry groups under — acceptable, well-understood, and far safer than storing a bare date string.

**Validation should be mathematical, not medical** — greater than zero, decimals allowed, **no invented "healthy" bounds**. This is the rule 5.9 established for BMI and it transfers directly.

---

## 6. The boundary that matters most

Journey is where VITA is most likely to accidentally become a diet app. The boundary, stated plainly:

**Prohibited.** Weight-loss coaching · diet recommendations · calorie prescriptions · BMI-derived targets · exercise prescription · body-image scoring · adherence scoring · auto-generated praise or criticism · *"on track / off track"* without user-defined semantics · **colour that moralises a direction of change**.

**Permitted.** The recorded weight · the arithmetic difference between recorded values · a trend visualisation · what the user themselves chose as a goal, if goals are authorized.

### Weight change is a number, not a verdict

`−3.2 lb` is a subtraction. It is not *good*, not *success*, not *improvement*. `+2.0 lb` is not *bad* — some users are deliberately gaining, and a product that paints one direction green has decided for them.

**This directly contradicts what the Journey tab does today**, where the loss is green and the app says *"Keep the momentum."* Removing that is a Sprint 6 requirement, not a preference.

**It also makes `palette.journey` a problem worth naming early.** The Journey identity colour is green — the same hex as `success`. Gold is the identity the roadmap names for Journey. Using green on a weight delta would re-introduce the exact moralisation above, *by accident*, through the feature's own accent. **Recommendation: Journey's weight surfaces take gold as the identity accent, and a weight delta takes neutral text with a direction glyph or sign, never a semantic colour.**

---

## 7. Journey information hierarchy — proposed

Not a design. A proposed order of importance, to be judged against the roadmap's *"motivates through progress, not just data display"*:

1. **The current weight** — the one real number, as the screen's subject.
2. **Change since the user's own starting point**, stated neutrally.
3. **History** — the trend, then the entries.
4. **One direct action** — log a weigh-in.

Direct-on-background by default, grouped surfaces only where a group is real, gold as the restrained accent. No motivational slogan, no giant empty hero, no achievement confetti — the same discipline Fuel, Water and Peptides already hold.

**Empty state:** factual and compact, one clear action, **no fake chart and no placeholder numbers** — which is precisely what today's screen gets wrong.

---

## 8. Add-weight flow — proposed

A **`VitaSheet`**, following Add Water, which is the closest existing analogue: a small numeric commitment made in place while the thing it changes stays visible. A dedicated route is more ceremony than one number deserves.

Reuses, with no new machinery: `NumericField` (which carries its own Done bar), the Done-dismisses-only contract, `PressableScale`, the `vitaHaptic` vocabulary, inline validation, Dynamic Type and Reduce Motion.

Open: whether the user can back-date an entry — §13, Decision 2.

---

## 9. BMI relationship — deferred, and the reason

The roadmap calls BMI integration *"an opportunity, not a commitment."*

**Sprint 6 may not touch the BMI calculator.** It stays stateless, standalone and explicit-input. If stored weight later prefills it, that is a separate authorized decision with its own founder gate — and it would be a *prefill*, never a silent coupling.

Stated as ownership:

| Domain | Owns |
|---|---|
| **Journey / Weight** | Stored weight history — the single source of truth, if this sprint creates it |
| **BMI Calculator** | Nothing. A stateless calculation over explicit input |
| **Fuel** | Nutrition logging and user-authored calorie/protein goals |
| **Settings** | Preferences |
| **Dashboard** | Presentation and launch. Never a source of truth |

---

## 10. Explicitly out of scope

| Area | Status |
|---|---|
| **Progress photos** | **Sprint 7.** `PhotosTab.tsx` exists and is fixture-driven; Sprint 6 must not build on it |
| **Atlas / AI insight** | **Sprint 8** |
| **Apple Health / HealthKit** | Not in the roadmap for Sprint 6. No native integration |
| **Dashboard Journey widget** | Not authorized. Dashboard has no Journey reference today and Sprint 6 adds none |
| **Journey Quick Tool** | Not authorized. If ever added it is *available, not selected*, under the locked Quick Tools model |
| **Weigh-in reminders / notifications** | Not in the roadmap. No permissions, no scheduling |
| **Goal weight** | **Unresolved** — §13, Decision 1 |

---

## 11. Persistence plan — proposed

Journey should fit the existing architecture rather than start a second data layer.

- **Key naming** via `singletonKey`/`dayKey` in `src/lib/daily/keys.ts`. `StorageDomain` is `string`, so adding `journey` needs no type change. Likely `vita:v1:journey:weight` (or day-keyed, depending on §13 Decision 2).
- **Structure** mirroring `src/lib/water/` — `model/` · `data/` · `state/` · `index.ts` · `__tests__/`.
- **Purely additive.** No Sprint 5 key is repurposed, migrated or rewritten. Dashboard layout, Quick Tools, Fuel targets, Water and Peptides records are untouched.
- **Normalization on read**, as every existing domain does: unknown fields dropped, malformed records producing something renderable rather than a crash.

---

## 12. Proposed slice breakdown

Including the Weight/Photos split the roadmap left open. The eight legacy Journey slices divide as follows:

| Legacy slice | Goes to |
|---|---|
| Journey Overview · Journey Detail · Journey Polish | **Sprint 6** (as the weight experience) |
| Journey Timeline | **Sprint 6** as weight history; the photo timeline is Sprint 7 |
| Milestones · Achievements · Rewards & Celebrations | **Deferred past Sprint 6.** All three are reward mechanics, and none has a design that survives the "no guilt mechanics" rule yet |
| **Streak System** | **Deferred, with the design-risk flag unresolved.** A streak that zeroes on a missed day is exactly the guilt mechanic Journey Stages was built to avoid. It needs a product decision before it needs an engineer |

Proposed Sprint 6 sequence:

- **6.1 — Journey truth.** Remove the fabricated data and the moralised copy; leave an honest empty Journey. Small, and it stops the app lying today.
- **6.2 — Weight domain + persistence.** Model, canonical kg, repository, normalization, tests. No UI.
- **6.3 — Weight logging.** The add sheet, validation, the unit decision.
- **6.4 — Journey Home + history.** Real current weight, neutral change, entry list, empty state, Sprint 5 identity.
- **6.5 — Trend visualisation.** Real inputs into the existing SVG chart; sparse-, single- and no-entry behaviour; accessibility.
- **6.6 — Edit / delete**, if authorized by Decision 2.
- **6.7 — Audit + closeout.**

**Recommended first slice: 6.1, then 6.2.** Two reasons. Removing invented data is the highest-value change in the sprint and is nearly free. And establishing data truth before presentation is the pattern every successful Sprint 5 slice followed — 5.6A fixed Fuel's goal truth before Fuel Home was redesigned, and 5.9A settled the BMI contract before a screen was drawn.

---

## 13. Open founder decisions

Four, and only four. Everything else above is answered by the roadmap or the code.

**Decision 1 — Is there a user-authored goal weight?**
*A:* Yes, user-authored only. *B:* No goal in Sprint 6.
**Recommendation: A, user-authored only.** The roadmap says "motivates through progress", and progress toward something the user chose is the only kind VITA is allowed to show. **Either way, VITA never calculates, recommends or suggests a goal weight** — no ideal weight, no BMI-derived target, no "healthy" range. The existing fixture already has a `goal` field, which is not authorization.

**Decision 2 — Multiple weigh-ins per day, and can entries be edited or back-dated?**
*A:* Many per day, all kept, edit and delete allowed. *B:* One canonical per day, newest replaces.
**Recommendation: A.** People weigh themselves twice, mistype, and want yesterday's reading in. B silently destroys data and makes "which one counted?" unanswerable. A costs an entry list and a delete affordance — both of which VITA already has patterns for.

**Decision 3 — Where does the body-weight unit live?**
*A:* App-level preference in Settings → Units. *B:* Journey-local, like Water's display unit.
**Recommendation: B, Journey-local.** It matches the documented principle that a unit belonging to a domain stays with that domain, and it is the smaller change. It can be promoted later if Photos or a future feature needs the same unit — promoting is easy, un-promoting is not.

**Decision 4 — Does Journey get a Dashboard widget in Sprint 6?**
*A:* Yes. *B:* No, defer.
**Recommendation: B, defer.** The roadmap does not authorize one, Dashboard has no Journey reference today, and a widget is worth building once there is real history to show in it.

---

## 14. Test strategy — what implementation will need pinned

Canonical kg storage and lb↔kg conversion · local-day grouping, including across a timezone change · same-day behaviour once Decision 2 lands · ordering · add / edit / delete · chart inputs at zero, one and sparse entries · the empty state · **that no Sprint 5 key is read or written** · **that no weight copy moralises a direction** — a sweep like the BMI boundary tests, asserting the absence of praise, judgment and "on track" language.

---

## 15. Accessibility, motion and themes

**Dynamic Type and VoiceOver from the start**, not as polish. A weight value is spoken with its unit. A chart is decorative and needs a text equivalent beside it — the existing `LineChart` is fixture-era and has no accessibility story yet. Nothing may depend on colour alone.

**Light and Dark from the first slice.** Gold must stay legible on both; slice 5.9 already measured that `palette.gold` reaches only ~1.7:1 on the cream background and needs a deepened light-mode pair, and that precedent applies directly.

**Motion reuses the locked Sprint 5 vocabulary** — `PressableScale`, `VitaSheet`, the motion tokens, Reduce Motion, sparse haptics. **No new motion architecture and no animation library.** In particular: no animated weight counter, no chart draw-on animation, and no celebration.

---

## 16. Deferred Sprint 5 debt — carried, not inherited

Not Sprint 6 work, and not to be folded into Journey planning:

- `FloatingDock` crops its labels at accessibility text sizes (carried since 5.3D)
- `ScreenHeader` truncates at accessibility-extra-large
- Fuel's `PROTEIN` header truncates
- Expo SDK 57 compatible upstream patch drift; **Doctor 20/21** at Sprint 5 closeout

Sprint 9 — Final Polish is the named app-wide pass for the first three.
