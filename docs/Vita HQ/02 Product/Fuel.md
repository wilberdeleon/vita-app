# Fuel

**What is this?** Vita's nutrition experience (canonical module name: `fuel`). Fuel is how users log what they eat — but framed as fueling a transformation, not counting calories.

**Why does it exist?** Nutrition is the highest-frequency health decision people make. Fuel's job is to make logging so frictionless that consistency becomes possible ([[Product Philosophy]]: reduce friction, reinforce consistency).

---

## Sprint 5 slice 5.6C — adding food is one screen now (2026-09-09, awaiting founder device review)

**Tapping *Add food* opens a search box, not a menu.** It used to be a list of five things to tap before you could type anything. Now the search field is right there, with **Scan** and **Manual** as two small buttons beside it.

**Underneath: what you actually eat.** Your recent foods and your favourites, as real rows you can tap straight into. Start typing and they step aside for the results.

**Every food looks the same everywhere.** Search, recents and favourites all use the same row as your meals on the Fuel home screen — same picture, same name, same calories on the right. A food you find in search looks like the same food once it is in your day.

**The meal comes with you.** Add food from Dinner and you see the moon and the word *Dinner* at the top — the exact same mark the Dinner row uses — and it stays with you through search, the scanner and manual entry, right up to logging.

**If search fails**, it says so in plain words with a *Try again*, and never mentions a database name or an error code. If one food source is down and another works, you just get results.

**Still no suggestions.** VITA does not recommend foods, rank them against your goals, or score them. Search results are search results.

**Coming next in Fuel:** the scanner, food detail and manual entry screens.

Engineering detail: repo `docs/06-Slice-Tracker.md` → slice 5.6C.

---

## ✅ Fuel Home is finished (approved on 2026-09-09)

**Wilber approved the Fuel home screen on his iPhone on 9 September 2026, and it is now locked.** That covers everything below — the redesign and all four rounds of corrections after it. Nobody is redesigning this screen again unless something is actually broken.

**What you get when you open Fuel:**

- **Your nutrition first.** The big number is what you have eaten today, with `Calories consumed` under it so it can't be misread. If you set a calorie goal, you also see what is left and a thin orange bar. Protein shows a goal if you set one. **Carbs and fat are just totals** — VITA sets no limit on either.
- **Your four meals** — breakfast, lunch, dinner and snacks — each on one line with a small mark for the time of day, tap to open, tap to close, and a `+` to add straight into one.
- **Water and peptides**, side by side at the bottom, showing exactly what Home shows.
- **Add food**, always at the end.

**You can rearrange it.** Tap `•••` → Customize Fuel to change the order, turn the day strip, water or peptides on and off, and switch water and peptides between square and wide. Nutrition and your meals always stay. There is a *Reset Layout* if you want the original back.

**The day strip is off unless you turn it on.** It still exists and still works — the picture of your day's food in the order you ate it — but the simpler screen won.

**Setting anything up is optional.** Calories, protein and water goals are all offered, all optional, and Fuel logs food perfectly well with none of them.

**VITA still does not tell you what to eat.** It counts what you enter and compares it to goals *you* chose. It does not recommend calories, protein, carbs or fat, does not calculate a TDEE or a deficit, does not grade your day and does not score food. Nutrition guidance is something [[My Journey|Journey]] may take on later, with its own review — nothing of the sort exists today.

**Still to come in Fuel:** the add / search / recent screens, then the scanner, food detail and manual entry. The home screen itself is done.

Engineering detail: repo `docs/06-Slice-Tracker.md` → *Slice 5.6B — closed*.

---

## ✅ Sprint 5 slice 5.6B.4 — calories say what they mean, and the day has a shape (2026-09-09, approved)

**The big number is what you ate.** Fuel now reads `1,340` above `Calories consumed`, with `660 left · 2,000 goal` under it. Home's Fuel card says the same thing in one line: `1,340 cal consumed · 660 left`. They are built from the same place, so they can never tell you two different things about the same day. Go past your goal and it says `400 over` in amber — a fact, not a telling-off.

**Protein, carbs and fat have their own colours now.** Violet, amber and a cool blue. **They only mean which one is which** — not good, not bad, not too much or too little. VITA has no opinion about your macro split and no limit for carbs or fat, so there is nothing for a colour to grade. The numbers themselves stay plain white so nothing looks like a warning.

**Your meals look like times of day again.** A sunrise on Breakfast, a sun on Lunch, **a moon on Dinner**, and cutlery on Snacks. Small marks beside the name — enough to make the list feel like a day rather than a spreadsheet. Empty meals keep their mark too.

**Nothing else moved.** Water and peptides are exactly as they were, the day strip is still off unless you turn it on, and Customize Fuel works the same way.

Engineering detail: repo `docs/06-Slice-Tracker.md` → slice 5.6B.4.

---

## ✅ Sprint 5 slice 5.6B.3 — water and peptides look the same everywhere (2026-09-08, approved)

**Water and peptides now look identical on Home and on Fuel.** They were two different-looking versions of the same thing; they are one now, drawn by one piece of the app. Whatever your water says in one place, it says in the other.

**Water shows the VITA bottle.** The same fillable bottle the Water screen uses, filling towards the same goal — not the generic progress circle it had before. With no goal set it simply sits there and shows your day's total; it does not pretend you are at 0% of something you never chose.

**The day strip is off to begin with.** With your nutrition at the top and your meals underneath it, the strip was adding clutter rather than an answer — especially on a busy day. It is not gone: turn it back on any time in `•••` → Customize Fuel, and it works exactly as it did. If you already turned it on, it stays on.

**Nutrition got a final tidy.** Slightly larger macro figures, cleaner spacing, and the protein bar is no longer green — green reads as *good*, and VITA does not grade what you ate.

Engineering detail: repo `docs/06-Slice-Tracker.md` → slice 5.6B.3.

---

## ✅ Sprint 5 slice 5.6B.2 — nutrition leads, and Fuel is yours to arrange (2026-09-08, approved)

**Your nutrition is the first thing you see now.** Calories, how far into your goal you are, then protein, carbs and fat. The strip of your day's food follows it — it is still Fuel's own picture of your day, it just no longer stands in front of the answer.

**Water and peptides are two small squares side by side**, at the foot of the screen. Water shows a ring with how far into your goal you are and the day's total; peptides shows what is scheduled. Both are read-only reminders with a way through to the real thing.

**Customize Fuel.** Tap `•••` in the header. You can change the order of the sections, turn the day strip, water and peptides on and off, and switch water and peptides between square and wide. Nutrition and your meals are always there — they are what Fuel is. There is a *Reset Layout* if you want the original back. Everything is remembered.

You can still press and hold a section on the page itself to move it up or down, exactly as before.

**If you have set no goals and logged no food**, Fuel does not show you a screen of zeroes. It offers to set your goals up instead — and once you have skipped that, it stops asking and shrinks to a quiet link. The moment you log something, your real numbers lead again, goals or no goals.

**Still no scores and no advice.** Carbs and fat remain plain totals with no limits, and VITA does not recommend calories, protein, or peptide doses — your goals are yours to set.

Engineering detail: repo `docs/06-Slice-Tracker.md` → slice 5.6B.2.

---

## ✅ Sprint 5 slice 5.6B.1 — the structure back, without the bulk (2026-09-07, approved)

**Fuel has five sections now**, all sitting straight on the background: your day's food, your nutrition, your meals, water and peptides. The 5.6B redesign looked right but had taken too much out — this puts the useful parts back without bringing back the big cards.

**Your meals fold open and shut.** Breakfast, Lunch, Dinner and Snacks are always there as one compact line each, showing their calories and how many foods. Tap one to see what is in it; tap again to close it.

**Water and peptides are back on Fuel**, as two quiet lines rather than the big tiles they used to be. Water shows your progress towards your goal; peptides tells you what is scheduled.

**Set up Fuel.** If you have set no goals at all, Fuel offers to set them up once — calories, protein and your water goal, all optional, with a real *Skip for now* that it remembers. **Your water goal is the same one the Water screen uses**: change it in either place and both follow.

**You can rearrange the page.** Press and hold any section, then move it up or down — by dragging, or with the arrows. The order is remembered. The header and Add food stay put.

**Still no scores and no advice.** Carbs and fat remain plain totals with no limits, and VITA does not recommend calories, protein or anything else — your goals are yours to set.

Engineering detail: repo `docs/06-Slice-Tracker.md` → slice 5.6B.1.

---

## ✅ Sprint 5 slice 5.6B — Fuel looks like VITA now (2026-09-07, approved)

**Fuel's screen is built around your food.** A strip across the top shows what you ate today, in the order you ate it, drawn with VITA's own food illustrations — or the product's real photo when there is one. It replaces the calorie ring, which was the one thing every calorie app already has and which answered *how am I scoring* instead of *what did I eat*.

**The numbers come after the food.** Your calories, then protein, carbs and fat. If you have set a calorie or protein goal, you see how the day sits against it with a thin line — no big ring, no percentage shouting at you. Carbs and fat are always plain totals.

**An empty day no longer greets you with zeroes.** The strip rests, it says *Nothing logged yet*, and there is one **Add food** button plus four meal shortcuts. If you have goals set they are stated quietly rather than reported as `0 / 2,000`.

**Only the meals you actually ate appear.** The old screen listed Breakfast, Lunch, Dinner and Snacks with *No foods logged* under each, whether or not anything had happened.

**One way to add food**, with the barcode scanner as a small icon at the top. There used to be a big orange button, a second big button beside it, and four more inline — four things doing the same job.

**Hydration and Peptides are gone from Fuel.** Your Home screen already brings everything together; Fuel is about food.

**Nothing about your food is scored, graded or rated.** No VITA Score, no health rating, no good or bad foods, and no calorie or macro recommendations — your goals stay yours to set.

Engineering detail: repo `docs/06-Slice-Tracker.md` → slice 5.6B.

---

## Current state (verified in repo — Sprint 2 in progress)

**Slice 2.1 — Nutrition Foundation is built.** Fuel's daily calories, macros, meal grouping, and targets now come from **real logged food entries** through the shared nutrition domain at `src/lib/nutrition/`, not from a fixture. Fuel and the Food Log render an honest empty day when nothing is logged. The engine persists to AsyncStorage behind a `FoodLogRepository` interface, so Supabase later swaps in without touching a screen. Architecture detail: repo `docs/09-Technical-Documentation.md`.

Removed in the same slice: `FUEL_TODAY` (its meal breakdown contradicted its own headline total, and its water/peptide counts duplicated fixtures those features already owned) and `features/dashboard/mealIcons.ts` (a Fuel-only concern living inside the Dashboard feature). Canonical meal vocabulary is now `Breakfast · Lunch · Dinner · Snacks` — the codebase previously carried both `Snack` and `Snacks` for the same thing.

**Still fixture or mock, deliberately:** Food Search, Recent, Favorites, and Food Detail still read the interim catalog in `features/fuel/mock.ts` (replaced by the provider layer, slice 2.6) · Add Manually saves nothing (slice 2.2) · the barcode scanner is still a static drawing with no camera · Home's nutrition is still its own fixture until slice 2.5.

The eight-screen flow under `src/app/(vita)/fuel/` and the Fuel hub tab are otherwise unchanged from Sprint 0. Domain color: **orange `#F2670F`** ([[Color System]]); dock icon: flame. Macro colors: protein `#2E9E5B` · carbs `#F5A623` · fat `#E5484D`.

## Target state

**Sprint 2** of the [[Roadmap]] (renumbered 2026-08-17; was Sprint 3): Core Logging, Home Integration, Recents/Favorites/Custom Foods, the Provider Layer, Food Search, **real barcode scanning** (camera permission ships here), Edge Cases & Polish, Final Verification. Live slice progress: repo `docs/06-Slice-Tracker.md`.

**Screenshot Food Analysis** ([[Mobile Order Screenshot Import]]) is explicitly **deferred out of Sprint 2's approved scope** and currently has no scheduled sprint — see [[Open Questions]] #14.

**The Peptides tile runs on real data since slice 3.9 (2026-08-26).** It had been showing `1 of 3 logged` to every user since Sprint 0 — a count that was invented and a goal VITA has never had. It now reads how many administrations were actually recorded today, falls back to how many routines are scheduled, and draws **no progress bar**, because there is no target to divide by. It remains a summary and a door into [[Peptides]]; Fuel does not grow a routine widget of its own, and nothing about Fuel's layout, hierarchy or nutrition behaviour changed.

**Fuel's Hydration and Peptides modules belong to Sprint 3.** The redesigned Fuel landing screen is approved and finished; **it is not redesigned again.** [[Water]] + [[Peptides]] — moved ahead of Journey to **Sprint 3** by the founder reorder of 2026-08-21 — turns those two compact modules into real entry points and daily summaries backed by real, persisted data, without re-opening Fuel's layout, hierarchy, or visual system.

### Fuel Visual Refinement — founder direction, 2026-08-18

Functionality stays the priority for the rest of Sprint 2, but **before Sprint 2 counts as polished, Fuel gets a dedicated visual/interaction refinement slice** — added to [[Roadmap]] after the functional slices and before Final Verification.

The founders' read on Fuel as built today: **too basic, too bulky, overusing large numbers, and filling space simply because space exists.** Calorie and nutrition values are the named example — they grow disproportionately large and dominate entire screens. It currently reads as a functional prototype rather than a refined production health app.

**Same feature architecture, significantly more refined presentation** — this is explicitly *not* a functional redesign. The slice evaluates: information density · typography scale · number sizing · spacing · card sizing · empty space · hierarchy · search-result density · Food Detail density · logging confirmation · meal rows · Food Log presentation. The governing principle, recorded on [[Design Bible]]: **size communicates importance, not availability.**

**Built for the Fuel landing screen 2026-08-21 — pending founder review** (slice 2.9; the other Fuel surfaces still to come). Fuel now opens as a daily nutrition command centre rather than a menu of cards: a calorie ring beside the Calories-remaining headline with macro bars below · a prominent **Log Food** action beside **Scan Barcode** · **Today's Meals** as four rows in one panel, where a logged meal shows its actual foods (serving, calories, favorite heart) and an untouched meal is a single compact row · a `+ Add food` per meal that opens the existing logging flow with that meal already selected · Hydration and Peptides reduced to half-width secondary modules. Two things a person previously had to leave Fuel to see — what they ate, and how to log something — are now on the screen itself.

Two decisions worth carrying: **Snacks is neutral sage, not the reference's purple** (purple is the locked Atlas/peptide domain color and the Peptides module sits just below), and **`kcal` is gone from user-facing copy** in favor of *Calories* / *cal* app-wide. Both flagged for founder confirmation. Detail: repo `docs/06-Slice-Tracker.md`, `docs/05-Design-System.md`.

**Approved and locked 2026-08-21.** The layout, density, meal structure, quick actions, and hydration/peptide placement are settled; Fuel is not to be restructured again. A polish pass the same day refined the copy (*Calories consumed* / *Calories remaining*; macros as progress toward the user's own configured targets, with no warning state and no invented dietary rules), fixed a persistence bug that was **permanently erasing product images from favorites**, and introduced the shared three-tier food visual resolver — see [[Contextual Food Visuals]], which is now *in development*, not released: the plumbing ships, the artwork does not.

**Final polish pass 2026-08-21 (post-approval).** Three device-QA findings closed: contextual food visuals were confidently *wrong* (the icon font's generic food glyph is a burger, so every unclassified food was drawn as one) and are now 14 hand-drawn VITA illustrations with a neutral fork-and-knife fallback — see [[Contextual Food Visuals]]; the calorie ring puts its number and unit back inside the circle and now **states an over-target day** (`326 · Calories over`, amber not red) instead of flattening it to `0 remaining`; and a barcode result that is wrong now has a way out — `Not the right product?` on scanner-originated Food Detail, offering search, rescan, manual entry, and an honestly-incomplete report. **Incorrect-product report submission has no backend and says so — deferred.**

**Restaurant coverage stays a gap, on purpose (founders, 2026-08-21).** FatSecret was researched as the restaurant/branded source and **deferred to pre-launch provider selection**: its terms let us keep identifiers but not the nutrition, names, brands, servings or images that VITA's permanent food-log snapshots depend on. Those snapshots are why history works offline and why Fuel and Home render instantly, so they were not traded away for one provider. Nothing was built and nothing was worked around. See [[Decision Log]] and repo `docs/04-Master-Roadmap.md` → Launch readiness follow-ups.

**Barcode remains the one open defect.** A Kroger water bottle still resolves to Hillshire Farm sausage, and the cause is now traced upstream: Open Food Facts record `0011110816405` sits under Kroger's own GS1 company prefix but carries Hillshire Farm name, brand, imagery, and nutrition. VITA's identity checks correctly confirm it, because the code returned genuinely is the code requested — **no client-side check can catch a database that is wrong about itself.** Not fixed, nothing hardcoded; awaiting one physical scan to confirm the bottle's actual code against that record.

### Contextual food visuals — concept, unscheduled

Food tracking should eventually feel more alive and visually distinctive — a burger shows a small burger, a taco a taco, oatmeal a bowl, coffee a cup. **Small, delightful, tasteful, premium, and useful for quick recognition — never giant food photos dominating the interface.**

Two constraints already settled as direction: presentation must **not depend on any one provider** (real image → VITA category illustration → generic fallback, because USDA, Open Food Facts, restaurant providers, and custom foods all have inconsistent image coverage), and a `Food → Category → illustration` mapping will likely be needed since provider data rarely exposes a usable *visual* category. Deliberately not over-engineered yet.

Full proposal: [[Contextual Food Visuals]].

## Sprint 5 direction — Fuel Identity Refresh, slice 5.6 (founder ruling, 2026-09-04)

**⚠️ Direction, not implementation authorization.** Slice 5.6 is planned and needs its own founder authorization. Full detail: repo `docs/Sprint-5-Migration-Guide.md` → Slice 5.6.

**Why Fuel gained a slice it did not originally have.** Sprint 2 built Fuel's functionality and Fuel's presentation predates the current VITA identity. When the founders ruled on 2026-09-04 that **Sprint 5 must apply the identity across every already-built product area before [[My Journey|Journey]] begins**, Fuel was the largest surface with no slice — the Screen Migration Guide had no Fuel section at all.

**This is not a Fuel architecture rewrite.** Preserved and not reopened: the nutrition model · logging · meal editing · the Open Food Facts integration · **barcode lookup and the `/fuel/scan` logging flow** · persistence · every existing real behaviour · current calorie and macro semantics, including the *Calories* / *cal* terminology decision.

**Potential visual / interaction scope:** Fuel Home · meal and log presentation · food detail surfaces · scanner presentation where appropriate · the logging flow · empty states · direct-content hierarchy · **orange feature identity** · tactile sheets and progressive disclosure where they genuinely help.

**Fuel should look like Fuel.** It adopts the shared VITA language — premium dark foundation, direct-content hierarchy, restrained surfaces, feature colors, purposeful motion, tactile interaction, accessibility, real-data-only presentation — **not another feature's layout.** The meal colour language, the three-tier food visual system and the calorie ring stay Fuel's own. **Fuel does not acquire [[Dashboard]]'s widget-customization model**, which is a Home-specific pattern.

**The scanner, stated plainly.** `/fuel/scan` is the **barcode lookup and logging** flow. Refreshing its presentation is in scope; **inventing a product score is not.** The Dashboard *Food Scanner* Quick Tool opens this logging flow — it is not a claim that food scoring exists. **No VITA Score exists or is authorised**, and the richer evaluating scanner ([[Food & Product Scanner]]) remains a separate deferred feature evolution.

## Future ideas

- AI meal planning via Atlas — [[Atlas Capabilities]]
- Nutrition insights connected to Health Age — [[Future Features]]
- Mobile order screenshot import — Atlas reads a restaurant/delivery order screenshot and drafts the log for review — [[Mobile Order Screenshot Import]]
- AI meal photo recognition — Atlas estimates foods, portions, and macros from a photo of the plate and drafts the log for review — [[AI Meal Photo Recognition]]
- Smart fridge scanner — Atlas reads what's in the fridge and suggests meals, swaps, and groceries (advisory, not a logging action — placement in the app is still open) — [[Smart Fridge Scanner]]
- Contextual food visuals — small food illustrations/icons for quick recognition, provider-independent — [[Contextual Food Visuals]]

## Dependencies

- Food data providers — **decided 2026-08-17**: FatSecret (restaurant/branded), USDA FoodData Central (generic/foundational), Open Food Facts (packaged/barcode/images), behind provider adapters and a normalized VITA food model. Licensing, attribution, and caching terms must be verified per provider before any third-party data is cached. See [[Decision Log]].
- Camera + barcode scanning implementation (Sprint 2, later slice)
- [[Supabase & Database]] — **not** required for Sprint 2 logging; persistence is local behind a repository interface, and Supabase becomes a second implementation later

## Open questions

- FatSecret account registration and Premier Free eligibility are founder tasks — Claude stops at that dependency rather than inventing credentials.
- Whether nutrition targets become user-editable in Sprint 2, given [[Settings]] has no sprint until 7.

**Related:** [[Product Overview]] · [[Dashboard]] · [[Water]] · [[Peptides]] · [[Atlas Capabilities]]
